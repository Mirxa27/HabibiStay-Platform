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
} from "@/shared/types";
import { MyFatoorahService, CreatePaymentSchema, PaymentCallbackSchema } from "@/shared/payment";
import { DEFAULT_EMAIL_TEMPLATES, EMAIL_TEMPLATES, renderEmailTemplate } from "@/shared/email";
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
} from "@/shared/security-middleware";
import { auditLogger } from "@/shared/security-utils";
import { AIChatService, ChatRequestSchema as EnhancedChatRequestSchema } from "@/shared/ai-chat-service";
import { EnhancedEmailService } from "@/shared/enhanced-email-service";
import { NotificationService } from "@/shared/notification-service";
import { PaymentService } from "@/server/services/PaymentService";
import { ChatRequestSchema as LegacyChatRequestSchema } from "@/shared/types";
import { z } from 'zod';

// Booking validation schemas
export const BookingCreateSchema = z.object({
  property_id: z.number().positive(),
  check_in_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  check_out_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  guests: z.number().min(1).max(20),
  guest_name: z.string().min(2).max(100),
  guest_email: z.string().email(),
  guest_phone: z.string().min(10),
  special_requests: z.string().optional(),
  promo_code: z.string().optional()
});

const app = new Hono<{ Bindings: Env }>();

// CORS middleware
app.use("*", cors({
  origin: "*",
  allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowHeaders: ["Content-Type", "Authorization"],
}));

// Initialize OpenAI client
function getOpenAIClient(env: Env): OpenAI {
  return new OpenAI({
    apiKey: env.OPENAI_API_KEY,
  });
}

