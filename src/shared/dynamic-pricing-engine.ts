// Dynamic Pricing Engine Implementation for HabibiStay
import { 
  IPricingEngine, 
  PricingRule, 
  PriceCalculationRequest, 
  PriceCalculationResult,
  PropertyPricingSettings,
  MarketData,
  PricingAnalytics,
  PricingRecommendation,
  AppliedRule,
  PriceBreakdown
} from './dynamic-pricing-types';

export class DynamicPricingEngine implements IPricingEngine {
  private db: any;

  constructor(database: any) {
    this.db = database;
  }

  /**
   * Calculate price for a specific booking request
   */
  async calculatePrice(request: PriceCalculationRequest): Promise<PriceCalculationResult> {
    try {
      // Get property base price and settings
      const settings = await this.getPricingSettings(request.property_id);
      if (!settings) {
        throw new Error(`No pricing settings found for property ${request.property_id}`);
      }

      const checkIn = new Date(request.check_in_date);
      const checkOut = new Date(request.check_out_date);
      const totalNights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));

      if (totalNights <= 0) {
        throw new Error('Invalid date range');
      }

      // Get all active pricing rules for this property
      const rules = await this.getRules(request.property_id);
      const activeRules = rules.filter(rule => rule.is_active).sort((a, b) => b.priority - a.priority);

      // Calculate base price
      const basePrice = settings.base_price;
      const baseTotal = basePrice * totalNights;

      // Apply pricing rules
      const { adjustedPrice, appliedRules, breakdown } = await this.applyPricingRules(
        activeRules, 
        request, 
        basePrice, 
        totalNights,
        settings
      );

      // Apply taxes and fees
      const taxes = adjustedPrice * 0.15; // 15% VAT in Saudi Arabia
      const serviceFee = Math.min(adjustedPrice * 0.03, 50); // 3% service fee, max 50 SAR
      const cleaningFee = 25; // Fixed cleaning fee

      const finalPrice = adjustedPrice + taxes + serviceFee + cleaningFee;

      // Get recommendations
      const recommendations = await this.getRecommendations(request.property_id);

