// Channel Manager Types for HabibiStay
export interface ExternalChannel {
  id: string;
  name: string;
  type: 'airbnb' | 'booking_com' | 'expedia' | 'vrbo' | 'agoda' | 'hotels_com' | 'custom';
  is_active: boolean;
  api_endpoint?: string;
  credentials: {
    api_key?: string;
    client_id?: string;
    client_secret?: string;
    access_token?: string;
    refresh_token?: string;
    username?: string;
    password?: string;
    property_id?: string;
  };
  sync_settings: {
    sync_properties: boolean;
    sync_rates: boolean;
    sync_availability: boolean;
    sync_bookings: boolean;
    sync_reviews: boolean;
    auto_sync_interval: number; // minutes
    last_sync_at?: string;
    sync_direction: 'push' | 'pull' | 'bidirectional';
  };
  mapping_rules: {
    property_mapping: Record<string, string>; // local_property_id -> external_property_id
    rate_plan_mapping: Record<string, string>;
    room_type_mapping: Record<string, string>;
  };
  created_at: string;
  updated_at: string;
}

export interface ChannelSyncLog {
  id: number;
  channel_id: string;
  sync_type: 'properties' | 'rates' | 'availability' | 'bookings' | 'reviews';
  operation: 'push' | 'pull';
  status: 'pending' | 'in_progress' | 'success' | 'failed' | 'partial';
  records_processed: number;
  records_success: number;
  records_failed: number;
  sync_details: {
    started_at: string;
    completed_at?: string;
    error_message?: string;
    warnings: string[];
    changes_summary: {
      created: number;
      updated: number;
      deleted: number;
      errors: number;
    };
  };
  created_at: string;
}

export interface ExternalProperty {
  external_id: string;
  channel_id: string;
  local_property_id?: number;
  external_data: {
    name: string;
    description?: string;
    address?: string;
    coordinates?: { lat: number; lng: number };
    amenities: string[];
    images: string[];
    property_type: string;
    room_count: number;
    max_guests: number;
    check_in_time?: string;
    check_out_time?: string;
    house_rules?: string[];
    cancellation_policy?: string;
  };
  sync_status: 'synced' | 'pending' | 'error' | 'conflict';
  last_synced_at?: string;
  sync_errors?: string[];
  created_at: string;
  updated_at: string;
}

export interface ExternalBooking {
  external_id: string;
  channel_id: string;
  external_property_id: string;
  local_booking_id?: number;
  booking_data: {
    guest_name: string;
    guest_email: string;
    guest_phone?: string;
    check_in_date: string;
    check_out_date: string;
    total_guests: number;
    total_amount: number;
    currency: string;
    status: 'confirmed' | 'cancelled' | 'modified' | 'pending';
    booking_date: string;
    special_requests?: string;
    payment_status: 'paid' | 'pending' | 'refunded' | 'partially_paid';
  };
  sync_status: 'synced' | 'pending' | 'error' | 'conflict';
  last_synced_at?: string;
  sync_errors?: string[];
  created_at: string;
  updated_at: string;
}

export interface RateAndAvailability {
  id: number;
  property_id: number;
  channel_id?: string;
  external_property_id?: string;
  date: string;
  is_available: boolean;
  rate: number;
  currency: string;
  minimum_stay: number;
  maximum_stay?: number;
  close_to_arrival: boolean;
  close_to_departure: boolean;
  restrictions: {
    no_checkin: boolean;
    no_checkout: boolean;
    minimum_stay_arrival: number;
    minimum_stay_through: number;
  };
  sync_status: 'synced' | 'pending' | 'error';
  last_synced_at?: string;
  created_at: string;
  updated_at: string;
}

export interface ChannelSyncRequest {
  channel_id: string;
  sync_type: 'properties' | 'rates' | 'availability' | 'bookings' | 'reviews' | 'all';
  operation: 'push' | 'pull' | 'bidirectional';
  filters?: {
    property_ids?: number[];
    date_range?: {
      start_date: string;
      end_date: string;
    };
    modified_since?: string;
  };
  options?: {
    force_update: boolean;
    dry_run: boolean;
    batch_size: number;
  };
}

export interface ChannelSyncResponse {
  success: boolean;
  sync_log_id: number;
  message: string;
  summary: {
    total_records: number;
    processed: number;
    success: number;
    failed: number;
    warnings: number;
  };
  errors?: string[];
  warnings?: string[];
}

export interface ChannelMetrics {
  channel_id: string;
  channel_name: string;
  metrics: {
    total_properties: number;
    active_properties: number;
    total_bookings: number;
    revenue: number;
    average_rate: number;
    occupancy_rate: number;
    sync_success_rate: number;
    last_successful_sync: string;
    sync_errors_24h: number;
  };
  period: {
    start_date: string;
    end_date: string;
  };
}