// Initialize MyFatoorah service
function getMyFatoorahService(env: Env): MyFatoorahService {
  return new MyFatoorahService(
    env.MYFATOORAH_API_KEY,
    env.MYFATOORAH_API_URL || 'https://apitest.myfatoorah.com'
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

    // In a real implementation, you would integrate with an email service like SendGrid, AWS SES, etc.
    // For now, we'll log the email and save it to the email_logs table
    console.log('Email would be sent:', {
      to,
      subject,
      templateKey,
      variables,
    });

    // Log email attempt
    await env.DB.prepare(`
      INSERT INTO email_logs (recipient_email, template_key, subject, status, sent_at)
      VALUES (?, ?, ?, ?, ?)
    `).bind(to, templateKey, subject, 'sent', new Date().toISOString()).run();

    return true;
  } catch (error) {
    console.error('Email sending failed:', error);
    
    // Log failed email
    await env.DB.prepare(`
      INSERT INTO email_logs (recipient_email, template_key, subject, status, error_message)
      VALUES (?, ?, ?, ?, ?)
    `).bind(to, templateKey, 'Failed to render template', 'failed', (error as Error).message).run();

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

// Error handler middleware
async function errorHandler(c: any, next: any) {
  try {
    await next();
  } catch (error) {
    console.error('API Error:', error);
    
    return c.json({
      success: false,
      error: 'Internal server error',
      message: (error as Error).message,
    }, 500);
  }
}

// Add error handler middleware
app.use('*', errorHandler);

// Auth routes
app.get('/api/oauth/google/redirect_url', async (c) => {
  const redirectUrl = await getOAuthRedirectUrl('google', {
    apiUrl: c.env.MOCHA_USERS_SERVICE_API_URL,
    apiKey: c.env.MOCHA_USERS_SERVICE_API_KEY,
  });

  return c.json({ redirectUrl }, 200);
});

app.post("/api/sessions", async (c) => {
  const body = await c.req.json();

  if (!body.code) {
    return c.json({ error: "No authorization code provided" }, 400);
  }

  const sessionToken = await exchangeCodeForSessionToken(body.code, {
    apiUrl: c.env.MOCHA_USERS_SERVICE_API_URL,
    apiKey: c.env.MOCHA_USERS_SERVICE_API_KEY,
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
      apiUrl: c.env.MOCHA_USERS_SERVICE_API_URL,
      apiKey: c.env.MOCHA_USERS_SERVICE_API_KEY,
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

// Properties routes - Enhanced search
app.get("/api/properties", zValidator("query", AdvancedPropertySearchSchema.partial()), async (c) => {
  const searchParams = c.req.valid("query");
  const { 
    location, guests, min_price, max_price, amenities,
    bedrooms, bathrooms, rating, sort_by, page = 1, limit = 20 
  } = searchParams;
  
  let query = "SELECT p.*, AVG(r.rating) as avg_rating, COUNT(r.id) as review_count FROM properties p LEFT JOIN reviews r ON p.id = r.property_id WHERE p.is_active = 1";
  const params: any[] = [];
  
  if (location) {
    query += " AND p.location LIKE ?";
    params.push(`%${location}%`);
  }
  
  if (guests) {
    query += " AND p.max_guests >= ?";
    params.push(guests);
  }
  
  if (min_price) {
    query += " AND p.price_per_night >= ?";
    params.push(min_price);
  }
  
  if (max_price) {
    query += " AND p.price_per_night <= ?";
    params.push(max_price);
  }
  
  if (bedrooms) {
    query += " AND p.bedrooms >= ?";
    params.push(bedrooms);
  }
  
  if (bathrooms) {
    query += " AND p.bathrooms >= ?";
    params.push(bathrooms);
  }
  
  if (amenities && amenities.length > 0) {
    const amenityConditions = amenities.map(() => "p.amenities LIKE ?").join(" AND ");
    query += ` AND (${amenityConditions})`;
    amenities.forEach(amenity => params.push(`%${amenity}%`));
  }
  
  query += " GROUP BY p.id";
  
  if (rating) {
    query += " HAVING avg_rating >= ?";
    params.push(rating);
  }
  
  // Sorting
  switch (sort_by) {
    case 'price_asc':
      query += " ORDER BY p.price_per_night ASC";
      break;
    case 'price_desc':
      query += " ORDER BY p.price_per_night DESC";
      break;
    case 'rating':
      query += " ORDER BY avg_rating DESC NULLS LAST";
      break;
    case 'newest':
      query += " ORDER BY p.created_at DESC";
      break;
    case 'featured':
      query += " ORDER BY p.is_featured DESC, p.created_at DESC";
      break;
    default:
      query += " ORDER BY p.is_featured DESC, p.created_at DESC";
  }
  
  // Pagination
  const offset = (page - 1) * limit;
  query += " LIMIT ? OFFSET ?";
  params.push(limit, offset);
  
  // Get total count for pagination
  let countQuery = "SELECT COUNT(DISTINCT p.id) as total FROM properties p LEFT JOIN reviews r ON p.id = r.property_id WHERE p.is_active = 1";
  const countParams: any[] = [];
  
  if (location) {
    countQuery += " AND p.location LIKE ?";
    countParams.push(`%${location}%`);
  }
  if (guests) {
    countQuery += " AND p.max_guests >= ?";
    countParams.push(guests);
  }
  if (min_price) {
    countQuery += " AND p.price_per_night >= ?";
    countParams.push(min_price);
  }
  if (max_price) {
    countQuery += " AND p.price_per_night <= ?";
    countParams.push(max_price);
  }
  if (bedrooms) {
    countQuery += " AND p.bedrooms >= ?";
    countParams.push(bedrooms);
  }
  if (bathrooms) {
    countQuery += " AND p.bathrooms >= ?";
    countParams.push(bathrooms);
  }
  if (amenities && amenities.length > 0) {
    const amenityConditions = amenities.map(() => "p.amenities LIKE ?").join(" AND ");
    countQuery += ` AND (${amenityConditions})`;
    amenities.forEach(amenity => countParams.push(`%${amenity}%`));
  }
  
  const [{ results }, countResult] = await Promise.all([
    c.env.DB.prepare(query).bind(...params).all(),
    c.env.DB.prepare(countQuery).bind(...countParams).first()
  ]);
  
  const total = (countResult as any)?.total || 0;
  const totalPages = Math.ceil(total / limit);
  
  return c.json({
    success: true,
    data: results as Property[],
    pagination: {
      page,
      limit,
      total,
      totalPages,
    },
  });
});

app.get("/api/properties/featured", async (c) => {
  const { results } = await c.env.DB.prepare(
    "SELECT * FROM properties WHERE is_featured = 1 AND is_active = 1 ORDER BY created_at DESC LIMIT 2"
  ).all();
  
  return c.json<ApiResponse<Property[]>>({
    success: true,
    data: results as Property[],
  });
});

app.get("/api/properties/:id", async (c) => {
  const id = c.req.param("id");
  
  // Get property with reviews and analytics
  const [property, reviews] = await Promise.all([
    c.env.DB.prepare(`
      SELECT p.*, AVG(r.rating) as avg_rating, COUNT(r.id) as review_count
      FROM properties p 
      LEFT JOIN reviews r ON p.id = r.property_id 
      WHERE p.id = ? AND p.is_active = 1
      GROUP BY p.id
    `).bind(id).first(),
    c.env.DB.prepare(`
      SELECT r.*, up.full_name as reviewer_name
      FROM reviews r
      LEFT JOIN user_profiles up ON r.user_id = up.user_id
      WHERE r.property_id = ?
      ORDER BY r.created_at DESC
      LIMIT 10
    `).bind(id).all()
  ]);
  
  if (!property) {
    return c.json<ApiResponse>({
      success: false,
      error: "Property not found",
    }, 404);
  }
  
  // Track property view
  await trackPropertyView(c.env, parseInt(id));
  
  return c.json<ApiResponse>({
    success: true,
    data: {
      ...property,
      reviews: reviews.results,
    },
  });
});

app.post("/api/properties", authMiddleware, zValidator("json", CreatePropertySchema), async (c) => {
  const user = c.get("user");
  if (!user) {
    return c.json<ApiResponse>({
      success: false,
      error: "User not authenticated",
    }, 401);
  }
  const data = c.req.valid("json");
  
  const { success } = await c.env.DB.prepare(`
    INSERT INTO properties (user_id, title, description, location, price_per_night, max_guests, bedrooms, bathrooms, amenities, images)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    user.id,
    data.title,
    data.description || null,
    data.location,
    data.price_per_night,
    data.max_guests,
    data.bedrooms || null,
    data.bathrooms || null,
    data.amenities ? JSON.stringify(data.amenities) : null,
    data.images ? JSON.stringify(data.images) : null
  ).run();
  
  if (!success) {
    return c.json<ApiResponse>({
      success: false,
      error: "Failed to create property",
    }, 500);
  }
  
  return c.json<ApiResponse>({
    success: true,
    message: "Property created successfully",
  });
});

// Helper function for generating alternative booking dates
async function generateAlternativeDates(db: any, propertyId: number, originalCheckIn: string, originalCheckOut: string): Promise<Array<{ check_in: string; check_out: string; price: number }>> {
  try {
    const checkIn = new Date(originalCheckIn);
    const checkOut = new Date(originalCheckOut);
    const nightsDuration = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
    
    const suggestions = [];
    
    // Try different starting dates (1, 3, 7, 14 days later)
    for (const dayOffset of [1, 3, 7, 14]) {
      const newCheckIn = new Date(checkIn);
      newCheckIn.setDate(newCheckIn.getDate() + dayOffset);
      
      const newCheckOut = new Date(newCheckIn);
      newCheckOut.setDate(newCheckOut.getDate() + nightsDuration);
      
      const checkInStr = newCheckIn.toISOString().split('T')[0];
      const checkOutStr = newCheckOut.toISOString().split('T')[0];
      
      // Check availability
      const conflictingBooking = await db.prepare(`
        SELECT id FROM bookings 
        WHERE property_id = ? 
        AND status IN ('pending', 'confirmed')
        AND (
          (check_in_date < ? AND check_out_date > ?) OR
          (check_in_date < ? AND check_out_date > ?) OR
          (check_in_date >= ? AND check_out_date <= ?)
        )
      `).bind(
        propertyId,
        checkOutStr, checkInStr,
        checkOutStr, checkOutStr,
        checkInStr, checkOutStr
      ).first();
      
      if (!conflictingBooking) {
        // Get property price for suggestion
        const property = await db.prepare('SELECT price_per_night FROM properties WHERE id = ?').bind(propertyId).first();
        const totalPrice = property ? (property.price_per_night * nightsDuration * 1.32) : 0; // Include fees estimate
        
        suggestions.push({
          check_in: checkInStr,
          check_out: checkOutStr,
          price: Math.round(totalPrice)
        });
        
        if (suggestions.length >= 3) break; // Limit to 3 suggestions
      }
    }
    
    return suggestions;
  } catch (error) {
    console.error('Alternative dates generation error:', error);
    return [];
  }
}

// Helper function for detailed pricing calculation
async function calculateDetailedPricing(db: any, propertyId: number, checkInDate: string, checkOutDate: string, guests: number, promoCode?: string): Promise<{
  base_price: number;
  nights: number;
  subtotal: number;
  cleaning_fee: number;
  service_fee: number;
  taxes: number;
  discounts: number;
  total_amount: number;
}> {
  try {
    const property = await db.prepare('SELECT * FROM properties WHERE id = ?').bind(propertyId).first();
    if (!property) throw new Error('Property not found');

    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));

    // Base pricing
    let basePrice = property.price_per_night;

    // Calculate subtotal
    const subtotal = basePrice * nights;

    // Service fees
    const serviceFeeRate = 0.12; // 12%
    const serviceFee = Math.round(subtotal * serviceFeeRate);

    // Cleaning fee
    const cleaningFee = property.cleaning_fee || Math.round(basePrice * 0.15); // 15% of nightly rate

    // Taxes (VAT)
    const taxRate = 0.15; // 15% VAT in Saudi Arabia
    const taxableAmount = subtotal + serviceFee + cleaningFee;
    const taxes = Math.round(taxableAmount * taxRate);

    // Calculate discounts
    let totalDiscountAmount = 0;
    
    // Weekly discount (7+ nights)
    if (nights >= 7) {
      totalDiscountAmount += Math.round(subtotal * 0.1); // 10%
    }
    
    // Monthly discount (28+ nights)
    if (nights >= 28) {
      totalDiscountAmount += Math.round(subtotal * 0.15); // Additional 15%
    }
    
    // Promo code discount
    if (promoCode) {
      const promo = await db.prepare(`
        SELECT * FROM promo_codes 
        WHERE code = ? 
        AND is_active = 1 
        AND (expires_at IS NULL OR expires_at > datetime('now'))
        AND (usage_count < max_uses OR max_uses IS NULL)
      `).bind(promoCode).first();

      if (promo) {
        let promoDiscount = 0;
        if (promo.discount_type === 'percentage') {
          promoDiscount = Math.round(subtotal * (promo.discount_value / 100));
        } else if (promo.discount_type === 'fixed') {
          promoDiscount = Math.min(promo.discount_value, subtotal);
        }
        totalDiscountAmount += promoDiscount;
      }
    }

    // Calculate total
    const totalAmount = Math.max(subtotal + serviceFee + cleaningFee + taxes - totalDiscountAmount, 0);

    return {
      base_price: basePrice,
      nights,
      subtotal,
      cleaning_fee: cleaningFee,
      service_fee: serviceFee,
      taxes,
      discounts: totalDiscountAmount,
      total_amount: totalAmount
    };

  } catch (error) {
    console.error('Pricing calculation error:', error);
    throw new Error('Failed to calculate pricing');
  }
}

// Bookings routes
app.post("/api/bookings", zValidator("json", BookingCreateSchema), async (c) => {
  const data = c.req.valid("json");
  const userId = c.get("user")?.id;
  const ip = c.req.header('cf-connecting-ip') || 'unknown';
  
  try {
    // Validate booking data
    const property = await c.env.DB.prepare(
      "SELECT * FROM properties WHERE id = ? AND is_active = 1"
    ).bind(data.property_id).first();
    
    if (!property) {
      return c.json<ApiResponse>({
        success: false,
        error: "Property not found or inactive",
      }, 404);
    }

    // Validate dates
    const checkIn = new Date(data.check_in_date);
    const checkOut = new Date(data.check_out_date);
    const todayValidation = new Date();
    todayValidation.setHours(0, 0, 0, 0);

    if (checkIn < todayValidation) {
      return c.json<ApiResponse>({
        success: false,
        error: 'Check-in date cannot be in the past'
      }, 400);
    }

    if (checkOut <= checkIn) {
      return c.json<ApiResponse>({
        success: false,
        error: 'Check-out date must be after check-in date'
      }, 400);
    }

    // Check guest capacity
    if (data.guests > (property as any).max_guests) {
      return c.json<ApiResponse>({
        success: false,
        error: `Property can accommodate maximum ${(property as any).max_guests} guests`
      }, 400);
    }

    // Atomic availability check
    const conflictingBooking = await c.env.DB.prepare(`
      SELECT id FROM bookings 
      WHERE property_id = ? 
      AND status IN ('pending', 'confirmed')
      AND (
        (check_in_date < ? AND check_out_date > ?) OR
        (check_in_date < ? AND check_out_date > ?) OR
        (check_in_date >= ? AND check_out_date <= ?)
      )
    `).bind(
      data.property_id,
      data.check_out_date, data.check_in_date,
      data.check_out_date, data.check_out_date,
      data.check_in_date, data.check_out_date
    ).first();
    
    if (conflictingBooking) {
      // Generate alternative dates
      const alternatives = await generateAlternativeDates(c.env.DB, data.property_id, data.check_in_date, data.check_out_date);
      
      return c.json<ApiResponse>({
        success: false,
        error: "Property is not available for selected dates",
        suggested_dates: alternatives
      } as any, 409);
    }

    // Calculate detailed pricing
    const pricing = await calculateDetailedPricing(
      c.env.DB, 
      data.property_id, 
      data.check_in_date, 
      data.check_out_date, 
      data.guests,
      data.promo_code
    );

    // Generate unique booking ID
    const bookingId = `HBS${Date.now().toString().slice(-8)}${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

    // Create booking with transaction
    const result = await c.env.DB.prepare(`
      INSERT INTO bookings (
        id, user_id, property_id, check_in_date, check_out_date, guests,
        total_amount, status, guest_name, guest_email, guest_phone,
        special_requests, pricing_breakdown, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      bookingId,
      userId || 'guest',
      data.property_id,
      data.check_in_date,
      data.check_out_date,
      data.guests,
      pricing.total_amount,
      'pending',
      data.guest_name,
      data.guest_email,
      data.guest_phone,
      data.special_requests || '',
      JSON.stringify(pricing),
      new Date().toISOString(),
      new Date().toISOString()
    ).run();

    if (!result.success) {
      return c.json<ApiResponse>({
        success: false,
        error: "Failed to create booking",
      }, 500);
    }

    // Update property analytics
    const todayAnalytics = new Date().toISOString().split('T')[0];
    await c.env.DB.prepare(`
      INSERT INTO property_analytics (property_id, bookings, revenue, date) 
      VALUES (?, 1, ?, ?)
      ON CONFLICT(property_id, date) 
      DO UPDATE SET 
        bookings = bookings + 1, 
        revenue = revenue + ?,
        updated_at = CURRENT_TIMESTAMP
    `).bind(data.property_id, pricing.total_amount, todayAnalytics, pricing.total_amount).run();

    // Send booking confirmation email
    await sendEmail(c.env, data.guest_email, EMAIL_TEMPLATES.BOOKING_CONFIRMATION, {
      guest_name: data.guest_name,
      property_title: (property as any).title,
      property_location: (property as any).location,
      check_in_date: new Date(data.check_in_date).toLocaleDateString(),
      check_out_date: new Date(data.check_out_date).toLocaleDateString(),
      guests: data.guests,
      total_amount: pricing.total_amount,
      booking_id: bookingId,
      nights: pricing.nights,
      base_price: pricing.base_price,
      service_fee: pricing.service_fee,
      cleaning_fee: pricing.cleaning_fee,
      taxes: pricing.taxes,
      discounts: pricing.discounts
    });

    // Log booking creation
    await auditLogger.log({
      userId: userId || 'anonymous',
      ip,
      action: 'BOOKING_CREATED',
      resource: `/api/bookings`,
      details: {
        booking_id: bookingId,
        property_id: data.property_id,
        total_amount: pricing.total_amount,
        guests: data.guests,
        nights: pricing.nights
      },
      success: true
    });

    return c.json<ApiResponse>({
      success: true,
      data: {
        booking_id: bookingId,
        total_amount: pricing.total_amount,
        pricing_breakdown: pricing,
        status: 'pending',
        property_title: (property as any).title,
        next_step: {
          action: 'payment_required',
          payment_endpoint: '/api/payments/create',
          payment_data: {
            bookingId: bookingId,
            amount: pricing.total_amount,
            currency: 'SAR',
            description: `Booking for ${(property as any).title}`,
            available_providers: ['myfatoorah', 'paypal']
          }
        }
      },
    });
    
  } catch (error) {
    console.error('Booking creation error:', error);
    
    // Log booking error
    await auditLogger.log({
      userId: userId || 'anonymous',
      ip,
      action: 'BOOKING_CREATE_ERROR',
      resource: `/api/bookings`,
      details: {
        property_id: data.property_id,
        error: (error as Error).message
      },
      success: false
    });
    
    return c.json<ApiResponse>({
      success: false,
      error: "Failed to create booking: " + (error as Error).message,
    }, 500);
  }
});

// Chat routes - Enhanced AI Chat Service Integration
app.post("/api/chat/enhanced", zValidator("json", EnhancedChatRequestSchema), async (c) => {
  try {
    const requestData = c.req.valid("json");
    const user = c.get("user");
    const ip = c.req.header("cf-connecting-ip") || c.req.header("x-forwarded-for") || "unknown";
    
    // Initialize AI Chat Service
    const aiChatService = new AIChatService(c.env.DB);
    
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
    
    const result = await aiChatService.processMessage(chatRequest, user?.id);
    
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
      
      return c.json<ApiResponse>({
        success: true,
        data: result.data
      });
    } else {
      return c.json<ApiResponse>({
        success: false,
        error: result.error
      }, 400);
    }
    
  } catch (error) {
    console.error('Enhanced AI Chat error:', error);
    return c.json<ApiResponse>({
      success: false,
      error: "Unable to process your message at this time. Please try again."
    }, 500);
  }
});

// Legacy chat endpoint (kept for backward compatibility)
app.post("/api/chat", zValidator("json", LegacyChatRequestSchema), async (c) => {
  const { message } = c.req.valid("json");
  
  if (!c.env.OPENAI_API_KEY) {
    return c.json<ApiResponse>({
      success: false,
      error: "OpenAI API key not configured",
    }, 500);
  }
  
  try {
    const openai = getOpenAIClient(c.env);
    
    // Get featured properties for context
    const { results: featuredProperties } = await c.env.DB.prepare(
      "SELECT * FROM properties WHERE is_featured = 1 AND is_active = 1 ORDER BY created_at DESC LIMIT 2"
    ).all();
    
    const systemPrompt = `You are Sara, a friendly and helpful AI assistant for HabibiStay, a premium short-term rental platform in Riyadh, Saudi Arabia. 

Your role is to help guests discover and book exceptional accommodations. You should:
- Be warm, professional, and culturally aware
- Focus on the guest experience and finding perfect stays
- Help with property search, booking questions, and local recommendations
- Always provide helpful, accurate information about our properties and services

Featured properties available:
${featuredProperties.map((p: any) => `- ${p.title} in ${p.location}: ${p.description || 'Luxury accommodation'} - ${p.price_per_night} SAR/night (Max ${p.max_guests} guests)`).join('\n')}

Keep responses conversational, helpful, and focused on creating an exceptional guest experience.`;
    
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message }
      ],
      temperature: 0.7,
      max_tokens: 500,
    });
    
    const responseMessage = completion.choices[0].message.content;
    
    return c.json<ApiResponse<{ message: string }>>({
      success: true,
      data: { message: responseMessage || "I'm here to help you find the perfect stay!" },
    });
    
  } catch (error) {
    console.error('OpenAI API error:', error);
    return c.json<ApiResponse>({
      success: false,
      error: "Failed to process chat message",
    }, 500);
  }
});

// AI Configuration Management Routes
app.get("/api/admin/ai-config", authMiddleware, requireRole(['admin']), async (c) => {
  try {
    const config = await c.env.DB.prepare(`
      SELECT * FROM ai_config WHERE is_active = 1 ORDER BY id DESC LIMIT 1
    `).first();
    
    return c.json<ApiResponse>({
      success: true,
      data: config || {
        model_provider: 'openai',
        model_name: 'gpt-4o-mini',
        temperature: 0.7,
        max_tokens: 500,
        personality: 'friendly',
        language: 'en',
        is_active: false
      }
    });
  } catch (error) {
    console.error('Error fetching AI config:', error);
    return c.json<ApiResponse>({
      success: false,
      error: 'Failed to fetch AI configuration'
    }, 500);
  }
});

app.post("/api/admin/ai-config", authMiddleware, requireRole(['admin']), async (c) => {
  try {
    const body = await c.req.json();
    const user = c.get("user");
    
    // Validate configuration
    const validProviders = ['openai', 'anthropic', 'gemini'];
    const validPersonalities = ['professional', 'friendly', 'casual'];
    
    if (!validProviders.includes(body.model_provider)) {
      return c.json<ApiResponse>({
        success: false,
        error: 'Invalid model provider'
      }, 400);
    }
    
    if (!validPersonalities.includes(body.personality)) {
      return c.json<ApiResponse>({
        success: false,
        error: 'Invalid personality setting'
      }, 400);
    }
    
    // Deactivate existing configurations
    await c.env.DB.prepare(
      "UPDATE ai_config SET is_active = 0, updated_at = ? WHERE is_active = 1"
    ).bind(new Date().toISOString()).run();
    
    // Insert new configuration
    const configId = await c.env.DB.prepare(`
      INSERT INTO ai_config (
        model_provider, model_name, api_key, temperature, max_tokens,
        system_prompt, personality, language, is_active, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      body.model_provider,
      body.model_name,
      body.api_key || null,
      body.temperature || 0.7,
      body.max_tokens || 500,
      body.system_prompt || null,
      body.personality,
      body.language || 'en',
      1,
      new Date().toISOString(),
      new Date().toISOString()
    ).run();
    
    // Log configuration change
    await auditLogger.log({
      userId: user?.id || 'admin',
      ip: c.req.header("cf-connecting-ip") || "unknown",
      action: 'AI_CONFIG_UPDATE',
      resource: '/api/admin/ai-config',
      details: {
        config_id: configId.meta.last_row_id,
        model_provider: body.model_provider,
        model_name: body.model_name,
        personality: body.personality
      },
      success: true
    });
    
    return c.json<ApiResponse>({
      success: true,
      message: 'AI configuration updated successfully'
    });
    
  } catch (error) {
    console.error('Error updating AI config:', error);
    return c.json<ApiResponse>({
      success: false,
      error: 'Failed to update AI configuration'
    }, 500);
  }
});

app.post("/api/admin/ai-config/test", authMiddleware, requireRole(['admin']), async (c) => {
  try {
    const body = await c.req.json();
    const testMessage = body.message || "Hello, this is a test message. Please respond briefly.";
    
    // Initialize AI Chat Service
    const aiChatService = new AIChatService(c.env.DB);
    
    // Test message with basic context
    const testRequest = {
      message: testMessage,
      context: {
        user_preferences: { test_mode: true }
      }
    };
    
    const startTime = Date.now();
    const result = await aiChatService.processMessage(testRequest);
    const responseTime = Date.now() - startTime;
    
    if (result.success) {
      return c.json<ApiResponse>({
        success: true,
        data: {
          response: result.data?.message || 'No response',
          latency: responseTime,
          tokens_used: result.data?.tokens_used || 0,
          confidence: result.data?.confidence || 0
        }
      });
    } else {
      return c.json<ApiResponse>({
        success: false,
        error: result.error
      }, 400);
    }
    
  } catch (error) {
    console.error('AI test error:', error);
    return c.json<ApiResponse>({
      success: false,
      error: 'AI service test failed'
    }, 500);
  }
});

// Chat Conversation Management Routes
app.get("/api/chat/conversations", authMiddleware, async (c) => {
  const user = c.get("user");
  if (!user) {
    return c.json<ApiResponse>({
      success: false,
      error: "User not authenticated",
    }, 401);
  }
  
  try {
    const { results } = await c.env.DB.prepare(`
      SELECT id, user_id, updated_at, is_active,
             json_extract(messages, '$[0].content') as first_message,
             json_array_length(messages) as message_count
      FROM chat_conversations 
      WHERE user_id = ? AND is_active = 1
      ORDER BY updated_at DESC
      LIMIT 50
    `).bind(user.id).all();
    
    return c.json<ApiResponse>({
      success: true,
      data: results.map((conv: any) => ({
        id: conv.id,
        first_message: conv.first_message ? conv.first_message.substring(0, 100) + '...' : 'New conversation',
        message_count: conv.message_count || 0,
        updated_at: conv.updated_at
      }))
    });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return c.json<ApiResponse>({
      success: false,
      error: 'Failed to fetch conversations'
    }, 500);
  }
});

app.get("/api/chat/conversations/:conversationId", authMiddleware, async (c) => {
  const user = c.get("user");
  if (!user) {
    return c.json<ApiResponse>({
      success: false,
      error: "User not authenticated",
    }, 401);
  }
  const conversationId = c.req.param("conversationId");
  
  try {
    const conversation = await c.env.DB.prepare(`
      SELECT * FROM chat_conversations 
      WHERE id = ? AND user_id = ? AND is_active = 1
    `).bind(conversationId, user.id).first();
    
    if (!conversation) {
      return c.json<ApiResponse>({
        success: false,
        error: 'Conversation not found'
      }, 404);
    }
    
    return c.json<ApiResponse>({
      success: true,
      data: {
        id: conversation.id,
        messages: JSON.parse(conversation.messages || '[]'),
        context: JSON.parse(conversation.context || '{}'),
        updated_at: conversation.updated_at
      }
    });
  } catch (error) {
    console.error('Error fetching conversation:', error);
    return c.json<ApiResponse>({
      success: false,
      error: 'Failed to fetch conversation'
    }, 500);
  }
});

app.delete("/api/chat/conversations/:conversationId", authMiddleware, async (c) => {
  const user = c.get("user");
  if (!user) {
    return c.json<ApiResponse>({
      success: false,
      error: "User not authenticated",
    }, 401);
  }
  const conversationId = c.req.param("conversationId");
  
  try {
    const { success } = await c.env.DB.prepare(`
      UPDATE chat_conversations 
      SET is_active = 0, updated_at = ?
      WHERE id = ? AND user_id = ?
    `).bind(new Date().toISOString(), conversationId, user.id).run();
    
    return c.json<ApiResponse>({
      success,
      message: success ? 'Conversation deleted successfully' : 'Failed to delete conversation'
    });
  } catch (error) {
    console.error('Error deleting conversation:', error);
    return c.json<ApiResponse>({
      success: false,
      error: 'Failed to delete conversation'
    }, 500);
  }
});

// Wishlist routes
app.get("/api/wishlist", authMiddleware, async (c) => {
  const user = c.get("user");
  if (!user) {
    return c.json<ApiResponse>({
      success: false,
      error: "User not authenticated",
    }, 401);
  }

  const { results } = await c.env.DB.prepare(`
    SELECT w.*, p.* FROM wishlists w
    JOIN properties p ON w.property_id = p.id
    WHERE w.user_id = ? AND p.is_active = 1
    ORDER BY w.created_at DESC
  `).bind(user.id).all();

  const wishlistItems = results.map((row: any) => ({
    id: row.id,
    property_id: row.property_id,
    created_at: row.created_at,
    property: {
      id: row.property_id,
      user_id: row.user_id,
      title: row.title,
      description: row.description,
      location: row.location,
      price_per_night: row.price_per_night,
      max_guests: row.max_guests,
      bedrooms: row.bedrooms,
      bathrooms: row.bathrooms,
      amenities: row.amenities,
      images: row.images,
      is_featured: row.is_featured,
      is_active: row.is_active,
      created_at: row.property_created_at,
      updated_at: row.property_updated_at,
    }
  }));

  return c.json<ApiResponse>({
    success: true,
    data: wishlistItems,
  });
});

app.post("/api/wishlist/:propertyId", authMiddleware, async (c) => {
  const user = c.get("user");
  if (!user) {
    return c.json<ApiResponse>({
      success: false,
      error: "User not authenticated",
    }, 401);
  }

  const propertyId = c.req.param("propertyId");

  // Check if already in wishlist
  const existing = await c.env.DB.prepare(
    "SELECT id FROM wishlists WHERE user_id = ? AND property_id = ?"
  ).bind(user.id, propertyId).first();

  if (existing) {
    return c.json<ApiResponse>({
      success: false,
      error: "Property already in wishlist",
    }, 400);
  }

  const { success } = await c.env.DB.prepare(`
    INSERT INTO wishlists (user_id, property_id)
    VALUES (?, ?)
  `).bind(user.id, propertyId).run();

  return c.json<ApiResponse>({
    success,
    message: success ? "Added to wishlist" : "Failed to add to wishlist",
  });
});

app.delete("/api/wishlist/:propertyId", authMiddleware, async (c) => {
  const user = c.get("user");
  if (!user) {
    return c.json<ApiResponse>({
      success: false,
      error: "User not authenticated",
    }, 401);
  }

  const propertyId = c.req.param("propertyId");

  const { success } = await c.env.DB.prepare(`
    DELETE FROM wishlists WHERE user_id = ? AND property_id = ?
  `).bind(user.id, propertyId).run();

  return c.json<ApiResponse>({
    success,
    message: success ? "Removed from wishlist" : "Failed to remove from wishlist",
  });
});

// User profile routes
app.get("/api/users/profile", authMiddleware, async (c) => {
  const user = c.get("user");
  if (!user) {
    return c.json<ApiResponse>({
      success: false,
      error: "User not authenticated",
    }, 401);
  }

  // Get user profile and notification settings
  const [profile, notifications] = await Promise.all([
    c.env.DB.prepare("SELECT * FROM user_profiles WHERE user_id = ?").bind(user.id).first(),
    c.env.DB.prepare("SELECT * FROM notification_settings WHERE user_id = ?").bind(user.id).first()
  ]);

  return c.json<ApiResponse>({
    success: true,
    data: {
      profile: profile || {
        full_name: user.google_user_data.name || '',
        phone: '',
        address: '',
        city: '',
        country: 'Saudi Arabia',
        date_of_birth: '',
        preferred_language: 'en',
        currency: 'SAR',
        bio: '',
        avatar_url: user.google_user_data.picture || null,
      },
      notifications: notifications || {
        email_booking_updates: true,
        email_marketing: false,
        sms_booking_updates: true,
        push_notifications: true,
      }
    },
  });
});

app.put("/api/users/profile", authMiddleware, zValidator("json", CreateUserProfileSchema), async (c) => {
  const user = c.get("user");
  if (!user) {
    return c.json<ApiResponse>({
      success: false,
      error: "User not authenticated",
    }, 401);
  }

  const profileData = c.req.valid("json");
  
  // Update or create user profile
  const { success } = await c.env.DB.prepare(`
    INSERT INTO user_profiles (
      user_id, full_name, phone, address, city, country, 
      date_of_birth, preferred_language, currency, bio, avatar_url
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(user_id) DO UPDATE SET
      full_name = COALESCE(excluded.full_name, full_name),
      phone = COALESCE(excluded.phone, phone),
      address = COALESCE(excluded.address, address),
      city = COALESCE(excluded.city, city),
      country = COALESCE(excluded.country, country),
      date_of_birth = COALESCE(excluded.date_of_birth, date_of_birth),
      preferred_language = COALESCE(excluded.preferred_language, preferred_language),
      currency = COALESCE(excluded.currency, currency),
      bio = COALESCE(excluded.bio, bio),
      avatar_url = COALESCE(excluded.avatar_url, avatar_url),
      updated_at = CURRENT_TIMESTAMP
  `).bind(
    user.id,
    profileData.full_name || null,
    profileData.phone || null,
    profileData.address || null,
    profileData.city || null,
    profileData.country || null,
    profileData.date_of_birth || null,
    profileData.preferred_language || 'en',
    profileData.currency || 'SAR',
    profileData.bio || null,
    profileData.avatar_url || null
  ).run();

  return c.json<ApiResponse>({
    success,
    message: success ? "Profile updated successfully" : "Failed to update profile",
  });
});

// User's properties and bookings
app.get("/api/properties/my-properties", authMiddleware, async (c) => {
  const user = c.get("user");
  if (!user) {
    return c.json<ApiResponse>({
      success: false,
      error: "User not authenticated",
    }, 401);
  }

  const { results } = await c.env.DB.prepare(
    "SELECT * FROM properties WHERE user_id = ? ORDER BY created_at DESC"
  ).bind(user.id).all();

  return c.json<ApiResponse<Property[]>>({
    success: true,
    data: results as Property[],
  });
});

app.get("/api/bookings/my-bookings", authMiddleware, async (c) => {
  const user = c.get("user");
  if (!user) {
    return c.json<ApiResponse>({
      success: false,
      error: "User not authenticated",
    }, 401);
  }

  const { results } = await c.env.DB.prepare(`
    SELECT b.*, p.title as property_title FROM bookings b
    LEFT JOIN properties p ON b.property_id = p.id
    WHERE b.user_id = ? OR p.user_id = ?
    ORDER BY b.created_at DESC
  `).bind(user.id, user.id).all();

  return c.json<ApiResponse>({
    success: true,
    data: results,
  });
});

// Admin routes
app.get("/api/admin/stats", authMiddleware, async (c) => {
  const user = c.get("user");
  if (!user || (!user.email.includes('admin') && !user.email.includes('owner'))) {
    return c.json<ApiResponse>({
      success: false,
      error: "Unauthorized",
    }, 403);
  }

  const [usersResult, propertiesResult, bookingsResult, revenueResult] = await Promise.all([
    c.env.DB.prepare("SELECT COUNT(*) as count FROM (SELECT DISTINCT user_id FROM properties UNION SELECT DISTINCT user_id FROM bookings)").first(),
    c.env.DB.prepare("SELECT COUNT(*) as total, COUNT(CASE WHEN is_active = 1 THEN 1 END) as active FROM properties").first(),
    c.env.DB.prepare("SELECT COUNT(*) as total, COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending FROM bookings").first(),
    c.env.DB.prepare("SELECT SUM(total_amount) as total FROM bookings WHERE status = 'completed'").first(),
  ]);

  const stats = {
    total_users: (usersResult as any)?.count || 0,
    total_properties: (propertiesResult as any)?.total || 0,
    active_properties: (propertiesResult as any)?.active || 0,
    total_bookings: (bookingsResult as any)?.total || 0,
    pending_bookings: (bookingsResult as any)?.pending || 0,
    total_revenue: (revenueResult as any)?.total || 0,
    monthly_growth: 12, // Mock data
    occupancy_rate: 85, // Mock data
  };

  return c.json<ApiResponse>({
    success: true,
    data: stats,
  });
});

app.get("/api/admin/properties", authMiddleware, async (c) => {
  const user = c.get("user");
  if (!user || (!user.email.includes('admin') && !user.email.includes('owner'))) {
    return c.json<ApiResponse>({
      success: false,
      error: "Unauthorized",
    }, 403);
  }

  const { results } = await c.env.DB.prepare(
    "SELECT * FROM properties ORDER BY created_at DESC"
  ).all();

  return c.json<ApiResponse<Property[]>>({
    success: true,
    data: results as Property[],
  });
});

app.get("/api/admin/bookings", authMiddleware, async (c) => {
  const user = c.get("user");
  if (!user || (!user.email.includes('admin') && !user.email.includes('owner'))) {
    return c.json<ApiResponse>({
      success: false,
      error: "Unauthorized",
    }, 403);
  }

  const { results } = await c.env.DB.prepare(
    "SELECT * FROM bookings ORDER BY created_at DESC"
  ).all();

  return c.json<ApiResponse>({
    success: true,
    data: results,
  });
});

app.get("/api/admin/settings", authMiddleware, async (c) => {
  const user = c.get("user");
  if (!user || (!user.email.includes('admin') && !user.email.includes('owner'))) {
    return c.json<ApiResponse>({
      success: false,
      error: "Unauthorized",
    }, 403);
  }

  const { results } = await c.env.DB.prepare(
    "SELECT * FROM admin_settings ORDER BY key"
  ).all();

  return c.json<ApiResponse>({
    success: true,
    data: results,
  });
});

app.put("/api/admin/properties/:propertyId/status", authMiddleware, async (c) => {
  const user = c.get("user");
  if (!user || (!user.email.includes('admin') && !user.email.includes('owner'))) {
    return c.json<ApiResponse>({
      success: false,
      error: "Unauthorized",
    }, 403);
  }

  const propertyId = c.req.param("propertyId");
  const { is_active } = await c.req.json();

  const { success } = await c.env.DB.prepare(`
    UPDATE properties SET is_active = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).bind(is_active, propertyId).run();

  return c.json<ApiResponse>({
    success,
    message: success ? "Property status updated" : "Failed to update property status",
  });
});

app.put("/api/admin/bookings/:bookingId/status", authMiddleware, async (c) => {
  const user = c.get("user");
  if (!user || (!user.email.includes('admin') && !user.email.includes('owner'))) {
    return c.json<ApiResponse>({
      success: false,
      error: "Unauthorized",
    }, 403);
  }

  const bookingId = c.req.param("bookingId");
  const { status } = await c.req.json();

  const { success } = await c.env.DB.prepare(`
    UPDATE bookings SET status = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).bind(status, bookingId).run();

  return c.json<ApiResponse>({
    success,
    message: success ? "Booking status updated" : "Failed to update booking status",
  });
});

app.post("/api/admin/settings", authMiddleware, async (c) => {
  const user = c.get("user");
  // Simple admin check - in production, you'd have proper role-based access
  if (!user || (!user.email.includes('admin') && !user.email.includes('owner'))) {
    return c.json<ApiResponse>({
      success: false,
      error: "Unauthorized",
    }, 403);
  }
  
  const { key, value } = await c.req.json();
  
  const { success } = await c.env.DB.prepare(`
    INSERT OR REPLACE INTO admin_settings (key, value, updated_at)
    VALUES (?, ?, CURRENT_TIMESTAMP)
  `).bind(key, value).run();
  
  return c.json<ApiResponse>({
    success,
    message: success ? "Setting updated" : "Failed to update setting",
  });
});

app.get("/api/admin/settings/:key", async (c) => {
  const key = c.req.param("key");
  
  const setting = await c.env.DB.prepare(
    "SELECT * FROM admin_settings WHERE key = ?"
  ).bind(key).first();
  
  return c.json<ApiResponse>({
    success: true,
    data: setting,
  });
});

// Enhanced Payment Integration Routes
app.get("/api/payments/providers", async (c) => {
  try {
    const paymentService = new PaymentService(c.env.DB);
    const providers = await paymentService.getPaymentProviders();
    
    return c.json<ApiResponse>({
      success: true,
      data: providers
    });
  } catch (error) {
    console.error('Error fetching payment providers:', error);
    return c.json<ApiResponse>({
      success: false,
      error: 'Failed to fetch payment providers'
    }, 500);
  }
});

app.get("/api/payments/methods/:provider", async (c) => {
  try {
    const provider = c.req.param('provider');
    const currency = c.req.query('currency') || 'SAR';
    
    const paymentService = new PaymentService(c.env.DB);
    const methods = await paymentService.getPaymentMethods(provider, currency);
    
    return c.json<ApiResponse>({
      success: true,
      data: methods
    });
  } catch (error) {
    console.error('Error fetching payment methods:', error);
    return c.json<ApiResponse>({
      success: false,
      error: 'Failed to fetch payment methods'
    }, 500);
  }
});

app.post("/api/payments/create", authMiddleware, async (c) => {
  try {
    const body = await c.req.json();
    const user = c.get("user");
    const ip = c.req.header("cf-connecting-ip") || "unknown";
    
    // Validate required fields
    const { bookingId, amount, currency = 'SAR', provider = 'myfatoorah', description } = body;
    
    if (!bookingId || !amount || !description) {
      return c.json<ApiResponse>({
        success: false,
        error: 'Missing required payment information'
      }, 400);
    }
    
    // Get booking details for customer info
    const booking = await c.env.DB.prepare(
      "SELECT * FROM bookings WHERE id = ?"
    ).bind(bookingId).first();
    
    if (!booking) {
      return c.json<ApiResponse>({
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
    
    const paymentService = new PaymentService(c.env.DB);
    const result = await paymentService.createPayment(paymentRequest, provider);
    
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
    
    return c.json<ApiResponse>({
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
    return c.json<ApiResponse>({
      success: false,
      error: 'Failed to create payment'
    }, 500);
  }
});

app.get("/api/payments/:paymentId/status", authMiddleware, async (c) => {
  try {
    const paymentId = c.req.param('paymentId');
    const user = c.get("user");
    
    // Get payment record to determine provider
    const payment = await c.env.DB.prepare(
      "SELECT * FROM payments WHERE id = ?"
    ).bind(paymentId).first();
    
    if (!payment) {
      return c.json<ApiResponse>({
        success: false,
        error: 'Payment not found'
      }, 404);
    }
    
    // Check if user owns this payment (through booking)
    if (user) {
      const booking = await c.env.DB.prepare(
        "SELECT user_id FROM bookings WHERE id = ?"
      ).bind(payment.booking_id).first();
      
      if (booking?.user_id !== user.id) {
        return c.json<ApiResponse>({
          success: false,
          error: 'Access denied'
        }, 403);
      }
    }
    
    const paymentService = new PaymentService(c.env.DB);
    const result = await paymentService.verifyPayment(paymentId, payment.provider);
    
    return c.json<ApiResponse>({
      success: true,
      data: {
        payment_id: result.paymentId,
        status: result.status,
        amount: result.amount,
        currency: result.currency,
        transaction_id: result.transactionId
      }
    });
    
  } catch (error) {
    console.error('Payment status error:', error);
    return c.json<ApiResponse>({
      success: false,
      error: 'Failed to get payment status'
    }, 500);
  }
});

app.post("/api/payments/:paymentId/refund", authMiddleware, requireRole(['admin']), async (c) => {
  try {
    const paymentId = c.req.param('paymentId');
    const body = await c.req.json();
    const user = c.get("user");
    const ip = c.req.header("cf-connecting-ip") || "unknown";
    
    const { amount, reason } = body;
    
    if (!amount || amount <= 0) {
      return c.json<ApiResponse>({
        success: false,
        error: 'Valid refund amount is required'
      }, 400);
    }
    
    const paymentService = new PaymentService(c.env.DB);
    const result = await paymentService.processRefund(paymentId, amount, reason);
    
    // Log refund attempt
    await auditLogger.log({
      userId: user?.id || 'admin',
      ip,
      action: 'PAYMENT_REFUND',
      resource: '/api/payments/refund',
      details: {
        payment_id: paymentId,
        refund_amount: amount,
        reason,
        success: result.success
      },
      success: result.success
    });
    
    return c.json<ApiResponse>({
      success: result.success,
      data: {
        refund_id: result.refundId,
        amount: result.amount,
        status: result.status
      },
      error: result.error
    });
    
  } catch (error) {
    console.error('Payment refund error:', error);
    return c.json<ApiResponse>({
      success: false,
      error: 'Failed to process refund'
    }, 500);
  }
});

// Payment Webhook Endpoints
app.post("/api/payments/webhook/myfatoorah", async (c) => {
  try {
    const body = await c.req.json();
    const signature = c.req.header('X-MyFatoorah-Signature');
    const timestamp = c.req.header('X-Timestamp') || new Date().toISOString();
    
    // Create webhook payload
    const webhookPayload = {
      provider: 'myfatoorah',
      event: body.EventType || 'Payment.StatusChanged',
      data: body,
      signature,
      timestamp,
      metadata: {
        user_agent: c.req.header('user-agent'),
        ip_address: c.req.header('cf-connecting-ip')
      }
    };
    
    const paymentService = new PaymentService(c.env.DB);
    await paymentService.handleWebhook(webhookPayload);
    
    return c.json({ success: true, message: 'Webhook processed successfully' });
    
  } catch (error) {
    console.error('MyFatoorah webhook error:', error);
    return c.json({ success: false, error: 'Webhook processing failed' }, 400);
  }
});

app.post("/api/payments/webhook/paypal", async (c) => {
  try {
    const body = await c.req.json();
    const headers = {
      auth_algo: c.req.header('PAYPAL-AUTH-ALGO'),
      cert_url: c.req.header('PAYPAL-CERT-URL'),
      transmission_id: c.req.header('PAYPAL-TRANSMISSION-ID'),
      transmission_sig: c.req.header('PAYPAL-TRANSMISSION-SIG'),
      transmission_time: c.req.header('PAYPAL-TRANSMISSION-TIME'),
      webhook_id: c.req.header('PAYPAL-WEBHOOK-ID')
    };
    
    // Create webhook payload
    const webhookPayload = {
      provider: 'paypal',
      event: body.event_type,
      data: body.resource || body,
      signature: headers.transmission_sig,
      timestamp: headers.transmission_time || new Date().toISOString(),
      metadata: {
        ...headers,
        event_id: body.id,
        user_agent: c.req.header('user-agent'),
        ip_address: c.req.header('cf-connecting-ip')
      }
    };
    
    const paymentService = new PaymentService(c.env.DB);
    await paymentService.handleWebhook(webhookPayload);
    
    return c.json({ success: true, message: 'Webhook processed successfully' });
    
  } catch (error) {
    console.error('PayPal webhook error:', error);
    return c.json({ success: false, error: 'Webhook processing failed' }, 400);
  }
});

// Payment Callback Endpoints (for redirect-based flows)
app.get("/api/payments/callback/myfatoorah", async (c) => {
  try {
    const paymentId = c.req.query('paymentId');
    const invoiceId = c.req.query('Id');
    
    if (!paymentId && !invoiceId) {
      return c.redirect(`${process.env.APP_URL}/payment/error?message=Missing payment identifier`);
    }
    
    const paymentService = new PaymentService(c.env.DB);
    
    // Get payment record
    const payment = await c.env.DB.prepare(
      "SELECT * FROM payments WHERE id = ? OR provider_transaction_id = ?"
    ).bind(paymentId || invoiceId, invoiceId || paymentId).first();
    
    if (!payment) {
      return c.redirect(`${process.env.APP_URL}/payment/error?message=Payment not found`);
    }
    
    // Verify payment status
    const result = await paymentService.verifyPayment(payment.id, 'myfatoorah');
    
    if (result.success && result.status === 'completed') {
      // Update booking status
      await c.env.DB.prepare(
        "UPDATE bookings SET payment_status = 'completed', status = 'confirmed' WHERE id = ?"
      ).bind(payment.booking_id).run();
      
      // Send confirmation notifications
      const notificationService = new NotificationService(c.env.DB, null);
      const booking = await c.env.DB.prepare("SELECT * FROM bookings WHERE id = ?").bind(payment.booking_id).first();
      
      if (booking) {
        await notificationService.sendPaymentConfirmation(booking, result);
      }
      
      return c.redirect(`${process.env.APP_URL}/payment/success?booking_id=${payment.booking_id}`);
    } else {
      return c.redirect(`${process.env.APP_URL}/payment/error?message=Payment verification failed`);
    }
    
  } catch (error) {
    console.error('MyFatoorah callback error:', error);
    return c.redirect(`${process.env.APP_URL}/payment/error?message=Payment processing failed`);
  }
});

app.get("/api/payments/callback/paypal", async (c) => {
  try {
    const token = c.req.query('token');
    const paymentId = c.req.query('paymentId');
    
    if (!token && !paymentId) {
      return c.redirect(`${process.env.APP_URL}/payment/error?message=Missing payment token`);
    }
    
    const paymentService = new PaymentService(c.env.DB);
    
    // Get payment record
    const payment = await c.env.DB.prepare(
      "SELECT * FROM payments WHERE id = ? OR provider_transaction_id = ?"
    ).bind(paymentId || token, token || paymentId).first();
    
    if (!payment) {
      return c.redirect(`${process.env.APP_URL}/payment/error?message=Payment not found`);
    }
    
    // Verify payment status
    const result = await paymentService.verifyPayment(payment.id, 'paypal');
    
    if (result.success && result.status === 'completed') {
      // Update booking status
      await c.env.DB.prepare(
        "UPDATE bookings SET payment_status = 'completed', status = 'confirmed' WHERE id = ?"
      ).bind(payment.booking_id).run();
      
      // Send confirmation notifications
      const notificationService = new NotificationService(c.env.DB, null);
      const booking = await c.env.DB.prepare("SELECT * FROM bookings WHERE id = ?").bind(payment.booking_id).first();
      
      if (booking) {
        await notificationService.sendPaymentConfirmation(booking, result);
      }
      
      return c.redirect(`${process.env.APP_URL}/payment/success?booking_id=${payment.booking_id}`);
    } else {
      return c.redirect(`${process.env.APP_URL}/payment/error?message=Payment verification failed`);
    }
    
  } catch (error) {
    console.error('PayPal callback error:', error);
    return c.redirect(`${process.env.APP_URL}/payment/error?message=Payment processing failed`);
  }
});

app.get("/api/payments/error/myfatoorah", async (c) => {
  const error = c.req.query('error') || 'Payment was cancelled or failed';
  return c.redirect(`${process.env.APP_URL}/payment/error?message=${encodeURIComponent(error)}`);
});

app.get("/api/payments/cancel/paypal", async (c) => {
  return c.redirect(`${process.env.APP_URL}/payment/error?message=Payment was cancelled`);
});
app.post("/api/payments/create", zValidator("json", CreatePaymentSchema), async (c) => {
  const { booking_id, amount, currency, return_url, cancel_url } = c.req.valid("json");
  
  // Get booking details
  const booking = await c.env.DB.prepare(`
    SELECT b.*, p.title as property_title 
    FROM bookings b 
    JOIN properties p ON b.property_id = p.id 
    WHERE b.id = ?
  `).bind(booking_id).first();
  
  if (!booking) {
    return c.json<ApiResponse>({
      success: false,
      error: "Booking not found",
    }, 404);
  }
  
  if ((booking as any).payment_status === 'completed') {
    return c.json<ApiResponse>({
      success: false,
      error: "Payment already completed for this booking",
    }, 400);
  }
  
  try {
    const myfatoorah = getMyFatoorahService(c.env);
    
    const paymentData = {
      InvoiceAmount: amount,
      CurrencyIso: currency,
      CustomerName: (booking as any).guest_name,
      CustomerEmail: (booking as any).guest_email,
      CustomerPhone: (booking as any).guest_phone || undefined,
      CallBackUrl: return_url,
      ErrorUrl: cancel_url,
      Language: 'en' as const,
      DisplayCurrencyIso: currency,
      CustomerReference: `booking_${booking_id}`,
      UserDefinedField: JSON.stringify({ 
        booking_id, 
        property_title: (booking as any).property_title 
      }),
    };
    
    const response = await myfatoorah.createInvoice(paymentData);
    
    if (response.IsSuccess) {
      // Save payment record
      await c.env.DB.prepare(`
        INSERT INTO payments (booking_id, payment_provider, invoice_id, amount, currency, payment_url, metadata)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).bind(
        booking_id,
        'myfatoorah',
        response.Data.InvoiceId.toString(),
        amount,
        currency,
        response.Data.InvoiceURL,
        JSON.stringify(response.Data)
      ).run();
      
      // Update booking payment status
      await c.env.DB.prepare(`
        UPDATE bookings SET payment_status = 'pending', updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).bind(booking_id).run();
      
      return c.json<ApiResponse>({
        success: true,
        data: {
          payment_url: response.Data.InvoiceURL,
          invoice_id: response.Data.InvoiceId,
        },
      });
    } else {
      throw new Error(response.Message);
    }
  } catch (error) {
    console.error('Payment creation failed:', error);
    return c.json<ApiResponse>({
      success: false,
      error: "Failed to create payment",
      message: (error as Error).message,
    }, 500);
  }
});

app.post("/api/payments/callback", zValidator("json", PaymentCallbackSchema), async (c) => {
  const { paymentId, Id, InvoiceId } = c.req.valid("json");
  
  try {
    const myfatoorah = getMyFatoorahService(c.env);
    const keyToUse = paymentId || Id || InvoiceId;
    
    if (!keyToUse) {
      return c.json<ApiResponse>({
        success: false,
        error: "Missing payment identifier",
      }, 400);
    }
    
    // Get payment status from MyFatoorah
    const statusResponse = await myfatoorah.getPaymentStatus(keyToUse);
    
    if (statusResponse.IsSuccess) {
      const paymentData = statusResponse.Data;
      const isSuccessful = paymentData.InvoiceStatus === 'Paid';
      
      // Find the payment record
      const payment = await c.env.DB.prepare(`
        SELECT * FROM payments WHERE invoice_id = ? OR payment_id = ?
      `).bind(paymentData.InvoiceId.toString(), keyToUse).first();
      
      if (payment) {
        // Update payment status
        const newStatus = isSuccessful ? 'completed' : 'failed';
        await c.env.DB.prepare(`
          UPDATE payments SET 
            status = ?, 
            transaction_id = ?,
            payment_method = ?,
            metadata = ?,
            updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `).bind(
          newStatus,
          paymentData.InvoiceTransactions[0]?.TransactionId || null,
          paymentData.InvoiceTransactions[0]?.PaymentGateway || null,
          JSON.stringify(paymentData),
          (payment as any).id
        ).run();
        
        // Update booking status
        const bookingStatus = isSuccessful ? 'confirmed' : 'pending';
        const paymentStatus = isSuccessful ? 'completed' : 'failed';
        
        await c.env.DB.prepare(`
          UPDATE bookings SET 
            status = ?, 
            payment_status = ?,
            updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `).bind(bookingStatus, paymentStatus, (payment as any).booking_id).run();
        
        if (isSuccessful) {
          // Get booking details for email
          const booking = await c.env.DB.prepare(`
            SELECT b.*, p.title as property_title, p.location as property_location
            FROM bookings b 
            JOIN properties p ON b.property_id = p.id 
            WHERE b.id = ?
          `).bind((payment as any).booking_id).first();
          
          if (booking) {
            // Send payment success email
            await sendEmail(c.env, (booking as any).guest_email, EMAIL_TEMPLATES.PAYMENT_SUCCESS, {
              guest_name: (booking as any).guest_name,
              amount: (payment as any).amount,
              transaction_id: paymentData.InvoiceTransactions[0]?.TransactionId || 'N/A',
              payment_method: paymentData.InvoiceTransactions[0]?.PaymentGateway || 'Credit Card',
              payment_date: new Date().toLocaleDateString(),
            });
          }
        }
      }
      
      return c.json<ApiResponse>({
        success: true,
        data: {
          status: isSuccessful ? 'success' : 'failed',
          transaction_id: paymentData.InvoiceTransactions[0]?.TransactionId,
        },
      });
    } else {
      throw new Error(statusResponse.Message);
    }
  } catch (error) {
    console.error('Payment callback processing failed:', error);
    return c.json<ApiResponse>({
      success: false,
      error: "Failed to process payment callback",
    }, 500);
  }
});

// Property Analytics routes
app.get("/api/properties/:id/analytics", authMiddleware, async (c) => {
  const user = c.get("user");
  if (!user) {
    return c.json<ApiResponse>({
      success: false,
      error: "User not authenticated",
    }, 401);
  }
  const propertyId = c.req.param("id");
  
  // Check if user owns the property or is admin
  const property = await c.env.DB.prepare(
    "SELECT user_id FROM properties WHERE id = ?"
  ).bind(propertyId).first();
  
  if (!property) {
    return c.json<ApiResponse>({
      success: false,
      error: "Property not found",
    }, 404);
  }
  
  const isOwner = (property as any).user_id === user.id;
  const isAdmin = user.email.includes('admin') || user.email.includes('owner');
  
  if (!isOwner && !isAdmin) {
    return c.json<ApiResponse>({
      success: false,
      error: "Unauthorized",
    }, 403);
  }
  
  // Get analytics data for the last 30 days
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  
  const [analytics, totalStats] = await Promise.all([
    c.env.DB.prepare(`
      SELECT * FROM property_analytics 
      WHERE property_id = ? AND date >= ?
      ORDER BY date DESC
    `).bind(propertyId, thirtyDaysAgo).all(),
    c.env.DB.prepare(`
      SELECT 
        SUM(views) as total_views,
        SUM(inquiries) as total_inquiries,
        SUM(bookings) as total_bookings,
        SUM(revenue) as total_revenue,
        AVG(avg_rating) as avg_rating,
        SUM(review_count) as total_reviews
      FROM property_analytics 
      WHERE property_id = ?
    `).bind(propertyId).first()
  ]);
  
  return c.json<ApiResponse>({
    success: true,
    data: {
      daily_analytics: analytics.results,
      summary: totalStats,
      period: '30_days',
    },
  });
});

// Email management routes
app.get("/api/admin/email-templates", authMiddleware, async (c) => {
  const user = c.get("user");
  if (!user || (!user.email.includes('admin') && !user.email.includes('owner'))) {
    return c.json<ApiResponse>({
      success: false,
      error: "Unauthorized",
    }, 403);
  }
  
  const { results } = await c.env.DB.prepare(
    "SELECT * FROM email_templates ORDER BY template_key"
  ).all();
  
  return c.json<ApiResponse>({
    success: true,
    data: results,
  });
});

app.get("/api/admin/email-logs", authMiddleware, async (c) => {
  const user = c.get("user");
  if (!user || (!user.email.includes('admin') && !user.email.includes('owner'))) {
    return c.json<ApiResponse>({
      success: false,
      error: "Unauthorized",
    }, 403);
  }
  
  const { results } = await c.env.DB.prepare(
    "SELECT * FROM email_logs ORDER BY created_at DESC LIMIT 100"
  ).all();
  
  return c.json<ApiResponse>({
    success: true,
    data: results,
  });
});

// Initialize email templates on first request
app.get("/api/admin/init-email-templates", authMiddleware, async (c) => {
  const user = c.get("user");
  if (!user || (!user.email.includes('admin') && !user.email.includes('owner'))) {
    return c.json<ApiResponse>({
      success: false,
      error: "Unauthorized",
    }, 403);
  }
  
  try {
    for (const template of DEFAULT_EMAIL_TEMPLATES) {
      await c.env.DB.prepare(`
        INSERT OR IGNORE INTO email_templates (template_key, subject, html_content, variables, is_active)
        VALUES (?, ?, ?, ?, ?)
      `).bind(
        template.template_key,
        template.subject,
        template.html_content,
        template.variables,
        template.is_active
      ).run();
    }
    
    return c.json<ApiResponse>({
      success: true,
      message: "Email templates initialized successfully",
    });
  } catch (error) {
    console.error('Failed to initialize email templates:', error);
    return c.json<ApiResponse>({
      success: false,
      error: "Failed to initialize email templates",
    }, 500);
  }
});

// Reviews routes
app.get("/api/reviews/:propertyId", async (c) => {
  const propertyId = c.req.param("propertyId");
  
  const { results } = await c.env.DB.prepare(`
    SELECT r.*, up.full_name as reviewer_name, up.avatar_url as reviewer_avatar
    FROM reviews r
    LEFT JOIN user_profiles up ON r.user_id = up.user_id
    WHERE r.property_id = ?
    ORDER BY r.created_at DESC
    LIMIT 20
  `).bind(propertyId).all();
  
  return c.json<ApiResponse>({
    success: true,
    data: results,
  });
});

app.post("/api/reviews", authMiddleware, async (c) => {
  const user = c.get("user");
  if (!user) {
    return c.json<ApiResponse>({
      success: false,
      error: "User not authenticated",
    }, 401);
  }

  const { property_id, booking_id, rating, comment } = await c.req.json();
  
  // Validate input
  if (!property_id || !rating || rating < 1 || rating > 5) {
    return c.json<ApiResponse>({
      success: false,
      error: "Invalid review data",
    }, 400);
  }

  // Check if user has already reviewed this property
  const existingReview = await c.env.DB.prepare(
    "SELECT id FROM reviews WHERE user_id = ? AND property_id = ?"
  ).bind(user.id, property_id).first();

  if (existingReview) {
    return c.json<ApiResponse>({
      success: false,
      error: "You have already reviewed this property",
    }, 400);
  }

  try {
    const { success } = await c.env.DB.prepare(`
      INSERT INTO reviews (user_id, property_id, booking_id, rating, comment)
      VALUES (?, ?, ?, ?, ?)
    `).bind(user.id, property_id, booking_id || null, rating, comment || null).run();

    if (success) {
      // Update property analytics with new review
      const today = new Date().toISOString().split('T')[0];
      await c.env.DB.prepare(`
        INSERT INTO property_analytics (property_id, review_count, avg_rating, date) 
        VALUES (?, 1, ?, ?)
        ON CONFLICT(property_id, date) 
        DO UPDATE SET 
          review_count = review_count + 1,
          avg_rating = (avg_rating * (review_count - 1) + ?) / review_count,
          updated_at = CURRENT_TIMESTAMP
      `).bind(property_id, rating, today, rating).run();

      return c.json<ApiResponse>({
        success: true,
        message: "Review submitted successfully",
      });
    } else {
      throw new Error("Failed to create review");
    }
  } catch (error) {
    console.error('Error creating review:', error);
    return c.json<ApiResponse>({
      success: false,
      error: "Failed to submit review",
    }, 500);
  }
});

// Notification settings routes
app.get("/api/users/notifications", authMiddleware, async (c) => {
  const user = c.get("user");
  if (!user) {
    return c.json<ApiResponse>({
      success: false,
      error: "User not authenticated",
    }, 401);
  }

  const settings = await c.env.DB.prepare(
    "SELECT * FROM notification_settings WHERE user_id = ?"
  ).bind(user.id).first();

  return c.json<ApiResponse>({
    success: true,
    data: settings || {
      email_booking_updates: true,
      email_marketing: false,
      sms_booking_updates: true,
      push_notifications: true,
    },
  });
});

app.put("/api/users/notifications", authMiddleware, async (c) => {
  const user = c.get("user");
  if (!user) {
    return c.json<ApiResponse>({
      success: false,
      error: "User not authenticated",
    }, 401);
  }

  const settings = await c.req.json();
  
  const { success } = await c.env.DB.prepare(`
    INSERT INTO notification_settings (
      user_id, email_booking_updates, email_marketing, sms_booking_updates, push_notifications
    ) VALUES (?, ?, ?, ?, ?)
    ON CONFLICT(user_id) DO UPDATE SET
      email_booking_updates = excluded.email_booking_updates,
      email_marketing = excluded.email_marketing,
      sms_booking_updates = excluded.sms_booking_updates,
      push_notifications = excluded.push_notifications,
      updated_at = CURRENT_TIMESTAMP
  `).bind(
    user.id,
    settings.email_booking_updates || false,
    settings.email_marketing || false,
    settings.sms_booking_updates || false,
    settings.push_notifications || false
  ).run();

  return c.json<ApiResponse>({
    success,
    message: success ? "Notification settings updated" : "Failed to update settings",
  });
});

// Property availability check
app.get("/api/properties/:id/availability", async (c) => {
  const propertyId = c.req.param("id");
  const checkIn = c.req.query("check_in");
  const checkOut = c.req.query("check_out");

  if (!checkIn || !checkOut) {
    return c.json<ApiResponse>({
      success: false,
      error: "Check-in and check-out dates are required",
    }, 400);
  }

  // Check for conflicting bookings
  const conflictingBooking = await c.env.DB.prepare(`
    SELECT id FROM bookings 
    WHERE property_id = ? 
    AND status NOT IN ('cancelled', 'rejected')
    AND (
      (check_in_date <= ? AND check_out_date > ?) OR
      (check_in_date < ? AND check_out_date >= ?) OR
      (check_in_date >= ? AND check_out_date <= ?)
    )
  `).bind(propertyId, checkIn, checkIn, checkOut, checkOut, checkIn, checkOut).first();

  return c.json<ApiResponse>({
    success: true,
    data: {
      available: !conflictingBooking,
      conflicting_booking: conflictingBooking?.id || null,
    },
  });
});

// Contact form submission
app.post("/api/contact", async (c) => {
  const { name, email, phone, interest, message } = await c.req.json();
  
  if (!name || !email || !interest || !message) {
    return c.json<ApiResponse>({
      success: false,
      error: "Required fields missing",
    }, 400);
  }

  try {
    // Store contact form submission
    const { success } = await c.env.DB.prepare(`
      INSERT INTO contact_submissions (name, email, phone, interest, message, created_at)
      VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `).bind(name, email, phone || null, interest, message).run();

    if (success) {
      // Send notification email to admin
      await sendEmail(c.env, 'info@habibistay.com', 'contact_form_submission', {
        name,
        email,
        phone: phone || 'Not provided',
        interest,
        message,
        submitted_at: new Date().toLocaleString(),
      });

      // Send confirmation email to user
      await sendEmail(c.env, email, 'contact_form_confirmation', {
        name,
        interest,
        message,
      });

      return c.json<ApiResponse>({
        success: true,
        message: "Contact form submitted successfully",
      });
    } else {
      throw new Error("Failed to store contact submission");
    }
  } catch (error) {
    console.error('Error processing contact form:', error);
    return c.json<ApiResponse>({
      success: false,
      error: "Failed to submit contact form",
    }, 500);
  }
});

// Newsletter subscription
app.post("/api/newsletter/subscribe", async (c) => {
  const { email, source } = await c.req.json();
  
  if (!email || !/\S+@\S+\.\S+/.test(email)) {
    return c.json<ApiResponse>({
      success: false,
      error: "Valid email address required",
    }, 400);
  }

  try {
    // Check if already subscribed
    const existing = await c.env.DB.prepare(
      "SELECT id FROM newsletter_subscriptions WHERE email = ? AND is_active = 1"
    ).bind(email).first();

    if (existing) {
      return c.json<ApiResponse>({
        success: false,
        error: "Email already subscribed",
      }, 400);
    }

    // Add subscription
    const { success } = await c.env.DB.prepare(`
      INSERT OR REPLACE INTO newsletter_subscriptions (email, source, is_active, subscribed_at)
      VALUES (?, ?, 1, CURRENT_TIMESTAMP)
    `).bind(email, source || 'website').run();

    if (success) {
      // Send welcome email
      await sendEmail(c.env, email, 'newsletter_welcome', {
        email,
        unsubscribe_url: `${c.req.url.split('/api')[0]}/newsletter/unsubscribe?email=${encodeURIComponent(email)}`,
      });

      return c.json<ApiResponse>({
        success: true,
        message: "Successfully subscribed to newsletter",
      });
    } else {
      throw new Error("Failed to add subscription");
    }
  } catch (error) {
    console.error('Error processing newsletter subscription:', error);
    return c.json<ApiResponse>({
      success: false,
      error: "Failed to subscribe to newsletter",
    }, 500);
  }
});

// Health check endpoint
app.get("/api/health", async (c) => {
  return c.json({
    success: true,
    message: "HabibiStay API is running",
    timestamp: new Date().toISOString(),
  });
});

export default {
  fetch: app.fetch,
};
