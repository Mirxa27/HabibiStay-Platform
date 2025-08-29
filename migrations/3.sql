
-- Insert sample properties for HabibiStay
INSERT INTO properties (user_id, title, description, location, price_per_night, max_guests, bedrooms, bathrooms, amenities, images, is_featured, is_active) VALUES
('owner1', 'Luxury Executive Suite in Olaya District', 'Modern luxury apartment in the heart of Riyadh''s business district. Perfect for executives and business travelers. Features panoramic city views, high-speed WiFi, and premium amenities.', 'Olaya District, Riyadh', 850, 4, 2, 2, '["WiFi", "Air Conditioning", "Kitchen", "Parking", "TV", "Gym", "Pool", "Concierge"]', '["https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&h=600", "https://images.unsplash.com/photo-1560448204-e1a3ecbdd6cc?auto=format&fit=crop&w=800&h=600", "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&h=600"]', 1, 1),

('owner2', 'Traditional Najdi Villa with Modern Amenities', 'Authentic Saudi experience in a beautifully restored traditional villa. Combines heritage architecture with modern comfort. Perfect for families and cultural enthusiasts.', 'Al-Diriyah, Riyadh', 1200, 8, 4, 3, '["WiFi", "Air Conditioning", "Kitchen", "Parking", "TV", "Traditional Decor", "Garden", "BBQ Area"]', '["https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=800&h=600", "https://images.unsplash.com/photo-1590725175947-49d8c5c4bd8e?auto=format&fit=crop&w=800&h=600", "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&w=800&h=600"]', 1, 1),

('owner3', 'Premium Penthouse in King Fahd District', 'Stunning penthouse with breathtaking views of Riyadh skyline. Features luxury finishes, private terrace, and access to building amenities including spa and fitness center.', 'King Fahd District, Riyadh', 1500, 6, 3, 3, '["WiFi", "Air Conditioning", "Kitchen", "Parking", "TV", "Terrace", "Spa Access", "Fitness Center", "Doorman"]', '["https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=800&h=600", "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&h=600", "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=800&h=600"]', 0, 1),

('owner4', 'Cozy Studio Near King Saud University', 'Perfect for students and young professionals. Modern studio apartment with all essentials. Walking distance to KSU campus and public transportation.', 'Al-Malaz, Riyadh', 350, 2, 1, 1, '["WiFi", "Air Conditioning", "Kitchenette", "Study Desk", "TV", "Laundry"]', '["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&h=600", "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&h=600"]', 0, 1),

('owner5', 'Family Compound in Diplomatic Quarter', 'Spacious family residence in the prestigious Diplomatic Quarter. Ideal for diplomats, executives, and large families. Features multiple bedrooms, garden, and security.', 'Diplomatic Quarter, Riyadh', 2000, 10, 5, 4, '["WiFi", "Air Conditioning", "Kitchen", "Parking", "TV", "Garden", "Security", "Maid Room", "Driver Room"]', '["https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&h=600", "https://images.unsplash.com/photo-1600566752355-35792bedcfea?auto=format&fit=crop&w=800&h=600", "https://images.unsplash.com/photo-1600573472550-8090b5e0745e?auto=format&fit=crop&w=800&h=600"]', 0, 1),

('owner6', 'Modern Apartment in Al-Nakheel District', 'Contemporary 2-bedroom apartment perfect for business travelers and couples. Features modern amenities and easy access to major business centers and shopping malls.', 'Al-Nakheel, Riyadh', 650, 4, 2, 2, '["WiFi", "Air Conditioning", "Kitchen", "Parking", "TV", "Balcony", "Shopping Nearby"]', '["https://images.unsplash.com/photo-1560448075-bb485b067938?auto=format&fit=crop&w=800&h=600", "https://images.unsplash.com/photo-1567767292278-a4f21aa2d36e?auto=format&fit=crop&w=800&h=600"]', 0, 1);

-- Insert sample bookings
INSERT INTO bookings (user_id, property_id, guest_name, guest_email, guest_phone, check_in_date, check_out_date, total_guests, total_amount, status, payment_status) VALUES
('guest1', 1, 'Ahmed Al-Hassan', 'ahmed.hassan@email.com', '+966501234567', '2024-12-28', '2024-12-31', 2, 2550, 'confirmed', 'paid'),
('guest2', 2, 'Sarah Mitchell', 'sarah.mitchell@email.com', '+44987654321', '2025-01-05', '2025-01-10', 6, 6000, 'confirmed', 'paid'),
('guest3', 1, 'Mohammad Al-Rashid', 'mohammad.rashid@email.com', '+966555123456', '2025-01-15', '2025-01-18', 4, 2550, 'pending', 'pending');

-- Insert sample reviews
INSERT INTO reviews (user_id, property_id, booking_id, rating, comment) VALUES
('guest1', 1, 1, 5, 'Absolutely exceptional stay! The property exceeded all expectations. Perfect location, immaculate cleanliness, and Sara was incredibly helpful throughout the booking process.'),
('guest2', 2, 2, 5, 'A truly authentic Saudi experience in a beautiful traditional setting. The villa was stunning and the host was very accommodating. Highly recommend for families.'),
('guest4', 1, NULL, 4, 'Great property in excellent location. Modern amenities and professional service. Would definitely stay again on my next business trip to Riyadh.');

-- Insert admin settings
INSERT INTO admin_settings (key, value) VALUES
('site_maintenance', 'false'),
('booking_commission', '10'),
('featured_property_fee', '500'),
('max_properties_per_owner', '20'),
('guest_support_email', 'support@habibistay.com'),
('owner_support_email', 'owners@habibistay.com'),
('investor_support_email', 'investors@habibistay.com');
