-- Remove default email templates
DELETE FROM email_templates WHERE template_key IN ('booking_confirmation', 'payment_success', 'welcome');