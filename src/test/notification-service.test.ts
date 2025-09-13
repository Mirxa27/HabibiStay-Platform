// Test file for notification service
import { NotificationService } from '../shared/notification-service';
import { createEnhancedEmailService } from '../shared/enhanced-email-service';

// Mock database
const mockDb = {
  prepare: jest.fn().mockReturnThis(),
  bind: jest.fn().mockReturnThis(),
  all: jest.fn().mockResolvedValue({ results: [] }),
  first: jest.fn().mockResolvedValue(null),
  run: jest.fn().mockResolvedValue({ success: true })
};

// Mock email service
const mockEmailService = {
  sendEmail: jest.fn().mockResolvedValue({ success: true, messageId: 'test-message-id' })
};

describe('NotificationService', () => {
  let notificationService: NotificationService;

  beforeEach(() => {
    notificationService = new NotificationService(mockDb, mockEmailService);
    jest.clearAllMocks();
  });

  describe('sendNotification', () => {
    it('should send email notification successfully', async () => {
      // Mock notification templates
      mockDb.all.mockResolvedValueOnce({
        results: [
          {
            id: '1',
            type: 'email',
            event: 'test_event',
            template_key: 'welcome_email',
            is_active: true,
            priority: 'normal'
          }
        ]
      });

      // Mock user preferences
      mockDb.first.mockResolvedValueOnce({
        email_booking_updates: true,
        email_marketing: true,
        sms_booking_updates: false,
        push_notifications: false,
        language_preference: 'en'
      });

      const result = await notificationService.sendNotification(
        'test_event',
        'test@example.com',
        { user_name: 'Test User' },
        'user-123'
      );

      expect(result.success).toBe(true);
      expect(result.notifications_sent).toBe(1);
      expect(result.errors).toHaveLength(0);
      expect(mockEmailService.sendEmail).toHaveBeenCalledWith({
        to: 'test@example.com',
        templateKey: 'welcome_email',
        variables: {
          user_name: 'Test User',
          language: 'en'
        },
        priority: 'normal',
        tags: ['test_event', 'email']
      });
    });

    it('should handle notification failure gracefully', async () => {
      // Mock notification templates
      mockDb.all.mockResolvedValueOnce({
        results: [
          {
            id: '1',
            type: 'email',
            event: 'test_event',
            template_key: 'welcome_email',
            is_active: true,
            priority: 'normal'
          }
        ]
      });

      // Mock user preferences
      mockDb.first.mockResolvedValueOnce({
        email_booking_updates: true,
        email_marketing: true,
        sms_booking_updates: false,
        push_notifications: false,
        language_preference: 'en'
      });

      // Mock email service failure
      mockEmailService.sendEmail.mockResolvedValueOnce({
        success: false,
        error: 'Email service unavailable'
      });

      const result = await notificationService.sendNotification(
        'test_event',
        'test@example.com',
        { user_name: 'Test User' },
        'user-123'
      );

      expect(result.success).toBe(false);
      expect(result.notifications_sent).toBe(0);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toBe('Email failed: Email service unavailable');
    });
  });

  describe('sendBookingConfirmation', () => {
    it('should send booking confirmation notification', async () => {
      // Mock notification templates
      mockDb.all.mockResolvedValueOnce({
        results: [
          {
            id: '1',
            type: 'email',
            event: 'booking_confirmation',
            template_key: 'booking_confirmation',
            is_active: true,
            priority: 'high'
          }
        ]
      });

      // Mock user preferences
      mockDb.first.mockResolvedValueOnce({
        email_booking_updates: true,
        email_marketing: true,
        sms_booking_updates: false,
        push_notifications: false,
        language_preference: 'en'
      });

      const booking = {
        id: 'booking-123',
        guest_email: 'guest@example.com',
        guest_name: 'John Doe',
        property_title: 'Luxury Villa',
        check_in_date: '2023-06-01',
        check_out_date: '2023-06-05',
        total_amount: 1000,
        guests: 2,
        user_id: 'user-123'
      };

      await notificationService.sendBookingConfirmation(booking);

      expect(mockEmailService.sendEmail).toHaveBeenCalledWith({
        to: 'guest@example.com',
        templateKey: 'booking_confirmation',
        variables: {
          booking_id: 'booking-123',
          guest_name: 'John Doe',
          property_title: 'Luxury Villa',
          check_in_date: '2023-06-01',
          check_out_date: '2023-06-05',
          total_amount: 1000,
          guests: 2,
          language: 'en'
        },
        priority: 'high',
        tags: ['booking_confirmation', 'email']
      });
    });
  });
});