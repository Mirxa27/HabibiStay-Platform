
-- Remove sample data
DELETE FROM reviews WHERE user_id IN ('guest1', 'guest2', 'guest4');
DELETE FROM bookings WHERE user_id IN ('guest1', 'guest2', 'guest3');
DELETE FROM properties WHERE user_id IN ('owner1', 'owner2', 'owner3', 'owner4', 'owner5', 'owner6');
DELETE FROM admin_settings WHERE key IN ('site_maintenance', 'booking_commission', 'featured_property_fee', 'max_properties_per_owner', 'guest_support_email', 'owner_support_email', 'investor_support_email');
