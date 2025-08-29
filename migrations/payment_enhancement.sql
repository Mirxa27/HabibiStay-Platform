-- Enhanced Payment System Migration
-- This migration updates the payment system to support the comprehensive PaymentService

-- Drop existing payments table if it exists (backup data first in production!)
DROP TABLE IF EXISTS payments;

-- Create enhanced payments table
CREATE TABLE payments (
  id TEXT PRIMARY KEY, -- Custom payment ID format: PAY_timestamp_random
  booking_id TEXT NOT NULL,
  amount REAL NOT NULL,
  currency TEXT DEFAULT 'SAR',
  provider TEXT NOT NULL CHECK (provider IN ('myfatoorah', 'paypal', 'stripe')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  description TEXT,
  payment_url TEXT,
  provider_transaction_id TEXT,
  provider_metadata TEXT, -- JSON
  metadata TEXT, -- JSON for additional data
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create refunds table
CREATE TABLE refunds (
  id TEXT PRIMARY KEY, -- Custom refund ID format: REF_timestamp_random
  payment_id TEXT NOT NULL,
  amount REAL NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  provider_refund_id TEXT,
  reason TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (payment_id) REFERENCES payments(id)
);

-- Create webhook logs table
CREATE TABLE webhook_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  provider TEXT NOT NULL,
  event TEXT NOT NULL,
  payload TEXT NOT NULL, -- JSON
  processed_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create notification templates table
CREATE TABLE notification_templates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('email', 'sms', 'push')),
  template_key TEXT NOT NULL,
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'critical')),
  is_active BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create notification settings table
CREATE TABLE notification_settings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  email_booking_updates BOOLEAN DEFAULT 1,
  email_marketing BOOLEAN DEFAULT 0,
  sms_booking_updates BOOLEAN DEFAULT 1,
  push_notifications BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Create notification logs table
CREATE TABLE notification_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  recipient TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('email', 'sms', 'push')),
  template_key TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('sent', 'failed', 'pending')),
  message_id TEXT,
  error_message TEXT,
  variables TEXT, -- JSON
  priority TEXT DEFAULT 'normal',
  user_id TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Create enhanced email logs table (if not exists)
CREATE TABLE IF NOT EXISTS email_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  recipient TEXT NOT NULL,
  template_key TEXT,
  subject TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'bounced', 'delivered')),
  sent_at DATETIME,
  failed_reason TEXT,
  variables TEXT, -- JSON
  provider TEXT,
  message_id TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create user profiles table (if not exists)
CREATE TABLE IF NOT EXISTS user_profiles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL UNIQUE,
  full_name TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  country TEXT DEFAULT 'Saudi Arabia',
  date_of_birth DATE,
  preferred_language TEXT DEFAULT 'en',
  currency TEXT DEFAULT 'SAR',
  bio TEXT,
  avatar_url TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Add indexes for performance
CREATE INDEX idx_payments_booking_id ON payments(booking_id);
CREATE INDEX idx_payments_provider ON payments(provider);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_created_at ON payments(created_at);
CREATE INDEX idx_refunds_payment_id ON refunds(payment_id);
CREATE INDEX idx_webhook_logs_provider ON webhook_logs(provider);
CREATE INDEX idx_notification_logs_recipient ON notification_logs(recipient);
CREATE INDEX idx_notification_logs_status ON notification_logs(status);

-- Insert default notification templates
INSERT INTO notification_templates (event, type, template_key, priority) VALUES
('booking_confirmation', 'email', 'booking_confirmation', 'high'),
('payment_confirmation', 'email', 'payment_confirmation', 'high'),
('booking_reminder', 'email', 'booking_reminder', 'normal'),
('booking_cancellation', 'email', 'booking_cancellation', 'normal'),
('welcome', 'email', 'welcome_email', 'normal');

-- Insert default admin settings for payment configuration
INSERT OR IGNORE INTO admin_settings (key, value, category, description) VALUES
('payment_myfatoorah_enabled', 'true', 'payment', 'Enable MyFatoorah payment gateway'),
('payment_paypal_enabled', 'true', 'payment', 'Enable PayPal payment gateway'),
('payment_default_currency', 'SAR', 'payment', 'Default payment currency'),
('payment_webhook_timeout', '30', 'payment', 'Webhook timeout in seconds'),
('notification_email_enabled', 'true', 'notification', 'Enable email notifications'),
('notification_sms_enabled', 'false', 'notification', 'Enable SMS notifications');