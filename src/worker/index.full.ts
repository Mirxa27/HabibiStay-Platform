import { Hono } from "hono";
import { cors } from "hono/cors";
import { zValidator } from "@hono/zod-validator";
import OpenAI from "openai";
import {
  CreatePropertySchema,
  CreateBookingSchema,
  ChatRequestSchema,
  AdvancedPropertySearchSchema,
  CreateUserProfileSchema,
  type ApiResponse,
  type Property,
} from "../shared/types";
import { MyFatoorahService, CreatePaymentSchema, PaymentCallbackSchema } from "../shared/payment";
import { DEFAULT_EMAIL_TEMPLATES, EMAIL_TEMPLATES, renderEmailTemplate } from "../shared/email";
import {
  authMiddleware,
  getOAuthRedirectUrl,
  exchangeCodeForSessionToken,
  deleteSession,
  MOCHA_SESSION_TOKEN_COOKIE_NAME,
} from "@getmocha/users-service/backend";
import { getCookie, setCookie } from "hono/cookie";
import {
  securityHeadersMiddleware,
  ipBlockingMiddleware,
  rateLimitMiddleware,
  requestLoggingMiddleware,
  inputValidationMiddleware,
  sqlInjectionMiddleware,
  suspiciousActivityMiddleware,
  requireRole,
  requirePermissions,
  requireOwnership
} from "../shared/security-middleware";
import { auditLogger } from "../shared/security-utils";
import { AIChatService, ChatRequestSchema as EnhancedChatRequestSchema } from "../shared/ai-chat-service";
import { EnhancedEmailService } from "../shared/enhanced-email-service";
import { NotificationService } from "../shared/notification-service";
import { PaymentService } from "../server/services/PaymentService";
import { BookingService } from "../server/services/BookingService";
import { PropertyService } from "../server/services/PropertyService";
import { ChatRequestSchema as LegacyChatRequestSchema } from "../shared/types";
import { z } from 'zod';

// Initialize services
function initializeServices(env: Env) {
  const paymentService = new PaymentService(env.DB);
  const emailService = new EnhancedEmailService(env.DB);
  const notificationService = new NotificationService(env.DB, emailService);
  const bookingService = new BookingService(env.DB, paymentService, emailService, null); // TODO: Add pricing service
  const propertyService = new PropertyService(env.DB);
  const aiChatService = new AIChatService(env.DB);

  return {
    paymentService,
    emailService,
    notificationService,
    bookingService,
    propertyService,
    aiChatService
  };
}

const app = new Hono<{ Bindings: Env }>();

// Apply global middleware
app.use("*", cors({
  origin: "*",
  allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowHeaders: ["Content-Type", "Authorization"],
}));

app.use("*", securityHeadersMiddleware);
app.use("*", ipBlockingMiddleware);
app.use("*", rateLimitMiddleware());
app.use("*", requestLoggingMiddleware);
app.use("*", inputValidationMiddleware);
app.use("*", sqlInjectionMiddleware);
app.use("*", suspiciousActivityMiddleware);

// Initialize OpenAI client
function getOpenAIClient(env: Env): OpenAI {
  return new OpenAI({
    apiKey: env.OPENAI_API_KEY,
  });
}

// Initialize MyFatoorah service
function getMyFatoorahService(env: Env): MyFatoorahService {
  return new MyFatoorahService(
    env.MYFATOORAH_API_KEY || '',
    env.MYFATOORAH_API_URL || 'https://api.myfatoorah.com'
  );
}

// Email service implementation
async function sendEmail(env: Env, to: string, templateKey: string, variables: Record<string, any> = {}): Promise<boolean> {
  try {
    // Get email template from database
    const template = await env.DB.prepare(
      "SELECT * FROM email_templates WHERE template_key = ? AND is_active = 1"
    ).bind(templateKey).first();

    if (!template) {
      console.error(`Email template not found: ${templateKey}`);
      return false;
    }

    // Render template with variables
    const subject = renderEmailTemplate((template as any).subject, variables);

    // Send email using EnhancedEmailService
    const services = initializeServices(env);
    const result = await services.emailService.sendEmail({
      to,
      subject: `HabibiStay: ${templateKey}`,
      templateKey,
      variables
    });
    return result.success;
  } catch (error) {
    console.error('Email sending failed:', error);
    return false;
  }
}

