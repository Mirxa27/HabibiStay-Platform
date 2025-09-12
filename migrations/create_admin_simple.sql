-- Create Admin User for Testing HabibiStay Application (Simplified Version)
-- This script creates admin users without complex permissions

-- Insert primary admin user
INSERT OR REPLACE INTO users (
  id, 
  email, 
  name, 
  avatar, 
  phone, 
  role, 
  is_verified, 
  is_active, 
  created_at, 
  updated_at
) VALUES (
  'admin-test-12345',
  'admin@habibistay.com',
  'HabibiStay Admin',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&h=300',
  '+966-55-0800-669',
  'admin',
  1,
  1,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
);

-- Insert secondary admin for testing
INSERT OR REPLACE INTO users (
  id, 
  email, 
  name, 
  avatar, 
  phone, 
  role, 
  is_verified, 
  is_active, 
  created_at, 
  updated_at
) VALUES (
  'admin-owner-67890',
  'owner@habibistay.com',
  'Property Owner Admin',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&h=300',
  '+966-55-0800-670',
  'admin',
  1,
  1,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
);

-- Insert test host user
INSERT OR REPLACE INTO users (
  id, 
  email, 
  name, 
  avatar, 
  phone, 
  role, 
  is_verified, 
  is_active, 
  created_at, 
  updated_at
) VALUES (
  'host-test-11111',
  'host@habibistay.com',
  'Test Property Host',
  'https://images.unsplash.com/photo-1494790108755-2616b9c11e97?auto=format&fit=crop&w=300&h=300',
  '+966-55-0800-671',
  'host',
  1,
  1,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
);

-- Insert test guest user
INSERT OR REPLACE INTO users (
  id, 
  email, 
  name, 
  avatar, 
  phone, 
  role, 
  is_verified, 
  is_active, 
  created_at, 
  updated_at
) VALUES (
  'guest-test-22222',
  'guest@habibistay.com',
  'Test Guest User',
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&h=300',
  '+966-55-0800-672',
  'guest',
  1,
  1,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
);

-- Update admin settings for testing
INSERT OR REPLACE INTO admin_settings (key, value, category, description) VALUES
('testing_mode', 'true', 'system', 'Enable testing mode for development'),
('admin_created_at', datetime('now'), 'system', 'Timestamp when admin accounts were created'),
('default_admin_email', 'admin@habibistay.com', 'system', 'Default admin email for testing');

-- Insert some sample analytics events for admin dashboard
INSERT OR IGNORE INTO analytics_events (event_type, user_id, session_id, event_data, ip_address, created_at) VALUES
('admin_login', 'admin-test-12345', 'session-001', '{"browser": "chrome", "os": "macOS"}', '127.0.0.1', CURRENT_TIMESTAMP),
('dashboard_view', 'admin-test-12345', 'session-001', '{"page": "admin_dashboard"}', '127.0.0.1', CURRENT_TIMESTAMP);