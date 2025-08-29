import { EMAIL_TEMPLATES } from './email-templates';
import { ADDITIONAL_EMAIL_TEMPLATES } from './additional-email-templates';

// Combine all email templates
const ALL_TEMPLATES = {
  ...EMAIL_TEMPLATES,
  ...ADDITIONAL_EMAIL_TEMPLATES
};

export interface EmailService {
  sendEmail: (to: string, templateKey: string, variables: Record<string, any>) => Promise<boolean>;
  queueEmail: (to: string, templateKey: string, variables: Record<string, any>, sendAt?: Date) => Promise<boolean>;
  sendBulkEmail: (recipients: string[], templateKey: string, variables: Record<string, any>) => Promise<boolean>;
}

export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  attachments?: Array<{
    filename: string;
    content: string | Buffer;
    encoding?: string;
  }>;
  scheduledAt?: Date;
  priority?: 'low' | 'normal' | 'high';
  tags?: string[];
}

export interface EmailLog {
  id: number;
  recipient: string;
  template_key: string;
  subject: string;
  status: 'pending' | 'sent' | 'failed' | 'bounced';
  sent_at?: string;
  failed_reason?: string;
  variables: string; // JSON stringified variables
  created_at: string;
}

export class HabibiStayEmailService implements EmailService {
  private apiKey: string;
  private fromEmail: string;
  private fromName: string;
  private db: any; // Database instance

  constructor(config: {
    apiKey: string;
    fromEmail: string;
    fromName: string;
    db: any;
  }) {
    this.apiKey = config.apiKey;
    this.fromEmail = config.fromEmail;
    this.fromName = config.fromName;
    this.db = config.db;
  }

