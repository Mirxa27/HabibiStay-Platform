/**
 * Unit tests for PaymentService
 */

import { PaymentService } from '../../src/server/services/PaymentService';

// Mock database
const mockDb = {
  run: jest.fn(),
  get: jest.fn(),
  prepare: jest.fn().mockReturnThis(),
  bind: jest.fn().mockReturnThis(),
  first: jest.fn(),
  all: jest.fn()
};

// Mock fetch
const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;

describe('PaymentService', () => {
  let paymentService: PaymentService;

  beforeEach(() => {
    paymentService = new PaymentService(mockDb as any);
    jest.clearAllMocks();
  });

  describe('getPaymentProviders', () => {
    it('should return available payment providers', async () => {
      const providers = await paymentService.getPaymentProviders();
      
      expect(providers).toHaveLength(2);
      expect(providers[0].id).toBe('myfatoorah');
      expect(providers[1].id).toBe('paypal');
    });

    it('should indicate provider availability based on configuration', async () => {
      const providers = await paymentService.getPaymentProviders();
      
      // Should be active when API keys are present (mocked in setup)
      expect(providers[0].isActive).toBe(true);
      expect(providers[1].isActive).toBe(true);
    });
  });

  describe('createPayment', () => {
    const mockPaymentRequest = {
      bookingId: 'BOOK_123',
      amount: 500,
      currency: 'SAR',
      description: 'Test booking payment',
      customerInfo: {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+966501234567'
      }
    };

    it('should create MyFatoorah payment successfully', async () => {
      // Mock database operations
      mockDb.run.mockResolvedValue({ meta: { last_row_id: 1 } });
      
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

      const result = await paymentService.createPayment(mockPaymentRequest, 'myfatoorah');

      expect(result.success).toBe(true);
      expect(result.paymentUrl).toBeDefined();
      expect(result.transactionId).toBe('12345');
      expect(result.provider).toBe('myfatoorah');
    });

    it('should handle MyFatoorah API errors', async () => {
      mockDb.run.mockResolvedValue({ meta: { last_row_id: 1 } });
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          IsSuccess: false,
          Message: 'Invalid payment request'
        })
      } as Response);

      const result = await paymentService.createPayment(mockPaymentRequest, 'myfatoorah');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid payment request');
    });

    it('should validate payment request before processing', async () => {
      const invalidRequest = {
        ...mockPaymentRequest,
        amount: 0 // Invalid amount
      };

      await expect(paymentService.createPayment(invalidRequest, 'myfatoorah'))
        .rejects.toThrow('Valid payment amount is required');
    });
  });

  describe('verifyPayment', () => {
    it('should verify MyFatoorah payment status', async () => {
      // Mock payment record
      mockDb.first.mockResolvedValue({
        id: 'PAY_123',
        provider_transaction_id: '12345',
        provider: 'myfatoorah'
      });

      // Mock MyFatoorah status API
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          IsSuccess: true,
          Data: {
            InvoiceId: 12345,
            InvoiceStatus: 'Paid',
            InvoiceValue: 500,
            DisplayCurrencyIso: 'SAR'
          }
        })
      } as Response);

      const result = await paymentService.verifyPayment('PAY_123', 'myfatoorah');

      expect(result.success).toBe(true);
      expect(result.status).toBe('completed');
      expect(result.amount).toBe(500);
    });
  });

  describe('processRefund', () => {
    it('should process MyFatoorah refund successfully', async () => {
      // Mock payment record
      mockDb.get.mockResolvedValue({
        id: 'PAY_123',
        provider_transaction_id: '12345',
        provider: 'myfatoorah',
        amount: 500
      });

      // Mock MyFatoorah refund API
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          IsSuccess: true,
          Data: {
            RefundId: 67890,
            Amount: 250
          }
        })
      } as Response);

      const result = await paymentService.processRefund('PAY_123', 250, 'Customer request');

      expect(result.success).toBe(true);
      expect(result.refundId).toBe('67890');
      expect(result.amount).toBe(250);
    });

    it('should not allow refund amount greater than payment amount', async () => {
      mockDb.get.mockResolvedValue({
        id: 'PAY_123',
        amount: 500
      });

      await expect(paymentService.processRefund('PAY_123', 600, 'Test'))
        .rejects.toThrow('Refund amount cannot exceed payment amount');
    });
  });

  describe('handleWebhook', () => {
    it('should handle MyFatoorah webhook successfully', async () => {
      const webhookPayload = {
        provider: 'myfatoorah',
        event: 'Payment.Completed',
        data: { invoiceId: '12345' },
        signature: 'valid-signature',
        timestamp: new Date().toISOString()
      };

      // Mock idempotency check
      mockDb.get.mockResolvedValue(null);
      
      // Mock webhook processing
      mockDb.run.mockResolvedValue({ success: true });

      await expect(paymentService.handleWebhook(webhookPayload))
        .resolves.not.toThrow();
    });

    it('should ignore duplicate webhooks', async () => {
      const webhookPayload = {
        provider: 'myfatoorah',
        event: 'Payment.Completed',
        data: { invoiceId: '12345' },
        signature: 'valid-signature',
        timestamp: new Date().toISOString()
      };

      // Mock existing webhook log
      mockDb.get.mockResolvedValue({ id: 1 });

      await expect(paymentService.handleWebhook(webhookPayload))
        .resolves.not.toThrow();
      
      // Should not process duplicate
      expect(mockDb.run).not.toHaveBeenCalled();
    });
  });
});