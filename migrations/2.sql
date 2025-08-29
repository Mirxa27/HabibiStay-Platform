
INSERT INTO properties (owner_id, title, description, location, price_per_night, max_guests, bedrooms, bathrooms, amenities, images, is_featured, is_active) VALUES
('admin', 'Luxury Downtown Apartment', 'Experience the heart of Riyadh in this stunning modern apartment with panoramic city views. Perfect for business travelers and luxury seekers.', 'King Fahd District, Riyadh', 850, 4, 2, 2, '["WiFi", "Air Conditioning", "Kitchen", "Parking", "TV", "Gym"]', '["https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&h=600", "https://images.unsplash.com/photo-1560448204-e1a3ecbdd6cc?auto=format&fit=crop&w=800&h=600"]', 1, 1),
('admin', 'Executive Suite with Pool', 'Elegant executive suite featuring a private pool, premium amenities, and concierge service. Ideal for extended stays and important meetings.', 'Al-Malaz District, Riyadh', 1200, 6, 3, 3, '["WiFi", "Pool", "Kitchen", "Parking", "TV", "Gym", "Air Conditioning"]', '["https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&h=600", "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&h=600"]', 1, 1),
('admin', 'Modern Family Villa', 'Spacious family villa in a quiet residential area with garden, multiple bedrooms, and traditional Saudi hospitality touches.', 'Al-Nakheel District, Riyadh', 950, 8, 4, 3, '["WiFi", "Kitchen", "Parking", "TV", "Air Conditioning", "Garden"]', '["https://images.unsplash.com/photo-1602941525421-8f8b81d3edbb?auto=format&fit=crop&w=800&h=600"]', 0, 1),
('admin', 'Business Traveler Studio', 'Compact yet comfortable studio perfect for business travelers. Located near major business districts with excellent connectivity.', 'Olaya District, Riyadh', 450, 2, 1, 1, '["WiFi", "Air Conditioning", "Kitchen", "TV", "Parking"]', '["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&h=600"]', 0, 1);

INSERT INTO admin_settings (key, value) VALUES
('openai_model', 'gpt-4o-mini'),
('sara_personality', 'friendly_professional'),
('featured_properties_count', '2'),
('booking_confirmation_enabled', 'true');
