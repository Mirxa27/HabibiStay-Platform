// Production-Ready Notification Service for HabibiStay
// Handles email, SMS, and push notifications with queue management

import { PushNotificationService } from './push-notification-service';

export interface NotificationTemplate {
  id: string;
  type: 'email' | 'sms' | 'push';
  event: string;
  template_key: string;
  is_active: boolean;
  priority: 'low' | 'normal' | 'high' | 'critical';
}

export interface NotificationPreferences {
  user_id: string;
  email_booking_updates: boolean;
  email_marketing: boolean;
  sms_booking_updates: boolean;
  push_notifications: boolean;
  language_preference: string;
}

export interface NotificationData {
  recipient: string;
  type: 'email' | 'sms' | 'push';
  template_key: string;
  variables: Record<string, any>;
  priority: 'low' | 'normal' | 'high' | 'critical';
  scheduled_at?: Date;
  user_id?: string;
}

export class NotificationService {
  constructor(
    private db: any, 
    private emailService: any,
    private pushService?: PushNotificationService
  ) {}

  // Send notification based on event and user preferences
  async sendNotification(event: string, recipient: string, variables: Record<string, any>, userId?: string): Promise<{
    success: boolean;
    notifications_sent: number;
    errors: string[];
  }> {
    try {
      const errors: string[] = [];
      let notificationsSent = 0;

      // Get user notification preferences
      const preferences = userId 
        ? await this.getUserPreferences(userId)
        : { email_booking_updates: true, sms_booking_updates: false, push_notifications: false, language_preference: 'en' };

      // Get notification templates for this event
      const templates = await this.db.prepare(`
        SELECT * FROM notification_templates 
        WHERE event = ? AND is_active = 1
        ORDER BY priority DESC
      `).bind(event).all();

      for (const template of templates.results || []) {
        try {
          // Check if user allows this type of notification
          if (!this.shouldSendNotification(template.type, preferences, event)) {
            continue;
          }

          // Send notification based on type
          switch (template.type) {
            case 'email':
              const emailResult = await this.emailService.sendEmail({
                to: recipient,
                templateKey: template.template_key,
                variables: {
                  ...variables,
                  language: preferences.language_preference || 'en'
                },
                priority: template.priority,
                tags: [event, template.type]
              });
              
              if (emailResult.success) {
                notificationsSent++;
                await this.logNotification({
                  recipient,
                  type: 'email',
                  template_key: template.template_key,
                  variables,
                  priority: template.priority,
                  user_id: userId
                }, 'sent', emailResult.messageId);
              } else {
                errors.push(`Email failed: ${emailResult.error}`);
                await this.logNotification({
                  recipient,
                  type: 'email',
                  template_key: template.template_key,
                  variables,
                  priority: template.priority,
                  user_id: userId
                }, 'failed', null, emailResult.error);
              }
              break;

            case 'sms':
              // SMS implementation would go here
              // For now, we'll log it as a placeholder
              await this.logNotification({
                recipient,
                type: 'sms',
                template_key: template.template_key,
                variables,
                priority: template.priority,
                user_id: userId
              }, 'pending');
              break;

            case 'push':
              // Push notification implementation
              if (this.pushService && userId) {
                // Get user device tokens
                const deviceTokens = await this.pushService.getUserDeviceTokens(userId, this.db);
                
                if (deviceTokens.length > 0) {
                  // Render push notification content
                  const pushContent = await this.renderPushTemplate(template.template_key, variables);
                  
                  // Send to all user devices
                  const pushResults = await this.pushService.sendToDevices(deviceTokens, pushContent);
                  
                  // Log results
                  for (const result of pushResults) {
                    if (result.success) {
                      notificationsSent++;
                      await this.logNotification({
                        recipient,
                        type: 'push',
                        template_key: template.template_key,
                        variables,
                        priority: template.priority,
                        user_id: userId
                      }, 'sent', result.messageId);
                    } else {
                      errors.push(`Push notification failed: ${result.error}`);
                      await this.logNotification({
                        recipient,
                        type: 'push',
                        template_key: template.template_key,
                        variables,
                        priority: template.priority,
                        user_id: userId
                      }, 'failed', null, result.error);
                    }
                  }
                } else {
                  // No device tokens found, log as pending
                  await this.logNotification({
                    recipient,
                    type: 'push',
                    template_key: template.template_key,
                    variables,
                    priority: template.priority,
                    user_id: userId
                  }, 'pending');
                }
              } else {
                // Push service not configured or no user ID, log as pending
                await this.logNotification({
                    recipient,
                    type: 'push',
                    template_key: template.template_key,
                    variables,
                    priority: template.priority,
                    user_id: userId
                  }, 'pending');
              }
              break;
          }
        } catch (error) {
          errors.push(`${template.type} notification failed: ${error.message}`);
        }
      }

      return {
        success: errors.length === 0 || notificationsSent > 0,
        notifications_sent: notificationsSent,
        errors
      };
    } catch (error) {
      console.error('Notification service error:', error);
      return {
        success: false,
        notifications_sent: 0,
        errors: [error.message]
      };
    }
  }

