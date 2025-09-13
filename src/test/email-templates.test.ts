// Test file for email templates
import { EMAIL_TEMPLATES } from '../shared/email-templates';
import { ADDITIONAL_EMAIL_TEMPLATES } from '../shared/additional-email-templates';
import { MORE_EMAIL_TEMPLATES } from '../shared/more-email-templates';
import { MORE_EMAIL_TEMPLATES_2 } from '../shared/more-email-templates-2';

describe('Email Templates', () => {
  describe('Core Templates', () => {
    it('should have booking confirmation template', () => {
      expect(EMAIL_TEMPLATES.booking_confirmation).toBeDefined();
      expect(EMAIL_TEMPLATES.booking_confirmation.subject).toContain('Booking Confirmation');
      expect(EMAIL_TEMPLATES.booking_confirmation.html).toContain('Booking Confirmed');
      expect(EMAIL_TEMPLATES.booking_confirmation.text).toContain('Booking Confirmed');
    });

    it('should have payment confirmation template', () => {
      expect(EMAIL_TEMPLATES.payment_confirmation).toBeDefined();
      expect(EMAIL_TEMPLATES.payment_confirmation.subject).toContain('Payment Received');
      expect(EMAIL_TEMPLATES.payment_confirmation.html).toContain('Payment Confirmed');
      expect(EMAIL_TEMPLATES.payment_confirmation.text).toContain('Payment Confirmed');
    });

    it('should have welcome email template', () => {
      expect(EMAIL_TEMPLATES.welcome_email).toBeDefined();
      expect(EMAIL_TEMPLATES.welcome_email.subject).toContain('Welcome');
      expect(EMAIL_TEMPLATES.welcome_email.html).toContain('Welcome to HabibiStay');
      expect(EMAIL_TEMPLATES.welcome_email.text).toContain('Welcome to HabibiStay');
    });
  });

  describe('Additional Templates', () => {
    it('should have booking reminder template', () => {
      expect(ADDITIONAL_EMAIL_TEMPLATES.booking_reminder).toBeDefined();
      expect(ADDITIONAL_EMAIL_TEMPLATES.booking_reminder.subject).toContain('Check-in Reminder');
    });

    it('should have host new booking template', () => {
      expect(ADDITIONAL_EMAIL_TEMPLATES.host_new_booking).toBeDefined();
      expect(ADDITIONAL_EMAIL_TEMPLATES.host_new_booking.subject).toContain('New Booking Received');
    });

    it('should have newsletter welcome template', () => {
      expect(ADDITIONAL_EMAIL_TEMPLATES.newsletter_welcome).toBeDefined();
      expect(ADDITIONAL_EMAIL_TEMPLATES.newsletter_welcome.subject).toContain('Welcome to HabibiStay Newsletter');
    });

    it('should have password reset template', () => {
      expect(ADDITIONAL_EMAIL_TEMPLATES.password_reset).toBeDefined();
      expect(ADDITIONAL_EMAIL_TEMPLATES.password_reset.subject).toContain('Reset Your HabibiStay Password');
    });
  });

  describe('More Templates Set 1', () => {
    it('should have booking cancellation template', () => {
      expect(MORE_EMAIL_TEMPLATES.booking_cancellation).toBeDefined();
      expect(MORE_EMAIL_TEMPLATES.booking_cancellation.subject).toContain('Booking Cancellation');
    });

    it('should have booking cancellation host template', () => {
      expect(MORE_EMAIL_TEMPLATES.booking_cancellation_host).toBeDefined();
      expect(MORE_EMAIL_TEMPLATES.booking_cancellation_host.subject).toContain('Booking Cancelled');
    });

    it('should have check-in reminder template', () => {
      expect(MORE_EMAIL_TEMPLATES.checkin_reminder).toBeDefined();
      expect(MORE_EMAIL_TEMPLATES.checkin_reminder.subject).toContain('Check-in Reminder');
    });

    it('should have host booking request template', () => {
      expect(MORE_EMAIL_TEMPLATES.host_booking_request).toBeDefined();
      expect(MORE_EMAIL_TEMPLATES.host_booking_request.subject).toContain('New Booking Request');
    });

    it('should have payment failed template', () => {
      expect(MORE_EMAIL_TEMPLATES.payment_failed).toBeDefined();
      expect(MORE_EMAIL_TEMPLATES.payment_failed.subject).toContain('Payment Failed');
    });

    it('should have account verification template', () => {
      expect(MORE_EMAIL_TEMPLATES.account_verification).toBeDefined();
      expect(MORE_EMAIL_TEMPLATES.account_verification.subject).toContain('Verify Your HabibiStay Account');
    });
  });

  describe('More Templates Set 2', () => {
    it('should have password reset request template', () => {
      expect(MORE_EMAIL_TEMPLATES_2.password_reset_request).toBeDefined();
      expect(MORE_EMAIL_TEMPLATES_2.password_reset_request.subject).toContain('Reset Your HabibiStay Password');
    });

    it('should have password changed template', () => {
      expect(MORE_EMAIL_TEMPLATES_2.password_changed).toBeDefined();
      expect(MORE_EMAIL_TEMPLATES_2.password_changed.subject).toContain('Password Has Been Changed');
    });

    it('should have account deactivated template', () => {
      expect(MORE_EMAIL_TEMPLATES_2.account_deactivated).toBeDefined();
      expect(MORE_EMAIL_TEMPLATES_2.account_deactivated.subject).toContain('Account Has Been Deactivated');
    });

    it('should have review request template', () => {
      expect(MORE_EMAIL_TEMPLATES_2.review_request).toBeDefined();
      expect(MORE_EMAIL_TEMPLATES_2.review_request.subject).toContain('Share Your Experience');
    });

    it('should have special offer template', () => {
      expect(MORE_EMAIL_TEMPLATES_2.special_offer).toBeDefined();
      expect(MORE_EMAIL_TEMPLATES_2.special_offer.subject).toContain('Exclusive Offer Just for You');
    });
  });

  describe('Template Structure', () => {
    it('should have consistent structure for all templates', () => {
      const allTemplates = {
        ...EMAIL_TEMPLATES,
        ...ADDITIONAL_EMAIL_TEMPLATES,
        ...MORE_EMAIL_TEMPLATES,
        ...MORE_EMAIL_TEMPLATES_2
      };

      Object.keys(allTemplates).forEach(templateKey => {
        const template = allTemplates[templateKey];
        expect(template).toHaveProperty('subject');
        expect(template).toHaveProperty('html');
        expect(template).toHaveProperty('text');
        expect(typeof template.subject).toBe('string');
        expect(typeof template.html).toBe('string');
        expect(typeof template.text).toBe('string');
      });
    });
  });
});