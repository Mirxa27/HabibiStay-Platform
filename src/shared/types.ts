import { z } from "zod";

// Property schemas
export const PropertySchema = z.object({
  id: z.number(),
  user_id: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  location: z.string(),
  price_per_night: z.number(),
  max_guests: z.number(),
  bedrooms: z.number().nullable(),
  bathrooms: z.number().nullable(),
  average_rating: z.number().min(0).max(5).nullable(),
  amenities: z.string().nullable(),
  images: z.string().nullable(),
  is_featured: z.boolean(),
  is_active: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const CreatePropertySchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  location: z.string().min(1),
  price_per_night: z.number().positive(),
  max_guests: z.number().int().positive(),
  bedrooms: z.number().int().positive().optional(),
  bathrooms: z.number().int().positive().optional(),
  amenities: z.array(z.string()).optional(),
  images: z.array(z.string()).optional(),
});

// Booking schemas
export const BookingSchema = z.object({
  id: z.number(),
  user_id: z.string(),
  property_id: z.number(),
  guest_name: z.string(),
  guest_email: z.string(),
  guest_phone: z.string().nullable(),
  check_in_date: z.string(),
  check_out_date: z.string(),
  total_guests: z.number(),
  total_amount: z.number(),
  status: z.string(),
  payment_status: z.string(),
  payment_id: z.string().nullable(),
  special_requests: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const CreateBookingSchema = z.object({
  property_id: z.number(),
  guest_name: z.string().min(1),
  guest_email: z.string().email(),
  guest_phone: z.string().optional(),
  check_in_date: z.string(),
  check_out_date: z.string(),
  total_guests: z.number().int().positive(),
  special_requests: z.string().optional(),
});

// Wishlist schemas
export const WishlistSchema = z.object({
  id: z.number(),
  user_id: z.string(),
  property_id: z.number(),
  created_at: z.string(),
  updated_at: z.string(),
});

// Review schemas
export const ReviewSchema = z.object({
  id: z.number(),
  user_id: z.string(),
  property_id: z.number(),
  booking_id: z.number().nullable(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const CreateReviewSchema = z.object({
  property_id: z.number(),
  booking_id: z.number().optional(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().optional(),
});

// Admin settings schemas
export const AdminSettingSchema = z.object({
  id: z.number(),
  key: z.string(),
  value: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

// Chat schemas
export const ChatMessageSchema = z.object({
  role: z.enum(['user', 'assistant', 'system']),
  content: z.string(),
  timestamp: z.string().optional(),
  metadata: z.any().optional(),
});

export const ChatRequestSchema = z.object({
  message: z.string(),
  conversation_id: z.string().optional(),
});

// Search schemas
export const PropertySearchSchema = z.object({
  location: z.string().optional(),
  check_in: z.string().optional(),
  check_out: z.string().optional(),
  guests: z.number().int().positive().optional(),
  min_price: z.number().positive().optional(),
  max_price: z.number().positive().optional(),
  amenities: z.array(z.string()).optional(),
});

// Type exports
export type Property = z.infer<typeof PropertySchema>;
export type CreateProperty = z.infer<typeof CreatePropertySchema>;
export type Booking = z.infer<typeof BookingSchema>;
export type CreateBooking = z.infer<typeof CreateBookingSchema>;
export type Wishlist = z.infer<typeof WishlistSchema>;
export type Review = z.infer<typeof ReviewSchema>;
export type CreateReview = z.infer<typeof CreateReviewSchema>;
export type AdminSetting = z.infer<typeof AdminSettingSchema>;
export type ChatMessage = z.infer<typeof ChatMessageSchema>;
export type ChatRequest = z.infer<typeof ChatRequestSchema>;
export type PropertySearch = z.infer<typeof PropertySearchSchema>;

// User Profile schemas
export const UserProfileSchema = z.object({
  id: z.number(),
  user_id: z.string(),
  full_name: z.string().nullable(),
  phone: z.string().nullable(),
  address: z.string().nullable(),
  city: z.string().nullable(),
  country: z.string().nullable(),
  date_of_birth: z.string().nullable(),
  preferred_language: z.string(),
  currency: z.string(),
  bio: z.string().nullable(),
  avatar_url: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const CreateUserProfileSchema = z.object({
  full_name: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  date_of_birth: z.string().optional(),
  preferred_language: z.string().optional(),
  currency: z.string().optional(),
  bio: z.string().optional(),
  avatar_url: z.string().optional(),
});

// Enhanced Property Search Schema
export const AdvancedPropertySearchSchema = z.object({
  location: z.string().optional(),
  check_in: z.string().optional(),
  check_out: z.string().optional(),
  guests: z.number().int().positive().optional(),
  min_price: z.number().positive().optional(),
  max_price: z.number().positive().optional(),
  amenities: z.array(z.string()).optional(),
  property_type: z.string().optional(),
  bedrooms: z.number().int().optional(),
  bathrooms: z.number().int().optional(),
  rating: z.number().min(1).max(5).optional(),
  sort_by: z.enum(['price_asc', 'price_desc', 'rating', 'newest', 'featured']).optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(50).default(20),
});

// Analytics schemas
export const PropertyAnalyticsSchema = z.object({
  id: z.number(),
  property_id: z.number(),
  views: z.number(),
  inquiries: z.number(),
  bookings: z.number(),
  revenue: z.number(),
  avg_rating: z.number(),
  review_count: z.number(),
  occupancy_rate: z.number(),
  date: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
});

// Payment schemas
export const PaymentSchema = z.object({
  id: z.number(),
  booking_id: z.number(),
  payment_provider: z.string(),
  payment_id: z.string().nullable(),
  invoice_id: z.string().nullable(),
  amount: z.number(),
  currency: z.string(),
  status: z.string(),
  payment_method: z.string().nullable(),
  transaction_id: z.string().nullable(),
  payment_url: z.string().nullable(),
  metadata: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

// Export new types
export type UserProfile = z.infer<typeof UserProfileSchema>;
export type CreateUserProfile = z.infer<typeof CreateUserProfileSchema>;
export type AdvancedPropertySearch = z.infer<typeof AdvancedPropertySearchSchema>;
export type PropertyAnalytics = z.infer<typeof PropertyAnalyticsSchema>;
export type Payment = z.infer<typeof PaymentSchema>;

// ===============================
// ENHANCED AI & CHATBOT TYPES
// ===============================

export type AIProviderType = 'openai' | 'anthropic' | 'gemini';
export type PersonalityType = 'professional' | 'friendly' | 'casual';
export type MessageRole = 'user' | 'assistant' | 'system';

export const AIConfigSchema = z.object({
  id: z.number(),
  model_provider: z.enum(['openai', 'anthropic', 'gemini']),
  model_name: z.string(),
  api_key: z.string().optional(),
  temperature: z.number().min(0).max(2),
  max_tokens: z.number().positive(),
  system_prompt: z.string().optional(),
  personality: z.enum(['professional', 'friendly', 'casual']),
  language: z.string(),
  is_active: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const ChatContextSchema = z.object({
  user_id: z.string().optional(),
  session_id: z.string(),
  current_intent: z.string().optional(),
  property_context: PropertySchema.optional(),
  booking_context: CreateBookingSchema.partial().optional(),
  featured_properties: z.array(PropertySchema).optional(),
});

export const ChatButtonSchema = z.object({
  id: z.string(),
  text: z.string(),
  action: z.string(),
  data: z.any().optional(),
  style: z.enum(['primary', 'secondary', 'success', 'warning', 'danger']).optional(),
});

export const AIResponseSchema = z.object({
  message: z.string(),
  action: z.string().optional(),
  data: z.any().optional(),
  buttons: z.array(ChatButtonSchema).optional(),
  properties: z.array(PropertySchema).optional(),
});

export type AIConfig = z.infer<typeof AIConfigSchema>;
export type ChatContext = z.infer<typeof ChatContextSchema>;
export type ChatButton = z.infer<typeof ChatButtonSchema>;
export type AIResponse = z.infer<typeof AIResponseSchema>;

// ===============================
// USER MANAGEMENT TYPES
// ===============================

export type UserRole = 'guest' | 'host' | 'admin';

export const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string(),
  avatar: z.string().optional(),
  phone: z.string().optional(),
  role: z.enum(['guest', 'host', 'admin']),
  is_verified: z.boolean(),
  is_active: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type User = z.infer<typeof UserSchema>;

// ===============================
// FINANCIAL REPORTING TYPES
// ===============================

export type ReportType = 'monthly' | 'quarterly' | 'annual';

export const FinancialReportSchema = z.object({
  id: z.number(),
  owner_id: z.string(),
  property_id: z.number().optional(),
  report_type: z.enum(['monthly', 'quarterly', 'annual']),
  period_start: z.string(),
  period_end: z.string(),
  total_revenue: z.number(),
  total_bookings: z.number(),
  occupancy_rate: z.number(),
  average_daily_rate: z.number(),
  expenses: z.number(),
  net_income: z.number(),
  roi_percentage: z.number(),
  report_data: z.any().optional(),
  created_at: z.string(),
});

export const InvestorMetricsSchema = z.object({
  total_properties: z.number(),
  total_revenue: z.number(),
  total_bookings: z.number(),
  average_occupancy_rate: z.number(),
  average_daily_rate: z.number(),
  roi_percentage: z.number(),
  net_operating_income: z.number(),
  monthly_revenue: z.array(z.object({
    month: z.string(),
    revenue: z.number(),
    bookings: z.number(),
    occupancy_rate: z.number(),
  })),
  expense_breakdown: z.array(z.object({
    category: z.string(),
    amount: z.number(),
    percentage: z.number(),
  })),
  payout_history: z.array(z.object({
    id: z.string(),
    amount: z.number(),
    date: z.string(),
    status: z.string(),
    method: z.string(),
  })),
});

export type FinancialReport = z.infer<typeof FinancialReportSchema>;
export type InvestorMetrics = z.infer<typeof InvestorMetricsSchema>;

// ===============================
// CHANNEL MANAGER TYPES
// ===============================

export type Platform = 'airbnb' | 'booking.com' | 'expedia' | 'vrbo';
export type SyncStatus = 'active' | 'paused' | 'error';

export const ChannelConnectionSchema = z.object({
  id: z.number(),
  property_id: z.number(),
  platform: z.enum(['airbnb', 'booking.com', 'expedia', 'vrbo']),
  external_property_id: z.string().optional(),
  calendar_url: z.string().optional(),
  sync_status: z.enum(['active', 'paused', 'error']),
  last_sync_at: z.string().optional(),
  sync_settings: z.any().optional(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type ChannelConnection = z.infer<typeof ChannelConnectionSchema>;

// ===============================
// PRICING & AVAILABILITY TYPES
// ===============================

export type PricingRuleType = 'seasonal' | 'weekly' | 'monthly' | 'early_bird' | 'last_minute';

export const PropertyAvailabilitySchema = z.object({
  id: z.number(),
  property_id: z.number(),
  date: z.string(),
  is_available: z.boolean(),
  price_override: z.number().optional(),
  minimum_stay: z.number(),
  notes: z.string().optional(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const PricingRuleSchema = z.object({
  id: z.number(),
  property_id: z.number(),
  rule_type: z.enum(['seasonal', 'weekly', 'monthly', 'early_bird', 'last_minute']),
  rule_name: z.string(),
  discount_percentage: z.number(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  min_nights: z.number().optional(),
  max_nights: z.number().optional(),
  advance_booking_days: z.number().optional(),
  is_active: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type PropertyAvailability = z.infer<typeof PropertyAvailabilitySchema>;
export type PricingRule = z.infer<typeof PricingRuleSchema>;

// ===============================
// ENHANCED PAYMENT TYPES
// ===============================

export type PaymentGateway = 'myfatoorah' | 'paypal' | 'stripe';
export type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';

export const EnhancedPaymentSchema = z.object({
  id: z.number(),
  booking_id: z.number(),
  payment_id: z.string(),
  gateway: z.enum(['myfatoorah', 'paypal', 'stripe']),
  amount: z.number(),
  currency: z.string(),
  status: z.enum(['pending', 'processing', 'completed', 'failed', 'refunded']),
  gateway_response: z.any().optional(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const PaymentDataSchema = z.object({
  gateway: z.enum(['myfatoorah', 'paypal', 'stripe']),
  amount: z.number(),
  currency: z.string().optional(),
  return_url: z.string().optional(),
  cancel_url: z.string().optional(),
});

export type EnhancedPayment = z.infer<typeof EnhancedPaymentSchema>;
export type PaymentData = z.infer<typeof PaymentDataSchema>;

// ===============================
// NOTIFICATION TYPES
// ===============================

export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export const NotificationSchema = z.object({
  id: z.number(),
  user_id: z.string(),
  title: z.string(),
  message: z.string(),
  type: z.enum(['info', 'success', 'warning', 'error']),
  is_read: z.boolean(),
  action_url: z.string().optional(),
  created_at: z.string(),
});

export type Notification = z.infer<typeof NotificationSchema>;

// ===============================
// VOICE INTERFACE TYPES
// ===============================

export const VoiceConfigSchema = z.object({
  enabled: z.boolean(),
  language: z.string(),
  voice: z.string().optional(),
  rate: z.number().min(0.1).max(2),
  pitch: z.number().min(0).max(2),
  volume: z.number().min(0).max(1),
});

export const SpeechRecognitionResultSchema = z.object({
  transcript: z.string(),
  confidence: z.number().min(0).max(1),
  isFinal: z.boolean(),
});

export type VoiceConfig = z.infer<typeof VoiceConfigSchema>;
export type SpeechRecognitionResult = z.infer<typeof SpeechRecognitionResultSchema>;

// ===============================
// HOST ONBOARDING TYPES
// ===============================

export const HostOnboardingStepSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  completed: z.boolean(),
  required: z.boolean(),
});

export const HostProfileSchema = z.object({
  user_id: z.string(),
  is_verified: z.boolean(),
  verification_documents: z.array(z.string()).optional(),
  bank_details: z.object({
    account_name: z.string(),
    account_number: z.string(),
    bank_name: z.string(),
    routing_number: z.string().optional(),
  }).optional(),
  tax_information: z.object({
    tax_id: z.string().optional(),
    vat_number: z.string().optional(),
  }).optional(),
  onboarding_completed: z.boolean(),
  onboarding_step: z.string(),
});

export type HostOnboardingStep = z.infer<typeof HostOnboardingStepSchema>;
export type HostProfile = z.infer<typeof HostProfileSchema>;

// ===============================
// FORM DATA TYPES
// ===============================

export const ContactFormSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  subject: z.string().min(1),
  message: z.string().min(1),
  interest_type: z.enum(['guest', 'host', 'investor']).optional(),
});

export type ContactFormData = z.infer<typeof ContactFormSchema>;

// ===============================
// CONSTANTS
// ===============================

export const CURRENCIES = {
  SAR: 'Saudi Riyal',
  USD: 'US Dollar',
  EUR: 'Euro',
  GBP: 'British Pound',
} as const;

export const PROPERTY_TYPES = [
  'apartment',
  'house',
  'villa',
  'studio',
  'townhouse',
  'loft',
  'condo',
  'cabin',
] as const;

export const AMENITIES = [
  'wifi',
  'kitchen',
  'washing_machine',
  'air_conditioning',
  'heating',
  'parking',
  'pool',
  'gym',
  'balcony',
  'garden',
  'pets_allowed',
  'smoking_allowed',
  'tv',
  'iron',
  'hair_dryer',
  'essentials',
] as const;

export const CANCELLATION_POLICIES = [
  'flexible',
  'moderate',
  'strict',
  'super_strict',
] as const;

// ===============================
// CMS TYPES
// ===============================

// Page model
export const PageSchema = z.object({
  id: z.number(),
  title: z.string(),
  slug: z.string(),
  template_id: z.number().nullable(),
  content: z.string().nullable(), // JSON structure
  metadata: z.string().nullable(), // JSON metadata
  status: z.enum(['draft', 'published', 'archived']),
  created_by: z.string().nullable(),
  updated_by: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
  published_at: z.string().nullable(),
});

// Template model
export const TemplateSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().nullable(),
  content_structure: z.string().nullable(), // JSON structure
  preview_image: z.string().nullable(),
  is_default: z.boolean(),
  parent_template_id: z.number().nullable(), // For template inheritance
  design_settings: z.string().nullable(), // JSON design settings
  created_by: z.string().nullable(),
  updated_by: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

// Component model
export const ComponentSchema = z.object({
  id: z.number(),
  type: z.string(),
  name: z.string(),
  properties: z.string().nullable(), // JSON properties
  styles: z.string().nullable(), // JSON styles
  created_by: z.string().nullable(),
  updated_by: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

// Media model
export const MediaSchema = z.object({
  id: z.number(),
  filename: z.string(),
  original_name: z.string(),
  mime_type: z.string(),
  size: z.number(),
  url: z.string(),
  alt_text: z.string().nullable(),
  caption: z.string().nullable(),
  created_by: z.string().nullable(),
  created_at: z.string(),
});

// Content version model
export const ContentVersionSchema = z.object({
  id: z.number(),
  content_id: z.number(),
  content_type: z.enum(['page', 'template', 'component']),
  data: z.string().nullable(), // JSON data
  created_by: z.string().nullable(),
  created_at: z.string(),
  comment: z.string().nullable(),
});

// AI Provider model (CMS)
export const CMSAIProviderSchema = z.object({
  id: z.number(),
  name: z.string(),
  api_key: z.string().nullable(),
  api_url: z.string().nullable(),
  enabled: z.boolean(),
  default_model: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

// AI Model model
export const AIModelSchema = z.object({
  id: z.number(),
  provider_id: z.number(),
  name: z.string(),
  capabilities: z.string().nullable(), // JSON array
  max_tokens: z.number().nullable(),
  pricing: z.number().nullable(),
  performance: z.number().nullable(),
  created_at: z.string(),
});

// AI Content Job model
export const AIContentJobSchema = z.object({
  id: z.number(),
  provider_id: z.number(),
  model_id: z.number(),
  prompt: z.string(),
  content: z.string().nullable(),
  status: z.enum(['pending', 'processing', 'completed', 'failed']),
  created_by: z.string().nullable(),
  created_at: z.string(),
  completed_at: z.string().nullable(),
  metadata: z.string().nullable(), // JSON metadata
});

// AI Content History model
export const AIContentHistorySchema = z.object({
  id: z.number(),
  job_id: z.number(),
  content: z.string(),
  version: z.number(),
  created_by: z.string().nullable(),
  created_at: z.string(),
});

// Export CMS types
export type Page = z.infer<typeof PageSchema>;
export type Template = z.infer<typeof TemplateSchema>;
export type Component = z.infer<typeof ComponentSchema>;
export type Media = z.infer<typeof MediaSchema>;
export type ContentVersion = z.infer<typeof ContentVersionSchema>;
export type CMSAIProvider = z.infer<typeof CMSAIProviderSchema>;
export type AIModel = z.infer<typeof AIModelSchema>;
export type AIContentJob = z.infer<typeof AIContentJobSchema>;
export type AIContentHistory = z.infer<typeof AIContentHistorySchema>;

// ===============================
// API RESPONSE TYPES
// ===============================

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