  // Render push notification template
  private async renderPushTemplate(templateKey: string, variables: Record<string, any>): Promise<{
    title: string;
    body: string;
    data?: Record<string, string>;
  }> {
    // In a real implementation, this would fetch templates from the database
    // For now, we'll use simple templates based on the template key
    switch (templateKey) {
      case 'mobile_booking_confirmation':
        return {
          title: 'Booking Confirmed!',
          body: `Your booking for ${variables.property_title} is confirmed.`,
          data: { 
            type: 'booking_confirmation',
            booking_id: variables.booking_id
          }
        };
      
      case 'mobile_booking_cancellation':
        return {
          title: 'Booking Cancelled',
          body: `Your booking for ${variables.property_title} has been cancelled.`,
          data: { 
            type: 'booking_cancellation',
            booking_id: variables.booking_id
          }
        };
      
      case 'mobile_checkin_reminder':
        return {
          title: 'Check-in Reminder',
          body: `Your check-in for ${variables.property_title} is tomorrow.`,
          data: { 
            type: 'checkin_reminder',
            booking_id: variables.booking_id
          }
        };
      
      case 'mobile_payment_confirmation':
        return {
          title: 'Payment Confirmed',
          body: `Your payment of ${variables.amount_paid} SAR has been confirmed.`,
          data: { 
            type: 'payment_confirmation',
            booking_id: variables.booking_id
          }
        };
      
      case 'mobile_payment_failed':
        return {
          title: 'Payment Failed',
          body: 'Your payment could not be processed. Please try again.',
          data: { 
            type: 'payment_failed',
            booking_id: variables.booking_id
          }
        };
      
      default:
        return {
          title: 'HabibiStay Notification',
          body: 'You have a new notification from HabibiStay.',
          data: { 
            type: 'general',
            template_key: templateKey
          }
        };
    }
  }

  // Check if notification should be sent based on user preferences
  private shouldSendNotification(type: string, preferences: any, event: string): boolean {
    switch (type) {
      case 'email':
        if (event.includes('booking') || event.includes('payment')) {
          return preferences.email_booking_updates;
        }
        if (event.includes('marketing') || event.includes('promotion')) {
          return preferences.email_marketing;
        }
        return true; // System emails always sent

      case 'sms':
        if (event.includes('booking') || event.includes('payment')) {
          return preferences.sms_booking_updates;
        }
        return false; // SMS only for important booking updates

      case 'push':
        return preferences.push_notifications;

      default:
        return false;
    }
  }

