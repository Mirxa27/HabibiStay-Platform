-- Add missing email templates to the database
-- This migration adds all the new email templates specified in the design document

-- Add booking cancellation template
INSERT OR REPLACE INTO email_templates (template_key, subject, html_content, text_content, variables, is_active) VALUES
(
  'booking_cancellation',
  'Booking Cancellation - {{property_title}} | HabibiStay',
  '<!DOCTYPE html>
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
      
      <p>We''re sorry to inform you that your booking for {{property_title}} has been cancelled.</p>
      
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
</html>',
  '❌ Booking Cancelled - HabibiStay

Hello {{guest_name}},

We''re sorry to inform you that your booking for {{property_title}} has been cancelled.

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
The HabibiStay Team',
  '["guest_name", "property_title", "check_in_date", "check_out_date", "booking_id", "cancellation_date", "original_amount", "cancellation_fee", "refund_amount", "refund_method", "expected_refund_date"]',
  1
),

-- Add booking cancellation host template
(
  'booking_cancellation_host',
  'Booking Cancelled - {{property_title}} | HabibiStay',
  '<!DOCTYPE html>
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
      
      <p>We''re informing you that a booking for your property {{property_title}} has been cancelled.</p>
      
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
</html>',
  '❌ Booking Cancelled - HabibiStay

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
The HabibiStay Team',
  '["host_name", "property_title", "guest_name", "check_in_date", "check_out_date", "booking_id", "cancellation_date", "original_amount", "cancellation_fee", "refund_amount"]',
  1
),

-- Add booking modification template
(
  'booking_modification',
  'Booking Updated - {{property_title}} | HabibiStay',
  '<!DOCTYPE html>
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
</html>',
  '🔄 Booking Updated - HabibiStay

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
The HabibiStay Team',
  '["guest_name", "property_title", "booking_id", "modification_date", "previous_check_in", "new_check_in", "previous_check_out", "new_check_out", "previous_guests", "new_guests", "previous_amount", "new_amount"]',
  1
),

-- Add check-in reminder template
(
  'checkin_reminder',
  'Check-in Reminder - Tomorrow at {{property_title}} | HabibiStay',
  '<!DOCTYPE html>
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
      
      <p>We''re excited to welcome you and hope you have a wonderful stay!</p>
      
      <p>Safe travels,<br><strong>The HabibiStay Team</strong></p>
    </div>
    
    <div class="footer">
      <p>HabibiStay - Premium Short-Term Rentals</p>
      <p>📧 support@habibistay.com</p>
    </div>
  </div>
</body>
</html>',
  '⏰ Check-in Tomorrow! - HabibiStay

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
The HabibiStay Team',
  '["guest_name", "property_title", "property_address", "check_in_date", "booking_id", "host_name", "host_phone"]',
  1
),

-- Add host booking request template
(
  'host_booking_request',
  'New Booking Request - {{property_title}} | HabibiStay',
  '<!DOCTYPE html>
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
</html>',
  '🎉 New Booking Request! - HabibiStay

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
The HabibiStay Team',
  '["host_name", "property_title", "check_in_date", "check_out_date", "total_guests", "total_amount", "booking_id", "guest_name", "guest_email", "guest_phone", "special_requests", "dashboard_url", "accept_url", "decline_url"]',
  1
),

-- Add payment failed template
(
  'payment_failed',
  'Payment Failed - Booking #{{booking_id}} | HabibiStay',
  '<!DOCTYPE html>
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
        <p>We''re sorry, but your payment could not be processed at this time.</p>
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
</html>',
  '❌ Payment Failed - HabibiStay

Hello,

We''re sorry, but your payment could not be processed.

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
The HabibiStay Team',
  '["booking_id", "amount", "payment_method", "failure_reason", "attempt_date", "payment_retry_url"]',
  1
),

-- Add account verification template
(
  'account_verification',
  'Verify Your HabibiStay Account',
  '<!DOCTYPE html>
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
          <li>If you didn''t create this account, please ignore this email</li>
        </ul>
      </div>
      
      <p>If you''re having trouble with the button, copy and paste this link into your browser:</p>
      <p><a href="{{verification_url}}">{{verification_url}}</a></p>
      
      <p>Welcome to HabibiStay! We''re excited to have you as part of our community.</p>
      
      <p>Best regards,<br><strong>The HabibiStay Team</strong></p>
    </div>
    
    <div class="footer">
      <p>HabibiStay - Premium Short-Term Rentals</p>
      <p>📧 support@habibistay.com | 📱 +966 XX XXX XXXX</p>
    </div>
  </div>
</body>
</html>',
  '🔐 Account Verification - HabibiStay

Hello {{user_name}},

Thank you for signing up with HabibiStay! To complete your registration, please verify your email address:

Verify Email: {{verification_url}}

This link expires in 24 hours for security.

Security Notice:
- Link valid for 24 hours only
- Never share this link
- If you didn''t create this account, ignore this email

Welcome to HabibiStay!

Best regards,
The HabibiStay Team',
  '["user_name", "verification_url"]',
  1
),

