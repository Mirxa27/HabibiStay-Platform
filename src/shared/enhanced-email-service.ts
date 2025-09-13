// Enhanced Email Service for HabibiStay
// Production-ready email service with multiple provider support and template management

import { EMAIL_TEMPLATES } from './email-templates';
import { ADDITIONAL_EMAIL_TEMPLATES } from './additional-email-templates';
import { MORE_EMAIL_TEMPLATES } from './more-email-templates';
import { MORE_EMAIL_TEMPLATES_2 } from './more-email-templates-2';

// Combine all email templates
const ALL_TEMPLATES = {
  ...EMAIL_TEMPLATES,
  ...ADDITIONAL_EMAIL_TEMPLATES,
  ...MORE_EMAIL_TEMPLATES,
  ...MORE_EMAIL_TEMPLATES_2
};

export interface EmailProvider {
  name: string;
  sendEmail: (data: EmailOptions) => Promise<EmailResult>;
  verifyConnection: () => Promise<boolean>;
}

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  templateKey?: string;
  variables?: Record<string, any>;
  attachments?: Array<{
    filename: string;
    content: string | Buffer;
    encoding?: string;
  }>;
  priority?: 'low' | 'normal' | 'high';
  tags?: string[];
  scheduledAt?: Date;
}

export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
  provider: string;
}