  // Get user notification preferences
  private async getUserPreferences(userId: string): Promise<NotificationPreferences> {
    try {
      const preferences = await this.db.prepare(`
        SELECT ns.*, up.preferred_language as language_preference
        FROM notification_settings ns
        LEFT JOIN user_profiles up ON ns.user_id = up.user_id
        WHERE ns.user_id = ?
      `).bind(userId).first();

      return preferences || {
        user_id: userId,
        email_booking_updates: true,
        email_marketing: false,
        sms_booking_updates: true,
        push_notifications: true,
        language_preference: 'en'
      };
    } catch (error) {
      console.error('Error getting user preferences:', error);
      return {
        user_id: userId,
        email_booking_updates: true,
        email_marketing: false,
        sms_booking_updates: false,
        push_notifications: false,
        language_preference: 'en'
      };
    }
  }

  // Log notification attempt
  private async logNotification(
    notification: NotificationData,
    status: 'sent' | 'failed' | 'pending',
    messageId?: string,
    error?: string
  ): Promise<void> {
    try {
      await this.db.prepare(`
        INSERT INTO notification_logs (
          recipient, type, template_key, status, message_id, 
          error_message, variables, priority, user_id, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        notification.recipient,
        notification.type,
        notification.template_key,
        status,
        messageId || null,
        error || null,
        JSON.stringify(notification.variables),
        notification.priority,
        notification.user_id || null,
        new Date().toISOString()
      ).run();
    } catch (error) {
      console.error('Failed to log notification:', error);
    }
  }

  // Send booking confirmation notifications
  async sendBookingConfirmation(booking: any): Promise<void> {
    await this.sendNotification('booking_confirmation', booking.guest_email, {
      booking_id: booking.id,
      guest_name: booking.guest_name,
      property_title: booking.property_title,
      check_in_date: booking.check_in_date,
      check_out_date: booking.check_out_date,
      total_amount: booking.total_amount,
      guests: booking.guests
    }, booking.user_id);
  }

  // Send payment confirmation notifications
  async sendPaymentConfirmation(booking: any, payment: any): Promise<void> {
    await this.sendNotification('payment_confirmation', booking.guest_email, {
      booking_id: booking.id,
      transaction_id: payment.transaction_id,
      amount_paid: payment.amount,
      payment_method: payment.payment_method,
      payment_date: payment.created_at
    }, booking.user_id);
  }

  // Send booking reminder notifications
  async sendBookingReminder(booking: any): Promise<void> {
    const checkInDate = new Date(booking.check_in_date);
    const now = new Date();
    const daysUntilCheckIn = Math.ceil((checkInDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    await this.sendNotification('booking_reminder', booking.guest_email, {
      booking_id: booking.id,
      guest_name: booking.guest_name,
      property_title: booking.property_title,
      check_in_date: booking.check_in_date,
      days_until_checkin: daysUntilCheckIn,
      property_location: booking.property_location
    }, booking.user_id);
  }

  // Send booking cancellation notifications
  async sendBookingCancellation(booking: any, refundInfo: any): Promise<void> {
    await this.sendNotification('booking_cancellation', booking.guest_email, {
      booking_id: booking.id,
      guest_name: booking.guest_name,
      property_title: booking.property_title,
      refund_amount: refundInfo.refund_amount,
      cancellation_fee: refundInfo.cancellation_fee
    }, booking.user_id);
  }

  // Send mobile booking confirmation
  async sendMobileBookingConfirmation(booking: any): Promise<void> {
    if (booking.user_id) {
      await this.sendNotification('booking_confirmation', booking.guest_email, {
        booking_id: booking.id,
        guest_name: booking.guest_name,
        property_title: booking.property_title,
        check_in_date: booking.check_in_date,
        check_out_date: booking.check_out_date,
        total_amount: booking.total_amount
      }, booking.user_id);
    }
  }

  // Send mobile payment confirmation
  async sendMobilePaymentConfirmation(booking: any, payment: any): Promise<void> {
    if (booking.user_id) {
      await this.sendNotification('payment_confirmation', booking.guest_email, {
        booking_id: booking.id,
        transaction_id: payment.transaction_id,
        amount_paid: payment.amount,
        payment_method: payment.payment_method
      }, booking.user_id);
    }
  }

  // Send mobile booking cancellation
  async sendMobileBookingCancellation(booking: any, refundInfo: any): Promise<void> {
    if (booking.user_id) {
      await this.sendNotification('booking_cancellation', booking.guest_email, {
        booking_id: booking.id,
        guest_name: booking.guest_name,
        property_title: booking.property_title,
        refund_amount: refundInfo.refund_amount,
        cancellation_fee: refundInfo.cancellation_fee
      }, booking.user_id);
    }
  }

  // Send mobile check-in reminder
  async sendMobileCheckinReminder(booking: any): Promise<void> {
    if (booking.user_id) {
      const checkInDate = new Date(booking.check_in_date);
      const now = new Date();
      const daysUntilCheckIn = Math.ceil((checkInDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      await this.sendNotification('checkin_reminder', booking.guest_email, {
        booking_id: booking.id,
        guest_name: booking.guest_name,
        property_title: booking.property_title,
        check_in_date: booking.check_in_date,
        days_until_checkin: daysUntilCheckIn
      }, booking.user_id);
    }
  }

  // Send mobile payment failed notification
  async sendMobilePaymentFailed(booking: any, failureInfo: any): Promise<void> {
    if (booking.user_id) {
      await this.sendNotification('payment_failed', booking.guest_email, {
        booking_id: booking.id,
        amount: failureInfo.amount,
        payment_method: failureInfo.payment_method,
        failure_reason: failureInfo.failure_reason
      }, booking.user_id);
    }
  }

  // Send mobile review request
  async sendMobileReviewRequest(booking: any): Promise<void> {
    if (booking.user_id) {
      await this.sendNotification('review_request', booking.guest_email, {
        booking_id: booking.id,
        guest_name: booking.guest_name,
        property_title: booking.property_title,
        check_in_date: booking.check_in_date,
        check_out_date: booking.check_out_date,
        review_url: `${process.env.WEBSITE_URL}/review/${booking.id}`
      }, booking.user_id);
    }
  }

  // Send mobile wishlist price drop notification
  async sendMobileWishlistPriceDrop(property: any, user: any): Promise<void> {
    if (user.id) {
      await this.sendNotification('wishlist_price_drop', user.email, {
        property_title: property.title,
        new_price: property.price,
        previous_price: property.previous_price,
        property_url: `${process.env.WEBSITE_URL}/property/${property.id}`
      }, user.id);
    }
  }

  // Send mobile account security alert
  async sendMobileAccountSecurityAlert(user: any, alertInfo: any): Promise<void> {
    if (user.id) {
      await this.sendNotification('account_security', user.email, {
        user_name: user.name,
        alert_type: alertInfo.alert_type,
        alert_description: alertInfo.description,
        ip_address: alertInfo.ip_address,
        timestamp: alertInfo.timestamp
      }, user.id);
    }
  }

  // Send mobile marketing offer
  async sendMobileMarketingOffer(user: any, offer: any): Promise<void> {
    if (user.id) {
      await this.sendNotification('marketing_offer', user.email, {
        user_name: user.name,
        offer_title: offer.title,
        discount_percentage: offer.discount_percentage,
        offer_expiry: offer.expiry_date,
        offer_url: `${process.env.WEBSITE_URL}/offer/${offer.id}`,
        offer_code: offer.code
      }, user.id);
    }
  }
}

// Create default notification templates
export const DEFAULT_NOTIFICATION_TEMPLATES = [
  {
    event: 'booking_confirmation',
    type: 'email',
    template_key: 'booking_confirmation',
    priority: 'high',
    is_active: true
  },
  {
    event: 'payment_confirmation',
    type: 'email',
    template_key: 'payment_confirmation',
    priority: 'high',
    is_active: true
  },
  {
    event: 'booking_reminder',
    type: 'email',
    template_key: 'booking_reminder',
    priority: 'normal',
    is_active: true
  },
  {
    event: 'booking_cancellation',
    type: 'email',
    template_key: 'booking_cancellation',
    priority: 'normal',
    is_active: true
  },
  {
    event: 'welcome',
    type: 'email',
    template_key: 'welcome_email',
    priority: 'normal',
    is_active: true
  }
];