-- Add password reset request template
(
  'password_reset_request',
  'Reset Your HabibiStay Password',
  '<!DOCTYPE html>
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
          <li>If you didn''t request this reset, please ignore this email</li>
          <li>Never share this link with anyone</li>
          <li>Contact support if you have concerns</li>
        </ul>
      </div>
      
      <p>If you didn''t request a password reset, please ignore this email. Your password will remain unchanged, and your account is secure.</p>
      
      <p>If you''re having trouble with the button, copy and paste this link into your browser:</p>
      <p><a href="{{reset_url}}">{{reset_url}}</a></p>
      
      <p>Best regards,<br><strong>The HabibiStay Security Team</strong></p>
    </div>
    
    <div class="footer">
      <p>HabibiStay - Premium Short-Term Rentals</p>
      <p>📧 support@habibistay.com | 📱 +966 XX XXX XXXX</p>
    </div>
  </div>
</body>
</html>',
  '🔐 Password Reset - HabibiStay

Hello {{user_name}},

We received a request to reset your HabibiStay account password.

Reset your password: {{reset_url}}

This link expires in 24 hours for security.

Security Notice:
- Link valid for 24 hours only
- If you didn''t request this, ignore this email
- Never share this link
- Contact support if you have concerns

If you didn''t request this reset, your account remains secure.

Best regards,
The HabibiStay Security Team',
  '["user_name", "reset_url"]',
  1
),

-- Add password changed template
(
  'password_changed',
  'Your HabibiStay Password Has Been Changed',
  '<!DOCTYPE html>
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
</html>',
  '✅ Password Changed Successfully - HabibiStay

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
The HabibiStay Security Team',
  '["user_name", "change_date", "ip_address", "user_agent"]',
  1
),

-- Add account deactivated template
(
  'account_deactivated',
  'Your HabibiStay Account Has Been Deactivated',
  '<!DOCTYPE html>
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
      
      <p>We''re writing to inform you that your HabibiStay account has been deactivated as of {{deactivation_date}}.</p>
      
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
</html>',
  '🔒 Account Deactivated - HabibiStay

Hello {{user_name}},

Your HabibiStay account has been deactivated as of {{deactivation_date}}.

Deactivation Details:
- Deactivation Date: {{deactivation_date}}
- Reason: {{deactivation_reason}}
- Account Email: {{user_email}}

Account Reactivation:
If this was in error or you''d like to reactivate your account, contact support@habibistay.com within 30 days.

Active bookings will not be affected, but you may need support to manage them.

Best regards,
The HabibiStay Team',
  '["user_name", "deactivation_date", "deactivation_reason", "user_email"]',
  1
),

-- Add review request template
(
  'review_request',
  'Share Your Experience - {{property_title}} | HabibiStay',
  '<!DOCTYPE html>
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
      
      <p>If you''re having trouble with the button, copy and paste this link into your browser:</p>
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
</html>',
  '⭐ Share Your Experience - HabibiStay

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
The HabibiStay Team',
  '["guest_name", "property_title", "check_in_date", "check_out_date", "booking_id", "review_url"]',
  1
),

-- Add special offer template
(
  'special_offer',
  'Exclusive Offer Just for You! | HabibiStay',
  '<!DOCTYPE html>
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
      
      <p>As a valued member of the HabibiStay community, we''re excited to offer you exclusive access to this limited-time deal!</p>
      
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
      
      <p>This offer is exclusive to you and expires soon. Don''t miss out on this opportunity to save on your next stay!</p>
      
      <p>Best regards,<br><strong>The HabibiStay Team</strong></p>
    </div>
    
    <div class="footer">
      <p>HabibiStay - Premium Short-Term Rentals</p>
      <p>📧 support@habibistay.com | 📱 +966 XX XXX XXXX</p>
      <p style="font-size: 12px; color: #666;">
        You''re receiving this email because you''re subscribed to HabibiStay offers. 
        <a href="{{unsubscribe_url}}">Unsubscribe</a>
      </p>
    </div>
  </div>
</body>
</html>',
  '🎁 Exclusive Offer Just for You! - HabibiStay

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

Unsubscribe: {{unsubscribe_url}}',
  '["user_name", "offer_title", "discount_percentage", "offer_expiry", "offer_description", "minimum_value", "offer_validity", "offer_code", "offer_url", "unsubscribe_url"]',
  1
);