-- Migration 10: Enhanced Security and Session Management Tables
-- This migration adds tables for session management, permissions, and audit logging

-- User sessions table for enhanced authentication
CREATE TABLE IF NOT EXISTS user_sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    ip_address TEXT,
    user_agent TEXT,
    expires_at DATETIME NOT NULL,
    is_revoked BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_activity DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Permissions table for RBAC
CREATE TABLE IF NOT EXISTS permissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    permission_name TEXT UNIQUE NOT NULL,
    description TEXT,
    category TEXT DEFAULT 'general',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- User permissions junction table
CREATE TABLE IF NOT EXISTS user_permissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    permission_id INTEGER NOT NULL,
    granted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    granted_by TEXT,
    UNIQUE(user_id, permission_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE,
    FOREIGN KEY (granted_by) REFERENCES users(id)
);

-- Security events table for monitoring suspicious activities
CREATE TABLE IF NOT EXISTS security_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_type TEXT NOT NULL,
    ip_address TEXT,
    user_id TEXT,
    severity TEXT DEFAULT 'medium', -- low, medium, high, critical
    details TEXT, -- JSON
    resolved BOOLEAN DEFAULT 0,
    resolved_by TEXT,
    resolved_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (resolved_by) REFERENCES users(id)
);

-- Booking pricing breakdown table (referenced in BookingService)
CREATE TABLE IF NOT EXISTS booking_pricing (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    booking_id TEXT NOT NULL UNIQUE,
    base_price REAL NOT NULL,
    nights INTEGER NOT NULL,
    subtotal REAL NOT NULL,
    service_fee REAL DEFAULT 0,
    taxes REAL DEFAULT 0,
    discounts REAL DEFAULT 0,
    total_amount REAL NOT NULL,
    breakdown TEXT, -- JSON
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
);

-- Create indexes for performance
CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_expires_at ON user_sessions(expires_at);
CREATE INDEX idx_user_permissions_user_id ON user_permissions(user_id);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp);
CREATE INDEX idx_security_events_ip ON security_events(ip_address);
CREATE INDEX idx_security_events_created_at ON security_events(created_at);
CREATE INDEX idx_booking_pricing_booking_id ON booking_pricing(booking_id);

-- Insert default permissions
INSERT INTO permissions (permission_name, description, category) VALUES
('property.create', 'Create new properties', 'properties'),
('property.update', 'Update property details', 'properties'),
('property.delete', 'Delete properties', 'properties'),
('property.view', 'View property details', 'properties'),
('booking.create', 'Create new bookings', 'bookings'),
('booking.update', 'Update booking details', 'bookings'),
('booking.cancel', 'Cancel bookings', 'bookings'),
('booking.view', 'View booking details', 'bookings'),
('user.create', 'Create new users', 'users'),
('user.update', 'Update user profiles', 'users'),
('user.delete', 'Delete users', 'users'),
('user.view', 'View user profiles', 'users'),
('admin.stats', 'View admin statistics', 'admin'),
('admin.properties', 'Manage all properties', 'admin'),
('admin.bookings', 'Manage all bookings', 'admin'),
('admin.users', 'Manage all users', 'admin'),
('admin.settings', 'Manage system settings', 'admin'),
('payment.process', 'Process payments', 'payments'),
('payment.refund', 'Process refunds', 'payments'),
('review.create', 'Create reviews', 'reviews'),
('review.moderate', 'Moderate reviews', 'reviews'),
('chat.access', 'Access AI chat', 'chat'),
('chat.admin', 'Admin chat features', 'chat');

-- Grant all permissions to admin role (we'll handle this in application code)
-- Grant basic permissions to host role (we'll handle this in application code)
-- Grant minimal permissions to guest role (we'll handle this in application code)