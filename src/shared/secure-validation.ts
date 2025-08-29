// Enhanced validation schemas with security measures for HabibiStay

import { z } from 'zod';
import { 
  emailSchema, 
  passwordSchema, 
  phoneSchema, 
  nameSchema, 
  priceSchema 
} from './security-utils';

// Enhanced user registration schema with security validation
export const SecureUserRegistrationSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  full_name: nameSchema,
  phone: phoneSchema.optional(),
  terms_accepted: z.boolean().refine(val => val === true, {
    message: 'Terms and conditions must be accepted'
  }),
  privacy_accepted: z.boolean().refine(val => val === true, {
    message: 'Privacy policy must be accepted'
  })
});

// Enhanced property creation schema with security validation
export const SecurePropertySchema = z.object({
  title: z.string()
    .min(5, 'Title must be at least 5 characters')
    .max(200, 'Title too long')
    .regex(/^[a-zA-Z0-9\s\u0600-\u06FF\-.,!]+$/, 'Title contains invalid characters'),
  
  description: z.string()
    .min(20, 'Description must be at least 20 characters')
    .max(2000, 'Description too long'),
  
  location: z.string()
    .min(3, 'Location must be at least 3 characters')
    .max(200, 'Location too long')
    .regex(/^[a-zA-Z0-9\s\u0600-\u06FF\-.,]+$/, 'Location contains invalid characters'),
  
  price_per_night: priceSchema.min(10, 'Minimum price is 10 SAR'),
  
  max_guests: z.number()
    .int('Guests must be a whole number')
    .min(1, 'Minimum 1 guest')
    .max(50, 'Maximum 50 guests'),
  
  bedrooms: z.number()
    .int('Bedrooms must be a whole number')
    .min(0, 'Bedrooms cannot be negative')
    .max(20, 'Maximum 20 bedrooms'),
  
  bathrooms: z.number()
    .int('Bathrooms must be a whole number')
    .min(1, 'Minimum 1 bathroom')
    .max(20, 'Maximum 20 bathrooms'),
  
  amenities: z.array(z.string().max(50))
    .max(50, 'Too many amenities')
    .optional(),
  
  images: z.array(z.string().url('Invalid image URL'))
    .min(1, 'At least 1 image required')
    .max(20, 'Maximum 20 images'),
  
  property_type: z.enum(['apartment', 'house', 'villa', 'studio', 'other']),
  
  check_in_time: z.string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'),
  
  check_out_time: z.string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'),
  
  house_rules: z.string()
    .max(1000, 'House rules too long')
    .optional(),
  
  cancellation_policy: z.enum(['flexible', 'moderate', 'strict', 'super_strict']),
  
  coordinates: z.object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180)
  }).optional()
});

// Enhanced booking schema with security validation
export const SecureBookingSchema = z.object({
  property_id: z.number().int().positive(),
  
  check_in_date: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)')
    .refine(date => {
      const checkIn = new Date(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return checkIn >= today;
    }, 'Check-in date must be today or in the future'),
  
  check_out_date: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
  
  guests: z.number()
    .int('Guests must be a whole number')
    .min(1, 'Minimum 1 guest')
    .max(50, 'Maximum 50 guests'),
  
  guest_details: z.object({
    full_name: nameSchema,
    email: emailSchema,
    phone: phoneSchema,
    special_requests: z.string().max(500, 'Special requests too long').optional()
  }),
  
  total_amount: priceSchema.min(1, 'Total amount must be positive'),
  
  payment_method: z.enum(['myfatoorah', 'paypal', 'stripe']),
  
  promo_code: z.string()
    .max(50, 'Promo code too long')
    .regex(/^[A-Z0-9]+$/, 'Invalid promo code format')
    .optional()
}).refine(data => {
  const checkIn = new Date(data.check_in_date);
  const checkOut = new Date(data.check_out_date);
  return checkOut > checkIn;
}, {
  message: 'Check-out date must be after check-in date',
  path: ['check_out_date']
}).refine(data => {
  const checkIn = new Date(data.check_in_date);
  const checkOut = new Date(data.check_out_date);
  const daysDiff = (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24);
  return daysDiff <= 365; // Maximum 1 year booking
}, {
  message: 'Booking period cannot exceed 365 days',
  path: ['check_out_date']
});

// Payment validation schema
export const SecurePaymentSchema = z.object({
  booking_id: z.number().int().positive(),
  payment_method: z.enum(['myfatoorah', 'paypal', 'stripe']),
  amount: priceSchema.min(1, 'Payment amount must be positive'),
  currency: z.enum(['SAR', 'USD', 'EUR']).default('SAR'),
  return_url: z.string().url('Invalid return URL').optional(),
  cancel_url: z.string().url('Invalid cancel URL').optional()
});

