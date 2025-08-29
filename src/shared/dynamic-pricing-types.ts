// Dynamic Pricing Engine Types for HabibiStay

export interface PricingRule {
  id: number;
  property_id: number;
  rule_type: 'seasonal' | 'occupancy' | 'advance_booking' | 'length_of_stay' | 'demand' | 'special_event' | 'last_minute' | 'weekly' | 'monthly';
  rule_name: string;
  is_active: boolean;
  priority: number; // Higher number = higher priority
  conditions: PricingConditions;
  adjustment: PricingAdjustment;
  date_range?: {
    start_date: string;
    end_date: string;
  };
  created_at: string;
  updated_at: string;
}

export interface PricingConditions {
  // Seasonal conditions
  seasons?: string[]; // ['winter', 'spring', 'summer', 'fall']
  months?: number[]; // [1, 2, 3] for Jan, Feb, Mar
  
  // Occupancy conditions
  occupancy_threshold?: {
    min?: number; // 0-100%
    max?: number; // 0-100%
  };
  
  // Advance booking conditions
  advance_days?: {
    min?: number; // minimum days in advance
    max?: number; // maximum days in advance
  };
  
  // Length of stay conditions
  stay_length?: {
    min_nights?: number;
    max_nights?: number;
  };
  
  // Day of week conditions
  days_of_week?: number[]; // 0=Sunday, 1=Monday, etc.
  
  // Special events
  event_dates?: string[]; // specific dates for events
  
  // Demand conditions
  demand_level?: 'low' | 'medium' | 'high' | 'very_high';
  
  // Competition conditions
  competitor_price_diff?: {
    percentage: number; // if our price is X% different from competitors
    comparison: 'above' | 'below';
  };
}

export interface PricingAdjustment {
  type: 'percentage' | 'fixed_amount' | 'set_price';
  value: number;
  currency?: string; // for fixed_amount and set_price
  min_price?: number; // minimum price after adjustment
  max_price?: number; // maximum price after adjustment
  
  // Progressive adjustments (for length of stay)
  progressive?: {
    tiers: Array<{
      nights: number;
      adjustment: number;
    }>;
  };
}

export interface PriceCalculationRequest {
  property_id: number;
  check_in_date: string;
  check_out_date: string;
  guest_count: number;
  booking_date?: string; // when the booking is being made (for advance booking rules)
  channel?: string; // booking channel (direct, airbnb, etc.)
}

export interface PriceCalculationResult {
  base_price: number;
  total_nights: number;
  breakdown: PriceBreakdown;
  final_price: number;
  currency: string;
  applied_rules: AppliedRule[];
  recommendations?: PricingRecommendation[];
}

export interface PriceBreakdown {
  base_total: number;
  adjustments: Array<{
    rule_name: string;
    rule_type: string;
    original_amount: number;
    adjusted_amount: number;
    difference: number;
    percentage_change: number;
  }>;
  taxes: number;
  fees: number;
  discounts: number;
  grand_total: number;
}

export interface AppliedRule {
  rule_id: number;
  rule_name: string;
  rule_type: string;
  priority: number;
  adjustment_type: string;
  adjustment_value: number;
  price_impact: number;
  applied_dates: string[];
}

export interface PricingRecommendation {
  type: 'increase' | 'decrease' | 'optimal';
  suggested_price: number;
  reasoning: string;
  potential_impact: {
    booking_probability: number;
    revenue_impact: number;
  };
}

export interface MarketData {
  property_id: number;
  date: string;
  local_occupancy_rate: number;
  competitor_average_price: number;
  demand_level: 'low' | 'medium' | 'high' | 'very_high';
  special_events: string[];
  weather_impact?: 'positive' | 'negative' | 'neutral';
  created_at: string;
}

export interface PropertyPricingSettings {
  property_id: number;
  base_price: number;
  currency: string;
  minimum_price: number;
  maximum_price: number;
  
  // Automatic pricing settings
  auto_pricing_enabled: boolean;
  update_frequency: 'daily' | 'weekly' | 'manual';
  
  // Discount settings
  early_bird_discount: {
    enabled: boolean;
    days_advance: number;
    discount_percentage: number;
  };
  
  last_minute_discount: {
    enabled: boolean;
    days_before: number;
    discount_percentage: number;
  };
  
  weekly_discount: {
    enabled: boolean;
    min_nights: number;
    discount_percentage: number;
  };
  
  monthly_discount: {
    enabled: boolean;
    min_nights: number;
    discount_percentage: number;
  };
  
  // Smart pricing preferences
  aggressiveness: 'conservative' | 'moderate' | 'aggressive';
  competitor_matching: boolean;
  seasonal_adjustment: boolean;
  demand_adjustment: boolean;
  
  created_at: string;
  updated_at: string;
}

export interface PricingAnalytics {
  property_id: number;
  period: {
    start_date: string;
    end_date: string;
  };
  metrics: {
    average_price: number;
    occupancy_rate: number;
    revenue: number;
    booking_count: number;
    price_changes: number;
    revenue_per_available_night: number;
  };
  performance: {
    vs_market: {
      price_position: 'below' | 'at' | 'above';
      percentage_difference: number;
    };
    optimization_score: number; // 0-100
    missed_revenue: number;
    gained_revenue: number;
  };
  recommendations: PricingRecommendation[];
}

export interface SeasonalPeriod {
  id: number;
  name: string;
  start_date: string; // MM-DD format
  end_date: string; // MM-DD format
  multiplier: number; // price multiplier
  description?: string;
  is_active: boolean;
}

export interface SpecialEvent {
  id: number;
  name: string;
  date: string;
  duration_days: number;
  impact_radius_km: number;
  price_impact: 'low' | 'medium' | 'high' | 'very_high';
  adjustment_percentage: number;
  description?: string;
  created_at: string;
}

// Pricing Engine Interface
export interface IPricingEngine {
  // Price calculation
  calculatePrice(request: PriceCalculationRequest): Promise<PriceCalculationResult>;
  calculateBulkPrices(requests: PriceCalculationRequest[]): Promise<PriceCalculationResult[]>;
  
  // Rule management
  createRule(rule: Omit<PricingRule, 'id' | 'created_at' | 'updated_at'>): Promise<number>;
  updateRule(ruleId: number, updates: Partial<PricingRule>): Promise<boolean>;
  deleteRule(ruleId: number): Promise<boolean>;
  getRules(propertyId: number): Promise<PricingRule[]>;
  
  // Settings management
  updatePricingSettings(propertyId: number, settings: Partial<PropertyPricingSettings>): Promise<boolean>;
  getPricingSettings(propertyId: number): Promise<PropertyPricingSettings | null>;
  
  // Market data
  updateMarketData(data: MarketData): Promise<boolean>;
  getMarketData(propertyId: number, date: string): Promise<MarketData | null>;
  
  // Analytics
  getAnalytics(propertyId: number, startDate: string, endDate: string): Promise<PricingAnalytics>;
  getRecommendations(propertyId: number): Promise<PricingRecommendation[]>;
  
  // Bulk operations
  updatePricesForProperty(propertyId: number, startDate: string, endDate: string): Promise<boolean>;
  updatePricesForAllProperties(): Promise<number>; // returns number of properties updated
}

export default IPricingEngine;