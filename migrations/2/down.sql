
DELETE FROM properties WHERE user_id = 'admin';
DELETE FROM admin_settings WHERE key IN ('openai_model', 'sara_personality', 'featured_properties_count', 'booking_confirmation_enabled');
