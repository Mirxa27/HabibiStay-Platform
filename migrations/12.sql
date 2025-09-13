-- Add missing notification templates for complete notification system
-- This migration adds all the email and mobile notification templates specified in the design document

-- Add missing notification templates
INSERT OR IGNORE INTO notification_templates (event, type, template_key, priority, is_active) VALUES
-- Booking System
('booking_cancellation', 'email', 'booking_cancellation', 'high', 1),
('booking_cancellation_host', 'email', 'booking_cancellation_host', 'high', 1),
('booking_modification', 'email', 'booking_modification', 'normal', 1),
('booking_modification_host', 'email', 'booking_modification_host', 'normal', 1),
('checkin_reminder', 'email', 'checkin_reminder', 'high', 1),
('checkout_reminder', 'email', 'checkout_reminder', 'normal', 1),
('host_booking_request', 'email', 'host_booking_request', 'critical', 1),
('host_booking_accepted', 'email', 'host_booking_accepted', 'high', 1),
('host_booking_declined', 'email', 'host_booking_declined', 'high', 1),

-- Payment System
('payment_failed', 'email', 'payment_failed', 'critical', 1),
('payment_refund_initiated', 'email', 'payment_refund_initiated', 'high', 1),
('payment_refund_completed', 'email', 'payment_refund_completed', 'high', 1),
('payment_reminder', 'email', 'payment_reminder', 'normal', 1),
('invoice_generated', 'email', 'invoice_generated', 'normal', 1),

-- User Management
('account_verification', 'email', 'account_verification', 'high', 1),
('password_reset_request', 'email', 'password_reset_request', 'high', 1),
('password_changed', 'email', 'password_changed', 'normal', 1),
('account_deactivated', 'email', 'account_deactivated', 'high', 1),
('account_reactivated', 'email', 'account_reactivated', 'normal', 1),
('two_factor_enabled', 'email', 'two_factor_enabled', 'normal', 1),
('two_factor_disabled', 'email', 'two_factor_disabled', 'normal', 1),

-- Review System
('review_request', 'email', 'review_request', 'normal', 1),
('review_received_host', 'email', 'review_received_host', 'normal', 1),
('review_response', 'email', 'review_response', 'normal', 1),
('review_published', 'email', 'review_published', 'low', 1),

-- Wishlist
('wishlist_price_drop', 'email', 'wishlist_price_drop', 'normal', 1),
('wishlist_property_available', 'email', 'wishlist_property_available', 'normal', 1),

-- Administrative
('admin_new_user', 'email', 'admin_new_user', 'normal', 1),
('admin_new_booking', 'email', 'admin_new_booking', 'normal', 1),
('admin_payment_dispute', 'email', 'admin_payment_dispute', 'critical', 1),
('admin_security_alert', 'email', 'admin_security_alert', 'critical', 1),
('admin_system_alert', 'email', 'admin_system_alert', 'critical', 1),
('admin_report_generated', 'email', 'admin_report_generated', 'low', 1),

-- Marketing
('special_offer', 'email', 'special_offer', 'normal', 1),
('property_featured', 'email', 'property_featured', 'normal', 1),
('loyalty_program_update', 'email', 'loyalty_program_update', 'low', 1),
('referral_program', 'email', 'referral_program', 'normal', 1),

-- Mobile Notifications
('booking_confirmation', 'push', 'mobile_booking_confirmation', 'high', 1),
('booking_cancellation', 'push', 'mobile_booking_cancellation', 'high', 1),
('checkin_reminder', 'push', 'mobile_checkin_reminder', 'high', 1),
('host_booking_request', 'push', 'mobile_host_booking_request', 'critical', 1),
('host_booking_accepted', 'push', 'mobile_host_booking_accepted', 'high', 1),
('payment_confirmation', 'push', 'mobile_payment_confirmation', 'high', 1),
('payment_failed', 'push', 'mobile_payment_failed', 'critical', 1),
('payment_refund_completed', 'push', 'mobile_payment_refund_completed', 'high', 1),
('review_request', 'push', 'mobile_review_request', 'normal', 1),
('wishlist_price_drop', 'push', 'mobile_wishlist_price_drop', 'normal', 1),
('account_security', 'push', 'mobile_account_security', 'critical', 1),
('marketing_offer', 'push', 'mobile_marketing_offer', 'normal', 1);