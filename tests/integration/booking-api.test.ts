/**
 * Integration tests for booking endpoints
 */

import request from 'supertest';
import { Hono } from 'hono';

// Mock environment for testing
const mockEnv = {
  DB: {
    prepare: jest.fn().mockReturnThis(),
    bind: jest.fn().mockReturnThis(),
    first: jest.fn(),
    all: jest.fn(),
    run: jest.fn()
  },
  OPENAI_API_KEY: 'test-openai-key',
  MYFATOORAH_API_KEY: 'test-myfatoorah-key'
};

// Import the worker after setting up mocks
jest.mock('@getmocha/users-service/hono', () => ({
  authMiddleware: (c: any, next: any) => {
    c.set('user', { id: 'test-user-123', email: 'test@example.com' });
    return next();
  }
}));

describe('Booking API Integration Tests', () => {
  let app: any;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Dynamically import the app to ensure mocks are applied
    const worker = require('../../src/worker/index');
    app = worker.app || worker.default;
  });

  describe('POST /api/bookings', () => {
    const validBookingData = {
      property_id: 1,
      check_in_date: '2024-03-15',
      check_out_date: '2024-03-18',
      guests: 2,
      guest_name: 'John Doe',
      guest_email: 'john@example.com',
      guest_phone: '+966501234567'
    };

    it('should create booking successfully', async () => {
      // Mock property exists
      mockEnv.DB.first.mockResolvedValueOnce({
        id: 1,
        title: 'Test Property',
        price_per_night: 300,
        max_guests: 4,
        is_active: 1
      });

      // Mock availability check
      mockEnv.DB.all.mockResolvedValueOnce({ results: [] });

      // Mock booking creation
      mockEnv.DB.run.mockResolvedValueOnce({
        meta: { last_row_id: 'BOOK_123' }
      });

      const response = await request(app)
        .post('/api/bookings')
        .send(validBookingData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.booking_id).toBeDefined();
      expect(response.body.data.total_amount).toBeGreaterThan(0);
      expect(response.body.data.next_step.action).toBe('payment_required');
    });

    it('should reject booking for non-existent property', async () => {
      mockEnv.DB.first.mockResolvedValueOnce(null);

      const response = await request(app)
        .post('/api/bookings')
        .send(validBookingData)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Property not found');
    });

    it('should reject booking with conflicting dates', async () => {
      // Mock property exists
      mockEnv.DB.first.mockResolvedValueOnce({
        id: 1,
        title: 'Test Property',
        max_guests: 4,
        is_active: 1
      });

      // Mock conflicting booking
      mockEnv.DB.all.mockResolvedValueOnce({
        results: [{
          check_in_date: '2024-03-14',
          check_out_date: '2024-03-16'
        }]
      });

      const response = await request(app)
        .post('/api/bookings')
        .send(validBookingData)
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('not available');
    });

    it('should reject booking exceeding guest capacity', async () => {
      mockEnv.DB.first.mockResolvedValueOnce({
        id: 1,
        title: 'Test Property',
        max_guests: 1,
        is_active: 1
      });

      const response = await request(app)
        .post('/api/bookings')
        .send({ ...validBookingData, guests: 5 })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('exceeds maximum');
    });

    it('should validate required fields', async () => {
      const invalidData = { ...validBookingData };
      delete invalidData.guest_email;

      const response = await request(app)
        .post('/api/bookings')
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should validate date format and logic', async () => {
      const response = await request(app)
        .post('/api/bookings')
        .send({
          ...validBookingData,
          check_in_date: '2024-03-18',
          check_out_date: '2024-03-15' // Check-out before check-in
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Check-out date must be after check-in');
    });
  });

  describe('GET /api/bookings', () => {
    it('should return user bookings', async () => {
      mockEnv.DB.all.mockResolvedValueOnce({
        results: [{
          id: 'BOOK_123',
          property_title: 'Test Property',
          check_in_date: '2024-03-15',
          status: 'confirmed',
          total_amount: 900
        }]
      });

      const response = await request(app)
        .get('/api/bookings')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].id).toBe('BOOK_123');
    });

    it('should require authentication', async () => {
      // Mock unauthorized access
      jest.doMock('@getmocha/users-service/hono', () => ({
        authMiddleware: (c: any, next: any) => {
          return c.json({ error: 'Unauthorized' }, 401);
        }
      }));

      const response = await request(app)
        .get('/api/bookings')
        .expect(401);

      expect(response.body.error).toBe('Unauthorized');
    });
  });

  describe('PUT /api/bookings/:id/cancel', () => {
    it('should cancel booking successfully', async () => {
      // Mock booking exists and belongs to user
      mockEnv.DB.first.mockResolvedValueOnce({
        id: 'BOOK_123',
        user_id: 'test-user-123',
        status: 'confirmed',
        check_in_date: '2024-04-15' // Future date
      });

      mockEnv.DB.run.mockResolvedValueOnce({ success: true });

      const response = await request(app)
        .put('/api/bookings/BOOK_123/cancel')
        .send({ reason: 'Change of plans' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('cancelled');
    });

    it('should not allow cancellation of past bookings', async () => {
      mockEnv.DB.first.mockResolvedValueOnce({
        id: 'BOOK_123',
        user_id: 'test-user-123',
        status: 'confirmed',
        check_in_date: '2024-01-15' // Past date
      });

      const response = await request(app)
        .put('/api/bookings/BOOK_123/cancel')
        .send({ reason: 'Change of plans' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('cannot be cancelled');
    });

    it('should prevent cancellation by non-owner', async () => {
      mockEnv.DB.first.mockResolvedValueOnce({
        id: 'BOOK_123',
        user_id: 'different-user',
        status: 'confirmed'
      });

      const response = await request(app)
        .put('/api/bookings/BOOK_123/cancel')
        .send({ reason: 'Change of plans' })
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Access denied');
    });
  });
});