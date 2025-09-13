// Additional email templates for HabibiStay platform (Part 2)
// These templates cover the remaining notification types specified in the design document

export const MORE_EMAIL_TEMPLATES_2 = {
  // Password reset request email
  password_reset_request: {
    subject: 'Reset Your HabibiStay Password',
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset - HabibiStay</title>
        <style>
          body { margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; background: white; }
          .header { background: #dc3545; padding: 40px 20px; text-align: center; color: white; }
          .content { padding: 40px 20px; }
          .reset-section { background: #f8d7da; border: 1px solid #f5c6cb; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center; }
          .reset-button { display: inline-block; background: #dc3545; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 15px 0; }
          .security-note { background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 15px; margin: 20px 0; font-size: 14px; }
          .footer { background: #f8f9fa; padding: 30px 20px; text-align: center; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 Password Reset</h1>
            <p>Secure your HabibiStay account</p>
          </div>
          
          <div class="content">
            <h2>Hello {{user_name}},</h2>
            
            <p>We received a request to reset the password for your HabibiStay account. If you made this request, click the button below to reset your password:</p>
            
            <div class="reset-section">
              <h3>Reset Your Password</h3>
              <a href="{{reset_url}}" class="reset-button">Reset Password</a>
              <p>This link will expire in 24 hours for security reasons.</p>
            </div>
            
            <div class="security-note">
              <h4>🛡️ Security Notice</h4>
              <ul>
                <li>This link is valid for 24 hours only</li>
                <li>If you didn't request this reset, please ignore this email</li>
                <li>Never share this link with anyone</li>
                <li>Contact support if you have concerns</li>
              </ul>
            </div>
            
            <p>If you didn't request a password reset, please ignore this email. Your password will remain unchanged, and your account is secure.</p>
            
            <p>If you're having trouble with the button, copy and paste this link into your browser:</p>
            <p><a href="{{reset_url}}">{{reset_url}}</a></p>
            
            <p>Best regards,<br><strong>The HabibiStay Security Team</strong></p>
          </div>
          
          <div class="footer">
            <p>HabibiStay - Premium Short-Term Rentals</p>
            <p>📧 support@habibistay.com | 📱 +966 XX XXX XXXX</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      🔐 Password Reset - HabibiStay
      
      Hello {{user_name}},
      
      We received a request to reset your HabibiStay account password.
      
      Reset your password: {{reset_url}}
      
      This link expires in 24 hours for security.
      
      Security Notice:
      - Link valid for 24 hours only
      - If you didn't request this, ignore this email
      - Never share this link
      - Contact support if you have concerns
      
      If you didn't request this reset, your account remains secure.
      
      Best regards,
      The HabibiStay Security Team
    `
  },

  // Password changed email
  password_changed: {
    subject: 'Your HabibiStay Password Has Been Changed',
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Changed - HabibiStay</title>
        <style>
          body { margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; background: white; }
          .header { background: #28a745; padding: 40px 20px; text-align: center; color: white; }
          .content { padding: 40px 20px; }
          .security-card { background: #d4edda; border: 2px solid #c3e6cb; border-radius: 12px; padding: 30px; margin: 20px 0; }
          .security-note { background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 15px; margin: 20px 0; font-size: 14px; }
          .footer { background: #f8f9fa; padding: 30px 20px; text-align: center; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Password Changed Successfully</h1>
            <p>Your account security has been updated</p>
          </div>
          
          <div class="content">
            <h2>Hello {{user_name}},</h2>
            
            <p>This is a confirmation that the password for your HabibiStay account has been successfully changed on {{change_date}}.</p>
            
            <div class="security-card">
              <h3>🔐 Security Information</h3>
              <p><strong>Change Date:</strong> {{change_date}}</p>
              <p><strong>IP Address:</strong> {{ip_address}}</p>
              <p><strong>User Agent:</strong> {{user_agent}}</p>
            </div>
            
            <div class="security-note">
              <h4>🛡️ Security Notice</h4>
              <p>If you did not make this change, your account may have been compromised. Please contact our security team immediately at security@habibistay.com.</p>
            </div>
            
            <p>For your security, we recommend:</p>
            <ul>
              <li>Using a strong, unique password</li>
              <li>Enabling two-factor authentication</li>
              <li>Regularly updating your passwords</li>
              <li>Never sharing your credentials</li>
            </ul>
            
            <p>Best regards,<br><strong>The HabibiStay Security Team</strong></p>
          </div>
          
          <div class="footer">
            <p>HabibiStay - Premium Short-Term Rentals</p>
            <p>📧 support@habibistay.com | 📱 +966 XX XXX XXXX</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      ✅ Password Changed Successfully - HabibiStay
      
      Hello {{user_name}},
      
      This is a confirmation that your HabibiStay account password has been changed on {{change_date}}.
      
      Security Information:
      - Change Date: {{change_date}}
      - IP Address: {{ip_address}}
      - User Agent: {{user_agent}}
      
      Security Notice:
      If you did not make this change, your account may be compromised. Contact security@habibistay.com immediately.
      
      For your security, we recommend:
      - Using a strong, unique password
      - Enabling two-factor authentication
      - Regularly updating your passwords
      - Never sharing your credentials
      
      Best regards,
      The HabibiStay Security Team
    `
  },

  // Account deactivated email
  account_deactivated: {
    subject: 'Your HabibiStay Account Has Been Deactivated',
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Account Deactivated - HabibiStay</title>
        <style>
          body { margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; background: white; }
          .header { background: #6c757d; padding: 40px 20px; text-align: center; color: white; }
          .content { padding: 40px 20px; }
          .deactivation-card { background: #f8f9fa; border: 2px solid #dee2e6; border-radius: 12px; padding: 30px; margin: 20px 0; }
          .reactivation-info { background: #e7f3ff; border: 1px solid #b8daff; border-radius: 8px; padding: 20px; margin: 20px 0; }
          .footer { background: #f8f9fa; padding: 30px 20px; text-align: center; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔒 Account Deactivated</h1>
            <p>Your account has been deactivated</p>
          </div>
          
          <div class="content">
            <h2>Hello {{user_name}},</h2>
            
            <p>We're writing to inform you that your HabibiStay account has been deactivated as of {{deactivation_date}}.</p>
            
            <div class="deactivation-card">
              <h3>Deactivation Details</h3>
              <p><strong>Deactivation Date:</strong> {{deactivation_date}}</p>
              <p><strong>Reason:</strong> {{deactivation_reason}}</p>
              <p><strong>Account Email:</strong> {{user_email}}</p>
            </div>
            
            <div class="reactivation-info">
              <h4>🔄 Account Reactivation</h4>
              <p>If you believe this deactivation was in error or would like to reactivate your account, please contact our support team at support@habibistay.com.</p>
              <p>You have 30 days from the deactivation date to request reactivation. After this period, your account data may be permanently deleted.</p>
            </div>
            
            <p>If you have any active bookings, they will not be affected by this account deactivation. However, you may need to contact support to manage them.</p>
            
            <p>Best regards,<br><strong>The HabibiStay Team</strong></p>
          </div>
          
          <div class="footer">
            <p>HabibiStay - Premium Short-Term Rentals</p>
            <p>📧 support@habibistay.com | 📱 +966 XX XXX XXXX</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      🔒 Account Deactivated - HabibiStay
      
      Hello {{user_name}},
      
      Your HabibiStay account has been deactivated as of {{deactivation_date}}.
      
      Deactivation Details:
      - Deactivation Date: {{deactivation_date}}
      - Reason: {{deactivation_reason}}
      - Account Email: {{user_email}}
      
      Account Reactivation:
      If this was in error or you'd like to reactivate your account, contact support@habibistay.com within 30 days.
      
      Active bookings will not be affected, but you may need support to manage them.
      
      Best regards,
      The HabibiStay Team
    `
  },

  // Review request email
  review_request: {
    subject: 'Share Your Experience - {{property_title}} | HabibiStay',
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Review Request - HabibiStay</title>
        <style>
          body { margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; background: white; }
          .header { background: #ffc107; padding: 40px 20px; text-align: center; color: #212529; }
          .content { padding: 40px 20px; }
          .property-card { background: #fff3cd; border: 2px solid #ffeaa7; border-radius: 12px; padding: 30px; margin: 20px 0; }
          .cta-button { display: inline-block; background: #ffc107; color: #212529; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 15px 0; }
          .footer { background: #f8f9fa; padding: 30px 20px; text-align: center; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⭐ Share Your Experience</h1>
            <p>Tell us about your stay at {{property_title}}</p>
          </div>
          
          <div class="content">
            <h2>Hello {{guest_name}},</h2>
            
            <p>We hope you had a wonderful stay at {{property_title}}! Your feedback helps us improve and helps other travelers make informed decisions.</p>
            
            <div class="property-card">
              <h3>🏠 Your Recent Stay</h3>
              <p><strong>Property:</strong> {{property_title}}</p>
              <p><strong>Stay Dates:</strong> {{check_in_date}} to {{check_out_date}}</p>
              <p><strong>Booking ID:</strong> #{{booking_id}}</p>
            </div>
            
            <p>Would you mind taking a moment to share your experience? Your review will be published on the property page after verification.</p>
            
            <p style="text-align: center;">
              <a href="{{review_url}}" class="cta-button">Write a Review</a>
            </p>
            
            <p>If you're having trouble with the button, copy and paste this link into your browser:</p>
            <p><a href="{{review_url}}">{{review_url}}</a></p>
            
            <p>Thank you for being part of the HabibiStay community!</p>
            
            <p>Best regards,<br><strong>The HabibiStay Team</strong></p>
          </div>
          
          <div class="footer">
            <p>HabibiStay - Premium Short-Term Rentals</p>
            <p>📧 support@habibistay.com | 📱 +966 XX XXX XXXX</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      ⭐ Share Your Experience - HabibiStay
      
      Hello {{guest_name}},
      
      We hope you had a wonderful stay at {{property_title}}! Your feedback helps us improve.
      
      Your Recent Stay:
      - Property: {{property_title}}
      - Stay Dates: {{check_in_date}} to {{check_out_date}}
      - Booking ID: #{{booking_id}}
      
      Share your experience:
      {{review_url}}
      
      Thank you for being part of the HabibiStay community!
      
      Best regards,
      The HabibiStay Team
    `
  },

  // Special offer email
  special_offer: {
    subject: 'Exclusive Offer Just for You! | HabibiStay',
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Special Offer - HabibiStay</title>
        <style>
          body { margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; background: white; }
          .header { background: #e83e8c; padding: 40px 20px; text-align: center; color: white; }
          .content { padding: 40px 20px; }
          .offer-card { background: #f8f0f5; border: 2px solid #f0c2e0; border-radius: 12px; padding: 30px; margin: 20px 0; text-align: center; }
          .offer-details { background: #f8f9fa; border-radius: 8px; padding: 20px; margin: 20px 0; }
          .cta-button { display: inline-block; background: #e83e8c; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 15px 0; }
          .footer { background: #f8f9fa; padding: 30px 20px; text-align: center; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎁 Exclusive Offer Inside!</h1>
            <p>A special deal just for you</p>
          </div>
          
          <div class="content">
            <h2>Hello {{user_name}},</h2>
            
            <p>As a valued member of the HabibiStay community, we're excited to offer you exclusive access to this limited-time deal!</p>
            
            <div class="offer-card">
              <h3>🎉 {{offer_title}}</h3>
              <p style="font-size: 24px; font-weight: bold; color: #e83e8c;">{{discount_percentage}}% OFF</p>
              <p>Valid until {{offer_expiry}}</p>
            </div>
            
            <div class="offer-details">
              <h4>Offer Details</h4>
              <p><strong>Description:</strong> {{offer_description}}</p>
              <p><strong>Minimum Booking Value:</strong> {{minimum_value}} SAR</p>
              <p><strong>Valid For:</strong> {{offer_validity}}</p>
              <p><strong>Code:</strong> <strong>{{offer_code}}</strong></p>
            </div>
            
            <p style="text-align: center;">
              <a href="{{offer_url}}" class="cta-button">Claim Your Offer</a>
            </p>
            
            <p>This offer is exclusive to you and expires soon. Don't miss out on this opportunity to save on your next stay!</p>
            
            <p>Best regards,<br><strong>The HabibiStay Team</strong></p>
          </div>
          
          <div class="footer">
            <p>HabibiStay - Premium Short-Term Rentals</p>
            <p>📧 support@habibistay.com | 📱 +966 XX XXX XXXX</p>
            <p style="font-size: 12px; color: #666;">
              You're receiving this email because you're subscribed to HabibiStay offers. 
              <a href="{{unsubscribe_url}}">Unsubscribe</a>
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      🎁 Exclusive Offer Just for You! - HabibiStay
      
      Hello {{user_name}},
      
      As a valued member, we have an exclusive offer for you!
      
      🎉 {{offer_title}}
      {{discount_percentage}}% OFF
      Valid until {{offer_expiry}}
      
      Offer Details:
      - Description: {{offer_description}}
      - Minimum Booking Value: {{minimum_value}} SAR
      - Valid For: {{offer_validity}}
      - Code: {{offer_code}}
      
      Claim your offer: {{offer_url}}
      
      This exclusive offer expires soon!
      
      Best regards,
      The HabibiStay Team
      
      Unsubscribe: {{unsubscribe_url}}
    `
  }
};