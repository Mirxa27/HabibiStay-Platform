// Booking Service for HabibiStay
// Comprehensive booking management with payment integration

import { Database } from '../db';
import { Booking, BookingCreate, BookingUpdate, BookingStatus } from '../../shared/types';
import { PaymentService } from './PaymentService';
import { EmailService } from './EmailService';
import { PricingService } from './PricingService';

export interface BookingSearchOptions {
  page?: number;
  limit?: number;
  status?: BookingStatus;
  userId?: string;
  propertyId?: number;
  startDate?: string;
  endDate?: string;
  sortBy?: 'created_at' | 'check_in_date' | 'total_amount';
  sortOrder?: 'asc' | 'desc';
}

export interface BookingSearchResult {
  bookings: Booking[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface BookingStats {
  totalBookings: number;
  pendingBookings: number;
  confirmedBookings: number;
  cancelledBookings: number;
  totalRevenue: number;
  averageBookingValue: number;
  occupancyRate: number;
}

export interface AvailabilityCheck {
  isAvailable: boolean;
  conflictingBookings?: Booking[];
  suggestedDates?: string[];
}

export interface PriceCalculation {
  basePrice: number;
  nights: number;
  subtotal: number;
  serviceFee: number;
  taxes: number;
  discounts: number;
  totalAmount: number;
  breakdown: {
    nightlyRate: number;
    cleaningFee: number;
    serviceFee: number;
    taxes: number;
    discounts: Array<{
      type: string;
      amount: number;
      description: string;
    }>;
  };
}

export class BookingService {
  private paymentService: PaymentService;
  private emailService: EmailService;
  private pricingService: PricingService;

  constructor(
    private db: Database,
    paymentService: PaymentService,
    emailService: EmailService,
    pricingService: PricingService
  ) {
    this.paymentService = paymentService;
    this.emailService = emailService;
    this.pricingService = pricingService;
  }

  // Create new booking
  async createBooking(bookingData: BookingCreate, userId?: string): Promise<Booking> {
    try {
      // Validate booking data
      await this.validateBookingData(bookingData);

      // Check property availability
      const availability = await this.checkAvailability(
        bookingData.property_id,
        bookingData.check_in_date,
        bookingData.check_out_date
      );

      if (!availability.isAvailable) {
        throw new Error('Property is not available for the selected dates');
      }

      // Calculate pricing
      const pricing = await this.calculateBookingPrice(
        bookingData.property_id,
        bookingData.check_in_date,
        bookingData.check_out_date,
        bookingData.guests
      );

      // Generate booking ID
      const bookingId = await this.generateBookingId();

      // Create booking record
      const booking = await this.db.run(`
        INSERT INTO bookings (
          id, user_id, property_id, check_in_date, check_out_date, guests,
          total_amount, status, guest_name, guest_email, guest_phone,
          special_requests, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        bookingId,
        userId || null,
        bookingData.property_id,
        bookingData.check_in_date,
        bookingData.check_out_date,
        bookingData.guests,
        pricing.totalAmount,
        'pending',
        bookingData.guest_name,
        bookingData.guest_email,
        bookingData.guest_phone,
        bookingData.special_requests || '',
        new Date().toISOString(),
        new Date().toISOString()
      ]);

      // Store pricing breakdown
      await this.storePricingBreakdown(bookingId, pricing);

      // Log booking creation
      await this.logBookingAction(bookingId, userId || 'guest', 'create', bookingData);

      // Send confirmation email
      await this.sendBookingConfirmationEmail(bookingId);

      return await this.getBookingById(bookingId);
    } catch (error) {
      throw new Error(`Failed to create booking: ${error.message}`);
    }
  }

  // Get booking by ID
  async getBookingById(bookingId: string): Promise<Booking> {
    try {
      const booking = await this.db.get(`
        SELECT b.*, p.title as property_title, p.location as property_location,
               p.images as property_images, u.name as user_name
        FROM bookings b
        LEFT JOIN properties p ON b.property_id = p.id
        LEFT JOIN users u ON b.user_id = u.id
        WHERE b.id = ?
      `, [bookingId]);

      if (!booking) {
        throw new Error('Booking not found');
      }

      // Get pricing breakdown
      const pricingBreakdown = await this.getPricingBreakdown(bookingId);
      booking.pricing_breakdown = pricingBreakdown;

      // Parse JSON fields
      if (booking.property_images) {
        booking.property_images = JSON.parse(booking.property_images);
      }

      return booking as Booking;
    } catch (error) {
      throw new Error(`Failed to get booking: ${error.message}`);
    }
  }

  // Update booking
  async updateBooking(bookingId: string, updateData: BookingUpdate, userId: string): Promise<Booking> {
    try {
      // Check if user can update this booking
      await this.validateBookingAccess(bookingId, userId);

      // Validate update data
      await this.validateBookingUpdateData(updateData);

      // Check if dates are being changed and validate availability
      if (updateData.check_in_date || updateData.check_out_date) {
        const currentBooking = await this.getBookingById(bookingId);
        const newCheckIn = updateData.check_in_date || currentBooking.check_in_date;
        const newCheckOut = updateData.check_out_date || currentBooking.check_out_date;

        const availability = await this.checkAvailability(
          currentBooking.property_id,
          newCheckIn,
          newCheckOut,
          bookingId // Exclude current booking from availability check
        );

        if (!availability.isAvailable) {
          throw new Error('Property is not available for the selected dates');
        }

        // Recalculate pricing if dates changed
        if (newCheckIn !== currentBooking.check_in_date || newCheckOut !== currentBooking.check_out_date) {
          const newPricing = await this.calculateBookingPrice(
            currentBooking.property_id,
            newCheckIn,
            newCheckOut,
            updateData.guests || currentBooking.guests
          );
          updateData.total_amount = newPricing.totalAmount;
          await this.storePricingBreakdown(bookingId, newPricing);
        }
      }

      // Build update query
      const updateFields = [];
      const updateValues = [];

      for (const [key, value] of Object.entries(updateData)) {
        if (value !== undefined && key !== 'id') {
          updateFields.push(`${key} = ?`);
          updateValues.push(value);
        }
      }

      if (updateFields.length === 0) {
        throw new Error('No valid fields to update');
      }

      // Add updated_at field
      updateFields.push('updated_at = ?');
      updateValues.push(new Date().toISOString());
      updateValues.push(bookingId);

      await this.db.run(`
        UPDATE bookings 
        SET ${updateFields.join(', ')}
        WHERE id = ?
      `, updateValues);

      // Log booking update
      await this.logBookingAction(bookingId, userId, 'update', updateData);

      // Send update notification if status changed
      if (updateData.status) {
        await this.sendBookingStatusUpdateEmail(bookingId, updateData.status);
      }

      return await this.getBookingById(bookingId);
    } catch (error) {
      throw new Error(`Failed to update booking: ${error.message}`);
    }
  }

  // Cancel booking
  async cancelBooking(bookingId: string, userId: string, reason?: string): Promise<Booking> {
    try {
      const booking = await this.getBookingById(bookingId);

      // Check if user can cancel this booking
      await this.validateBookingAccess(bookingId, userId);

      // Check if booking can be cancelled
      if (booking.status === 'cancelled') {
        throw new Error('Booking is already cancelled');
      }

      if (booking.status === 'completed') {
        throw new Error('Cannot cancel completed booking');
      }

      // Calculate cancellation fee based on policy
      const cancellationInfo = await this.calculateCancellationFee(bookingId);

      // Update booking status
      await this.db.run(`
        UPDATE bookings 
        SET status = 'cancelled', 
            cancellation_reason = ?,
            cancellation_fee = ?,
            refund_amount = ?,
            updated_at = ?
        WHERE id = ?
      `, [
        reason || 'Cancelled by user',
        cancellationInfo.fee,
        cancellationInfo.refundAmount,
        new Date().toISOString(),
        bookingId
      ]);

      // Process refund if applicable
      if (cancellationInfo.refundAmount > 0) {
        await this.processRefund(bookingId, cancellationInfo.refundAmount);
      }

      // Log cancellation
      await this.logBookingAction(bookingId, userId, 'cancel', { reason, ...cancellationInfo });

      // Send cancellation email
      await this.sendBookingCancellationEmail(bookingId);

      return await this.getBookingById(bookingId);
    } catch (error) {
      throw new Error(`Failed to cancel booking: ${error.message}`);
    }
  }

  // Search bookings
  async searchBookings(options: BookingSearchOptions): Promise<BookingSearchResult> {
    try {
      const {
        page = 1,
        limit = 20,
        status,
        userId,
        propertyId,
        startDate,
        endDate,
        sortBy = 'created_at',
        sortOrder = 'desc'
      } = options;

      // Build WHERE clause
      const whereConditions = [];
      const queryParams: any[] = [];

      if (status) {
        whereConditions.push('b.status = ?');
        queryParams.push(status);
      }

      if (userId) {
        whereConditions.push('b.user_id = ?');
        queryParams.push(userId);
      }

      if (propertyId) {
        whereConditions.push('b.property_id = ?');
        queryParams.push(propertyId);
      }

      if (startDate) {
        whereConditions.push('b.check_in_date >= ?');
        queryParams.push(startDate);
      }

      if (endDate) {
        whereConditions.push('b.check_out_date <= ?');
        queryParams.push(endDate);
      }

      const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

      // Get total count
      const totalResult = await this.db.get(`
        SELECT COUNT(*) as total
        FROM bookings b
        ${whereClause}
      `, queryParams);

      const total = totalResult.total;
      const totalPages = Math.ceil(total / limit);
      const offset = (page - 1) * limit;

      // Build ORDER BY clause
      const validSortFields = ['created_at', 'check_in_date', 'total_amount'];
      const sortField = validSortFields.includes(sortBy) ? `b.${sortBy}` : 'b.created_at';
      const sortDirection = sortOrder === 'asc' ? 'ASC' : 'DESC';

      // Get bookings
      const bookings = await this.db.all(`
        SELECT b.*, p.title as property_title, p.location as property_location,
               p.images as property_images, u.name as user_name
        FROM bookings b
        LEFT JOIN properties p ON b.property_id = p.id
        LEFT JOIN users u ON b.user_id = u.id
        ${whereClause}
        ORDER BY ${sortField} ${sortDirection}
        LIMIT ? OFFSET ?
      `, [...queryParams, limit, offset]);

      // Parse JSON fields and add pricing breakdown
      const enrichedBookings = await Promise.all(
        bookings.map(async (booking) => {
          if (booking.property_images) {
            booking.property_images = JSON.parse(booking.property_images);
          }
          booking.pricing_breakdown = await this.getPricingBreakdown(booking.id);
          return booking;
        })
      );

      return {
        bookings: enrichedBookings as Booking[],
        total,
        page,
        limit,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      };
    } catch (error) {
      throw new Error(`Failed to search bookings: ${error.message}`);
    }
  }

  // Check availability
  async checkAvailability(
    propertyId: number,
    checkInDate: string,
    checkOutDate: string,
    excludeBookingId?: string
  ): Promise<AvailabilityCheck> {
    try {
      let query = `
        SELECT * FROM bookings 
        WHERE property_id = ? 
        AND status IN ('confirmed', 'pending')
        AND (
          (check_in_date <= ? AND check_out_date > ?) OR
          (check_in_date < ? AND check_out_date >= ?) OR
          (check_in_date >= ? AND check_out_date <= ?)
        )
      `;
      const params = [propertyId, checkInDate, checkInDate, checkOutDate, checkOutDate, checkInDate, checkOutDate];

      if (excludeBookingId) {
        query += ' AND id != ?';
        params.push(excludeBookingId);
      }

      const conflictingBookings = await this.db.all(query, params);

      if (conflictingBookings.length > 0) {
        // Generate suggested alternative dates
        const suggestedDates = await this.generateSuggestedDates(propertyId, checkInDate, checkOutDate);

        return {
          isAvailable: false,
          conflictingBookings: conflictingBookings as Booking[],
          suggestedDates
        };
      }

      return { isAvailable: true };
    } catch (error) {
      throw new Error(`Failed to check availability: ${error.message}`);
    }
  }

  // Calculate booking price
  async calculateBookingPrice(
    propertyId: number,
    checkInDate: string,
    checkOutDate: string,
    guests: number
  ): Promise<PriceCalculation> {
    try {
      // Get property details
      const property = await this.db.get('SELECT * FROM properties WHERE id = ?', [propertyId]);
      if (!property) {
        throw new Error('Property not found');
      }

      // Calculate number of nights
      const checkIn = new Date(checkInDate);
      const checkOut = new Date(checkOutDate);
      const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));

      // Use pricing service for dynamic pricing
      const dynamicPrice = await this.pricingService.getPropertyPrice(propertyId, checkInDate, checkOutDate);
      const basePrice = dynamicPrice || property.price_per_night;

      // Calculate subtotal
      const subtotal = basePrice * nights;

      // Calculate fees and taxes
      const serviceFeeRate = 0.12; // 12% service fee
      const taxRate = 0.15; // 15% VAT

      const serviceFee = Math.round(subtotal * serviceFeeRate);
      const taxes = Math.round((subtotal + serviceFee) * taxRate);

      // Apply discounts
      const discounts = await this.calculateDiscounts(propertyId, subtotal, nights, guests);
      const totalDiscountAmount = discounts.reduce((sum, discount) => sum + discount.amount, 0);

      // Calculate total
      const totalAmount = subtotal + serviceFee + taxes - totalDiscountAmount;

      return {
        basePrice,
        nights,
        subtotal,
        serviceFee,
        taxes,
        discounts: totalDiscountAmount,
        totalAmount,
        breakdown: {
          nightlyRate: basePrice,
          cleaningFee: 0, // Can be added later
          serviceFee,
          taxes,
          discounts
        }
      };
    } catch (error) {
      throw new Error(`Failed to calculate booking price: ${error.message}`);
    }
  }

  // Get booking statistics
  async getBookingStats(propertyId?: number, ownerId?: string): Promise<BookingStats> {
    try {
      let whereClause = '';
      const params: any[] = [];

      if (propertyId) {
        whereClause = 'WHERE b.property_id = ?';
        params.push(propertyId);
      } else if (ownerId) {
        whereClause = 'WHERE p.owner_id = ?';
        params.push(ownerId);
      }

      const stats = await this.db.get(`
        SELECT 
          COUNT(b.id) as totalBookings,
          COUNT(CASE WHEN b.status = 'pending' THEN 1 END) as pendingBookings,
          COUNT(CASE WHEN b.status = 'confirmed' THEN 1 END) as confirmedBookings,
          COUNT(CASE WHEN b.status = 'cancelled' THEN 1 END) as cancelledBookings,
          COALESCE(SUM(CASE WHEN b.status = 'confirmed' THEN b.total_amount ELSE 0 END), 0) as totalRevenue,
          COALESCE(AVG(CASE WHEN b.status = 'confirmed' THEN b.total_amount END), 0) as averageBookingValue
        FROM bookings b
        LEFT JOIN properties p ON b.property_id = p.id
        ${whereClause}
      `, params);

      // Calculate occupancy rate (simplified)
      const occupancyRate = await this.calculateOccupancyRate(propertyId, ownerId);

      return {
        ...stats,
        occupancyRate
      } as BookingStats;
    } catch (error) {
      throw new Error(`Failed to get booking statistics: ${error.message}`);
    }
  }

  // Private helper methods

  private async validateBookingData(data: BookingCreate): Promise<void> {
    if (!data.property_id) {
      throw new Error('Property ID is required');
    }

    if (!data.check_in_date || !data.check_out_date) {
      throw new Error('Check-in and check-out dates are required');
    }

    const checkIn = new Date(data.check_in_date);
    const checkOut = new Date(data.check_out_date);
    const today = new Date();

    if (checkIn < today) {
      throw new Error('Check-in date cannot be in the past');
    }

    if (checkOut <= checkIn) {
      throw new Error('Check-out date must be after check-in date');
    }

    if (!data.guests || data.guests < 1 || data.guests > 20) {
      throw new Error('Number of guests must be between 1 and 20');
    }

    if (!data.guest_name || data.guest_name.trim().length < 2) {
      throw new Error('Guest name is required');
    }

    if (!data.guest_email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.guest_email)) {
      throw new Error('Valid email address is required');
    }

    if (!data.guest_phone || data.guest_phone.trim().length < 10) {
      throw new Error('Valid phone number is required');
    }
  }

  private async validateBookingUpdateData(data: BookingUpdate): Promise<void> {
    if (data.check_in_date && new Date(data.check_in_date) < new Date()) {
      throw new Error('Check-in date cannot be in the past');
    }

    if (data.check_in_date && data.check_out_date && new Date(data.check_out_date) <= new Date(data.check_in_date)) {
      throw new Error('Check-out date must be after check-in date');
    }

    if (data.guests && (data.guests < 1 || data.guests > 20)) {
      throw new Error('Number of guests must be between 1 and 20');
    }
  }

  private async validateBookingAccess(bookingId: string, userId: string): Promise<void> {
    const booking = await this.db.get(`
      SELECT b.user_id, b.property_id, p.owner_id 
      FROM bookings b
      LEFT JOIN properties p ON b.property_id = p.id
      WHERE b.id = ?
    `, [bookingId]);

    if (!booking) {
      throw new Error('Booking not found');
    }

    const user = await this.db.get('SELECT role FROM users WHERE id = ?', [userId]);

    // Allow access if user is the booking guest, property owner, or admin
    if (booking.user_id !== userId && booking.owner_id !== userId && user?.role !== 'admin') {
      throw new Error('Access denied');
    }
  }

  private async generateBookingId(): Promise<string> {
    const prefix = 'HBS';
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.random().toString(36).substr(2, 4).toUpperCase();
    return `${prefix}${timestamp}${random}`;
  }

  private async storePricingBreakdown(bookingId: string, pricing: PriceCalculation): Promise<void> {
    await this.db.run(`
      INSERT OR REPLACE INTO booking_pricing (
        booking_id, base_price, nights, subtotal, service_fee, taxes, 
        discounts, total_amount, breakdown, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      bookingId,
      pricing.basePrice,
      pricing.nights,
      pricing.subtotal,
      pricing.serviceFee,
      pricing.taxes,
      pricing.discounts,
      pricing.totalAmount,
      JSON.stringify(pricing.breakdown),
      new Date().toISOString()
    ]);
  }

  private async getPricingBreakdown(bookingId: string): Promise<any> {
    const pricing = await this.db.get('SELECT * FROM booking_pricing WHERE booking_id = ?', [bookingId]);
    if (pricing && pricing.breakdown) {
      pricing.breakdown = JSON.parse(pricing.breakdown);
    }
    return pricing;
  }

  private async calculateDiscounts(propertyId: number, subtotal: number, nights: number, guests: number): Promise<Array<{ type: string; amount: number; description: string }>> {
    const discounts = [];

    // Weekly discount (7+ nights)
    if (nights >= 7) {
      const weeklyDiscount = Math.round(subtotal * 0.1); // 10% weekly discount
      discounts.push({
        type: 'weekly',
        amount: weeklyDiscount,
        description: 'Weekly stay discount (10%)'
      });
    }

    // Monthly discount (30+ nights)
    if (nights >= 30) {
      const monthlyDiscount = Math.round(subtotal * 0.2); // 20% monthly discount
      discounts.push({
        type: 'monthly',
        amount: monthlyDiscount,
        description: 'Monthly stay discount (20%)'
      });
    }

    // First-time user discount (implement as needed)
    // Group booking discount (implement as needed)

    return discounts;
  }

  private async calculateCancellationFee(bookingId: string): Promise<{ fee: number; refundAmount: number }> {
    const booking = await this.getBookingById(bookingId);
    const checkInDate = new Date(booking.check_in_date);
    const now = new Date();
    const daysUntilCheckIn = Math.ceil((checkInDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    let feePercentage = 0;

    // Flexible cancellation policy
    if (daysUntilCheckIn >= 7) {
      feePercentage = 0; // No fee
    } else if (daysUntilCheckIn >= 1) {
      feePercentage = 0.1; // 10% fee
    } else {
      feePercentage = 0.5; // 50% fee
    }

    const fee = Math.round(booking.total_amount * feePercentage);
    const refundAmount = booking.total_amount - fee;

    return { fee, refundAmount };
  }

  private async processRefund(bookingId: string, amount: number): Promise<void> {
    // Implement refund processing with payment gateway
    await this.paymentService.processRefund(bookingId, amount);
  }

  private async generateSuggestedDates(propertyId: number, originalCheckIn: string, originalCheckOut: string): Promise<string[]> {
    // Simple implementation - suggest dates 1 week later
    const checkIn = new Date(originalCheckIn);
    const checkOut = new Date(originalCheckOut);
    const nightsDuration = (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24);

    const suggestions = [];
    for (let i = 7; i <= 21; i += 7) { // Try 1, 2, 3 weeks later
      const newCheckIn = new Date(checkIn.getTime() + (i * 24 * 60 * 60 * 1000));
      const newCheckOut = new Date(newCheckIn.getTime() + (nightsDuration * 24 * 60 * 60 * 1000));
      
      const availability = await this.checkAvailability(
        propertyId,
        newCheckIn.toISOString().split('T')[0],
        newCheckOut.toISOString().split('T')[0]
      );

      if (availability.isAvailable) {
        suggestions.push(newCheckIn.toISOString().split('T')[0]);
      }
    }

    return suggestions;
  }

  private async calculateOccupancyRate(propertyId?: number, ownerId?: string): Promise<number> {
    // Simplified occupancy rate calculation
    // In a real implementation, this would be more sophisticated
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - (90 * 24 * 60 * 60 * 1000)); // Last 90 days

    let whereClause = 'WHERE b.status = "confirmed" AND b.check_out_date >= ? AND b.check_in_date <= ?';
    const params = [startDate.toISOString(), endDate.toISOString()];

    if (propertyId) {
      whereClause += ' AND b.property_id = ?';
      params.push(propertyId);
    } else if (ownerId) {
      whereClause += ' AND p.owner_id = ?';
      params.push(ownerId);
    }

    const result = await this.db.get(`
      SELECT SUM(
        CASE 
          WHEN b.check_out_date <= ? THEN 
            julianday(b.check_out_date) - julianday(b.check_in_date)
          WHEN b.check_in_date >= ? THEN 
            julianday(?) - julianday(b.check_in_date)
          ELSE 
            julianday(?) - julianday(?)
        END
      ) as occupiedNights
      FROM bookings b
      LEFT JOIN properties p ON b.property_id = p.id
      ${whereClause}
    `, [endDate.toISOString(), startDate.toISOString(), endDate.toISOString(), endDate.toISOString(), startDate.toISOString(), ...params]);

    const occupiedNights = result.occupiedNights || 0;
    const totalNights = 90; // Last 90 days
    
    return Math.round((occupiedNights / totalNights) * 100);
  }

  private async logBookingAction(bookingId: string, userId: string, action: string, details: any): Promise<void> {
    await this.db.run(`
      INSERT INTO audit_logs (user_id, action, details, timestamp)
      VALUES (?, ?, ?, ?)
    `, [userId, `booking_${action}`, JSON.stringify({ bookingId, ...details }), new Date().toISOString()]);
  }

  private async sendBookingConfirmationEmail(bookingId: string): Promise<void> {
    try {
      const booking = await this.getBookingById(bookingId);
      await this.emailService.sendBookingConfirmation(booking);
    } catch (error) {
      console.error('Failed to send booking confirmation email:', error);
    }
  }

  private async sendBookingStatusUpdateEmail(bookingId: string, status: BookingStatus): Promise<void> {
    try {
      const booking = await this.getBookingById(bookingId);
      await this.emailService.sendBookingStatusUpdate(booking, status);
    } catch (error) {
      console.error('Failed to send booking status update email:', error);
    }
  }

  private async sendBookingCancellationEmail(bookingId: string): Promise<void> {
    try {
      const booking = await this.getBookingById(bookingId);
      await this.emailService.sendBookingCancellation(booking);
    } catch (error) {
      console.error('Failed to send booking cancellation email:', error);
    }
  }
}