// Review validation schema
export const SecureReviewSchema = z.object({
  property_id: z.number().int().positive(),
  booking_id: z.number().int().positive(),
  rating: z.number().int().min(1, 'Minimum rating is 1').max(5, 'Maximum rating is 5'),
  comment: z.string()
    .min(10, 'Review must be at least 10 characters')
    .max(1000, 'Review too long')
    .regex(/^[a-zA-Z0-9\s\u0600-\u06FF\-.,!?()]+$/, 'Review contains invalid characters'),
  
  categories: z.object({
    cleanliness: z.number().int().min(1).max(5),
    communication: z.number().int().min(1).max(5),
    location: z.number().int().min(1).max(5),
    value: z.number().int().min(1).max(5)
  }).optional()
});

// Admin configuration schema
export const SecureAdminConfigSchema = z.object({
  platform_settings: z.object({
    commission_rate: z.number().min(0).max(50), // 0-50%
    default_currency: z.enum(['SAR', 'USD', 'EUR']),
    supported_languages: z.array(z.enum(['en', 'ar'])),
    maintenance_mode: z.boolean(),
    registration_enabled: z.boolean()
  }).optional(),
  
  ai_settings: z.object({
    model: z.enum(['gpt-4', 'gpt-3.5-turbo', 'claude-3']),
    temperature: z.number().min(0).max(2),
    max_tokens: z.number().int().min(100).max(4000),
    system_prompt: z.string().max(2000),
    personality: z.enum(['professional', 'friendly', 'casual']),
    auto_responses: z.boolean()
  }).optional(),
  
  security_settings: z.object({
    max_login_attempts: z.number().int().min(3).max(10),
    session_timeout: z.number().int().min(300).max(86400), // 5 minutes to 24 hours
    require_2fa: z.boolean(),
    password_expiry_days: z.number().int().min(30).max(365)
  }).optional()
});

// File upload validation schema
export const SecureFileUploadSchema = z.object({
  files: z.array(z.object({
    name: z.string()
      .max(255, 'Filename too long')
      .regex(/^[a-zA-Z0-9\-_.]+\.(jpg|jpeg|png|webp|gif)$/i, 'Invalid filename or extension'),
    size: z.number().max(10 * 1024 * 1024, 'File size exceeds 10MB'),
    type: z.enum(['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
  })).max(20, 'Too many files'),
  
  upload_type: z.enum(['property_images', 'profile_avatar', 'document']),
  property_id: z.number().int().positive().optional()
});

// Search query validation
export const SecureSearchSchema = z.object({
  location: z.string()
    .max(200, 'Location query too long')
    .regex(/^[a-zA-Z0-9\s\u0600-\u06FF\-.,]+$/, 'Invalid location characters')
    .optional(),
  
  guests: z.number().int().min(1).max(50).optional(),
  min_price: z.number().min(0).max(100000).optional(),
  max_price: z.number().min(0).max(100000).optional(),
  
  check_in: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format')
    .optional(),
  
  check_out: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format')
    .optional(),
  
  amenities: z.array(z.string().max(50)).max(20).optional(),
  property_type: z.enum(['apartment', 'house', 'villa', 'studio', 'other']).optional(),
  sort_by: z.enum(['price_asc', 'price_desc', 'rating', 'newest', 'distance']).optional(),
  
  page: z.number().int().min(1).max(1000).default(1),
  limit: z.number().int().min(1).max(100).default(20)
}).refine(data => {
  if (data.min_price && data.max_price) {
    return data.min_price <= data.max_price;
  }
  return true;
}, {
  message: 'Minimum price cannot be greater than maximum price',
  path: ['max_price']
}).refine(data => {
  if (data.check_in && data.check_out) {
    return new Date(data.check_in) < new Date(data.check_out);
  }
  return true;
}, {
  message: 'Check-out date must be after check-in date',
  path: ['check_out']
});

// Host onboarding validation
export const SecureHostOnboardingSchema = z.object({
  identity: z.object({
    full_name: nameSchema,
    phone: phoneSchema,
    national_id: z.string()
      .regex(/^[0-9]{10}$/, 'Invalid national ID format (10 digits)')
      .optional(),
    passport_number: z.string()
      .max(20, 'Passport number too long')
      .regex(/^[A-Z0-9]+$/, 'Invalid passport number format')
      .optional(),
    verified: z.boolean().default(false)
  }),
  
  banking: z.object({
    bank_name: z.string().min(2).max(100),
    iban: z.string()
      .regex(/^SA[0-9]{22}$/, 'Invalid Saudi IBAN format'),
    account_holder: nameSchema,
    swift_code: z.string()
      .regex(/^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/, 'Invalid SWIFT code')
      .optional()
  }),
  
  legal: z.object({
    terms_accepted: z.boolean().refine(val => val === true),
    privacy_accepted: z.boolean().refine(val => val === true),
    commercial_license: z.string().max(50).optional(),
    tax_number: z.string()
      .regex(/^[0-9]{15}$/, 'Invalid tax number format (15 digits)')
      .optional()
  })
});

export default {
  SecureUserRegistrationSchema,
  SecurePropertySchema,
  SecureBookingSchema,
  SecurePaymentSchema,
  SecureReviewSchema,
  SecureAdminConfigSchema,
  SecureFileUploadSchema,
  SecureSearchSchema,
  SecureHostOnboardingSchema
};