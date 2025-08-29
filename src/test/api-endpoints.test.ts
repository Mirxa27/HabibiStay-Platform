// API endpoint tests for HabibiStay backend

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Hono } from 'hono';

// Mock environment for testing
const mockEnv = {
  DB: {
    prepare: vi.fn().mockReturnThis(),
    bind: vi.fn().mockReturnThis(),
    first: vi.fn(),
    all: vi.fn(),
    run: vi.fn(),
  },
  OPENAI_API_KEY: 'test-openai-key',
  MYFATOORAH_API_KEY: 'test-myfatoorah-key',
  MYFATOORAH_API_URL: 'https://apitest.myfatoorah.com',
  MOCHA_USERS_SERVICE_API_URL: 'https://test-auth.com',
  MOCHA_USERS_SERVICE_API_KEY: 'test-auth-key',
};

// Mock Hono app
const app = new Hono();

// Mock authentication middleware
const mockAuthMiddleware = vi.fn(async (c, next) => {
  c.set('user', {
    id: 'test-user-id',
    email: 'test@example.com',
    role: 'user',
  });
  await next();
});

describe('API Endpoints', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Properties API', () => {
    it('should get properties with search filters', async () => {
      const mockProperties = [
        {
          id: 1,
          title: 'Luxury Apartment',
          location: 'Riyadh',
          price_per_night: 250,
          rating: 4.8,
        },
        {
          id: 2,
          title: 'Modern Villa',
          location: 'Jeddah',
          price_per_night: 400,
          rating: 4.9,
        },
      ];

      mockEnv.DB.all.mockResolvedValue({ results: mockProperties });

      const req = new Request('http://localhost/api/properties?location=Riyadh&guests=2');
      const res = await app.request(req, mockEnv);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.data).toEqual(mockProperties);
    });

    it('should handle property search with advanced filters', async () => {
      mockEnv.DB.all.mockResolvedValue({ results: [] });

      const params = new URLSearchParams({
        location: 'Riyadh',
        guests: '4',
        min_price: '200',
        max_price: '500',
        amenities: 'wifi,pool',
        property_type: 'apartment',
        bedrooms: '2',
        bathrooms: '2',
      });

      const req = new Request(`http://localhost/api/properties?${params}`);
      const res = await app.request(req, mockEnv);

      expect(mockEnv.DB.prepare).toHaveBeenCalled();
      const prepareCall = mockEnv.DB.prepare.mock.calls[0][0];
      expect(prepareCall).toContain('p.location LIKE ?');
      expect(prepareCall).toContain('p.max_guests >= ?');
      expect(prepareCall).toContain('p.price_per_night BETWEEN ? AND ?');
    });

    it('should get featured properties', async () => {
      const mockFeaturedProperties = [
        { id: 1, title: 'Featured Property 1', is_featured: true },
        { id: 2, title: 'Featured Property 2', is_featured: true },
      ];

      mockEnv.DB.all.mockResolvedValue({ results: mockFeaturedProperties });

      const req = new Request('http://localhost/api/properties/featured');
      const res = await app.request(req, mockEnv);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.data).toEqual(mockFeaturedProperties);
    });

    it('should get property by ID with reviews', async () => {
      const mockProperty = {
        id: 1,
        title: 'Test Property',
        description: 'A nice place',
        price_per_night: 250,
      };

      const mockReviews = [
        { id: 1, rating: 5, comment: 'Great place!' },
        { id: 2, rating: 4, comment: 'Good value' },
      ];

      mockEnv.DB.first.mockResolvedValue(mockProperty);
      mockEnv.DB.all.mockResolvedValue({ results: mockReviews });

      const req = new Request('http://localhost/api/properties/1');
      const res = await app.request(req, mockEnv);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.data.reviews).toEqual(mockReviews);
    });

    it('should return 404 for non-existent property', async () => {
      mockEnv.DB.first.mockResolvedValue(null);

      const req = new Request('http://localhost/api/properties/999');
      const res = await app.request(req, mockEnv);

      expect(res.status).toBe(404);
      const data = await res.json();
      expect(data.success).toBe(false);
      expect(data.error).toBe('Property not found');
    });

    it('should create property with authentication', async () => {
      mockEnv.DB.run.mockResolvedValue({ success: true });

      const propertyData = {
        title: 'New Property',
        description: 'A beautiful place',
        location: 'Riyadh, Saudi Arabia',
        price_per_night: 300,
        max_guests: 4,
        bedrooms: 2,
        bathrooms: 2,
        amenities: ['wifi', 'parking'],
        images: ['image1.jpg', 'image2.jpg'],
      };

      const req = new Request('http://localhost/api/properties', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-token',
        },
        body: JSON.stringify(propertyData),
      });

      // Mock authentication
      app.use('/api/properties', mockAuthMiddleware);

      const res = await app.request(req, mockEnv);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
    });
  });

  describe('Bookings API', () => {
    it('should create booking with valid data', async () => {
      const mockProperty = {
        id: 1,
        price_per_night: 250,
        max_guests: 4,
        is_active: true,
      };

      const mockBookingResult = {
        meta: { last_row_id: 123 },
        success: true,
      };

      mockEnv.DB.first.mockResolvedValue(mockProperty);
      mockEnv.DB.run.mockResolvedValue(mockBookingResult);

      const bookingData = {
        property_id: 1,
        check_in_date: '2024-12-01',
        check_out_date: '2024-12-05',
        guests: 2,
        guest_details: {
          full_name: 'John Doe',
          email: 'john@example.com',
          phone: '+966501234567',
        },
      };

      const req = new Request('http://localhost/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-token',
        },
        body: JSON.stringify(bookingData),
      });

      app.use('/api/bookings', mockAuthMiddleware);

      const res = await app.request(req, mockEnv);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.data.booking_id).toBe(123);
    });

    it('should validate booking dates', async () => {
      const bookingData = {
        property_id: 1,
        check_in_date: '2024-12-05',
        check_out_date: '2024-12-01', // Invalid: before check-in
        guests: 2,
        guest_details: {
          full_name: 'John Doe',
          email: 'john@example.com',
          phone: '+966501234567',
        },
      };

      const req = new Request('http://localhost/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-token',
        },
        body: JSON.stringify(bookingData),
      });

      app.use('/api/bookings', mockAuthMiddleware);

      const res = await app.request(req, mockEnv);

      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.success).toBe(false);
      expect(data.error).toBe('Invalid date range');
    });

    it('should check property availability', async () => {
      const mockConflictingBooking = {
        id: 456,
        check_in_date: '2024-12-02',
        check_out_date: '2024-12-04',
      };

      mockEnv.DB.first.mockResolvedValueOnce({ id: 1, is_active: true }); // Property exists
      mockEnv.DB.first.mockResolvedValueOnce(mockConflictingBooking); // Conflicting booking

      const req = new Request('http://localhost/api/properties/1/availability?check_in=2024-12-01&check_out=2024-12-05');
      const res = await app.request(req, mockEnv);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.data.available).toBe(false);
      expect(data.data.conflicting_booking).toBe(456);
    });
  });

  describe('Chat API', () => {
    it('should process chat messages with OpenAI', async () => {
      // Mock OpenAI response
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          choices: [
            {
              message: {
                content: 'Hello! I can help you find the perfect stay.',
              },
            },
          ],
        }),
      });

      const chatData = {
        message: 'Hello Sara',
        conversation_id: 'test-conv-id',
      };

      const req = new Request('http://localhost/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(chatData),
      });

      const res = await app.request(req, mockEnv);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.data.message).toBe('Hello! I can help you find the perfect stay.');
    });

    it('should handle OpenAI API errors', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('OpenAI API error'));

      const chatData = {
        message: 'Hello Sara',
        conversation_id: 'test-conv-id',
      };

      const req = new Request('http://localhost/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(chatData),
      });

      const res = await app.request(req, mockEnv);

      expect(res.status).toBe(500);
      const data = await res.json();
      expect(data.success).toBe(false);
      expect(data.error).toBe('Failed to process chat message');
    });
  });

  describe('Payments API', () => {
    it('should create MyFatoorah payment', async () => {
      const mockBooking = {
        id: 1,
        total_amount: 1000,
        status: 'pending',
        guest_email: 'test@example.com',
      };

      // Mock MyFatoorah API response
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          IsSuccess: true,
          Data: {
            InvoiceURL: 'https://myfatoorah.com/payment/123',
            InvoiceId: 'INV123',
          },
        }),
      });

      mockEnv.DB.first.mockResolvedValue(mockBooking);
      mockEnv.DB.run.mockResolvedValue({ success: true });

      const paymentData = {
        booking_id: 1,
        payment_method: 'myfatoorah',
        amount: 1000,
        currency: 'SAR',
      };

      const req = new Request('http://localhost/api/payments/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentData),
      });

      const res = await app.request(req, mockEnv);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.data.payment_url).toBe('https://myfatoorah.com/payment/123');
    });

    it('should handle payment callback', async () => {
      // Mock MyFatoorah payment status
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          IsSuccess: true,
          Data: {
            InvoiceStatus: 'Paid',
            InvoiceTransactions: [
              { TransactionId: 'TXN123' },
            ],
          },
        }),
      });

      mockEnv.DB.run.mockResolvedValue({ success: true });

      const callbackData = {
        paymentId: 'INV123',
        Id: 'INV123',
      };

      const req = new Request('http://localhost/api/payments/callback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(callbackData),
      });

      const res = await app.request(req, mockEnv);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.data.status).toBe('success');
    });
  });

  describe('Admin API', () => {
    it('should get admin stats with authentication', async () => {
      const mockStats = {
        total_properties: 150,
        total_bookings: 300,
        total_revenue: 75000,
        occupancy_rate: 78.5,
      };

      mockEnv.DB.first.mockResolvedValue(mockStats);

      const mockAdminMiddleware = vi.fn(async (c, next) => {
        c.set('user', {
          id: 'admin-user-id',
          email: 'admin@habibistay.com',
          role: 'admin',
        });
        await next();
      });

      const req = new Request('http://localhost/api/admin/stats', {
        headers: { 'Authorization': 'Bearer admin-token' },
      });

      app.use('/api/admin/*', mockAdminMiddleware);

      const res = await app.request(req, mockEnv);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.data).toEqual(mockStats);
    });

    it('should reject non-admin users', async () => {
      const mockUserMiddleware = vi.fn(async (c, next) => {
        c.set('user', {
          id: 'user-id',
          email: 'user@example.com',
          role: 'user', // Not admin
        });
        await next();
      });

      const req = new Request('http://localhost/api/admin/stats', {
        headers: { 'Authorization': 'Bearer user-token' },
      });

      app.use('/api/admin/*', mockUserMiddleware);

      const res = await app.request(req, mockEnv);

      expect(res.status).toBe(403);
      const data = await res.json();
      expect(data.success).toBe(false);
      expect(data.error).toBe('Insufficient permissions');
    });
  });

  describe('Rate Limiting', () => {
    it('should enforce rate limits', async () => {
      // Simulate rate limiting middleware
      let requestCount = 0;
      const rateLimitMiddleware = vi.fn(async (c, next) => {
        requestCount++;
        if (requestCount > 100) {
          return c.json({ error: 'Too many requests' }, 429);
        }
        await next();
      });

      app.use('*', rateLimitMiddleware);

      // Make requests up to limit
      for (let i = 0; i < 100; i++) {
        const req = new Request('http://localhost/api/properties');
        const res = await app.request(req, mockEnv);
        expect(res.status).not.toBe(429);
      }

      // 101st request should be rate limited
      const req = new Request('http://localhost/api/properties');
      const res = await app.request(req, mockEnv);
      expect(res.status).toBe(429);
    });
  });

  describe('Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      mockEnv.DB.all.mockRejectedValue(new Error('Database connection failed'));

      const req = new Request('http://localhost/api/properties');
      const res = await app.request(req, mockEnv);

      expect(res.status).toBe(500);
      const data = await res.json();
      expect(data.success).toBe(false);
      expect(data.error).toBe('Internal server error');
    });

    it('should validate request data', async () => {
      const invalidData = {
        // Missing required fields
        title: '',
        price_per_night: -100, // Invalid price
      };

      const req = new Request('http://localhost/api/properties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invalidData),
      });

      const res = await app.request(req, mockEnv);

      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.success).toBe(false);
    });
  });

  describe('Security', () => {
    it('should sanitize input data', async () => {
      const maliciousData = {
        title: '<script>alert("xss")</script>',
        description: 'DROP TABLE properties;',
      };

      const req = new Request('http://localhost/api/properties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(maliciousData),
      });

      // Should not crash or execute malicious code
      const res = await app.request(req, mockEnv);
      
      // The request should be processed safely
      expect(res.status).not.toBe(500);
    });

    it('should require authentication for protected routes', async () => {
      const req = new Request('http://localhost/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      const res = await app.request(req, mockEnv);

      expect(res.status).toBe(401);
      const data = await res.json();
      expect(data.error).toBe('Authentication required');
    });
  });
});