// Track property view for analytics
async function trackPropertyView(env: Env, propertyId: number): Promise<void> {
  const today = new Date().toISOString().split('T')[0];

  await env.DB.prepare(`
    INSERT INTO property_analytics (property_id, views, date)
    VALUES (?, 1, ?)
    ON CONFLICT(property_id, date)
    DO UPDATE SET views = views + 1, updated_at = CURRENT_TIMESTAMP
  `).bind(propertyId, today).run();
}

// Auth routes
app.get('/api/oauth/google/redirect_url', async (c) => {
  const redirectUrl = await getOAuthRedirectUrl('google', {
    apiUrl: c.env.MOCHA_USERS_SERVICE_API_URL || '',
    apiKey: c.env.MOCHA_USERS_SERVICE_API_KEY || '',
  });

  return c.json({ redirectUrl }, 200);
});

app.post("/api/sessions", async (c) => {
  const body = await c.req.json();

  if (!body.code) {
    return c.json({ error: "No authorization code provided" }, 400);
  }

  const sessionToken = await exchangeCodeForSessionToken(body.code, {
    apiUrl: c.env.MOCHA_USERS_SERVICE_API_URL || '',
    apiKey: c.env.MOCHA_USERS_SERVICE_API_KEY || '',
  });

  setCookie(c, MOCHA_SESSION_TOKEN_COOKIE_NAME, sessionToken, {
    httpOnly: true,
    path: "/",
    sameSite: "none",
    secure: true,
    maxAge: 60 * 24 * 60 * 60, // 60 days
  });

  return c.json({ success: true }, 200);
});

app.get("/api/users/me", authMiddleware, async (c) => {
  return c.json(c.get("user"));
});

app.get('/api/logout', async (c) => {
  const sessionToken = getCookie(c, MOCHA_SESSION_TOKEN_COOKIE_NAME);

  if (typeof sessionToken === 'string') {
    await deleteSession(sessionToken, {
      apiUrl: c.env.MOCHA_USERS_SERVICE_API_URL || '',
      apiKey: c.env.MOCHA_USERS_SERVICE_API_KEY || '',
    });
  }

  setCookie(c, MOCHA_SESSION_TOKEN_COOKIE_NAME, '', {
    httpOnly: true,
    path: '/',
    sameSite: 'none',
    secure: true,
    maxAge: 0,
  });

  return c.json({ success: true }, 200);
});

// Properties routes - Enhanced search with authentication
app.get("/api/properties", zValidator("query", AdvancedPropertySearchSchema.partial()), async (c) => {
  try {
    const services = initializeServices(c.env);
    const searchParams = c.req.valid("query");

    const result = await services.propertyService.searchProperties(searchParams);

    return c.json({
      success: true,
      data: result.properties,
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
      },
    });
  } catch (error) {
    console.error('Properties search error:', error);
    return c.json({
      success: false,
      error: 'Failed to search properties'
    }, 500);
  }
});

app.get("/api/properties/featured", async (c) => {
  try {
    const services = initializeServices(c.env);
    const properties = await services.propertyService.getFeaturedProperties(10);

    return c.json<ApiResponse<Property[]>>({
      success: true,
      data: properties,
    });
  } catch (error) {
    console.error('Featured properties error:', error);
    return c.json({
      success: false,
      error: 'Failed to get featured properties'
    }, 500);
  }
});

app.get("/api/properties/:id", async (c) => {
  try {
    const services = initializeServices(c.env);
    const id = parseInt(c.req.param("id"));

    const property = await services.propertyService.getPropertyById(id);

    return c.json<ApiResponse>({
      success: true,
      data: property,
    });
  } catch (error) {
    console.error('Property fetch error:', error);
    return c.json({
      success: false,
      error: 'Property not found'
    }, 404);
  }
});

