import { Hono } from "hono";
import { cors } from "hono/cors";
import { zValidator } from "@hono/zod-validator";
import {
  CreatePropertySchema,
  CreateBookingSchema,
  ChatRequestSchema,
  AdvancedPropertySearchSchema,
  CreateUserProfileSchema,
  type ApiResponse,
  type Property,
  PageSchema,
  TemplateSchema,
  ComponentSchema,
  MediaSchema,
  AIProviderSchema,
  AIModelSchema,
  AIContentJobSchema
} from "../shared/types";
import { MyFatoorahService } from "../shared/payment";
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
} from "../shared/security-middleware";
import { auditLogger } from "../shared/security-utils";
import { AIChatService, ChatRequestSchema as EnhancedChatRequestSchema } from "../shared/ai-chat-service";
import { EnhancedEmailService } from "../shared/enhanced-email-service";
import { NotificationService } from "../shared/notification-service";
import { PaymentService } from "../server/services/PaymentService";
import { BookingService } from "../server/services/BookingService";
import { PropertyService } from "../server/services/PropertyService";
import { CMSService } from "../shared/cms-service";
import { AIContentService } from "../shared/ai-content-service";
import { CMSPermissionsService } from "../shared/cms-permissions-service";
import { z } from 'zod';

// Initialize services
function initializeServices(env: Env) {
  const paymentService = new PaymentService(env.DB);
  const emailService = new EnhancedEmailService(env.DB);
  const notificationService = new NotificationService(env.DB, emailService);
  const bookingService = new BookingService(env.DB, paymentService, emailService, null); // TODO: Add pricing service
  const propertyService = new PropertyService(env.DB);
  const aiChatService = new AIChatService(env.DB);
  const cmsService = new CMSService(env.DB);
  const aiContentService = new AIContentService(env.DB);
  const cmsPermissionsService = new CMSPermissionsService(env.DB);

  return {
    paymentService,
    emailService,
    notificationService,
    bookingService,
    propertyService,
    aiChatService,
    cmsService,
    aiContentService,
    cmsPermissionsService
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

// CMS Routes
// Pages
app.get("/api/cms/pages", authMiddleware, requireRole(['admin']), async (c) => {
  try {
    const services = initializeServices(c.env);
    const pages = await services.cmsService.getAllPages();
    
    return c.json<ApiResponse>({
      success: true,
      data: pages,
    });
  } catch (error) {
    console.error('CMS pages fetch error:', error);
    return c.json({
      success: false,
      error: 'Failed to fetch pages'
    }, 500);
  }
});

app.get("/api/cms/pages/:id", authMiddleware, requireRole(['admin']), async (c) => {
  try {
    const services = initializeServices(c.env);
    const id = parseInt(c.req.param("id"));
    const page = await services.cmsService.getPageById(id);
    
    if (!page) {
      return c.json({
        success: false,
        error: 'Page not found'
      }, 404);
    }
    
    return c.json<ApiResponse>({
      success: true,
      data: page,
    });
  } catch (error) {
    console.error('CMS page fetch error:', error);
    return c.json({
      success: false,
      error: 'Failed to fetch page'
    }, 500);
  }
});

app.post("/api/cms/pages", authMiddleware, requireRole(['admin']), async (c) => {
  try {
    const services = initializeServices(c.env);
    const user = c.get("user");
    const data = await c.req.json();
    
    const pageData = {
      ...data,
      created_by: user.id,
      updated_by: user.id,
    };
    
    const page = await services.cmsService.createPage(pageData);
    
    return c.json<ApiResponse>({
      success: true,
      data: page,
      message: "Page created successfully",
    });
  } catch (error) {
    console.error('CMS page creation error:', error);
    return c.json({
      success: false,
      error: (error as Error).message || 'Failed to create page'
    }, 500);
  }
});

app.put("/api/cms/pages/:id", authMiddleware, requireRole(['admin']), async (c) => {
  try {
    const services = initializeServices(c.env);
    const user = c.get("user");
    const id = parseInt(c.req.param("id"));
    const data = await c.req.json();
    
    // Check if page exists
    const existingPage = await services.cmsService.getPageById(id);
    if (!existingPage) {
      return c.json({
        success: false,
        error: 'Page not found'
      }, 404);
    }
    
    const pageData = {
      ...data,
      updated_by: user.id,
    };
    
    const page = await services.cmsService.updatePage(id, pageData);
    
    return c.json<ApiResponse>({
      success: true,
      data: page,
      message: "Page updated successfully",
    });
  } catch (error) {
    console.error('CMS page update error:', error);
    return c.json({
      success: false,
      error: (error as Error).message || 'Failed to update page'
    }, 500);
  }
});

app.delete("/api/cms/pages/:id", authMiddleware, requireRole(['admin']), async (c) => {
  try {
    const services = initializeServices(c.env);
    const id = parseInt(c.req.param("id"));
    
    // Check if page exists
    const existingPage = await services.cmsService.getPageById(id);
    if (!existingPage) {
      return c.json({
        success: false,
        error: 'Page not found'
      }, 404);
    }
    
    const result = await services.cmsService.deletePage(id);
    
    if (!result) {
      return c.json({
        success: false,
        error: 'Failed to delete page'
      }, 500);
    }
    
    return c.json<ApiResponse>({
      success: true,
      message: "Page deleted successfully",
    });
  } catch (error) {
    console.error('CMS page delete error:', error);
    return c.json({
      success: false,
      error: (error as Error).message || 'Failed to delete page'
    }, 500);
  }
});

// Templates
app.get("/api/cms/templates", authMiddleware, requireRole(['admin']), async (c) => {
  try {
    const services = initializeServices(c.env);
    const templates = await services.cmsService.getAllTemplates();
    
    return c.json<ApiResponse>({
      success: true,
      data: templates,
    });
  } catch (error) {
    console.error('CMS templates fetch error:', error);
    return c.json({
      success: false,
      error: 'Failed to fetch templates'
    }, 500);
  }
});

app.get("/api/cms/templates/:id", authMiddleware, requireRole(['admin']), async (c) => {
  try {
    const services = initializeServices(c.env);
    const id = parseInt(c.req.param("id"));
    const template = await services.cmsService.getTemplateById(id);
    
    if (!template) {
      return c.json({
        success: false,
        error: 'Template not found'
      }, 404);
    }
    
    return c.json<ApiResponse>({
      success: true,
      data: template,
    });
  } catch (error) {
    console.error('CMS template fetch error:', error);
    return c.json({
      success: false,
      error: 'Failed to fetch template'
    }, 500);
  }
});

// Create a new template
app.post("/api/cms/templates", authMiddleware, requireRole(['admin']), async (c) => {
  try {
    const services = initializeServices(c.env);
    const user = c.get("user");
    const data = await c.req.json();
    
    const templateData = {
      ...data,
      created_by: user.id,
      updated_by: user.id,
    };
    
    const template = await services.cmsService.createTemplate(templateData);
    
    return c.json<ApiResponse>({
      success: true,
      data: template,
      message: "Template created successfully",
    });
  } catch (error) {
    console.error('CMS template creation error:', error);
    return c.json({
      success: false,
      error: (error as Error).message || 'Failed to create template'
    }, 500);
  }
});

// Update a template
app.put("/api/cms/templates/:id", authMiddleware, requireRole(['admin']), async (c) => {
  try {
    const services = initializeServices(c.env);
    const user = c.get("user");
    const id = parseInt(c.req.param("id"));
    const data = await c.req.json();
    
    // Check if template exists
    const existingTemplate = await services.cmsService.getTemplateById(id);
    if (!existingTemplate) {
      return c.json({
        success: false,
        error: 'Template not found'
      }, 404);
    }
    
    const templateData = {
      ...data,
      updated_by: user.id,
    };
    
    const template = await services.cmsService.updateTemplate(id, templateData);
    
    return c.json<ApiResponse>({
      success: true,
      data: template,
      message: "Template updated successfully",
    });
  } catch (error) {
    console.error('CMS template update error:', error);
    return c.json({
      success: false,
      error: (error as Error).message || 'Failed to update template'
    }, 500);
  }
});

app.delete("/api/cms/templates/:id", authMiddleware, requireRole(['admin']), async (c) => {
  try {
    const services = initializeServices(c.env);
    const id = parseInt(c.req.param("id"));
    
    // Check if template exists
    const existingTemplate = await services.cmsService.getTemplateById(id);
    if (!existingTemplate) {
      return c.json({
        success: false,
        error: 'Template not found'
      }, 404);
    }
    
    const result = await services.cmsService.deleteTemplate(id);
    
    if (!result) {
      return c.json({
        success: false,
        error: 'Failed to delete template'
      }, 500);
    }
    
    return c.json<ApiResponse>({
      success: true,
      message: "Template deleted successfully",
    });
  } catch (error) {
    console.error('CMS template delete error:', error);
    return c.json({
      success: false,
      error: (error as Error).message || 'Failed to delete template'
    }, 500);
  }
});

// Components
app.get("/api/cms/components", authMiddleware, requireRole(['admin']), async (c) => {
  try {
    const services = initializeServices(c.env);
    const components = await services.cmsService.getAllComponents();
    
    return c.json<ApiResponse>({
      success: true,
      data: components,
    });
  } catch (error) {
    console.error('CMS components fetch error:', error);
    return c.json({
      success: false,
      error: 'Failed to fetch components'
    }, 500);
  }
});

app.get("/api/cms/components/:id", authMiddleware, requireRole(['admin']), async (c) => {
  try {
    const services = initializeServices(c.env);
    const id = parseInt(c.req.param("id"));
    const component = await services.cmsService.getComponentById(id);
    
    if (!component) {
      return c.json({
        success: false,
        error: 'Component not found'
      }, 404);
    }
    
    return c.json<ApiResponse>({
      success: true,
      data: component,
    });
  } catch (error) {
    console.error('CMS component fetch error:', error);
    return c.json({
      success: false,
      error: 'Failed to fetch component'
    }, 500);
  }
});

app.post("/api/cms/components", authMiddleware, requireRole(['admin']), async (c) => {
  try {
    const services = initializeServices(c.env);
    const user = c.get("user");
    const data = await c.req.json();
    
    const componentData = {
      ...data,
      created_by: user.id,
      updated_by: user.id,
    };
    
    const component = await services.cmsService.createComponent(componentData);
    
    return c.json<ApiResponse>({
      success: true,
      data: component,
      message: "Component created successfully",
    });
  } catch (error) {
    console.error('CMS component creation error:', error);
    return c.json({
      success: false,
      error: (error as Error).message || 'Failed to create component'
    }, 500);
  }
});

app.put("/api/cms/components/:id", authMiddleware, requireRole(['admin']), async (c) => {
  try {
    const services = initializeServices(c.env);
    const user = c.get("user");
    const id = parseInt(c.req.param("id"));
    const data = await c.req.json();
    
    // Check if component exists
    const existingComponent = await services.cmsService.getComponentById(id);
    if (!existingComponent) {
      return c.json({
        success: false,
        error: 'Component not found'
      }, 404);
    }
    
    const componentData = {
      ...data,
      updated_by: user.id,
    };
    
    const component = await services.cmsService.updateComponent(id, componentData);
    
    return c.json<ApiResponse>({
      success: true,
      data: component,
      message: "Component updated successfully",
    });
  } catch (error) {
    console.error('CMS component update error:', error);
    return c.json({
      success: false,
      error: (error as Error).message || 'Failed to update component'
    }, 500);
  }
});

app.delete("/api/cms/components/:id", authMiddleware, requireRole(['admin']), async (c) => {
  try {
    const services = initializeServices(c.env);
    const id = parseInt(c.req.param("id"));
    
    // Check if component exists
    const existingComponent = await services.cmsService.getComponentById(id);
    if (!existingComponent) {
      return c.json({
        success: false,
        error: 'Component not found'
      }, 404);
    }
    
    const result = await services.cmsService.deleteComponent(id);
    
    if (!result) {
      return c.json({
        success: false,
        error: 'Failed to delete component'
      }, 500);
    }
    
    return c.json<ApiResponse>({
      success: true,
      message: "Component deleted successfully",
    });
  } catch (error) {
    console.error('CMS component delete error:', error);
    return c.json({
      success: false,
      error: (error as Error).message || 'Failed to delete component'
    }, 500);
  }
});

// Media
app.get("/api/cms/media", authMiddleware, requireRole(['admin']), async (c) => {
  try {
    const services = initializeServices(c.env);
    const media = await services.cmsService.getAllMedia();
    
    return c.json<ApiResponse>({
      success: true,
      data: media,
    });
  } catch (error) {
    console.error('CMS media fetch error:', error);
    return c.json({
      success: false,
      error: 'Failed to fetch media'
    }, 500);
  }
});

app.get("/api/cms/media/:id", authMiddleware, requireRole(['admin']), async (c) => {
  try {
    const services = initializeServices(c.env);
    const id = parseInt(c.req.param("id"));
    const media = await services.cmsService.getMediaById(id);
    
    if (!media) {
      return c.json({
        success: false,
        error: 'Media not found'
      }, 404);
    }
    
    return c.json<ApiResponse>({
      success: true,
      data: media,
    });
  } catch (error) {
    console.error('CMS media fetch error:', error);
    return c.json({
      success: false,
      error: 'Failed to fetch media'
    }, 500);
  }
});

app.post("/api/cms/media", authMiddleware, requireRole(['admin']), async (c) => {
  try {
    const services = initializeServices(c.env);
    const user = c.get("user");
    const data = await c.req.json();
    
    const mediaData = {
      ...data,
      created_by: user.id,
    };
    
    const media = await services.cmsService.createMedia(mediaData);
    
    return c.json<ApiResponse>({
      success: true,
      data: media,
      message: "Media created successfully",
    });
  } catch (error) {
    console.error('CMS media creation error:', error);
    return c.json({
      success: false,
      error: (error as Error).message || 'Failed to create media'
    }, 500);
  }
});

app.delete("/api/cms/media/:id", authMiddleware, requireRole(['admin']), async (c) => {
  try {
    const services = initializeServices(c.env);
    const id = parseInt(c.req.param("id"));
    
    // Check if media exists
    const existingMedia = await services.cmsService.getMediaById(id);
    if (!existingMedia) {
      return c.json({
        success: false,
        error: 'Media not found'
      }, 404);
    }
    
    const result = await services.cmsService.deleteMedia(id);
    
    if (!result) {
      return c.json({
        success: false,
        error: 'Failed to delete media'
      }, 500);
    }
    
    return c.json<ApiResponse>({
      success: true,
      message: "Media deleted successfully",
    });
  } catch (error) {
    console.error('CMS media delete error:', error);
    return c.json({
      success: false,
      error: (error as Error).message || 'Failed to delete media'
    }, 500);
  }
});

// AI Providers
app.get("/api/cms/ai/providers", authMiddleware, requireRole(['admin']), async (c) => {
  try {
    const services = initializeServices(c.env);
    const providers = await services.cmsService.getAllAIProviders();
    
    return c.json<ApiResponse>({
      success: true,
      data: providers,
    });
  } catch (error) {
    console.error('CMS AI providers fetch error:', error);
    return c.json({
      success: false,
      error: 'Failed to fetch AI providers'
    }, 500);
  }
});

app.get("/api/cms/ai/providers/:id", authMiddleware, requireRole(['admin']), async (c) => {
  try {
    const services = initializeServices(c.env);
    const id = parseInt(c.req.param("id"));
    const provider = await services.cmsService.getAIProviderById(id);
    
    if (!provider) {
      return c.json({
        success: false,
        error: 'AI provider not found'
      }, 404);
    }
    
    return c.json<ApiResponse>({
      success: true,
      data: provider,
    });
  } catch (error) {
    console.error('CMS AI provider fetch error:', error);
    return c.json({
      success: false,
      error: 'Failed to fetch AI provider'
    }, 500);
  }
});

app.post("/api/cms/ai/providers", authMiddleware, requireRole(['admin']), async (c) => {
  try {
    const services = initializeServices(c.env);
    const data = await c.req.json();
    
    const provider = await services.cmsService.createAIProvider(data);
    
    return c.json<ApiResponse>({
      success: true,
      data: provider,
      message: "AI provider created successfully",
    });
  } catch (error) {
    console.error('CMS AI provider creation error:', error);
    return c.json({
      success: false,
      error: (error as Error).message || 'Failed to create AI provider'
    }, 500);
  }
});

app.put("/api/cms/ai/providers/:id", authMiddleware, requireRole(['admin']), async (c) => {
  try {
    const services = initializeServices(c.env);
    const id = parseInt(c.req.param("id"));
    const data = await c.req.json();
    
    // Check if provider exists
    const existingProvider = await services.cmsService.getAIProviderById(id);
    if (!existingProvider) {
      return c.json({
        success: false,
        error: 'AI provider not found'
      }, 404);
    }
    
    const provider = await services.cmsService.updateAIProvider(id, data);
    
    return c.json<ApiResponse>({
      success: true,
      data: provider,
      message: "AI provider updated successfully",
    });
  } catch (error) {
    console.error('CMS AI provider update error:', error);
    return c.json({
      success: false,
      error: (error as Error).message || 'Failed to update AI provider'
    }, 500);
  }
});

app.delete("/api/cms/ai/providers/:id", authMiddleware, requireRole(['admin']), async (c) => {
  try {
    const services = initializeServices(c.env);
    const id = parseInt(c.req.param("id"));
    
    // Check if provider exists
    const existingProvider = await services.cmsService.getAIProviderById(id);
    if (!existingProvider) {
      return c.json({
        success: false,
        error: 'AI provider not found'
      }, 404);
    }
    
    const result = await services.cmsService.deleteAIProvider(id);
    
    if (!result) {
      return c.json({
        success: false,
        error: 'Failed to delete AI provider'
      }, 500);
    }
    
    return c.json<ApiResponse>({
      success: true,
      message: "AI provider deleted successfully",
    });
  } catch (error) {
    console.error('CMS AI provider delete error:', error);
    return c.json({
      success: false,
      error: (error as Error).message || 'Failed to delete AI provider'
    }, 500);
  }
});

// AI Models
app.get("/api/cms/ai/providers/:providerId/models", authMiddleware, requireRole(['admin']), async (c) => {
  try {
    const services = initializeServices(c.env);
    const providerId = parseInt(c.req.param("providerId"));
    const models = await services.cmsService.getModelsByProvider(providerId);
    
    return c.json<ApiResponse>({
      success: true,
      data: models,
    });
  } catch (error) {
    console.error('CMS AI models fetch error:', error);
    return c.json({
      success: false,
      error: 'Failed to fetch AI models'
    }, 500);
  }
});

app.post("/api/cms/ai/providers/:providerId/models/refresh", authMiddleware, requireRole(['admin']), async (c) => {
  try {
    const services = initializeServices(c.env);
    const providerId = parseInt(c.req.param("providerId"));
    
    // Refresh models from the provider
    const models = await services.aiContentService.refreshModelsFromProvider(providerId);
    
    return c.json<ApiResponse>({
      success: true,
      data: models,
      message: "Models refreshed successfully",
    });
  } catch (error) {
    console.error('CMS AI models refresh error:', error);
    return c.json({
      success: false,
      error: (error as Error).message || 'Failed to refresh AI models'
    }, 500);
  }
});

app.post("/api/cms/ai/models", authMiddleware, requireRole(['admin']), async (c) => {
  try {
    const services = initializeServices(c.env);
    const data = await c.req.json();
    
    const model = await services.cmsService.createAIModel(data);
    
    return c.json<ApiResponse>({
      success: true,
      data: model,
      message: "AI model created successfully",
    });
  } catch (error) {
    console.error('CMS AI model creation error:', error);
    return c.json({
      success: false,
      error: (error as Error).message || 'Failed to create AI model'
    }, 500);
  }
});

app.put("/api/cms/ai/models/:id", authMiddleware, requireRole(['admin']), async (c) => {
  try {
    const services = initializeServices(c.env);
    const id = parseInt(c.req.param("id"));
    const data = await c.req.json();
    
    const model = await services.cmsService.updateAIModel(id, data);
    
    return c.json<ApiResponse>({
      success: true,
      data: model,
      message: "AI model updated successfully",
    });
  } catch (error) {
    console.error('CMS AI model update error:', error);
    return c.json({
      success: false,
      error: (error as Error).message || 'Failed to update AI model'
    }, 500);
  }
});

app.delete("/api/cms/ai/models/:id", authMiddleware, requireRole(['admin']), async (c) => {
  try {
    const services = initializeServices(c.env);
    const id = parseInt(c.req.param("id"));
    
    const result = await services.cmsService.deleteAIModel(id);
    
    if (!result) {
      return c.json({
        success: false,
        error: 'Failed to delete AI model'
      }, 500);
    }
    
    return c.json<ApiResponse>({
      success: true,
      message: "AI model deleted successfully",
    });
  } catch (error) {
    console.error('CMS AI model delete error:', error);
    return c.json({
      success: false,
      error: (error as Error).message || 'Failed to delete AI model'
    }, 500);
  }
});

// AI Content Jobs
app.get("/api/cms/ai/jobs", authMiddleware, requireRole(['admin']), async (c) => {
  try {
    const services = initializeServices(c.env);
    const jobs = await services.cmsService.getPendingAIContentJobs();
    
    return c.json<ApiResponse>({
      success: true,
      data: jobs,
    });
  } catch (error) {
    console.error('CMS AI jobs fetch error:', error);
    return c.json({
      success: false,
      error: 'Failed to fetch AI jobs'
    }, 500);
  }
});

app.post("/api/cms/ai/generate", authMiddleware, requireRole(['admin']), async (c) => {
  try {
    const services = initializeServices(c.env);
    const user = c.get("user");
    const data = await c.req.json();
    
    const jobData = {
      ...data,
      created_by: user.id,
    };
    
    const job = await services.cmsService.createAIContentJob(jobData);
    
    return c.json<ApiResponse>({
      success: true,
      data: job,
      message: "AI content job created successfully",
    });
  } catch (error) {
    console.error('CMS AI content job creation error:', error);
    return c.json({
      success: false,
      error: (error as Error).message || 'Failed to create AI content job'
    }, 500);
  }
});

app.put("/api/cms/ai/jobs/:id", authMiddleware, requireRole(['admin']), async (c) => {
  try {
    const services = initializeServices(c.env);
    const id = parseInt(c.req.param("id"));
    const data = await c.req.json();
    
    const job = await services.cmsService.updateAIContentJob(id, data);
    
    return c.json<ApiResponse>({
      success: true,
      data: job,
      message: "AI content job updated successfully",
    });
  } catch (error) {
    console.error('CMS AI content job update error:', error);
    return c.json({
      success: false,
      error: (error as Error).message || 'Failed to update AI content job'
    }, 500);
  }
});

// Process pending AI content jobs
app.post("/api/cms/ai/process-jobs", authMiddleware, requireRole(['admin']), async (c) => {
  try {
    const services = initializeServices(c.env);
    
    // Process pending jobs
    await services.aiContentService.processPendingJobs();
    
    return c.json<ApiResponse>({
      success: true,
      message: "AI content jobs processed successfully",
    });
  } catch (error) {
    console.error('CMS AI content jobs process error:', error);
    return c.json({
      success: false,
      error: (error as Error).message || 'Failed to process AI content jobs'
    }, 500);
  }
});

// Create a new content version
app.post("/api/cms/content-versions", authMiddleware, requireRole(['admin']), async (c) => {
  try {
    const services = initializeServices(c.env);
    const user = c.get("user");
    const data = await c.req.json();
    
    const versionData = {
      ...data,
      created_by: user.id,
    };
    
    const version = await services.cmsService.createContentVersion(versionData);
    
    return c.json<ApiResponse>({
      success: true,
      data: version,
      message: "Content version created successfully",
    });
  } catch (error) {
    console.error('CMS content version creation error:', error);
    return c.json({
      success: false,
      error: (error as Error).message || 'Failed to create content version'
    }, 500);
  }
});

// Get content versions for a specific content item
app.get("/api/cms/content-versions/:contentId/:contentType", authMiddleware, requireRole(['admin']), async (c) => {
  try {
    const services = initializeServices(c.env);
    const contentId = parseInt(c.req.param("contentId"));
    const contentType = c.req.param("contentType");
    
    const versions = await services.cmsService.getContentVersions(contentId, contentType);
    
    return c.json<ApiResponse>({
      success: true,
      data: versions,
    });
  } catch (error) {
    console.error('CMS content versions fetch error:', error);
    return c.json({
      success: false,
      error: 'Failed to fetch content versions'
    }, 500);
  }
});

// CMS Permissions Management

// Get all CMS permissions for current user
app.get("/api/cms/permissions", authMiddleware, requireRole(['admin']), async (c) => {
  try {
    const services = initializeServices(c.env);
    const userId = c.get("userId") as string;
    
    const permissions = await services.cmsPermissionsService.getUserCMSPermissions(userId);
    
    return c.json<ApiResponse>({
      success: true,
      data: permissions,
    });
  } catch (error) {
    console.error('CMS permissions fetch error:', error);
    return c.json({
      success: false,
      error: 'Failed to fetch permissions'
    }, 500);
  }
});

// Get all available CMS permissions
app.get("/api/cms/permissions/all", authMiddleware, requireRole(['admin']), async (c) => {
  try {
    const services = initializeServices(c.env);
    
    const permissions = await services.cmsPermissionsService.getAllCMSPermissions();
    
    return c.json<ApiResponse>({
      success: true,
      data: permissions,
    });
  } catch (error) {
    console.error('CMS all permissions fetch error:', error);
    return c.json({
      success: false,
      error: 'Failed to fetch permissions'
    }, 500);
  }
});

// Check if user has specific CMS permission
app.get("/api/cms/permissions/check/:permission", authMiddleware, requireRole(['admin']), async (c) => {
  try {
    const services = initializeServices(c.env);
    const userId = c.get("userId") as string;
    const permission = c.req.param("permission");
    
    const hasPermission = await services.cmsPermissionsService.userHasCMSPermission(userId, permission);
    
    return c.json<ApiResponse>({
      success: true,
      data: { hasPermission },
    });
  } catch (error) {
    console.error('CMS permission check error:', error);
    return c.json({
      success: false,
      error: 'Failed to check permission'
    }, 500);
  }
});

// Grant CMS permission to user
app.post("/api/cms/permissions/grant", authMiddleware, requireRole(['admin']), async (c) => {
  try {
    const services = initializeServices(c.env);
    const data = await c.req.json();
    
    await services.cmsPermissionsService.grantCMSPermission(data.userId, data.permission);
    
    return c.json<ApiResponse>({
      success: true,
      message: "Permission granted successfully",
    });
  } catch (error) {
    console.error('CMS permission grant error:', error);
    return c.json({
      success: false,
      error: (error as Error).message || 'Failed to grant permission'
    }, 500);
  }
});

// Revoke CMS permission from user
app.post("/api/cms/permissions/revoke", authMiddleware, requireRole(['admin']), async (c) => {
  try {
    const services = initializeServices(c.env);
    const data = await c.req.json();
    
    await services.cmsPermissionsService.revokeCMSPermission(data.userId, data.permission);
    
    return c.json<ApiResponse>({
      success: true,
      message: "Permission revoked successfully",
    });
  } catch (error) {
    console.error('CMS permission revoke error:', error);
    return c.json({
      success: false,
      error: (error as Error).message || 'Failed to revoke permission'
    }, 500);
  }
});

// Get users with specific CMS permission
app.get("/api/cms/permissions/users/:permission", authMiddleware, requireRole(['admin']), async (c) => {
  try {
    const services = initializeServices(c.env);
    const permission = c.req.param("permission");
    
    const users = await services.cmsPermissionsService.getUsersWithCMSPermission(permission);
    
    return c.json<ApiResponse>({
      success: true,
      data: users,
    });
  } catch (error) {
    console.error('CMS users with permission fetch error:', error);
    return c.json({
      success: false,
      error: 'Failed to fetch users'
    }, 500);
  }
});

// Public route to get a page by slug (for frontend rendering)
app.get("/api/cms/pages/slug/:slug", async (c) => {
  try {
    const services = initializeServices(c.env);
    const slug = c.req.param("slug");
    const page = await services.cmsService.getPageBySlug(slug);
    
    if (!page) {
      return c.json({
        success: false,
        error: 'Page not found'
      }, 404);
    }
    
    return c.json<ApiResponse>({
      success: true,
      data: page,
    });
  } catch (error) {
    console.error('CMS page by slug fetch error:', error);
    return c.json({
      success: false,
      error: 'Failed to fetch page'
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