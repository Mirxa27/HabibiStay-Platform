// Essential email templates for HabibiStay platform
export const EMAIL_TEMPLATES = {
  // Booking confirmation email
  booking_confirmation: {
    subject: 'Booking Confirmation - Welcome to {{property_title}} | HabibiStay',
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Booking Confirmation - HabibiStay</title>
        <style>
          body { margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; background: white; }
          .header { background: #2957c3; padding: 40px 20px; text-align: center; color: white; }
          .content { padding: 40px 20px; }
          .booking-card { background: #f8faff; border: 2px solid #e8f1ff; border-radius: 12px; padding: 30px; margin: 20px 0; }
          .booking-details { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 20px 0; }
          .detail-item { padding: 15px; background: white; border-radius: 8px; border: 1px solid #e8f1ff; }
          .detail-item h4 { margin: 0 0 5px 0; color: #2957c3; font-size: 14px; font-weight: bold; }
          .detail-item p { margin: 0; color: #333; font-size: 16px; font-weight: 600; }
          .amount-total { text-align: center; background: #2957c3; color: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .cta-button { display: inline-block; background: #2957c3; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
          .footer { background: #f8f9fa; padding: 30px 20px; text-align: center; color: #666; }
          .important-info { background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 20px; margin: 20px 0; }
          @media (max-width: 600px) { .booking-details { grid-template-columns: 1fr; } }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Booking Confirmed!</h1>
            <p>Thank you for choosing HabibiStay</p>
          </div>
          
          <div class="content">
            <h2>Hello {{guest_name}},</h2>
            <p>Great news! Your booking has been confirmed. We're excited to host you at our beautiful property.</p>
            
            <div class="booking-card">
              <h3>{{property_title}}</h3>
              <p>📍 {{property_location}}</p>
              
              <div class="booking-details">
                <div class="detail-item">
                  <h4>📅 CHECK-IN</h4>
                  <p>{{check_in_date}}</p>
                </div>
                <div class="detail-item">
                  <h4>📅 CHECK-OUT</h4>
                  <p>{{check_out_date}}</p>
                </div>
                <div class="detail-item">
                  <h4>👥 GUESTS</h4>
                  <p>{{total_guests}} guest(s)</p>
                </div>
                <div class="detail-item">
                  <h4>🔖 BOOKING ID</h4>
                  <p>#{{booking_id}}</p>
                </div>
              </div>
              
              <div class="amount-total">
                <h3>Total Amount: {{total_amount}} SAR</h3>
              </div>
            </div>
            
            <div class="important-info">
              <h4>📋 Important Information</h4>
              <ul>
                <li>Check-in time: 3:00 PM - 11:00 PM</li>
                <li>Check-out time: Before 12:00 PM</li>
                <li>Please bring a valid government-issued ID</li>
                <li>Contact us 24/7 for any assistance</li>
              </ul>
            </div>
            
            <p style="text-align: center;">
              <a href="{{property_url}}" class="cta-button">View Property Details</a>
            </p>
            
            <p>If you have any questions or need assistance, feel free to contact our support team at support@habibistay.com or call us at +966 XX XXX XXXX.</p>
            
            <p>We look forward to providing you with an exceptional stay!</p>
            
            <p>Best regards,<br><strong>The HabibiStay Team</strong></p>
          </div>
          
          <div class="footer">
            <p>HabibiStay - Premium Short-Term Rentals</p>
            <p>📧 support@habibistay.com | 📱 +966 XX XXX XXXX</p>
            <p>© 2024 HabibiStay. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      🎉 Booking Confirmed! - HabibiStay
      
      Hello {{guest_name}},
      
      Great news! Your booking has been confirmed for {{property_title}} in {{property_location}}.
      
      📅 Check-in: {{check_in_date}}
      📅 Check-out: {{check_out_date}}
      👥 Guests: {{total_guests}}
      🔖 Booking ID: #{{booking_id}}
      💰 Total Amount: {{total_amount}} SAR
      
      Important Information:
      - Check-in time: 3:00 PM - 11:00 PM
      - Check-out time: Before 12:00 PM
      - Please bring a valid government-issued ID
      - Contact us 24/7 for any assistance
      
      Property Details: {{property_url}}
      
      If you have any questions, contact us at support@habibistay.com or +966 XX XXX XXXX.
      
      Best regards,
      The HabibiStay Team
    `
  },

  // Payment confirmation email
  payment_confirmation: {
    subject: 'Payment Received - Booking #{{booking_id}} | HabibiStay',
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Payment Confirmation - HabibiStay</title>
        <style>
          body { margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; background: white; }
          .header { background: #28a745; padding: 40px 20px; text-align: center; color: white; }
          .content { padding: 40px 20px; }
          .payment-success { background: #d4edda; border: 2px solid #c3e6cb; border-radius: 12px; padding: 30px; margin: 20px 0; text-align: center; }
          .payment-details { background: #f8f9fa; border-radius: 8px; padding: 20px; margin: 20px 0; }
          .detail-row { display: flex; justify-content: space-between; margin: 10px 0; padding: 10px 0; border-bottom: 1px solid #e9ecef; }
          .detail-row:last-child { border-bottom: none; }
          .detail-label { font-weight: bold; color: #495057; }
          .detail-value { color: #28a745; font-weight: 600; }
          .receipt-info { background: #e7f3ff; border: 1px solid #b8daff; border-radius: 8px; padding: 20px; margin: 20px 0; }
          .footer { background: #f8f9fa; padding: 30px 20px; text-align: center; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Payment Confirmed!</h1>
            <p>Your payment has been successfully processed</p>
          </div>
          
          <div class="content">
            <div class="payment-success">
              <h2>🎉 Payment Successful!</h2>
              <p>Thank you for your payment. Your booking is now fully confirmed.</p>
            </div>
            
            <h3>Payment Details</h3>
            <div class="payment-details">
              <div class="detail-row">
                <span class="detail-label">Transaction ID:</span>
                <span class="detail-value">{{transaction_id}}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Booking ID:</span>
                <span class="detail-value">#{{booking_id}}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Amount Paid:</span>
                <span class="detail-value">{{amount_paid}} SAR</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Payment Method:</span>
                <span class="detail-value">{{payment_method}}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Payment Date:</span>
                <span class="detail-value">{{payment_date}}</span>
              </div>
            </div>
            
            <div class="receipt-info">
              <h4>📄 Receipt Information</h4>
              <p>A detailed receipt has been generated for your records. You can download it from your account dashboard or contact our support team for assistance.</p>
            </div>
            
            <p>Your booking is now fully confirmed and we look forward to hosting you!</p>
            
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
      ✅ Payment Confirmed! - HabibiStay
      
      Hello,
      
      Your payment has been successfully processed!
      
      Payment Details:
      - Transaction ID: {{transaction_id}}
      - Booking ID: #{{booking_id}}
      - Amount Paid: {{amount_paid}} SAR
      - Payment Method: {{payment_method}}
      - Payment Date: {{payment_date}}
      
      Your booking is now fully confirmed and we look forward to hosting you!
      
      Best regards,
      The HabibiStay Team
    `
  },

  // Welcome email for new users
  welcome_email: {
    subject: 'Welcome to HabibiStay! 🏠✨',
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to HabibiStay</title>
        <style>
          body { margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; background: white; }
          .header { background: #2957c3; padding: 50px 20px; text-align: center; color: white; }
          .content { padding: 40px 20px; }
          .features { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 30px 0; }
          .feature { background: #f8faff; border: 1px solid #e8f1ff; border-radius: 8px; padding: 20px; text-align: center; }
          .feature h4 { color: #2957c3; margin: 0 0 10px 0; }
          .cta-section { background: #2957c3; color: white; padding: 30px; border-radius: 12px; text-align: center; margin: 30px 0; }
          .cta-button { display: inline-block; background: white; color: #2957c3; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 15px 0; }
          .footer { background: #f8f9fa; padding: 30px 20px; text-align: center; color: #666; }
          @media (max-width: 600px) { .features { grid-template-columns: 1fr; } }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🏠 Welcome to HabibiStay!</h1>
            <p>Your gateway to premium short-term rentals</p>
          </div>
          
          <div class="content">
            <h2>Hello {{user_name}},</h2>
            
            <p>Welcome to HabibiStay! We're thrilled to have you join our community of travelers and hosts who appreciate exceptional accommodations and memorable experiences.</p>
            
            <div class="features">
              <div class="feature">
                <h4>🔍 Discover Amazing Properties</h4>
                <p>Browse our curated collection of premium properties across Saudi Arabia</p>
              </div>
              <div class="feature">
                <h4>🤖 Meet Sara, Your AI Assistant</h4>
                <p>Get personalized recommendations and instant support 24/7</p>
              </div>
              <div class="feature">
                <h4>💳 Secure Booking & Payments</h4>
                <p>Book with confidence using our secure payment system</p>
              </div>
              <div class="feature">
                <h4>⭐ Verified Reviews</h4>
                <p>Read genuine reviews from our community of travelers</p>
              </div>
            </div>
            
            <div class="cta-section">
              <h3>Ready to Start Your Journey?</h3>
              <p>Explore our featured properties and book your perfect stay today!</p>
              <a href="{{browse_properties_url}}" class="cta-button">Browse Properties</a>
            </div>
            
            <h3>🚀 Getting Started</h3>
            <ul>
              <li><strong>Complete your profile:</strong> Add your preferences and travel details</li>
              <li><strong>Browse properties:</strong> Use our advanced search to find your perfect stay</li>
              <li><strong>Chat with Sara:</strong> Get instant help with booking and recommendations</li>
              <li><strong>Book securely:</strong> Enjoy hassle-free booking with instant confirmation</li>
            </ul>
            
            <p>If you have any questions or need assistance, our support team is here to help 24/7 at support@habibistay.com.</p>
            
            <p>Welcome aboard and happy travels!</p>
            
            <p>Best regards,<br><strong>The HabibiStay Team</strong></p>
          </div>
          
          <div class="footer">
            <p>HabibiStay - Premium Short-Term Rentals</p>
            <p>📧 support@habibistay.com | 📱 +966 XX XXX XXXX</p>
            <p>© 2024 HabibiStay. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      🏠 Welcome to HabibiStay!
      
      Hello {{user_name}},
      
      Welcome to HabibiStay! We're thrilled to have you join our community.
      
      What you can do with HabibiStay:
      🔍 Discover Amazing Properties - Browse premium properties across Saudi Arabia
      🤖 Meet Sara, Your AI Assistant - Get personalized recommendations 24/7
      💳 Secure Booking & Payments - Book with confidence
      ⭐ Verified Reviews - Read genuine reviews from travelers
      
      Getting Started:
      1. Complete your profile
      2. Browse properties: {{browse_properties_url}}
      3. Chat with Sara for instant help
      4. Book securely with instant confirmation
      
      Need help? Contact us at support@habibistay.com
      
      Welcome aboard and happy travels!
      
      The HabibiStay Team
    `
  }
};