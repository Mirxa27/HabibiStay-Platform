// Additional email templates for HabibiStay platform
// These templates cover all the missing notification types specified in the design document

export const MORE_EMAIL_TEMPLATES = {
  // Booking cancellation email for guest
  booking_cancellation: {
    subject: 'Booking Cancellation - {{property_title}} | HabibiStay',
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Booking Cancellation - HabibiStay</title>
        <style>
          body { margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; background: white; }
          .header { background: #dc3545; padding: 40px 20px; text-align: center; color: white; }
          .content { padding: 40px 20px; }
          .cancellation-card { background: #f8d7da; border: 2px solid #f5c6cb; border-radius: 12px; padding: 30px; margin: 20px 0; }
          .refund-details { background: #f8f9fa; border-radius: 8px; padding: 20px; margin: 20px 0; }
          .detail-row { display: flex; justify-content: space-between; margin: 10px 0; padding: 10px 0; border-bottom: 1px solid #e9ecef; }
          .detail-row:last-child { border-bottom: none; }
          .detail-label { font-weight: bold; color: #495057; }
          .detail-value { color: #dc3545; font-weight: 600; }
          .footer { background: #f8f9fa; padding: 30px 20px; text-align: center; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>❌ Booking Cancelled</h1>
            <p>Your booking has been cancelled</p>
          </div>
          
          <div class="content">
            <h2>Hello {{guest_name}},</h2>
            
            <p>We're sorry to inform you that your booking for {{property_title}} has been cancelled.</p>
            
            <div class="cancellation-card">
              <h3>📅 Cancellation Details</h3>
              <p><strong>Property:</strong> {{property_title}}</p>
              <p><strong>Original Check-in:</strong> {{check_in_date}}</p>
              <p><strong>Original Check-out:</strong> {{check_out_date}}</p>
              <p><strong>Booking ID:</strong> #{{booking_id}}</p>
              <p><strong>Cancellation Date:</strong> {{cancellation_date}}</p>
            </div>
            
            <div class="refund-details">
              <h4>💰 Refund Information</h4>
              <div class="detail-row">
                <span class="detail-label">Original Amount:</span>
                <span class="detail-value">{{original_amount}} SAR</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Cancellation Fee:</span>
                <span class="detail-value">{{cancellation_fee}} SAR</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Refund Amount:</span>
                <span class="detail-value">{{refund_amount}} SAR</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Refund Method:</span>
                <span class="detail-value">{{refund_method}}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Expected Refund Date:</span>
                <span class="detail-value">{{expected_refund_date}}</span>
              </div>
            </div>
            
            <p>If you have any questions about this cancellation or need assistance with the refund process, please contact our support team at support@habibistay.com.</p>
            
            <p>We hope to serve you again in the future.</p>
            
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
      ❌ Booking Cancelled - HabibiStay
      
      Hello {{guest_name}},
      
      We're sorry to inform you that your booking for {{property_title}} has been cancelled.
      
      Cancellation Details:
      - Property: {{property_title}}
      - Original Check-in: {{check_in_date}}
      - Original Check-out: {{check_out_date}}
      - Booking ID: #{{booking_id}}
      - Cancellation Date: {{cancellation_date}}
      
      Refund Information:
      - Original Amount: {{original_amount}} SAR
      - Cancellation Fee: {{cancellation_fee}} SAR
      - Refund Amount: {{refund_amount}} SAR
      - Refund Method: {{refund_method}}
      - Expected Refund Date: {{expected_refund_date}}
      
      If you have any questions, contact us at support@habibistay.com
      
      Best regards,
      The HabibiStay Team
    `
  },

  // Booking cancellation email for host
  booking_cancellation_host: {
    subject: 'Booking Cancelled - {{property_title}} | HabibiStay',
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Booking Cancelled - HabibiStay</title>
        <style>
          body { margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; background: white; }
          .header { background: #dc3545; padding: 40px 20px; text-align: center; color: white; }
          .content { padding: 40px 20px; }
          .cancellation-card { background: #f8d7da; border: 2px solid #f5c6cb; border-radius: 12px; padding: 30px; margin: 20px 0; }
          .booking-details { background: #f8f9fa; border-radius: 8px; padding: 20px; margin: 20px 0; }
          .footer { background: #f8f9fa; padding: 30px 20px; text-align: center; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>❌ Booking Cancelled</h1>
            <p>A booking for your property has been cancelled</p>
          </div>
          
          <div class="content">
            <h2>Hello {{host_name}},</h2>
            
            <p>We're informing you that a booking for your property {{property_title}} has been cancelled.</p>
            
            <div class="cancellation-card">
              <h3>📅 Cancellation Details</h3>
              <p><strong>Property:</strong> {{property_title}}</p>
              <p><strong>Guest Name:</strong> {{guest_name}}</p>
              <p><strong>Original Check-in:</strong> {{check_in_date}}</p>
              <p><strong>Original Check-out:</strong> {{check_out_date}}</p>
              <p><strong>Booking ID:</strong> #{{booking_id}}</p>
              <p><strong>Cancellation Date:</strong> {{cancellation_date}}</p>
            </div>
            
            <div class="booking-details">
              <h4>📋 Booking Information</h4>
              <p><strong>Original Amount:</strong> {{original_amount}} SAR</p>
              <p><strong>Cancellation Fee:</strong> {{cancellation_fee}} SAR</p>
              <p><strong>Refund to Guest:</strong> {{refund_amount}} SAR</p>
            </div>
            
            <p>Your calendar for these dates is now available for new bookings. If you have any questions, please contact our support team.</p>
            
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
      ❌ Booking Cancelled - HabibiStay
      
      Hello {{host_name}},
      
      A booking for your property {{property_title}} has been cancelled.
      
      Cancellation Details:
      - Property: {{property_title}}
      - Guest Name: {{guest_name}}
      - Original Check-in: {{check_in_date}}
      - Original Check-out: {{check_out_date}}
      - Booking ID: #{{booking_id}}
      - Cancellation Date: {{cancellation_date}}
      
      Booking Information:
      - Original Amount: {{original_amount}} SAR
      - Cancellation Fee: {{cancellation_fee}} SAR
      - Refund to Guest: {{refund_amount}} SAR
      
      Your calendar is now available for these dates.
      
      Best regards,
      The HabibiStay Team
    `
  },

  // Booking modification email for guest
  booking_modification: {
    subject: 'Booking Updated - {{property_title}} | HabibiStay',
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Booking Updated - HabibiStay</title>
        <style>
          body { margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; background: white; }
          .header { background: #fd7e14; padding: 40px 20px; text-align: center; color: white; }
          .content { padding: 40px 20px; }
          .modification-card { background: #fff3cd; border: 2px solid #ffeaa7; border-radius: 12px; padding: 30px; margin: 20px 0; }
          .detail-row { display: flex; justify-content: space-between; margin: 10px 0; padding: 10px 0; border-bottom: 1px solid #e9ecef; }
          .detail-row:last-child { border-bottom: none; }
          .detail-label { font-weight: bold; color: #495057; }
          .detail-value { color: #fd7e14; font-weight: 600; }
          .footer { background: #f8f9fa; padding: 30px 20px; text-align: center; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔄 Booking Updated</h1>
            <p>Your booking details have been modified</p>
          </div>
          
          <div class="content">
            <h2>Hello {{guest_name}},</h2>
            
            <p>Your booking for {{property_title}} has been updated with the following changes:</p>
            
            <div class="modification-card">
              <h3>📅 Updated Booking Details</h3>
              <p><strong>Property:</strong> {{property_title}}</p>
              <p><strong>Booking ID:</strong> #{{booking_id}}</p>
              <p><strong>Modified Date:</strong> {{modification_date}}</p>
            </div>
            
            <div class="modification-card">
              <h4>📋 Changes Made</h4>
              <div class="detail-row">
                <span class="detail-label">Previous Check-in:</span>
                <span class="detail-value">{{previous_check_in}}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">New Check-in:</span>
                <span class="detail-value">{{new_check_in}}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Previous Check-out:</span>
                <span class="detail-value">{{previous_check_out}}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">New Check-out:</span>
                <span class="detail-value">{{new_check_out}}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Previous Guests:</span>
                <span class="detail-value">{{previous_guests}}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">New Guests:</span>
                <span class="detail-value">{{new_guests}}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Previous Amount:</span>
                <span class="detail-value">{{previous_amount}} SAR</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">New Amount:</span>
                <span class="detail-value">{{new_amount}} SAR</span>
              </div>
            </div>
            
            <p>If you have any questions about these changes or need to make further modifications, please contact our support team at support@habibistay.com.</p>
            
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
      🔄 Booking Updated - HabibiStay
      
      Hello {{guest_name}},
      
      Your booking for {{property_title}} has been updated with the following changes:
      
      Updated Booking Details:
      - Property: {{property_title}}
      - Booking ID: #{{booking_id}}
      - Modified Date: {{modification_date}}
      
      Changes Made:
      - Previous Check-in: {{previous_check_in}}
      - New Check-in: {{new_check_in}}
      - Previous Check-out: {{previous_check_out}}
      - New Check-out: {{new_check_out}}
      - Previous Guests: {{previous_guests}}
      - New Guests: {{new_guests}}
      - Previous Amount: {{previous_amount}} SAR
      - New Amount: {{new_amount}} SAR
      
      If you have any questions, contact us at support@habibistay.com
      
      Best regards,
      The HabibiStay Team
    `
  },

  // Check-in reminder email
  checkin_reminder: {
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

  // Host new booking request email
  host_booking_request: {
    subject: 'New Booking Request - {{property_title}} | HabibiStay',
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Booking Request - HabibiStay</title>
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
          .btn-danger { background: #dc3545; color: white; }
          .footer { background: #f8f9fa; padding: 30px 20px; text-align: center; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 New Booking Request!</h1>
            <p>You have received a new booking request</p>
          </div>
          
          <div class="content">
            <h2>Hello {{host_name}},</h2>
            
            <p>You have received a new booking request for your property.</p>
            
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
              <a href="{{decline_url}}" class="btn btn-danger">Decline Booking</a>
            </div>
            
            <p>Please review the booking details and respond within 24 hours to provide the best experience for your guests.</p>
            
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
      🎉 New Booking Request! - HabibiStay
      
      Hello {{host_name}},
      
      You have received a new booking request for {{property_title}}.
      
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
      
      Actions:
      - View Details: {{dashboard_url}}
      - Accept Booking: {{accept_url}}
      - Decline Booking: {{decline_url}}
      
      Please respond within 24 hours.
      
      Best regards,
      The HabibiStay Team
    `
  },

  // Payment failed email
  payment_failed: {
    subject: 'Payment Failed - Booking #{{booking_id}} | HabibiStay',
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Payment Failed - HabibiStay</title>
        <style>
          body { margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; background: white; }
          .header { background: #dc3545; padding: 40px 20px; text-align: center; color: white; }
          .content { padding: 40px 20px; }
          .payment-failed { background: #f8d7da; border: 2px solid #f5c6cb; border-radius: 12px; padding: 30px; margin: 20px 0; text-align: center; }
          .payment-details { background: #f8f9fa; border-radius: 8px; padding: 20px; margin: 20px 0; }
          .detail-row { display: flex; justify-content: space-between; margin: 10px 0; padding: 10px 0; border-bottom: 1px solid #e9ecef; }
          .detail-row:last-child { border-bottom: none; }
          .detail-label { font-weight: bold; color: #495057; }
          .detail-value { color: #dc3545; font-weight: 600; }
          .cta-button { display: inline-block; background: #2957c3; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 15px 0; }
          .footer { background: #f8f9fa; padding: 30px 20px; text-align: center; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>❌ Payment Failed</h1>
            <p>Your payment could not be processed</p>
          </div>
          
          <div class="content">
            <div class="payment-failed">
              <h2>Payment Failed!</h2>
              <p>We're sorry, but your payment could not be processed at this time.</p>
            </div>
            
            <h3>Payment Details</h3>
            <div class="payment-details">
              <div class="detail-row">
                <span class="detail-label">Booking ID:</span>
                <span class="detail-value">#{{booking_id}}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Amount:</span>
                <span class="detail-value">{{amount}} SAR</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Payment Method:</span>
                <span class="detail-value">{{payment_method}}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Failure Reason:</span>
                <span class="detail-value">{{failure_reason}}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Attempt Date:</span>
                <span class="detail-value">{{attempt_date}}</span>
              </div>
            </div>
            
            <p>To complete your booking, please try again with a different payment method or contact our support team for assistance.</p>
            
            <p style="text-align: center;">
              <a href="{{payment_retry_url}}" class="cta-button">Retry Payment</a>
            </p>
            
            <p>If you continue to experience issues, please contact our support team at support@habibistay.com.</p>
            
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
      ❌ Payment Failed - HabibiStay
      
      Hello,
      
      We're sorry, but your payment could not be processed.
      
      Payment Details:
      - Booking ID: #{{booking_id}}
      - Amount: {{amount}} SAR
      - Payment Method: {{payment_method}}
      - Failure Reason: {{failure_reason}}
      - Attempt Date: {{attempt_date}}
      
      To complete your booking, please retry your payment:
      {{payment_retry_url}}
      
      If you continue to have issues, contact us at support@habibistay.com
      
      Best regards,
      The HabibiStay Team
    `
  },

  // Account verification email
  account_verification: {
    subject: 'Verify Your HabibiStay Account',
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Account Verification - HabibiStay</title>
        <style>
          body { margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; background: white; }
          .header { background: #2957c3; padding: 40px 20px; text-align: center; color: white; }
          .content { padding: 40px 20px; }
          .verification-card { background: #f8faff; border: 2px solid #e8f1ff; border-radius: 12px; padding: 30px; margin: 20px 0; text-align: center; }
          .cta-button { display: inline-block; background: #2957c3; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 15px 0; }
          .security-note { background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 15px; margin: 20px 0; font-size: 14px; }
          .footer { background: #f8f9fa; padding: 30px 20px; text-align: center; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 Account Verification</h1>
            <p>Verify your HabibiStay account</p>
          </div>
          
          <div class="content">
            <h2>Hello {{user_name}},</h2>
            
            <p>Thank you for signing up with HabibiStay! To complete your registration and secure your account, please verify your email address by clicking the button below:</p>
            
            <div class="verification-card">
              <h3>Verify Your Email</h3>
              <a href="{{verification_url}}" class="cta-button">Verify Email Address</a>
              <p>This link will expire in 24 hours for security reasons.</p>
            </div>
            
            <div class="security-note">
              <h4>🛡️ Security Notice</h4>
              <ul>
                <li>This verification link is valid for 24 hours only</li>
                <li>Never share this link with anyone</li>
                <li>If you didn't create this account, please ignore this email</li>
              </ul>
            </div>
            
            <p>If you're having trouble with the button, copy and paste this link into your browser:</p>
            <p><a href="{{verification_url}}">{{verification_url}}</a></p>
            
            <p>Welcome to HabibiStay! We're excited to have you as part of our community.</p>
            
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
      🔐 Account Verification - HabibiStay
      
      Hello {{user_name}},
      
      Thank you for signing up with HabibiStay! To complete your registration, please verify your email address:
      
      Verify Email: {{verification_url}}
      
      This link expires in 24 hours for security.
      
      Security Notice:
      - Link valid for 24 hours only
      - Never share this link
      - If you didn't create this account, ignore this email
      
      Welcome to HabibiStay!
      
      Best regards,
      The HabibiStay Team
    `
  }
};