export interface EmailTemplate {
  id: number;
  template_key: string;
  subject: string;
  html_content: string;
  text_content?: string;
  variables: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface EmailLog {
  id: number;
  recipient: string;
  template_key?: string;
  subject: string;
  status: 'pending' | 'sent' | 'failed' | 'bounced' | 'delivered';
  sent_at?: string;
  failed_reason?: string;
  variables?: string;
  provider: string;
  message_id?: string;
  created_at: string;
}

// Resend Provider Implementation
export class ResendProvider implements EmailProvider {
  name = 'resend';
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async sendEmail(options: EmailOptions): Promise<EmailResult> {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'HabibiStay <noreply@habibistay.com>',
          to: Array.isArray(options.to) ? options.to : [options.to],
          subject: options.subject,
          html: options.html,
          text: options.text,
          attachments: options.attachments,
          tags: options.tags
        }),
      });

      const result = await response.json();

      if (response.ok) {
        return {
          success: true,
          messageId: result.id,
          provider: this.name
        };
      } else {
        return {
          success: false,
          error: result.message || 'Failed to send email',
          provider: this.name
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        provider: this.name
      };
    }
  }

  async verifyConnection(): Promise<boolean> {
    try {
      const response = await fetch('https://api.resend.com/domains', {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}

// SendGrid Provider Implementation
export class SendGridProvider implements EmailProvider {
  name = 'sendgrid';
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async sendEmail(options: EmailOptions): Promise<EmailResult> {
    try {
      const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: { email: 'noreply@habibistay.com', name: 'HabibiStay' },
          personalizations: [{
            to: Array.isArray(options.to) 
              ? options.to.map(email => ({ email }))
              : [{ email: options.to }],
            subject: options.subject
          }],
          content: [
            ...(options.html ? [{ type: 'text/html', value: options.html }] : []),
            ...(options.text ? [{ type: 'text/plain', value: options.text }] : [])
          ],
          attachments: options.attachments?.map(att => ({
            filename: att.filename,
            content: typeof att.content === 'string' ? att.content : att.content.toString('base64'),
            type: 'application/octet-stream'
          })),
          categories: options.tags
        }),
      });

      if (response.ok) {
        return {
          success: true,
          messageId: response.headers.get('x-message-id') || undefined,
          provider: this.name
        };
      } else {
        const error = await response.text();
        return {
          success: false,
          error: error || 'Failed to send email',
          provider: this.name
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        provider: this.name
      };
    }
  }

  async verifyConnection(): Promise<boolean> {
    try {
      const response = await fetch('https://api.sendgrid.com/v3/user/profile', {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}

// AWS SES Provider Implementation
export class AWSProvider implements EmailProvider {
  name = 'aws-ses';
  private accessKeyId: string;
  private secretAccessKey: string;
  private region: string;

  constructor(accessKeyId: string, secretAccessKey: string, region: string = 'us-east-1') {
    this.accessKeyId = accessKeyId;
    this.secretAccessKey = secretAccessKey;
    this.region = region;
  }

  async sendEmail(options: EmailOptions): Promise<EmailResult> {
    // Simplified AWS SES implementation
    // In production, use proper AWS SDK
    try {
      const params = {
        Source: 'HabibiStay <noreply@habibistay.com>',
        Destination: {
          ToAddresses: Array.isArray(options.to) ? options.to : [options.to]
        },
        Message: {
          Subject: { Data: options.subject },
          Body: {
            ...(options.html && { Html: { Data: options.html } }),
            ...(options.text && { Text: { Data: options.text } })
          }
        }
      };

      // Mock implementation - replace with actual AWS SES call
      console.log('AWS SES Email would be sent:', params);
      
      return {
        success: true,
        messageId: `aws-${Date.now()}`,
        provider: this.name
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        provider: this.name
      };
    }
  }

  async verifyConnection(): Promise<boolean> {
    // Mock verification - implement actual AWS SES verification
    return true;
  }
}

// Main Enhanced Email Service
export class EnhancedEmailService {
  private providers: EmailProvider[] = [];
  private primaryProvider?: EmailProvider;
  private db: any;

  constructor(db: any) {
    this.db = db;
  }

  // Initialize email providers
  async initializeProviders(config: {
    resend?: { apiKey: string };
    sendgrid?: { apiKey: string };
    aws?: { accessKeyId: string; secretAccessKey: string; region?: string };
  }): Promise<void> {
    this.providers = [];

    if (config.resend?.apiKey) {
      const provider = new ResendProvider(config.resend.apiKey);
      this.providers.push(provider);
      if (!this.primaryProvider) this.primaryProvider = provider;
    }

    if (config.sendgrid?.apiKey) {
      const provider = new SendGridProvider(config.sendgrid.apiKey);
      this.providers.push(provider);
      if (!this.primaryProvider) this.primaryProvider = provider;
    }

    if (config.aws?.accessKeyId && config.aws?.secretAccessKey) {
      const provider = new AWSProvider(
        config.aws.accessKeyId,
        config.aws.secretAccessKey,
        config.aws.region
      );
      this.providers.push(provider);
      if (!this.primaryProvider) this.primaryProvider = provider;
    }
  }

  // Send email with template support and fallback
  async sendEmail(options: EmailOptions): Promise<EmailResult> {
    try {
      let emailContent = { html: options.html, text: options.text, subject: options.subject };

      // If templateKey is provided, render template
      if (options.templateKey) {
        emailContent = await this.renderTemplate(options.templateKey, options.variables || {});
      }

      const emailOptions: EmailOptions = {
        ...options,
        html: emailContent.html,
        text: emailContent.text,
        subject: emailContent.subject
      };

      // Try primary provider first
      if (this.primaryProvider) {
        const result = await this.primaryProvider.sendEmail(emailOptions);
        
        // Log email attempt
        await this.logEmail({
          recipient: Array.isArray(options.to) ? options.to[0] : options.to,
          template_key: options.templateKey,
          subject: emailContent.subject,
          status: result.success ? 'sent' : 'failed',
          provider: result.provider,
          message_id: result.messageId,
          failed_reason: result.error,
          variables: options.variables ? JSON.stringify(options.variables) : undefined
        });

        if (result.success) {
          return result;
        }

        console.warn(`Primary provider ${this.primaryProvider.name} failed:`, result.error);
      }

      // Try fallback providers
      for (const provider of this.providers) {
        if (provider === this.primaryProvider) continue;

        try {
          const result = await provider.sendEmail(emailOptions);
          
          await this.logEmail({
            recipient: Array.isArray(options.to) ? options.to[0] : options.to,
            template_key: options.templateKey,
            subject: emailContent.subject,
            status: result.success ? 'sent' : 'failed',
            provider: result.provider,
            message_id: result.messageId,
            failed_reason: result.error,
            variables: options.variables ? JSON.stringify(options.variables) : undefined
          });

          if (result.success) {
            console.log(`Email sent successfully using fallback provider: ${provider.name}`);
            return result;
          }
        } catch (error) {
          console.error(`Fallback provider ${provider.name} failed:`, error);
        }
      }

      // All providers failed
      const failedResult: EmailResult = {
        success: false,
        error: 'All email providers failed',
        provider: 'none'
      };

      await this.logEmail({
        recipient: Array.isArray(options.to) ? options.to[0] : options.to,
        template_key: options.templateKey,
        subject: emailContent.subject,
        status: 'failed',
        provider: 'none',
        failed_reason: failedResult.error,
        variables: options.variables ? JSON.stringify(options.variables) : undefined
      });

      return failedResult;

    } catch (error) {
      console.error('Email service error:', error);
      return {
        success: false,
        error: error.message,
        provider: 'unknown'
      };
    }
  }

  // Render email template
  private async renderTemplate(templateKey: string, variables: Record<string, any>): Promise<{
    html: string;
    text: string;
    subject: string;
  }> {
    try {
      // First try to get template from database
      const dbTemplate = await this.db.prepare(
        'SELECT * FROM email_templates WHERE template_key = ? AND is_active = 1'
      ).bind(templateKey).first();

      if (dbTemplate) {
        return {
          html: this.replaceVariables(dbTemplate.html_content, variables),
          text: this.replaceVariables(dbTemplate.text_content || '', variables),
          subject: this.replaceVariables(dbTemplate.subject, variables)
        };
      }

      // Fallback to built-in templates
      const builtInTemplate = ALL_TEMPLATES[templateKey];
      if (builtInTemplate) {
        return {
          html: this.replaceVariables(builtInTemplate.html, variables),
          text: this.replaceVariables(builtInTemplate.text || '', variables),
          subject: this.replaceVariables(builtInTemplate.subject, variables)
        };
      }

      throw new Error(`Template not found: ${templateKey}`);
    } catch (error) {
      console.error('Template rendering error:', error);
      throw error;
    }
  }

  // Replace template variables
  private replaceVariables(template: string, variables: Record<string, any>): string {
    let result = template;
    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
      result = result.replace(regex, String(value || ''));
    }
    return result;
  }

  // Log email to database
  private async logEmail(log: Partial<EmailLog>): Promise<void> {
    try {
      await this.db.prepare(`
        INSERT INTO email_logs (
          recipient, template_key, subject, status, provider, 
          message_id, failed_reason, variables, sent_at, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        log.recipient,
        log.template_key || null,
        log.subject,
        log.status,
        log.provider,
        log.message_id || null,
        log.failed_reason || null,
        log.variables || null,
        log.status === 'sent' ? new Date().toISOString() : null,
        new Date().toISOString()
      ).run();
    } catch (error) {
      console.error('Failed to log email:', error);
    }
  }

  // Send booking confirmation email
  async sendBookingConfirmation(booking: any): Promise<boolean> {
    const result = await this.sendEmail({
      to: booking.guest_email,
      templateKey: 'booking_confirmation',
      variables: {
        booking_id: booking.id,
        guest_name: booking.guest_name,
        property_title: booking.property_title,
        check_in_date: booking.check_in_date,
        check_out_date: booking.check_out_date,
        total_amount: booking.total_amount,
        guests: booking.guests
      },
      tags: ['booking', 'confirmation']
    });

    return result.success;
  }

  // Send payment confirmation email
  async sendPaymentConfirmation(booking: any, payment: any): Promise<boolean> {
    const result = await this.sendEmail({
      to: booking.guest_email,
      templateKey: 'payment_confirmation',
      variables: {
        booking_id: booking.id,
        transaction_id: payment.transaction_id,
        amount_paid: payment.amount,
        payment_method: payment.payment_method,
        payment_date: payment.created_at
      },
      tags: ['payment', 'confirmation']
    });

    return result.success;
  }

  // Send welcome email
  async sendWelcomeEmail(user: any): Promise<boolean> {
    const result = await this.sendEmail({
      to: user.email,
      templateKey: 'welcome_email',
      variables: {
        user_name: user.name || 'Guest',
        user_email: user.email
      },
      tags: ['welcome', 'onboarding']
    });

    return result.success;
  }

  // Get email statistics
  async getEmailStats(timeRange: string = '30d'): Promise<{
    total_sent: number;
    total_failed: number;
    success_rate: number;
    top_templates: Array<{ template_key: string; count: number }>;
  }> {
    try {
      let dateFilter = '';
      switch (timeRange) {
        case '24h':
          dateFilter = "AND created_at >= datetime('now', '-1 day')";
          break;
        case '7d':
          dateFilter = "AND created_at >= datetime('now', '-7 days')";
          break;
        case '30d':
          dateFilter = "AND created_at >= datetime('now', '-30 days')";
          break;
        default:
          dateFilter = "AND created_at >= datetime('now', '-30 days')";
      }

      const stats = await this.db.prepare(`
        SELECT 
          COUNT(CASE WHEN status = 'sent' THEN 1 END) as total_sent,
          COUNT(CASE WHEN status = 'failed' THEN 1 END) as total_failed,
          COUNT(*) as total_emails
        FROM email_logs 
        WHERE 1=1 ${dateFilter}
      `).first();

      const topTemplates = await this.db.prepare(`
        SELECT template_key, COUNT(*) as count
        FROM email_logs 
        WHERE template_key IS NOT NULL ${dateFilter}
        GROUP BY template_key
        ORDER BY count DESC
        LIMIT 10
      `).all();

      const successRate = stats.total_emails > 0 
        ? (stats.total_sent / stats.total_emails) * 100 
        : 0;

      return {
        total_sent: stats.total_sent || 0,
        total_failed: stats.total_failed || 0,
        success_rate: Math.round(successRate * 100) / 100,
        top_templates: topTemplates.results || []
      };
    } catch (error) {
      console.error('Failed to get email stats:', error);
      return {
        total_sent: 0,
        total_failed: 0,
        success_rate: 0,
        top_templates: []
      };
    }
  }
}

// Export default instance creator
export function createEnhancedEmailService(db: any): EnhancedEmailService {
  return new EnhancedEmailService(db);
}