app.post("/api/properties", authMiddleware, async (c) => {
  try {
    const services = initializeServices(c.env);
    const user = c.get("user");
    const data = await c.req.json();

    if (!user) {
      return c.json({
        success: false,
        error: 'User not authenticated'
      }, 401);
    }

    // Basic property creation (simplified)
    const propertyId = await c.env.DB.run(`
      INSERT INTO properties (
        title, description, location, property_type, max_guests, bedrooms, bathrooms,
        price_per_night, amenities, images, owner_id, is_featured, is_active,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      data.title,
      data.description,
      data.location,
      data.property_type,
      data.max_guests,
      data.bedrooms,
      data.bathrooms,
      data.price_per_night,
      JSON.stringify(data.amenities || []),
      JSON.stringify(data.images || []),
      user.id,
      false,
      true,
      new Date().toISOString(),
      new Date().toISOString()
    ]);

    const property = await services.propertyService.getPropertyById(propertyId);

    return c.json({
      success: true,
      data: property,
      message: "Property created successfully",
    });
  } catch (error) {
    console.error('Property creation error:', error);
    return c.json({
      success: false,
      error: (error as Error).message || 'Failed to create property'
    }, 500);
  }
});

// Bookings routes with full business logic
app.post("/api/bookings", zValidator("json", CreateBookingSchema), async (c) => {
  try {
    const services = initializeServices(c.env);
    const data = c.req.valid("json");
    const user = c.get("user");
    const ip = c.req.header('cf-connecting-ip') || c.req.header('x-forwarded-for') || 'unknown';

    if (!user) {
      return c.json({
        success: false,
        error: 'User not authenticated'
      }, 401);
    }

    const booking = await services.bookingService.createBooking(data, user.id);

    // Log booking creation
    await auditLogger.log({
      userId: user.id,
      ip,
      action: 'BOOKING_CREATED',
      resource: '/api/bookings',
      details: {
        booking_id: booking.id,
        property_id: booking.property_id,
        total_amount: booking.total_amount,
        guests: data.total_guests
      },
      success: true
    });

    // Get property title for response
    const property = await c.env.DB.prepare(
      "SELECT title FROM properties WHERE id = ?"
    ).bind(booking.property_id).first();

    const propertyTitle = (property as any)?.title || 'Property';

    return c.json({
      success: true,
      data: {
        booking_id: booking.id,
        total_amount: booking.total_amount,
        status: booking.status,
        property_title: propertyTitle,
        next_step: {
          action: 'payment_required',
          payment_endpoint: '/api/payments/create',
          payment_data: {
            bookingId: booking.id,
            amount: booking.total_amount,
            currency: 'SAR',
            description: `Booking for ${propertyTitle}`,
            available_providers: ['myfatoorah', 'paypal']
          }
        }
      },
    });
  } catch (error) {
    console.error('Booking creation error:', error);
    return c.json({
      success: false,
      error: (error as Error).message || 'Failed to create booking'
    }, 500);
  }
});

// Enhanced Payment Integration Routes
app.get("/api/payments/providers", async (c) => {
  try {
    const services = initializeServices(c.env);
    const providers = await services.paymentService.getPaymentProviders();

    return c.json<ApiResponse>({
      success: true,
      data: providers
    });
  } catch (error) {
    console.error('Error fetching payment providers:', error);
    return c.json({
      success: false,
      error: 'Failed to fetch payment providers'
    }, 500);
  }
});

app.post("/api/payments/create", authMiddleware, async (c) => {
  try {
    const services = initializeServices(c.env);
    const body = await c.req.json();
    const user = c.get("user");
    const ip = c.req.header("cf-connecting-ip") || "unknown";

    // Validate required fields
    const { bookingId, amount, currency = 'SAR', provider = 'myfatoorah', description } = body;

    if (!bookingId || !amount || !description) {
      return c.json({
        success: false,
        error: 'Missing required payment information'
      }, 400);
    }

    // Get booking details for customer info
    const booking = await c.env.DB.prepare(
      "SELECT * FROM bookings WHERE id = ?"
    ).bind(bookingId).first();

    if (!booking) {
      return c.json({
        success: false,
        error: 'Booking not found'
      }, 404);
    }

    // Create payment request
    const paymentRequest = {
      bookingId: bookingId.toString(),
      amount: parseFloat(amount),
      currency,
      description,
      customerInfo: {
        name: booking.guest_name,
        email: booking.guest_email,
        phone: booking.guest_phone
      },
      metadata: {
        user_id: user?.id,
        ip_address: ip,
        booking_reference: booking.id
      }
    };

    const result = await services.paymentService.createPayment(paymentRequest, provider);

    // Log payment creation
    await auditLogger.log({
      userId: user?.id || 'anonymous',
      ip,
      action: 'PAYMENT_CREATE',
      resource: '/api/payments/create',
      details: {
        payment_id: result.paymentId,
        booking_id: bookingId,
        amount,
        provider,
        success: result.success
      },
      success: result.success
    });

    return c.json({
      success: result.success,
      data: {
        payment_id: result.paymentId,
        payment_url: result.paymentUrl,
        transaction_id: result.transactionId,
        status: result.status,
        provider: result.provider
      },
      error: result.error
    });

  } catch (error) {
    console.error('Payment creation error:', error);
    return c.json({
      success: false,
      error: 'Failed to create payment'
    }, 500);
  }
});

// Enhanced AI Chat Service Integration
app.post("/api/chat/enhanced", zValidator("json", EnhancedChatRequestSchema), async (c) => {
  try {
    const services = initializeServices(c.env);
    const requestData = c.req.valid("json");
    const user = c.get("user");
    const ip = c.req.header("cf-connecting-ip") || c.req.header("x-forwarded-for") || "unknown";

    // Enhanced context with property and booking information
    const enhancedContext: any = {
      ...requestData.context,
      ip_address: ip,
      user_agent: c.req.header("user-agent") || "unknown",
      session_id: c.req.header("x-session-id") || "anonymous"
    };

    // If user is viewing a property, add property details to context
    if (requestData.context?.property_id) {
      const property = await c.env.DB.prepare(
        "SELECT * FROM properties WHERE id = ? AND is_active = 1"
      ).bind(requestData.context.property_id).first();

      if (property) {
        enhancedContext.property_details = {
          title: property.title,
          location: property.location,
          price_per_night: property.price_per_night,
          max_guests: property.max_guests,
          amenities: property.amenities,
          description: property.description
        };
      }
    }

    // Add featured properties for recommendations
    const { results: featuredProperties } = await c.env.DB.prepare(
      "SELECT id, title, location, price_per_night, max_guests, description FROM properties WHERE is_featured = 1 AND is_active = 1 ORDER BY created_at DESC LIMIT 3"
    ).all();
    enhancedContext.featured_properties = featuredProperties;

    // Process chat request
    const chatRequest = {
      message: requestData.message,
      conversation_id: requestData.conversation_id,
      user_id: user?.id,
      context: enhancedContext,
      model_preferences: requestData.model_preferences
    };

    const result = await services.aiChatService.processMessage(chatRequest, user?.id);

    if (result.success) {
      // Log successful interaction
      await auditLogger.log({
        userId: user?.id || 'anonymous',
        ip,
        action: 'CHAT_INTERACTION',
        resource: '/api/chat/enhanced',
        details: {
          conversation_id: result.data?.conversation_id || 'unknown',
          message_length: requestData.message.length,
          response_length: result.data?.message.length || 0,
          tokens_used: result.data?.tokens_used || 0,
          confidence: result.data?.confidence || 0
        },
        success: true
      });

      return c.json({
        success: true,
        data: result.data
      });
    } else {
      return c.json({
        success: false,
        error: result.error
      }, 400);
    }

  } catch (error) {
    console.error('Enhanced AI Chat error:', error);
    return c.json({
      success: false,
      error: "Unable to process your message at this time. Please try again."
    }, 500);
  }
});

// Admin routes with proper authorization
app.get("/api/admin/stats", authMiddleware, requireRole(['admin']), async (c) => {
  try {
    const services = initializeServices(c.env);

    // Get comprehensive stats
    const [usersResult, propertiesResult, bookingsResult, revenueResult] = await Promise.all([
      c.env.DB.prepare("SELECT COUNT(*) as count FROM users").first(),
      c.env.DB.prepare("SELECT COUNT(*) as total, COUNT(CASE WHEN is_active = true THEN 1 END) as active, COUNT(CASE WHEN is_featured = true THEN 1 END) as featured FROM properties").first(),
      c.env.DB.prepare("SELECT COUNT(*) as total, COUNT(CASE WHEN status = 'confirmed' THEN 1 END) as confirmed, COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending FROM bookings").first(),
      c.env.DB.prepare("SELECT SUM(total_amount) as total FROM bookings WHERE status = 'confirmed'").first(),
    ]);

    const stats = {
      total_users: (usersResult as any)?.count || 0,
      total_properties: (propertiesResult as any)?.total || 0,
      active_properties: (propertiesResult as any)?.active || 0,
      featured_properties: (propertiesResult as any)?.featured || 0,
      total_bookings: (bookingsResult as any)?.total || 0,
      confirmed_bookings: (bookingsResult as any)?.confirmed || 0,
      pending_bookings: (bookingsResult as any)?.pending || 0,
      total_revenue: (revenueResult as any)?.total || 0,
      monthly_growth: 12, // TODO: Calculate actual growth
      occupancy_rate: 85, // TODO: Calculate actual occupancy
    };

    return c.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    return c.json({
      success: false,
      error: 'Failed to fetch admin statistics'
    }, 500);
  }
});

// Health check endpoint
app.get("/api/health", async (c) => {
  return c.json({
    success: true,
    message: "HabibiStay API is running with full business logic",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
    services: {
      authentication: true,
      payments: true,
      bookings: true,
      properties: true,
      ai_chat: true,
      notifications: true
    }
  });
});

export default {
  fetch: app.fetch,
};
