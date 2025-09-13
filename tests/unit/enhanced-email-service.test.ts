/**
 * Unit tests for EnhancedEmailService
 */

import { EnhancedEmailService, ResendProvider, SendGridProvider } from '../../src/shared/enhanced-email-service';
import { vi } from 'vitest';

// Mock database
const mockDb = {
  prepare: vi.fn().mockReturnThis(),
  bind: vi.fn().mockReturnThis(),
  first: vi.fn(),
  run: vi.fn(),
  all: vi.fn()
};

// Mock fetch
const mockFetch = global.fetch as any;

describe('EnhancedEmailService', () => {
  let emailService: EnhancedEmailService;

  beforeEach(() => {
    emailService = new EnhancedEmailService(mockDb as any);
    vi.clearAllMocks();
  });

  describe('initializeProviders', () => {
    it('should initialize Resend provider', async () => {
      await emailService.initializeProviders({
        resend: { apiKey: 'test-resend-key' }
      });

      expect((emailService as any).providers).toHaveLength(1);
      expect((emailService as any).primaryProvider).toBeInstanceOf(ResendProvider);
    });

    it('should initialize multiple providers with fallback', async () => {
      await emailService.initializeProviders({
        resend: { apiKey: 'test-resend-key' },
        sendgrid: { apiKey: 'test-sendgrid-key' }
      });

      expect((emailService as any).providers).toHaveLength(2);
    });
  });

  describe('sendEmail', () => {
    beforeEach(async () => {
      await emailService.initializeProviders({
        resend: { apiKey: 'test-resend-key' }
      });
    });

    it('should send email successfully with primary provider', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 'msg_123' })
      } as Response);

      mockDb.run.mockResolvedValue({ success: true });

      const result = await emailService.sendEmail({
        to: 'test@example.com',
        subject: 'Test Subject',
        html: '<p>Test content</p>',
        tags: ['test']
      });

      expect(result.success).toBe(true);
      expect(result.messageId).toBe('msg_123');
      expect(result.provider).toBe('resend');
    });

    it('should use template rendering when templateKey provided', async () => {
      // Mock template from database
      mockDb.first.mockResolvedValueOnce({
        template_key: 'welcome_email',
        subject: 'Welcome {{user_name}}!',
        html_content: '<h1>Welcome {{user_name}}!</h1>',
        text_content: 'Welcome {{user_name}}!',
        is_active: 1
      });

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 'msg_124' })
      } as Response);

      mockDb.run.mockResolvedValue({ success: true });

      const result = await emailService.sendEmail({
        to: 'john@example.com',
        templateKey: 'welcome_email',
        variables: { user_name: 'John Doe' }
      });

      expect(result.success).toBe(true);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.resend.com/emails',
        expect.objectContaining({
          body: expect.stringContaining('Welcome John Doe!')
        })
      );
    });

    it('should fallback to secondary provider on primary failure', async () => {
      // Initialize with multiple providers
      await emailService.initializeProviders({
        resend: { apiKey: 'test-resend-key' },
        sendgrid: { apiKey: 'test-sendgrid-key' }
      });

      // Mock primary provider failure
      mockFetch
        .mockResolvedValueOnce({
          ok: false,
          json: async () => ({ message: 'Rate limit exceeded' })
        } as Response)
        // Mock secondary provider success
        .mockResolvedValueOnce({
          ok: true,
          headers: new Map([['x-message-id', 'sg_123']])
        } as Response);

      mockDb.run.mockResolvedValue({ success: true });

      const result = await emailService.sendEmail({
        to: 'test@example.com',
        subject: 'Test Subject',
        html: '<p>Test content</p>'
      });

      expect(result.success).toBe(true);
      expect(result.provider).toBe('sendgrid');
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    it('should fail when all providers fail', async () => {
      // Mock provider failure
      mockFetch.mockResolvedValue({
        ok: false,
        json: async () => ({ message: 'Service unavailable' })
      } as Response);

      mockDb.run.mockResolvedValue({ success: true });

      const result = await emailService.sendEmail({
        to: 'test@example.com',
        subject: 'Test Subject',
        html: '<p>Test content</p>'
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('All email providers failed');
    });
  });

  describe('sendBookingConfirmation', () => {
    beforeEach(async () => {
      await emailService.initializeProviders({
        resend: { apiKey: 'test-resend-key' }
      });
    });

    it('should send booking confirmation email', async () => {
      const mockBooking = {
        id: 'BOOK_123',
        guest_email: 'guest@example.com',
        guest_name: 'John Doe',
        property_title: 'Luxury Villa in Riyadh',
        check_in_date: '2024-03-15',
        check_out_date: '2024-03-18',
        total_amount: 1500,
        guests: 4
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 'conf_123' })
      } as Response);

      mockDb.run.mockResolvedValue({ success: true });

      const result = await emailService.sendBookingConfirmation(mockBooking);

      expect(result).toBe(true);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.resend.com/emails',
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('guest@example.com')
        })
      );
    });
  });

  describe('getEmailStats', () => {
    it('should return email statistics', async () => {
      mockDb.first.mockResolvedValueOnce({
        total_sent: 150,