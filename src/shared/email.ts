import { z } from "zod";

// Email Template Schemas
export const EmailTemplateSchema = z.object({
  id: z.number(),
  template_key: z.string(),
  subject: z.string(),
  html_content: z.string(),
  variables: z.string().nullable(),
  is_active: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const CreateEmailTemplateSchema = z.object({
  template_key: z.string().min(1),
  subject: z.string().min(1),
  html_content: z.string().min(1),
  variables: z.array(z.string()).optional(),
});

export const SendEmailSchema = z.object({
  to: z.string().email(),
  template_key: z.string(),
  variables: z.record(z.any()).optional(),
  subject_override: z.string().optional(),
});

export const EmailLogSchema = z.object({
  id: z.number(),
  recipient_email: z.string(),
  template_key: z.string().nullable(),
  subject: z.string().nullable(),
  status: z.string(),
  error_message: z.string().nullable(),
  sent_at: z.string().nullable(),
  created_at: z.string(),
});

// Types
export type EmailTemplate = z.infer<typeof EmailTemplateSchema>;
export type CreateEmailTemplate = z.infer<typeof CreateEmailTemplateSchema>;
export type SendEmail = z.infer<typeof SendEmailSchema>;
export type EmailLog = z.infer<typeof EmailLogSchema>;

// Email template keys
export const EMAIL_TEMPLATES = {
  BOOKING_CONFIRMATION: 'booking_confirmation',
  BOOKING_CANCELLED: 'booking_cancelled',
  PAYMENT_SUCCESS: 'payment_success',
  PAYMENT_FAILED: 'payment_failed',
  PROPERTY_APPROVED: 'property_approved',
  PROPERTY_REJECTED: 'property_rejected',
  WELCOME: 'welcome',
  PASSWORD_RESET: 'password_reset',
  BOOKING_REMINDER: 'booking_reminder',
} as const;

// Email service interface
export interface EmailService {
  sendEmail(data: SendEmail): Promise<boolean>;
  sendBookingConfirmation(email: string, bookingData: any): Promise<boolean>;
  sendPaymentConfirmation(email: string, paymentData: any): Promise<boolean>;
  sendWelcomeEmail(email: string, userData: any): Promise<boolean>;
}

// Email template utilities
export function renderEmailTemplate(template: string, variables: Record<string, any>): string {
  let rendered = template;
  
  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
    rendered = rendered.replace(regex, String(value));
  }
  
  return rendered;
}

// Default email templates
export const DEFAULT_EMAIL_TEMPLATES: Array<Omit<EmailTemplate, 'id' | 'created_at' | 'updated_at'>> = [
  {
    template_key: EMAIL_TEMPLATES.BOOKING_CONFIRMATION,
    subject: 'Booking Confirmation - HabibiStay',
    html_content: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Booking Confirmation</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
            .container { max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px; }
            .header { text-align: center; margin-bottom: 30px; }
            .logo { color: #2957c3; font-size: 24px; font-weight: bold; }
            .content { line-height: 1.6; }
            .booking-details { background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .btn { display: inline-block; background-color: #2957c3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">HabibiStay</div>
              <h1>Booking Confirmation</h1>
            </div>
            <div class="content">
              <p>Dear {{ guest_name }},</p>
              <p>Thank you for your booking! We're excited to host you at {{ property_title }}.</p>
              
              <div class="booking-details">
                <h3>Booking Details</h3>
                <p><strong>Property:</strong> {{ property_title }}</p>
                <p><strong>Location:</strong> {{ property_location }}</p>
                <p><strong>Check-in:</strong> {{ check_in_date }}</p>
                <p><strong>Check-out:</strong> {{ check_out_date }}</p>
                <p><strong>Guests:</strong> {{ total_guests }}</p>
                <p><strong>Total Amount:</strong> {{ total_amount }} SAR</p>
                <p><strong>Booking Reference:</strong> {{ booking_id }}</p>
              </div>
              
              <p>We look forward to welcoming you to Riyadh!</p>
              
              <a href="{{ property_url }}" class="btn">View Property Details</a>
              
              <p>Best regards,<br>The HabibiStay Team</p>
            </div>
          </div>
        </body>
      </html>
    `,
    variables: '["guest_name", "property_title", "property_location", "check_in_date", "check_out_date", "total_guests", "total_amount", "booking_id", "property_url"]',
    is_active: true,
  },
  {
    template_key: EMAIL_TEMPLATES.PAYMENT_SUCCESS,
    subject: 'Payment Successful - HabibiStay',
    html_content: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Payment Successful</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
            .container { max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px; }
            .header { text-align: center; margin-bottom: 30px; }
            .logo { color: #2957c3; font-size: 24px; font-weight: bold; }
            .success { color: #28a745; text-align: center; font-size: 48px; margin: 20px 0; }
            .content { line-height: 1.6; }
            .payment-details { background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">HabibiStay</div>
              <div class="success">✓</div>
              <h1>Payment Successful</h1>
            </div>
            <div class="content">
              <p>Dear {{ guest_name }},</p>
              <p>Your payment has been successfully processed. Your booking is now confirmed!</p>
              
              <div class="payment-details">
                <h3>Payment Details</h3>
                <p><strong>Amount Paid:</strong> {{ amount }} SAR</p>
                <p><strong>Transaction ID:</strong> {{ transaction_id }}</p>
                <p><strong>Payment Method:</strong> {{ payment_method }}</p>
                <p><strong>Date:</strong> {{ payment_date }}</p>
              </div>
              
              <p>You will receive a separate email with your booking confirmation details.</p>
              
              <p>Thank you for choosing HabibiStay!</p>
              
              <p>Best regards,<br>The HabibiStay Team</p>
            </div>
          </div>
        </body>
      </html>
    `,
    variables: '["guest_name", "amount", "transaction_id", "payment_method", "payment_date"]',
    is_active: true,
  },
  {
    template_key: EMAIL_TEMPLATES.WELCOME,
    subject: 'Welcome to HabibiStay',
    html_content: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Welcome to HabibiStay</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
            .container { max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px; }
            .header { text-align: center; margin-bottom: 30px; }
            .logo { color: #2957c3; font-size: 24px; font-weight: bold; }
            .content { line-height: 1.6; }
            .btn { display: inline-block; background-color: #2957c3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .features { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 30px 0; }
            .feature { text-align: center; padding: 20px; background-color: #f8f9fa; border-radius: 8px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">HabibiStay</div>
              <h1>Welcome to HabibiStay!</h1>
            </div>
            <div class="content">
              <p>Dear {{ user_name }},</p>
              <p>Welcome to HabibiStay, your gateway to exceptional accommodations in Riyadh! We're thrilled to have you join our community.</p>
              
              <div class="features">
                <div class="feature">
                  <h3>🏠 Premium Properties</h3>
                  <p>Discover handpicked accommodations in the best locations</p>
                </div>
                <div class="feature">
                  <h3>🤖 AI Assistant Sara</h3>
                  <p>Get personalized help with bookings and recommendations</p>
                </div>
                <div class="feature">
                  <h3>💰 Earn Income</h3>
                  <p>List your property and start earning with us</p>
                </div>
                <div class="feature">
                  <h3>📱 Easy Booking</h3>
                  <p>Simple and secure booking process</p>
                </div>
              </div>
              
              <p>Ready to explore? Start by browsing our curated collection of properties or list your own to begin earning.</p>
              
              <a href="{{ dashboard_url }}" class="btn">Go to Dashboard</a>
              
              <p>If you have any questions, our AI assistant Sara is always here to help!</p>
              
              <p>Best regards,<br>The HabibiStay Team</p>
            </div>
          </div>
        </body>
      </html>
    `,
    variables: '["user_name", "dashboard_url"]',
    is_active: true,
  },
];
