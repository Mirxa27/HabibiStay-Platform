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
