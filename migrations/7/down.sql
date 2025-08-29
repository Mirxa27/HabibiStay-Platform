-- Drop tables
DROP TABLE contact_submissions;
DROP TABLE newsletter_subscriptions;

-- Remove email templates
DELETE FROM email_templates WHERE template_key IN ('contact_form_submission', 'contact_form_confirmation', 'newsletter_welcome');