/**
 * End-to-end tests for complete booking flow
 * Tests the entire user journey from property search to payment completion
 */

import request from 'supertest';

// Mock comprehensive environment
const mockEnv = {
  DB: {
    prepare: jest.fn().mockReturnThis(),
    bind: jest.fn().mockReturnThis(),
    first: jest.fn(),
    all: jest.fn(),
    run: jest.fn()
  },
  OPENAI_API_KEY: 'test-openai-key',
  MYFATOORAH_API_KEY: 'test-myfatoorah-key',
  APP_URL: 'https://habibistay.com'
};

// Mock authentication
jest.mock('@getmocha/users-service/hono', () => ({
  authMiddleware: (c: any, next: any) => {
    c.set('user', { 
      id: 'user_123', 
      email: 'john@example.com',
      google_user_data: { name: 'John Doe' }
    });
    return next();
  }
}));

const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;

describe('Complete Booking Flow E2E Tests', () => {
  let app: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.mockReset();
    
    const worker = require('../../src/worker/index');
    app = worker.app || worker.default;
  });

  describe('Happy Path: Complete booking workflow', () => {
    it('should complete full booking and payment flow', async () => {
      // Step 1: Search for properties
      mockEnv.DB.all.mockResolvedValueOnce({
        results: [{
          id: 1,
          title: 'Luxury Villa in Riyadh',
          location: 'Riyadh, Saudi Arabia',
          price_per_night: 300,
          max_guests: 6,
          bedrooms: 3,
          bathrooms: 2,
          is_featured: 1,
          is_active: 1,
          avg_rating: 4.8,
          review_count: 25
        }]
      });

      const searchResponse = await request(app)
        .get('/api/properties?location=Riyadh&guests=4')
        .expect(200);

      expect(searchResponse.body.success).toBe(true);
      expect(searchResponse.body.data).toHaveLength(1);
      const property = searchResponse.body.data[0];

      // Step 2: Get property details
      mockEnv.DB.first.mockResolvedValueOnce({
        id: 1,
        title: 'Luxury Villa in Riyadh',
        description: 'Beautiful villa with modern amenities',
        location: 'Riyadh, Saudi Arabia',
        price_per_night: 300,
        max_guests: 6,
        amenities: JSON.stringify(['wifi', 'parking', 'pool']),
        images: JSON.stringify(['villa1.jpg', 'villa2.jpg']),
        is_active: 1
      });

      mockEnv.DB.all.mockResolvedValueOnce({ results: [] }); // No reviews for simplicity

      const detailResponse = await request(app)
        .get('/api/properties/1')
        .expect(200);

      expect(detailResponse.body.success).toBe(true);
      expect(detailResponse.body.data.title).toBe('Luxury Villa in Riyadh');

      // Step 3: Create booking
      mockEnv.DB.first.mockResolvedValueOnce({
        id: 1,
        title: 'Luxury Villa in Riyadh',
        price_per_night: 300,
        max_guests: 6,
        is_active: 1
      });

      // Mock availability check (no conflicts)
      mockEnv.DB.all.mockResolvedValueOnce({ results: [] });

      // Mock booking creation
      mockEnv.DB.run.mockResolvedValueOnce({
        meta: { last_row_id: 'BOOK_123' }
      });

      const bookingData = {
        property_id: 1,
        check_in_date: '2024-03-15',
        check_out_date: '2024-03-18',
        guests: 4,
        guest_name: 'John Doe',
        guest_email: 'john@example.com',
        guest_phone: '+966501234567',
        special_requests: 'Late check-in please'
      };

      const bookingResponse = await request(app)
        .post('/api/bookings')
        .send(bookingData)
        .expect(200);

      expect(bookingResponse.body.success).toBe(true);
      expect(bookingResponse.body.data.booking_id).toBe('BOOK_123');
      expect(bookingResponse.body.data.next_step.action).toBe('payment_required');

      const bookingId = bookingResponse.body.data.booking_id;
      const totalAmount = bookingResponse.body.data.total_amount;

      // Step 4: Create payment
      mockEnv.DB.first.mockResolvedValueOnce({
        id: bookingId,
        guest_name: 'John Doe',
        guest_email: 'john@example.com',
        guest_phone: '+966501234567'
      });

      mockEnv.DB.run.mockResolvedValueOnce({
        meta: { last_row_id: 1 }
      });

      // Mock MyFatoorah payment creation
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          IsSuccess: true,
          Data: {
            InvoiceId: 12345,
            PaymentURL: 'https://demo.myfatoorah.com/payment/12345',
            InvoiceStatus: 'Pending'
          }
        })
      } as Response);

      const paymentData = {
        bookingId,
        amount: totalAmount,
        currency: 'SAR',
        provider: 'myfatoorah',
        description: `Booking for ${property.title}`
      };

      const paymentResponse = await request(app)
        .post('/api/payments/create')
        .send(paymentData)
        .expect(200);

      expect(paymentResponse.body.success).toBe(true);
      expect(paymentResponse.body.data.payment_url).toContain('myfatoorah.com');
      const paymentId = paymentResponse.body.data.payment_id;

      // Step 5: Simulate payment completion via webhook
      const webhookPayload = {
        EventType: 'Payment.Completed',
        Data: {
          InvoiceId: 12345,
          InvoiceStatus: 'Paid',
          CustomerReference: bookingId
        }
      };

      mockEnv.DB.get.mockResolvedValueOnce(null); // No duplicate webhook
      mockEnv.DB.run.mockResolvedValue({ success: true });

      const webhookResponse = await request(app)
        .post('/api/payments/webhook/myfatoorah')
        .send(webhookPayload)
        .set('X-MyFatoorah-Signature', 'valid-signature')
        .expect(200);

      expect(webhookResponse.body.success).toBe(true);

      // Step 6: Verify booking status updated
      mockEnv.DB.all.mockResolvedValueOnce({
        results: [{
          id: bookingId,
          property_title: 'Luxury Villa in Riyadh',
          check_in_date: '2024-03-15',
          check_out_date: '2024-03-18',
          status: 'confirmed',
          payment_status: 'completed',
          total_amount: totalAmount
        }]
      });

      const bookingsResponse = await request(app)
        .get('/api/bookings')
        .expect(200);

      expect(bookingsResponse.body.success).toBe(true);
      expect(bookingsResponse.body.data[0].status).toBe('confirmed');
      expect(bookingsResponse.body.data[0].payment_status).toBe('completed');

      // Step 7: Verify payment status
      mockEnv.DB.first
        .mockResolvedValueOnce({
          id: paymentId,
          booking_id: bookingId,
          provider: 'myfatoorah',
          provider_transaction_id: '12345'
        })
        .mockResolvedValueOnce({
          user_id: 'user_123'
        });

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          IsSuccess: true,
          Data: {
            InvoiceId: 12345,
            InvoiceStatus: 'Paid',
            InvoiceValue: totalAmount,
            DisplayCurrencyIso: 'SAR'
          }
        })
      } as Response);

      const paymentStatusResponse = await request(app)
        .get(`/api/payments/${paymentId}/status`)
        .expect(200);

      expect(paymentStatusResponse.body.success).toBe(true);
      expect(paymentStatusResponse.body.data.status).toBe('completed');
    });
  });

  describe('Error Scenarios', () => {
    it('should handle property unavailability gracefully', async () => {
      // Mock property exists but has conflict
      mockEnv.DB.first.mockResolvedValueOnce({
        id: 1,
        title: 'Test Property',
        max_guests: 6,
        is_active: 1
      });

      // Mock conflicting booking
      mockEnv.DB.all.mockResolvedValueOnce({
        results: [{
          check_in_date: '2024-03-14',
          check_out_date: '2024-03-17'
        }]
      });

      const bookingData = {
        property_id: 1,
        check_in_date: '2024-03-15',
        check_out_date: '2024-03-18',
        guests: 4,
        guest_name: 'John Doe',
        guest_email: 'john@example.com',
        guest_phone: '+966501234567'
      };

      const response = await request(app)
        .post('/api/bookings')
        .send(bookingData);

      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('not available');
      
      // Should suggest alternative dates
      expect(response.body.suggested_dates).toBeDefined();
      expect(response.body.suggested_dates.length).toBeGreaterThan(0);
    });

    it('should handle payment gateway failures', async () => {
      // Mock successful booking creation
      mockEnv.DB.first.mockResolvedValueOnce({
        id: 1,
        title: 'Test Property',
        max_guests: 6,
        is_active: 1
      });

      mockEnv.DB.all.mockResolvedValueOnce({ results: [] });
      mockEnv.DB.run.mockResolvedValueOnce({
        meta: { last_row_id: 'BOOK_456' }
      });

      const bookingResponse = await request(app)
        .post('/api/bookings')
        .send({
          property_id: 1,
          check_in_date: '2024-04-15',
          check_out_date: '2024-04-18',
          guests: 2,
          guest_name: 'Jane Doe',
          guest_email: 'jane@example.com',
          guest_phone: '+966501234567'
        })
        .expect(200);

      const bookingId = bookingResponse.body.data.booking_id;

      // Try to create payment but simulate gateway failure
      mockEnv.DB.first.mockResolvedValueOnce({
        id: bookingId,
        guest_name: 'Jane Doe',
        guest_email: 'jane@example.com',
        guest_phone: '+966501234567'
      });

      mockEnv.DB.run.mockResolvedValueOnce({
        meta: { last_row_id: 1 }
      });

      // Mock MyFatoorah API failure
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          IsSuccess: false,
          Message: 'Invalid payment details'
        })
      } as Response);

      const paymentResponse = await request(app)
        .post('/api/payments/create')
        .send({
          bookingId,
          amount: 600,
          currency: 'SAR',
          provider: 'myfatoorah',
          description: 'Test booking payment'
        });

      expect(paymentResponse.body.success).toBe(false);
      expect(paymentResponse.body.error).toBeDefined();
    });

    it('should handle booking cancellation workflow', async () => {
      // Mock user's booking
      mockEnv.DB.first.mockResolvedValueOnce({
        id: 'BOOK_789',
        user_id: 'user_123',
        status: 'confirmed',
        check_in_date: '2024-05-15', // Future date
        total_amount: 900
      });

      mockEnv.DB.run.mockResolvedValueOnce({ success: true });

      const cancelResponse = await request(app)
        .put('/api/bookings/BOOK_789/cancel')
        .send({ reason: 'Emergency cancellation' })
        .expect(200);

      expect(cancelResponse.body.success).toBe(true);
      expect(cancelResponse.body.message).toContain('cancelled');
    });
  });

  describe('AI Chat Integration in Booking Flow', () => {
    it('should provide booking assistance through AI chat', async () => {
      // Mock AI config
      mockEnv.DB.first.mockResolvedValueOnce({
        model_provider: 'openai',
        model_name: 'gpt-4o-mini',
        api_key: 'test-key',
        temperature: 0.7,
        max_tokens: 500,
        personality: 'friendly',
        language: 'en',
        content_moderation: false,
        is_active: true
      });

      // Mock chat completion
      const mockOpenAI = {
        chat: {
          completions: {
            create: jest.fn().mockResolvedValue({
              choices: [{
                message: {
                  content: 'I\'d be happy to help you find a property in Riyadh! Based on your requirements for 4 guests, I recommend our Luxury Villa which can accommodate up to 6 guests and costs 300 SAR per night.'
                }
              }],
              usage: { total_tokens: 85 }
            })
          }
        }
      };

      jest.doMock('openai', () => ({
        OpenAI: jest.fn(() => mockOpenAI)
      }));

      mockEnv.DB.run.mockResolvedValue({ success: true });

      // Mock featured properties for context
      mockEnv.DB.all.mockResolvedValueOnce({
        results: [{
          id: 1,
          title: 'Luxury Villa in Riyadh',
          location: 'Riyadh',
          price_per_night: 300,
          max_guests: 6,
          description: 'Beautiful villa with modern amenities'
        }]
      });

      const chatResponse = await request(app)
        .post('/api/chat/enhanced')
        .send({
          message: 'I need help finding a property in Riyadh for 4 guests',
          context: {
            user_preferences: { location: 'Riyadh', guests: 4 }
          }
        })
        .expect(200);

      expect(chatResponse.body.success).toBe(true);
      expect(chatResponse.body.data.message).toContain('Riyadh');
      expect(chatResponse.body.data.message).toContain('Luxury Villa');
      expect(chatResponse.body.data.tokens_used).toBe(85);
    });
  });
});