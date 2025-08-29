// Additional email templates for HabibiStay platform
export const ADDITIONAL_EMAIL_TEMPLATES = {
  // Booking reminder email (24 hours before check-in)
  booking_reminder: {
    subject: 'Check-in Reminder - Tomorrow at {{property_title}} | HabibiStay',
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Check-in Reminder - HabibiStay</title>
        <style>
          body { margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; background: white; }
          .header { background: #fd7e14; padding: 40px 20px; text-align: center; color: white; }
          .content { padding: 40px 20px; }
          .reminder-card { background: #fff3cd; border: 2px solid #ffeaa7; border-radius: 12px; padding: 30px; margin: 20px 0; }
          .checklist { background: #f8f9fa; border-radius: 8px; padding: 20px; margin: 20px 0; }
          .checklist ul { margin: 0; padding-left: 20px; }
          .checklist li { margin: 10px 0; }
          .contact-info { background: #e7f3ff; border: 1px solid #b8daff; border-radius: 8px; padding: 20px; margin: 20px 0; }
          .footer { background: #f8f9fa; padding: 30px 20px; text-align: center; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⏰ Check-in Tomorrow!</h1>
            <p>Your stay at {{property_title}} is coming up</p>
          </div>
          
          <div class="content">
            <h2>Hello {{guest_name}},</h2>
            
            <div class="reminder-card">
              <h3>🏠 Your Check-in is Tomorrow!</h3>
              <p><strong>Property:</strong> {{property_title}}</p>
              <p><strong>Address:</strong> {{property_address}}</p>
              <p><strong>Check-in Date:</strong> {{check_in_date}}</p>
              <p><strong>Check-in Time:</strong> 3:00 PM - 11:00 PM</p>
              <p><strong>Booking ID:</strong> #{{booking_id}}</p>
            </div>
            
            <div class="checklist">
              <h4>📋 Pre-Arrival Checklist</h4>
              <ul>
                <li>✅ Valid government-issued photo ID</li>
                <li>✅ Confirmation email (this one!)</li>
                <li>✅ Contact information updated</li>
                <li>✅ Review property rules and amenities</li>
                <li>✅ Plan your arrival time (3:00 PM - 11:00 PM)</li>
              </ul>
            </div>
            
            <div class="contact-info">
              <h4>📞 Need Assistance?</h4>
              <p><strong>Property Host:</strong> {{host_name}}</p>
              <p><strong>Host Phone:</strong> {{host_phone}}</p>
              <p><strong>24/7 Support:</strong> +966 XX XXX XXXX</p>
              <p><strong>Emergency Contact:</strong> +966 XX XXX XXXX</p>
            </div>
            
            <p>We're excited to welcome you and hope you have a wonderful stay!</p>
            
            <p>Safe travels,<br><strong>The HabibiStay Team</strong></p>
          </div>
          
          <div class="footer">
            <p>HabibiStay - Premium Short-Term Rentals</p>
            <p>📧 support@habibistay.com</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      ⏰ Check-in Tomorrow! - HabibiStay
      
      Hello {{guest_name}},
      
      Your check-in at {{property_title}} is tomorrow!
      
      Details:
      - Property: {{property_title}}
      - Address: {{property_address}}
      - Check-in Date: {{check_in_date}}
      - Check-in Time: 3:00 PM - 11:00 PM
      - Booking ID: #{{booking_id}}
      
      Pre-Arrival Checklist:
      ✅ Valid government-issued photo ID
      ✅ Confirmation email
      ✅ Contact information updated
      ✅ Review property rules and amenities
      ✅ Plan your arrival time (3:00 PM - 11:00 PM)
      
      Contact Information:
      - Property Host: {{host_name}} - {{host_phone}}
      - 24/7 Support: +966 XX XXX XXXX
      
      Safe travels,
      The HabibiStay Team
    `
  },

  // Host notification for new booking
  host_new_booking: {
    subject: 'New Booking Received - {{property_title}} | HabibiStay',
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Booking - HabibiStay</title>
        <style>
          body { margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; background: white; }
          .header { background: #2957c3; padding: 40px 20px; text-align: center; color: white; }
          .content { padding: 40px 20px; }
          .booking-info { background: #f8faff; border: 2px solid #e8f1ff; border-radius: 12px; padding: 30px; margin: 20px 0; }
          .guest-details { background: #f8f9fa; border-radius: 8px; padding: 20px; margin: 20px 0; }
          .action-buttons { text-align: center; margin: 30px 0; }
          .btn { display: inline-block; padding: 12px 24px; margin: 0 10px; text-decoration: none; border-radius: 6px; font-weight: bold; }
          .btn-primary { background: #2957c3; color: white; }
          .btn-success { background: #28a745; color: white; }
          .footer { background: #f8f9fa; padding: 30px 20px; text-align: center; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 New Booking!</h1>
            <p>You have received a new booking request</p>
          </div>
          
          <div class="content">
            <h2>Hello {{host_name}},</h2>
            
            <p>Great news! You have received a new booking for your property.</p>
            
            <div class="booking-info">
              <h3>📅 Booking Details</h3>
              <p><strong>Property:</strong> {{property_title}}</p>
              <p><strong>Check-in:</strong> {{check_in_date}}</p>
              <p><strong>Check-out:</strong> {{check_out_date}}</p>
              <p><strong>Guests:</strong> {{total_guests}}</p>
              <p><strong>Total Amount:</strong> {{total_amount}} SAR</p>
              <p><strong>Booking ID:</strong> #{{booking_id}}</p>
            </div>
            
            <div class="guest-details">
              <h4>👤 Guest Information</h4>
              <p><strong>Name:</strong> {{guest_name}}</p>
              <p><strong>Email:</strong> {{guest_email}}</p>
              <p><strong>Phone:</strong> {{guest_phone}}</p>
              <p><strong>Special Requests:</strong> {{special_requests}}</p>
            </div>
            
            <div class="action-buttons">
              <a href="{{dashboard_url}}" class="btn btn-primary">View in Dashboard</a>
              <a href="{{accept_url}}" class="btn btn-success">Accept Booking</a>
            </div>
            
            <p>Please review the booking details and respond promptly to provide the best experience for your guests.</p>
            
            <p>Best regards,<br><strong>The HabibiStay Team</strong></p>
          </div>
          
          <div class="footer">
            <p>HabibiStay - Premium Short-Term Rentals</p>
            <p>📧 support@habibistay.com</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      🎉 New Booking! - HabibiStay
      
      Hello {{host_name}},
      
      You have received a new booking for {{property_title}}.
      
      Booking Details:
      - Check-in: {{check_in_date}}
      - Check-out: {{check_out_date}}
      - Guests: {{total_guests}}
      - Total Amount: {{total_amount}} SAR
      - Booking ID: #{{booking_id}}
      
      Guest Information:
      - Name: {{guest_name}}
      - Email: {{guest_email}}
      - Phone: {{guest_phone}}
      - Special Requests: {{special_requests}}
      
      View Details: {{dashboard_url}}
      Accept Booking: {{accept_url}}
      
      Best regards,
      The HabibiStay Team
    `
  },

  // Newsletter welcome email
  newsletter_welcome: {
    subject: 'Welcome to HabibiStay Newsletter! 📧',
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Newsletter Welcome - HabibiStay</title>
        <style>
          body { margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; background: white; }
          .header { background: #6f42c1; padding: 40px 20px; text-align: center; color: white; }
          .content { padding: 40px 20px; }
          .benefits { background: #f8f9fa; border-radius: 8px; padding: 20px; margin: 20px 0; }
          .benefits ul { margin: 0; padding-left: 20px; }
          .benefits li { margin: 10px 0; }
          .unsubscribe { background: #e9ecef; border-radius: 8px; padding: 15px; margin: 20px 0; font-size: 12px; color: #6c757d; }
          .footer { background: #f8f9fa; padding: 30px 20px; text-align: center; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📧 Welcome to Our Newsletter!</h1>
            <p>Stay updated with the latest from HabibiStay</p>
          </div>
          
          <div class="content">
            <h2>Hello!</h2>
            
            <p>Thank you for subscribing to the HabibiStay newsletter! You're now part of our exclusive community that gets first access to amazing travel deals and insider tips.</p>
            
            <div class="benefits">
              <h3>What to Expect:</h3>
              <ul>
                <li>🏠 <strong>Exclusive Property Deals:</strong> Special rates and early access to new listings</li>
                <li>🎯 <strong>Personalized Recommendations:</strong> Properties matched to your travel preferences</li>
                <li>🏝️ <strong>Travel Tips & Guides:</strong> Insider knowledge about destinations</li>
                <li>🎉 <strong>Special Events:</strong> Invitations to HabibiStay community events</li>
                <li>💡 <strong>Platform Updates:</strong> Be the first to know about new features</li>
              </ul>
            </div>
            
            <p>We'll send you our newsletter monthly, packed with valuable content and exclusive offers. No spam, just quality content we think you'll love!</p>
            
            <p>Ready to explore? Browse our latest properties and start planning your next adventure.</p>
            
            <p>Happy travels,<br><strong>The HabibiStay Team</strong></p>
            
            <div class="unsubscribe">
              <p>You're receiving this email because you subscribed to HabibiStay newsletter at {{email}}. 
              If you no longer wish to receive these emails, you can <a href="{{unsubscribe_url}}">unsubscribe here</a>.</p>
            </div>
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
      📧 Welcome to HabibiStay Newsletter!
      
      Hello!
      
      Thank you for subscribing to our newsletter! You're now part of our exclusive community.
      
      What to Expect:
      🏠 Exclusive Property Deals - Special rates and early access
      🎯 Personalized Recommendations - Properties matched to your preferences
      🏝️ Travel Tips & Guides - Insider destination knowledge
      🎉 Special Events - Community event invitations
      💡 Platform Updates - First to know about new features
      
      We'll send monthly newsletters with valuable content and exclusive offers.
      
      Happy travels,
      The HabibiStay Team
      
      Unsubscribe: {{unsubscribe_url}}
    `
  },

  // Password reset email
  password_reset: {
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
  }
};