      return {
        base_price: basePrice,
        total_nights: totalNights,
        breakdown: {
          base_total: baseTotal,
          adjustments: breakdown,
          taxes,
          fees: serviceFee + cleaningFee,
          discounts: Math.max(0, baseTotal - adjustedPrice),
          grand_total: finalPrice
        },
        final_price: finalPrice,
        currency: settings.currency,
        applied_rules: appliedRules,
        recommendations
      };
    } catch (error) {
      console.error('Price calculation error:', error);
      throw error;
    }
  }

  /**
   * Apply pricing rules to calculate adjusted price
   */
  private async applyPricingRules(
    rules: PricingRule[],
    request: PriceCalculationRequest,
    basePrice: number,
    totalNights: number,
    settings: PropertyPricingSettings
  ): Promise<{
    adjustedPrice: number;
    appliedRules: AppliedRule[];
    breakdown: Array<{
      rule_name: string;
      rule_type: string;
      original_amount: number;
      adjusted_amount: number;
      difference: number;
      percentage_change: number;
    }>;
  }> {
    let currentPrice = basePrice * totalNights;
    const appliedRules: AppliedRule[] = [];
    const breakdown: any[] = [];

    const checkIn = new Date(request.check_in_date);
    const checkOut = new Date(request.check_out_date);
    const bookingDate = request.booking_date ? new Date(request.booking_date) : new Date();

    for (const rule of rules) {
      const originalAmount = currentPrice;
      
      if (await this.isRuleApplicable(rule, request, checkIn, checkOut, bookingDate, totalNights)) {
        const adjustment = this.calculateRuleAdjustment(rule, currentPrice, totalNights, request);
        currentPrice = Math.max(
          settings.minimum_price * totalNights,
          Math.min(settings.maximum_price * totalNights, adjustment.newPrice)
        );

        const difference = currentPrice - originalAmount;
        const percentageChange = (difference / originalAmount) * 100;

        appliedRules.push({
          rule_id: rule.id,
          rule_name: rule.rule_name,
          rule_type: rule.rule_type,
          priority: rule.priority,
          adjustment_type: rule.adjustment.type,
          adjustment_value: rule.adjustment.value,
          price_impact: difference,
          applied_dates: this.getDateRange(checkIn, checkOut)
        });

        breakdown.push({
          rule_name: rule.rule_name,
          rule_type: rule.rule_type,
          original_amount: originalAmount,
          adjusted_amount: currentPrice,
          difference,
          percentage_change: percentageChange
        });
      }
    }

    return {
      adjustedPrice: currentPrice,
      appliedRules,
      breakdown
    };
  }

  /**
   * Check if a pricing rule is applicable to the current request
   */
  private async isRuleApplicable(
    rule: PricingRule,
    request: PriceCalculationRequest,
    checkIn: Date,
    checkOut: Date,
    bookingDate: Date,
    totalNights: number
  ): Promise<boolean> {
    const conditions = rule.conditions;

    // Check date range
    if (rule.date_range) {
      const ruleStart = new Date(rule.date_range.start_date);
      const ruleEnd = new Date(rule.date_range.end_date);
      if (checkIn < ruleStart || checkOut > ruleEnd) {
        return false;
      }
    }

    // Check seasonal conditions
    if (conditions.seasons) {
      const season = this.getSeason(checkIn);
      if (!conditions.seasons.includes(season)) {
        return false;
      }
    }

    // Check monthly conditions
    if (conditions.months) {
      const month = checkIn.getMonth() + 1; // getMonth() returns 0-11
      if (!conditions.months.includes(month)) {
        return false;
      }
    }

    // Check advance booking conditions
    if (conditions.advance_days) {
      const advanceDays = Math.ceil((checkIn.getTime() - bookingDate.getTime()) / (1000 * 60 * 60 * 24));
      if (conditions.advance_days.min && advanceDays < conditions.advance_days.min) {
        return false;
      }
      if (conditions.advance_days.max && advanceDays > conditions.advance_days.max) {
        return false;
      }
    }

    // Check length of stay conditions
    if (conditions.stay_length) {
      if (conditions.stay_length.min_nights && totalNights < conditions.stay_length.min_nights) {
        return false;
      }
      if (conditions.stay_length.max_nights && totalNights > conditions.stay_length.max_nights) {
        return false;
      }
    }

    // Check day of week conditions
    if (conditions.days_of_week) {
      const dayOfWeek = checkIn.getDay();
      if (!conditions.days_of_week.includes(dayOfWeek)) {
        return false;
      }
    }

    // Check occupancy conditions (requires market data)
    if (conditions.occupancy_threshold) {
      const marketData = await this.getMarketData(request.property_id, request.check_in_date);
      if (marketData) {
        const occupancy = marketData.local_occupancy_rate;
        if (conditions.occupancy_threshold.min && occupancy < conditions.occupancy_threshold.min) {
          return false;
        }
        if (conditions.occupancy_threshold.max && occupancy > conditions.occupancy_threshold.max) {
          return false;
        }
      }
    }

    return true;
  }

  /**
   * Calculate price adjustment based on rule
   */
  private calculateRuleAdjustment(
    rule: PricingRule,
    currentPrice: number,
    totalNights: number,
    request: PriceCalculationRequest
  ): { newPrice: number; adjustment: number } {
    const adjustment = rule.adjustment;
    let newPrice = currentPrice;

    switch (adjustment.type) {
      case 'percentage':
        newPrice = currentPrice * (1 + adjustment.value / 100);
        break;
      
      case 'fixed_amount':
        newPrice = currentPrice + (adjustment.value * totalNights);
        break;
      
      case 'set_price':
        newPrice = adjustment.value * totalNights;
        break;
    }

    // Apply progressive adjustments for length of stay
    if (adjustment.progressive && rule.rule_type === 'length_of_stay') {
      const applicableTier = adjustment.progressive.tiers
        .filter(tier => totalNights >= tier.nights)
        .sort((a, b) => b.nights - a.nights)[0];
      
      if (applicableTier) {
        newPrice = currentPrice * (1 + applicableTier.adjustment / 100);
      }
    }

    // Apply min/max price constraints
    if (adjustment.min_price) {
      newPrice = Math.max(newPrice, adjustment.min_price * totalNights);
    }
    if (adjustment.max_price) {
      newPrice = Math.min(newPrice, adjustment.max_price * totalNights);
    }

    return {
      newPrice,
      adjustment: newPrice - currentPrice
    };
  }

  /**
   * Get season based on date
   */
  private getSeason(date: Date): string {
    const month = date.getMonth() + 1; // getMonth() returns 0-11
    
    if (month >= 12 || month <= 2) return 'winter';
    if (month >= 3 && month <= 5) return 'spring';
    if (month >= 6 && month <= 8) return 'summer';
    return 'fall';
  }

  /**
   * Get array of date strings between two dates
   */
  private getDateRange(startDate: Date, endDate: Date): string[] {
    const dates: string[] = [];
    const currentDate = new Date(startDate);
    
    while (currentDate < endDate) {
      dates.push(currentDate.toISOString().split('T')[0]);
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return dates;
  }

  // Rule Management Methods
  async createRule(rule: Omit<PricingRule, 'id' | 'created_at' | 'updated_at'>): Promise<number> {
    const result = await this.db.prepare(`
      INSERT INTO pricing_rules (
        property_id, rule_type, rule_name, is_active, priority, 
        conditions, adjustment, date_range_start, date_range_end, 
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `).bind(
      rule.property_id,
      rule.rule_type,
      rule.rule_name,
      rule.is_active,
      rule.priority,
      JSON.stringify(rule.conditions),
      JSON.stringify(rule.adjustment),
      rule.date_range?.start_date || null,
      rule.date_range?.end_date || null
    ).run();

    return result.meta.last_row_id;
  }

  async updateRule(ruleId: number, updates: Partial<PricingRule>): Promise<boolean> {
    const setClauses: string[] = [];
    const values: any[] = [];

    if (updates.rule_name) {
      setClauses.push('rule_name = ?');
      values.push(updates.rule_name);
    }
    if (updates.is_active !== undefined) {
      setClauses.push('is_active = ?');
      values.push(updates.is_active);
    }
    if (updates.priority !== undefined) {
      setClauses.push('priority = ?');
      values.push(updates.priority);
    }
    if (updates.conditions) {
      setClauses.push('conditions = ?');
      values.push(JSON.stringify(updates.conditions));
    }
    if (updates.adjustment) {
      setClauses.push('adjustment = ?');
      values.push(JSON.stringify(updates.adjustment));
    }

    setClauses.push('updated_at = datetime(\'now\')');
    values.push(ruleId);

    const result = await this.db.prepare(`
      UPDATE pricing_rules SET ${setClauses.join(', ')} WHERE id = ?
    `).bind(...values).run();

    return result.changes > 0;
  }

  async deleteRule(ruleId: number): Promise<boolean> {
    const result = await this.db.prepare('DELETE FROM pricing_rules WHERE id = ?').bind(ruleId).run();
    return result.changes > 0;
  }

  async getRules(propertyId: number): Promise<PricingRule[]> {
    const { results } = await this.db.prepare(`
      SELECT * FROM pricing_rules WHERE property_id = ? ORDER BY priority DESC
    `).bind(propertyId).all();

    return results.map((row: any) => ({
      id: row.id,
      property_id: row.property_id,
      rule_type: row.rule_type,
      rule_name: row.rule_name,
      is_active: Boolean(row.is_active),
      priority: row.priority,
      conditions: JSON.parse(row.conditions),
      adjustment: JSON.parse(row.adjustment),
      date_range: row.date_range_start && row.date_range_end ? {
        start_date: row.date_range_start,
        end_date: row.date_range_end
      } : undefined,
      created_at: row.created_at,
      updated_at: row.updated_at
    }));
  }

  // Settings Management
  async updatePricingSettings(propertyId: number, settings: Partial<PropertyPricingSettings>): Promise<boolean> {
    const existing = await this.getPricingSettings(propertyId);
    
    if (existing) {
      // Update existing settings
      const setClauses: string[] = [];
      const values: any[] = [];

      Object.entries(settings).forEach(([key, value]) => {
        if (key !== 'property_id' && key !== 'created_at') {
          setClauses.push(`${key} = ?`);
          values.push(typeof value === 'object' ? JSON.stringify(value) : value);
        }
      });

      setClauses.push('updated_at = datetime(\'now\')');
      values.push(propertyId);

      const result = await this.db.prepare(`
        UPDATE property_pricing_settings SET ${setClauses.join(', ')} WHERE property_id = ?
      `).bind(...values).run();

      return result.changes > 0;
    } else {
      // Create new settings
      const defaultSettings: PropertyPricingSettings = {
        property_id: propertyId,
        base_price: 100,
        currency: 'SAR',
        minimum_price: 50,
        maximum_price: 1000,
        auto_pricing_enabled: false,
        update_frequency: 'daily',
        early_bird_discount: { enabled: false, days_advance: 30, discount_percentage: 10 },
        last_minute_discount: { enabled: false, days_before: 3, discount_percentage: 15 },
        weekly_discount: { enabled: false, min_nights: 7, discount_percentage: 10 },
        monthly_discount: { enabled: false, min_nights: 28, discount_percentage: 20 },
        aggressiveness: 'moderate',
        competitor_matching: false,
        seasonal_adjustment: true,
        demand_adjustment: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...settings
      };

      const result = await this.db.prepare(`
        INSERT INTO property_pricing_settings (
          property_id, base_price, currency, minimum_price, maximum_price,
          auto_pricing_enabled, update_frequency, early_bird_discount,
          last_minute_discount, weekly_discount, monthly_discount,
          aggressiveness, competitor_matching, seasonal_adjustment,
          demand_adjustment, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
      `).bind(
        defaultSettings.property_id,
        defaultSettings.base_price,
        defaultSettings.currency,
        defaultSettings.minimum_price,
        defaultSettings.maximum_price,
        defaultSettings.auto_pricing_enabled,
        defaultSettings.update_frequency,
        JSON.stringify(defaultSettings.early_bird_discount),
        JSON.stringify(defaultSettings.last_minute_discount),
        JSON.stringify(defaultSettings.weekly_discount),
        JSON.stringify(defaultSettings.monthly_discount),
        defaultSettings.aggressiveness,
        defaultSettings.competitor_matching,
        defaultSettings.seasonal_adjustment,
        defaultSettings.demand_adjustment
      ).run();

      return result.meta.last_row_id > 0;
    }
  }

  async getPricingSettings(propertyId: number): Promise<PropertyPricingSettings | null> {
    const row = await this.db.prepare(`
      SELECT * FROM property_pricing_settings WHERE property_id = ?
    `).bind(propertyId).first();

    if (!row) return null;

    return {
      property_id: row.property_id,
      base_price: row.base_price,
      currency: row.currency,
      minimum_price: row.minimum_price,
      maximum_price: row.maximum_price,
      auto_pricing_enabled: Boolean(row.auto_pricing_enabled),
      update_frequency: row.update_frequency,
      early_bird_discount: JSON.parse(row.early_bird_discount),
      last_minute_discount: JSON.parse(row.last_minute_discount),
      weekly_discount: JSON.parse(row.weekly_discount),
      monthly_discount: JSON.parse(row.monthly_discount),
      aggressiveness: row.aggressiveness,
      competitor_matching: Boolean(row.competitor_matching),
      seasonal_adjustment: Boolean(row.seasonal_adjustment),
      demand_adjustment: Boolean(row.demand_adjustment),
      created_at: row.created_at,
      updated_at: row.updated_at
    };
  }

  // Market Data Management
  async updateMarketData(data: MarketData): Promise<boolean> {
    const result = await this.db.prepare(`
      INSERT OR REPLACE INTO market_data (
        property_id, date, local_occupancy_rate, competitor_average_price,
        demand_level, special_events, weather_impact, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `).bind(
      data.property_id,
      data.date,
      data.local_occupancy_rate,
      data.competitor_average_price,
      data.demand_level,
      JSON.stringify(data.special_events),
      data.weather_impact || null
    ).run();

    return result.meta.last_row_id > 0 || result.changes > 0;
  }

  async getMarketData(propertyId: number, date: string): Promise<MarketData | null> {
    const row = await this.db.prepare(`
      SELECT * FROM market_data WHERE property_id = ? AND date = ?
    `).bind(propertyId, date).first();

    if (!row) return null;

    return {
      property_id: row.property_id,
      date: row.date,
      local_occupancy_rate: row.local_occupancy_rate,
      competitor_average_price: row.competitor_average_price,
      demand_level: row.demand_level,
      special_events: JSON.parse(row.special_events || '[]'),
      weather_impact: row.weather_impact,
      created_at: row.created_at
    };
  }

  // Analytics and Recommendations
  async getAnalytics(propertyId: number, startDate: string, endDate: string): Promise<PricingAnalytics> {
    // This is a simplified implementation - in production, you'd want more sophisticated analytics
    const bookings = await this.db.prepare(`
      SELECT AVG(total_amount) as avg_price, COUNT(*) as booking_count, SUM(total_amount) as revenue
      FROM bookings 
      WHERE property_id = ? AND check_in_date >= ? AND check_in_date <= ?
    `).bind(propertyId, startDate, endDate).first();

    const totalDays = Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24));
    const occupancyRate = (bookings.booking_count || 0) / totalDays * 100;

    return {
      property_id: propertyId,
      period: { start_date: startDate, end_date: endDate },
      metrics: {
        average_price: bookings.avg_price || 0,
        occupancy_rate: occupancyRate,
        revenue: bookings.revenue || 0,
        booking_count: bookings.booking_count || 0,
        price_changes: 0, // Would track price changes from pricing history
        revenue_per_available_night: (bookings.revenue || 0) / totalDays
      },
      performance: {
        vs_market: {
          price_position: 'at',
          percentage_difference: 0
        },
        optimization_score: 75,
        missed_revenue: 0,
        gained_revenue: 0
      },
      recommendations: await this.getRecommendations(propertyId)
    };
  }

  async getRecommendations(propertyId: number): Promise<PricingRecommendation[]> {
    // Simplified recommendations - in production, use ML models
    return [
      {
        type: 'optimal',
        suggested_price: 150,
        reasoning: 'Current pricing is well-optimized for demand',
        potential_impact: {
          booking_probability: 85,
          revenue_impact: 0
        }
      }
    ];
  }

  // Bulk Operations
  async calculateBulkPrices(requests: PriceCalculationRequest[]): Promise<PriceCalculationResult[]> {
    const results = await Promise.all(
      requests.map(request => this.calculatePrice(request))
    );
    return results;
  }

  async updatePricesForProperty(propertyId: number, startDate: string, endDate: string): Promise<boolean> {
    // Implementation would update rates for the specified date range
    console.log(`Updating prices for property ${propertyId} from ${startDate} to ${endDate}`);
    return true;
  }

  async updatePricesForAllProperties(): Promise<number> {
    // Implementation would update prices for all properties with auto-pricing enabled
    const { results } = await this.db.prepare(`
      SELECT property_id FROM property_pricing_settings WHERE auto_pricing_enabled = 1
    `).all();

    let updatedCount = 0;
    for (const row of results) {
      const success = await this.updatePricesForProperty(
        row.property_id,
        new Date().toISOString().split('T')[0],
        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      );
      if (success) updatedCount++;
    }

    return updatedCount;
  }
}

export default DynamicPricingEngine;