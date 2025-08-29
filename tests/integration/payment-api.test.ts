/**
 * Integration tests for payment endpoints
 */

import request from 'supertest';

// Mock environment
const mockEnv = {
  DB: {
    prepare: jest.fn().mockReturnThis(),
    bind: jest.fn().mockReturnThis(),
    first: jest.fn(),
    all: jest.fn(),
    run: jest.fn()
  },
  MYFATOORAH_API_KEY: 'test-myfatoorah-key',
  PAYPAL_CLIENT_ID: 'test-paypal-client',
  PAYPAL_CLIENT_SECRET: 'test-paypal-secret'
};

// Mock authentication middleware
jest.mock('@getmocha/users-service/hono', () => ({
  authMiddleware: (c: any, next: any) => {
    c.set('user', { id: 'test-user-123', email: 'test@example.com' });
    return next();
  }
}));

// Mock fetch for external API calls
const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;

describe('Payment API Integration Tests', () => {
  let app: any;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset fetch mock
    mockFetch.mockReset();
    
    const worker = require('../../src/worker/index');
    app = worker.app || worker.default;
  });

  describe('GET /api/payments/providers', () => {
    it('should return available payment providers', async () => {
      const response = await request(app)
        .get('/api/payments/providers')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.data[0].id).toBe('myfatoorah');
      expect(response.body.data[1].id).toBe('paypal');
    });
  });

  describe('GET /api/payments/methods/:provider', () => {
    it('should return MyFatoorah payment methods', async () => {
      // Mock MyFatoorah API response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          IsSuccess: true,
          Data: {
            PaymentMethods: [
              {
                PaymentMethodId: 1,
                PaymentMethodCode: 'VISA',
                PaymentMethodEn: 'Visa',
                ImageUrl: 'https://example.com/visa.png',
                IsDirectPayment: true
              }
            ]
          }
        })
      } as Response);

      const response = await request(app)
        .get('/api/payments/methods/myfatoorah?currency=SAR')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].name).toBe('Visa');
    });

    it('should return PayPal payment methods', async () => {
      const response = await request(app)
        .get('/api/payments/methods/paypal')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.data[0].provider).toBe('paypal');
    });
  });

  describe('POST /api/payments/create', () => {
    const validPaymentData = {
      bookingId: 'BOOK_123',
      amount: 500,
      currency: 'SAR',
      provider: 'myfatoorah',
      description: 'Booking payment for Test Property'
    };

    it('should create MyFatoorah payment successfully', async () => {
      // Mock booking exists
      mockEnv.DB.first.mockResolvedValueOnce({
        id: 'BOOK_123',
        guest_name: 'John Doe',
        guest_email: 'john@example.com',
        guest_phone: '+966501234567'
      });

      // Mock payment creation in database
      mockEnv.DB.run.mockResolvedValueOnce({
        meta: { last_row_id: 1 }
      });

      // Mock MyFatoorah API response
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

      const response = await request(app)
        .post('/api/payments/create')
        .send(validPaymentData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.payment_url).toContain('myfatoorah.com');
      expect(response.body.data.transaction_id).toBe('12345');
    });

    it('should create PayPal payment successfully', async () => {
      mockEnv.DB.first.mockResolvedValueOnce({
        id: 'BOOK_123',
        guest_name: 'John Doe',
        guest_email: 'john@example.com',
        guest_phone: '+966501234567'
      });

      mockEnv.DB.run.mockResolvedValueOnce({
        meta: { last_row_id: 1 }
      });

      // Mock PayPal access token
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ access_token: 'test-token' })
        } as Response)\n        .mockResolvedValueOnce({\n          ok: true,\n          status: 201,\n          json: async () => ({\n            id: 'PAYPAL_ORDER_123',\n            status: 'CREATED',\n            links: [{\n              rel: 'approve',\n              href: 'https://sandbox.paypal.com/approve/PAYPAL_ORDER_123'\n            }]\n          })\n        } as Response);\n\n      const response = await request(app)\n        .post('/api/payments/create')\n        .send({ ...validPaymentData, provider: 'paypal' })\n        .expect(200);\n\n      expect(response.body.success).toBe(true);\n      expect(response.body.data.payment_url).toContain('paypal.com');\n    });\n\n    it('should reject payment for non-existent booking', async () => {\n      mockEnv.DB.first.mockResolvedValueOnce(null);\n\n      const response = await request(app)\n        .post('/api/payments/create')\n        .send(validPaymentData)\n        .expect(404);\n\n      expect(response.body.success).toBe(false);\n      expect(response.body.error).toContain('Booking not found');\n    });\n\n    it('should validate required payment fields', async () => {\n      const invalidData = { ...validPaymentData };\n      delete invalidData.amount;\n\n      const response = await request(app)\n        .post('/api/payments/create')\n        .send(invalidData)\n        .expect(400);\n\n      expect(response.body.success).toBe(false);\n      expect(response.body.error).toContain('required');\n    });\n  });\n\n  describe('GET /api/payments/:paymentId/status', () => {\n    it('should return payment status for authorized user', async () => {\n      // Mock payment record\n      mockEnv.DB.first\n        .mockResolvedValueOnce({\n          id: 'PAY_123',\n          booking_id: 'BOOK_123',\n          provider: 'myfatoorah',\n          provider_transaction_id: '12345'\n        })\n        .mockResolvedValueOnce({\n          user_id: 'test-user-123'\n        });\n\n      // Mock MyFatoorah status API\n      mockFetch.mockResolvedValueOnce({\n        ok: true,\n        json: async () => ({\n          IsSuccess: true,\n          Data: {\n            InvoiceId: 12345,\n            InvoiceStatus: 'Paid',\n            InvoiceValue: 500,\n            DisplayCurrencyIso: 'SAR'\n          }\n        })\n      } as Response);\n\n      const response = await request(app)\n        .get('/api/payments/PAY_123/status')\n        .expect(200);\n\n      expect(response.body.success).toBe(true);\n      expect(response.body.data.status).toBe('completed');\n      expect(response.body.data.amount).toBe(500);\n    });\n\n    it('should deny access to other users payments', async () => {\n      mockEnv.DB.first\n        .mockResolvedValueOnce({\n          id: 'PAY_123',\n          booking_id: 'BOOK_123',\n          provider: 'myfatoorah'\n        })\n        .mockResolvedValueOnce({\n          user_id: 'different-user'\n        });\n\n      const response = await request(app)\n        .get('/api/payments/PAY_123/status')\n        .expect(403);\n\n      expect(response.body.success).toBe(false);\n      expect(response.body.error).toContain('Access denied');\n    });\n  });\n\n  describe('POST /api/payments/webhook/myfatoorah', () => {\n    it('should process MyFatoorah webhook successfully', async () => {\n      const webhookPayload = {\n        EventType: 'Payment.Completed',\n        Data: {\n          InvoiceId: 12345,\n          InvoiceStatus: 'Paid'\n        }\n      };\n\n      // Mock webhook processing\n      mockEnv.DB.get.mockResolvedValueOnce(null); // No duplicate\n      mockEnv.DB.run.mockResolvedValue({ success: true });\n\n      const response = await request(app)\n        .post('/api/payments/webhook/myfatoorah')\n        .send(webhookPayload)\n        .set('X-MyFatoorah-Signature', 'valid-signature')\n        .expect(200);\n\n      expect(response.body.success).toBe(true);\n      expect(response.body.message).toContain('processed successfully');\n    });\n\n    it('should reject invalid webhook signatures', async () => {\n      const webhookPayload = {\n        EventType: 'Payment.Completed',\n        Data: { InvoiceId: 12345 }\n      };\n\n      const response = await request(app)\n        .post('/api/payments/webhook/myfatoorah')\n        .send(webhookPayload)\n        .set('X-MyFatoorah-Signature', 'invalid-signature')\n        .expect(400);\n\n      expect(response.body.success).toBe(false);\n    });\n  });\n\n  describe('GET /api/payments/callback/myfatoorah', () => {\n    it('should handle successful payment callback', async () => {\n      // Mock payment record\n      mockEnv.DB.first\n        .mockResolvedValueOnce({\n          id: 'PAY_123',\n          booking_id: 'BOOK_123',\n          provider_transaction_id: '12345'\n        })\n        .mockResolvedValueOnce({\n          id: 'BOOK_123',\n          guest_email: 'john@example.com'\n        });\n\n      // Mock payment verification\n      mockFetch.mockResolvedValueOnce({\n        ok: true,\n        json: async () => ({\n          IsSuccess: true,\n          Data: {\n            InvoiceId: 12345,\n            InvoiceStatus: 'Paid',\n            InvoiceValue: 500\n          }\n        })\n      } as Response);\n\n      mockEnv.DB.run.mockResolvedValue({ success: true });\n\n      const response = await request(app)\n        .get('/api/payments/callback/myfatoorah?paymentId=PAY_123')\n        .expect(302); // Redirect\n\n      expect(response.headers.location).toContain('/payment/success');\n    });\n\n    it('should handle failed payment callback', async () => {\n      mockEnv.DB.first.mockResolvedValueOnce({\n        id: 'PAY_123',\n        booking_id: 'BOOK_123',\n        provider_transaction_id: '12345'\n      });\n\n      // Mock payment verification failure\n      mockFetch.mockResolvedValueOnce({\n        ok: true,\n        json: async () => ({\n          IsSuccess: true,\n          Data: {\n            InvoiceId: 12345,\n            InvoiceStatus: 'Failed'\n          }\n        })\n      } as Response);\n\n      const response = await request(app)\n        .get('/api/payments/callback/myfatoorah?paymentId=PAY_123')\n        .expect(302);\n\n      expect(response.headers.location).toContain('/payment/error');\n    });\n  });\n});