export interface ChannelConflict {
  id: number;
  channel_id: string;
  conflict_type: 'property_mismatch' | 'booking_overlap' | 'rate_conflict' | 'availability_conflict';
  local_record_id: number;
  external_record_id: string;
  conflict_details: {
    field: string;
    local_value: any;
    external_value: any;
    last_modified_local?: string;
    last_modified_external?: string;
  };
  resolution_status: 'pending' | 'resolved_local' | 'resolved_external' | 'manual_review';
  resolution_notes?: string;
  created_at: string;
  resolved_at?: string;
}

export interface ChannelConfiguration {
  rate_sync_enabled: boolean;
  availability_sync_enabled: boolean;
  booking_sync_enabled: boolean;
  property_sync_enabled: boolean;
  review_sync_enabled: boolean;
  auto_accept_bookings: boolean;
  sync_frequency: number; // minutes
  conflict_resolution: 'local_wins' | 'external_wins' | 'manual_review' | 'latest_wins';
  notification_settings: {
    sync_errors: boolean;
    booking_notifications: boolean;
    conflict_alerts: boolean;
    daily_summary: boolean;
  };
  rate_adjustment: {
    enabled: boolean;
    markup_percentage: number;
    currency_conversion: boolean;
    seasonal_adjustments: Array<{
      start_date: string;
      end_date: string;
      adjustment_percentage: number;
    }>;
  };
}

// API Response Types
export interface ChannelAPIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    has_more: boolean;
  };
  rate_limit?: {
    remaining: number;
    reset_at: string;
  };
}

// External Platform API Interfaces
export interface AirbnbProperty {
  id: string;
  listing_url: string;
  name: string;
  summary: string;
  description: string;
  neighborhood_overview: string;
  picture_url: string;
  host_id: string;
  host_name: string;
  latitude: number;
  longitude: number;
  property_type: string;
  room_type: string;
  accommodates: number;
  bathrooms: number;
  bedrooms: number;
  beds: number;
  price: string;
  minimum_nights: number;
  maximum_nights: number;
  amenities: string;
  availability_365: number;
}

export interface BookingComProperty {
  hotel_id: string;
  name: string;
  address: string;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  star_rating: number;
  property_type: string;
  facilities: string[];
  description: string;
  photos: Array<{ url: string; description: string }>;
  rooms: Array<{
    room_id: string;
    room_name: string;
    max_occupancy: number;
    bed_configurations: Array<{ bed_type: string; count: number }>;
  }>;
}

export interface ExternalBookingData {
  reservation_id: string;
  property_id: string;
  guest_info: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    country: string;
  };
  stay_info: {
    checkin_date: string;
    checkout_date: string;
    adults: number;
    children: number;
    infants: number;
  };
  pricing: {
    total_amount: number;
    currency: string;
    breakdown: Array<{
      type: string;
      amount: number;
      description: string;
    }>;
  };
  status: string;
  created_at: string;
  special_requests?: string;
}

// Channel Manager Service Interface
export interface IChannelManager {
  // Channel Management
  addChannel(channel: Omit<ExternalChannel, 'id' | 'created_at' | 'updated_at'>): Promise<string>;
  updateChannel(channelId: string, updates: Partial<ExternalChannel>): Promise<boolean>;
  removeChannel(channelId: string): Promise<boolean>;
  getChannel(channelId: string): Promise<ExternalChannel | null>;
  getAllChannels(): Promise<ExternalChannel[]>;
  
  // Synchronization
  syncChannel(request: ChannelSyncRequest): Promise<ChannelSyncResponse>;
  syncAllChannels(): Promise<ChannelSyncResponse[]>;
  getSyncLogs(channelId?: string, limit?: number): Promise<ChannelSyncLog[]>;
  
  // Property Management
  mapProperty(localPropertyId: number, channelId: string, externalPropertyId: string): Promise<boolean>;
  unmapProperty(localPropertyId: number, channelId: string): Promise<boolean>;
  getPropertyMapping(channelId: string): Promise<Record<string, string>>;
  
  // Rate and Availability
  updateRateAndAvailability(
    propertyId: number,
    dateRange: { startDate: string; endDate: string },
    data: Partial<RateAndAvailability>
  ): Promise<boolean>;
  
  // Conflict Resolution
  getConflicts(channelId?: string): Promise<ChannelConflict[]>;
  resolveConflict(conflictId: number, resolution: 'local' | 'external', notes?: string): Promise<boolean>;
  
  // Metrics and Reporting
  getChannelMetrics(channelId: string, period: { startDate: string; endDate: string }): Promise<ChannelMetrics>;
  getPerformanceReport(): Promise<{
    total_channels: number;
    active_channels: number;
    total_synced_properties: number;
    sync_health_score: number;
    recent_errors: number;
  }>;
}

export default IChannelManager;