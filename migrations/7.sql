-- Create contact submissions table
CREATE TABLE contact_submissions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  interest TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'new',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create newsletter subscriptions table
CREATE TABLE newsletter_subscriptions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  source TEXT DEFAULT 'website',
  is_active BOOLEAN DEFAULT 1,
  subscribed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  unsubscribed_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Add additional email templates
INSERT OR REPLACE INTO email_templates (template_key, subject, html_content, variables, is_active) VALUES
(
  'contact_form_submission',
  'New Contact Form Submission - HabibiStay',
  '<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>Contact Form Submission</title>
    <style>
      body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
      .container { max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px; }
      .header { text-align: center; margin-bottom: 30px; }
      .logo { color: #2957c3; font-size: 24px; font-weight: bold; }
      .content { line-height: 1.6; }
      .submission-details { background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <div class="logo">HabibiStay</div>
        <h1>New Contact Form Submission</h1>
      </div>
      <div class="content">
        <p>A new contact form has been submitted on the HabibiStay website.</p>
        
        <div class="submission-details">
          <h3>Contact Details</h3>
          <p><strong>Name:</strong> {{ name }}</p>
          <p><strong>Email:</strong> {{ email }}</p>
          <p><strong>Phone:</strong> {{ phone }}</p>
          <p><strong>Interest:</strong> {{ interest }}</p>
          <p><strong>Submitted At:</strong> {{ submitted_at }}</p>
        </div>
        
        <div class="submission-details">
          <h3>Message</h3>
          <p>{{ message }}</p>
        </div>
        
        <p>Please respond to this inquiry promptly.</p>
      </div>
    </div>
  </body>
</html>',
  '["name", "email", "phone", "interest", "message", "submitted_at"]',
  1
),
(
  'contact_form_confirmation',
  'Thank you for contacting HabibiStay',
  '<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>Contact Confirmation</title>
    <style>
      body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
      .container { max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px; }
      .header { text-align: center; margin-bottom: 30px; }
      .logo { color: #2957c3; font-size: 24px; font-weight: bold; }
      .content { line-height: 1.6; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <div class="logo">HabibiStay</div>
        <h1>Thank You for Contacting Us</h1>
      </div>
      <div class="content">
        <p>Dear {{ name }},</p>
        <p>Thank you for reaching out to HabibiStay regarding <strong>{{ interest }}</strong>.</p>
        
        <p>We have received your message and our team will review it shortly. You can expect to hear back from us within 24 hours.</p>
        
        <p>In the meantime, feel free to explore our platform or chat with Sara, our AI assistant, for immediate assistance.</p>
        
        <p>Best regards,<br>The HabibiStay Team</p>
      </div>
    </div>
  </body>
</html>',
  '["name", "interest"]',
  1
),
(
  'newsletter_welcome',
  'Welcome to HabibiStay Newsletter',
  '<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>Newsletter Welcome</title>
    <style>
      body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
      .container { max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px; }
      .header { text-align: center; margin-bottom: 30px; }
      .logo { color: #2957c3; font-size: 24px; font-weight: bold; }
      .content { line-height: 1.6; }
      .btn { display: inline-block; background-color: #2957c3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <div class="logo">HabibiStay</div>
        <h1>Welcome to Our Newsletter!</h1>
      </div>
      <div class="content">
        <p>Thank you for subscribing to the HabibiStay newsletter!</p>
        
        <p>You''ll now receive:</p>
        <ul>
          <li>Market insights and trends</li>
          <li>New property listings</li>
          <li>Investment opportunities</li>
          <li>Exclusive offers and promotions</li>
          <li>Saudi real estate news</li>
        </ul>
        
        <p>Stay connected with the future of Saudi hospitality and real estate.</p>
        
        <p>Best regards,<br>The HabibiStay Team</p>
        
        <p style="font-size: 12px; color: #666; margin-top: 30px;">
          You can <a href="{{ unsubscribe_url }}">unsubscribe</a> at any time.
        </p>
      </div>
    </div>
  </body>
</html>',
  '["email", "unsubscribe_url"]',
  1
);