  /**
   * Process template variables and replace placeholders
   */
  private processTemplate(template: string, variables: Record<string, any>): string {
    let processed = template;
    
    // Replace standard variables
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      processed = processed.replace(regex, String(value || ''));
    });
    
    // Handle conditional blocks (simple implementation)
    // {{#variable}}content{{/variable}}
    processed = processed.replace(/{{#(\w+)}}(.*?){{\/\1}}/gs, (match, key, content) => {
      return variables[key] ? content : '';
    });
    
    // Clean up any remaining unprocessed variables
    processed = processed.replace(/{{[^}]+}}/g, '');
    
    return processed;
  }

  /**
   * Get email template by key
   */
  private getTemplate(templateKey: string): EmailTemplate | null {
    const template = ALL_TEMPLATES[templateKey as keyof typeof ALL_TEMPLATES];
    return template || null;
  }

  /**
   * Log email to database
   */
  private async logEmail(
    recipient: string, 
    templateKey: string, 
    subject: string, 
    variables: Record<string, any>,
    status: string = 'pending'
  ): Promise<number> {
    const result = await this.db.prepare(`
      INSERT INTO email_logs (recipient, template_key, subject, status, variables, created_at)
      VALUES (?, ?, ?, ?, ?, datetime('now'))
    `).bind(
      recipient,
      templateKey,
      subject,
      status,
      JSON.stringify(variables)
    ).run();
    
    return result.meta.last_row_id;
  }

  /**
   * Update email log status
   */
  private async updateEmailLog(logId: number, status: string, failedReason?: string): Promise<void> {
    await this.db.prepare(`
      UPDATE email_logs 
      SET status = ?, failed_reason = ?, sent_at = datetime('now')
      WHERE id = ?
    `).bind(status, failedReason || null, logId).run();
  }

  /**
   * Send email using external service (Resend, SendGrid, etc.)
   */
  private async sendEmailToProvider(options: EmailOptions): Promise<boolean> {
    try {
      const emailProvider = this.env.EMAIL_PROVIDER || 'resend';
      
      switch (emailProvider) {
        case 'resend':
          return await this.sendWithResend(options);
        case 'sendgrid':
          return await this.sendWithSendGrid(options);
        case 'ses':
          return await this.sendWithSES(options);
        default:
          console.warn(`Unknown email provider: ${emailProvider}, falling back to console log`);
          return await this.mockEmailSend(options);
      }
    } catch (error) {
      console.error('Email sending failed:', error);
      return false;
    }
  }

  /**
   * Send email via Resend (recommended)
   */
  private async sendWithResend(options: EmailOptions): Promise<boolean> {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: options.from || this.env.FROM_EMAIL || 'noreply@habibistay.com',
          to: [options.to],
          subject: options.subject,
          html: options.html,
          text: options.text,
          reply_to: options.replyTo,
          tags: [
            { name: 'category', value: options.category || 'general' },
            { name: 'template', value: options.templateKey || 'custom' }
          ]
        })
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Resend API error: ${response.status} ${error}`);
      }

      const result = await response.json();
      console.log('Email sent via Resend:', { id: result.id, to: options.to });
      return true;
    } catch (error) {
      console.error('Resend email error:', error);
      return false;
    }
  }

  /**
   * Send email via SendGrid
   */
  private async sendWithSendGrid(options: EmailOptions): Promise<boolean> {
    try {
      const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.env.SENDGRID_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          personalizations: [{
            to: [{ email: options.to }],
            subject: options.subject
          }],
          from: {
            email: options.from || this.env.FROM_EMAIL || 'noreply@habibistay.com',
            name: 'HabibiStay'
          },
          content: [
            {
              type: 'text/html',
              value: options.html
            },
            {
              type: 'text/plain', 
              value: options.text
            }
          ].filter(Boolean),
          categories: [options.category || 'general'],
          custom_args: {
            template_key: options.templateKey || 'custom'
          }
        })
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`SendGrid API error: ${response.status} ${error}`);
      }

      console.log('Email sent via SendGrid:', { to: options.to });
      return true;
    } catch (error) {
      console.error('SendGrid email error:', error);
      return false;
    }
  }

  /**
   * Send email via Amazon SES
   */
  private async sendWithSES(options: EmailOptions): Promise<boolean> {
    try {
      // For AWS SES, you would typically use AWS SDK
      // This is a simplified version using the REST API
      const params = new URLSearchParams({
        'Action': 'SendEmail',
        'Source': options.from || this.env.FROM_EMAIL || 'noreply@habibistay.com',
        'Destination.ToAddresses.member.1': options.to,
        'Message.Subject.Data': options.subject,
        'Message.Body.Html.Data': options.html || '',
        'Message.Body.Text.Data': options.text || '',
        'Version': '2010-12-01'
      });

      // Note: This would need proper AWS signature authentication in production
      console.log('SES email would be sent with params:', params.toString());
      return true;
    } catch (error) {
      console.error('SES email error:', error);
      return false;
    }
  }

  /**
   * Mock email sending for development/testing
   */
  private async mockEmailSend(options: EmailOptions): Promise<boolean> {
    console.log('📧 [MOCK EMAIL]', {
      to: options.to,
      subject: options.subject,
      category: options.category,
      templateKey: options.templateKey,
      timestamp: new Date().toISOString()
    });
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 100));
    return true;
  }

  /**
   * Send email using template
   */
  async sendEmail(to: string, templateKey: string, variables: Record<string, any> = {}): Promise<boolean> {
    try {
      const template = this.getTemplate(templateKey);
      if (!template) {
        console.error(`Email template not found: ${templateKey}`);
        return false;
      }

      // Add default variables
      const defaultVariables = {
        site_name: 'HabibiStay',
        site_url: 'https://habibistay.com',
        support_email: 'support@habibistay.com',
        current_year: new Date().getFullYear().toString(),
        ...variables
      };

      const subject = this.processTemplate(template.subject, defaultVariables);
      const html = this.processTemplate(template.html, defaultVariables);
      const text = this.processTemplate(template.text, defaultVariables);

      // Log email attempt
      const logId = await this.logEmail(to, templateKey, subject, defaultVariables);

      // Send email
      const success = await this.sendEmailToProvider({
        to,
        subject,
        html,
        text,
        tags: [templateKey, 'habibistay']
      });

      // Update log
      await this.updateEmailLog(logId, success ? 'sent' : 'failed', success ? undefined : 'Provider error');

      return success;
    } catch (error) {
      console.error('Email sending error:', error);
      return false;
    }
  }

  /**
   * Queue email for later sending
   */
  async queueEmail(
    to: string, 
    templateKey: string, 
    variables: Record<string, any> = {}, 
    sendAt?: Date
  ): Promise<boolean> {
    try {
      // Store email in queue table for background processing
      await this.db.prepare(`
        INSERT INTO email_queue (recipient, template_key, variables, scheduled_at, status, created_at)
        VALUES (?, ?, ?, ?, 'queued', datetime('now'))
      `).bind(
        to,
        templateKey,
        JSON.stringify(variables),
        sendAt ? sendAt.toISOString() : null
      ).run();

      return true;
    } catch (error) {
      console.error('Email queueing error:', error);
      return false;
    }
  }

  /**
   * Send bulk emails (useful for newsletters)
   */
  async sendBulkEmail(
    recipients: string[], 
    templateKey: string, 
    variables: Record<string, any> = {}
  ): Promise<boolean> {
    try {
      const results = await Promise.allSettled(
        recipients.map(recipient => 
          this.sendEmail(recipient, templateKey, { 
            ...variables, 
            email: recipient 
          })
        )
      );

      const successCount = results.filter(result => 
        result.status === 'fulfilled' && result.value === true
      ).length;

      console.log(`Bulk email sent: ${successCount}/${recipients.length} successful`);
      
      return successCount > 0;
    } catch (error) {
      console.error('Bulk email error:', error);
      return false;
    }
  }

  /**
   * Process email queue (should be called by background job)
   */
  async processEmailQueue(): Promise<number> {
    try {
      const { results } = await this.db.prepare(`
        SELECT * FROM email_queue 
        WHERE status = 'queued' 
        AND (scheduled_at IS NULL OR scheduled_at <= datetime('now'))
        ORDER BY created_at ASC
        LIMIT 50
      `).all();

      let processedCount = 0;

      for (const queueItem of results) {
        try {
          const variables = JSON.parse(queueItem.variables);
          const success = await this.sendEmail(queueItem.recipient, queueItem.template_key, variables);
          
          // Update queue status
          await this.db.prepare(`
            UPDATE email_queue 
            SET status = ?, processed_at = datetime('now'), attempts = attempts + 1
            WHERE id = ?
          `).bind(success ? 'sent' : 'failed', queueItem.id).run();
          
          if (success) processedCount++;
        } catch (error) {
          console.error(`Failed to process queue item ${queueItem.id}:`, error);
        }
      }

      return processedCount;
    } catch (error) {
      console.error('Email queue processing error:', error);
      return 0;
    }
  }

  /**
   * Get email statistics
   */
  async getEmailStats(days: number = 30): Promise<{
    total_sent: number;
    total_failed: number;
    success_rate: number;
    by_template: Array<{ template: string; sent: number; failed: number }>;
  }> {
    try {
      const dateFilter = `date(created_at) >= date('now', '-${days} days')`;
      
      // Get total stats
      const totalStats = await this.db.prepare(`
        SELECT 
          COUNT(CASE WHEN status = 'sent' THEN 1 END) as total_sent,
          COUNT(CASE WHEN status = 'failed' THEN 1 END) as total_failed
        FROM email_logs 
        WHERE ${dateFilter}
      `).first();

      // Get stats by template
      const { results: templateStats } = await this.db.prepare(`
        SELECT 
          template_key as template,
          COUNT(CASE WHEN status = 'sent' THEN 1 END) as sent,
          COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed
        FROM email_logs 
        WHERE ${dateFilter}
        GROUP BY template_key
        ORDER BY sent DESC
      `).all();

      const total = totalStats.total_sent + totalStats.total_failed;
      const successRate = total > 0 ? (totalStats.total_sent / total) * 100 : 0;

      return {
        total_sent: totalStats.total_sent,
        total_failed: totalStats.total_failed,
        success_rate: Math.round(successRate * 100) / 100,
        by_template: templateStats
      };
    } catch (error) {
      console.error('Email stats error:', error);
      return {
        total_sent: 0,
        total_failed: 0,
        success_rate: 0,
        by_template: []
      };
    }
  }
}

// Export available template keys for type safety
export const AVAILABLE_TEMPLATES = Object.keys(ALL_TEMPLATES) as Array<keyof typeof ALL_TEMPLATES>;

// Export utility function to get template
export function getEmailTemplate(templateKey: string): EmailTemplate | null {
  return ALL_TEMPLATES[templateKey as keyof typeof ALL_TEMPLATES] || null;
}

// Export template processing utility
export function processEmailTemplate(template: string, variables: Record<string, any>): string {
  let processed = template;
  
  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    processed = processed.replace(regex, String(value || ''));
  });
  
  return processed.replace(/{{[^}]+}}/g, '');
}

export default HabibiStayEmailService;