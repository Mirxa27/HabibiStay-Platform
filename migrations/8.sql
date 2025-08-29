-- Migration 8: Add dynamic pricing tables

-- Property pricing settings
CREATE TABLE IF NOT EXISTS property_pricing_settings (
    property_id INTEGER PRIMARY KEY,
    base_price DECIMAL(10,2) NOT NULL DEFAULT 100.00,
    currency VARCHAR(3) NOT NULL DEFAULT 'SAR',
    minimum_price DECIMAL(10,2) NOT NULL DEFAULT 50.00,
    maximum_price DECIMAL(10,2) NOT NULL DEFAULT 1000.00,
    auto_pricing_enabled BOOLEAN NOT NULL DEFAULT 0,
    update_frequency VARCHAR(10) NOT NULL DEFAULT 'daily',
    early_bird_discount TEXT, -- JSON
    last_minute_discount TEXT, -- JSON
    weekly_discount TEXT, -- JSON
    monthly_discount TEXT, -- JSON
    aggressiveness VARCHAR(20) NOT NULL DEFAULT 'moderate',
    competitor_matching BOOLEAN NOT NULL DEFAULT 0,
    seasonal_adjustment BOOLEAN NOT NULL DEFAULT 1,
    demand_adjustment BOOLEAN NOT NULL DEFAULT 1,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE
);

-- Pricing rules
CREATE TABLE IF NOT EXISTS pricing_rules (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    property_id INTEGER NOT NULL,
    rule_type VARCHAR(50) NOT NULL, -- seasonal, occupancy, advance_booking, etc.
    rule_name VARCHAR(255) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT 1,
    priority INTEGER NOT NULL DEFAULT 1,
    conditions TEXT NOT NULL, -- JSON
    adjustment TEXT NOT NULL, -- JSON
    date_range_start DATE,
    date_range_end DATE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE
);

-- Market data for pricing decisions
CREATE TABLE IF NOT EXISTS market_data (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    property_id INTEGER NOT NULL,
    date DATE NOT NULL,
    local_occupancy_rate DECIMAL(5,2),
    competitor_average_price DECIMAL(10,2),
    demand_level VARCHAR(20), -- low, medium, high, very_high
    special_events TEXT, -- JSON array
    weather_impact VARCHAR(20), -- positive, negative, neutral
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
    UNIQUE(property_id, date)
);

-- Pricing history for analytics
CREATE TABLE IF NOT EXISTS pricing_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    property_id INTEGER NOT NULL,
    date DATE NOT NULL,
    base_price DECIMAL(10,2) NOT NULL,
    final_price DECIMAL(10,2) NOT NULL,
    applied_rules TEXT, -- JSON array of applied rule IDs
    occupancy_rate DECIMAL(5,2),
    bookings_count INTEGER DEFAULT 0,
    revenue DECIMAL(10,2) DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
    UNIQUE(property_id, date)
);

-- Seasonal periods for pricing
CREATE TABLE IF NOT EXISTS seasonal_periods (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(100) NOT NULL,
    start_date VARCHAR(5) NOT NULL, -- MM-DD format
    end_date VARCHAR(5) NOT NULL, -- MM-DD format
    multiplier DECIMAL(4,2) NOT NULL DEFAULT 1.0,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT 1,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Special events affecting pricing
CREATE TABLE IF NOT EXISTS special_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    duration_days INTEGER NOT NULL DEFAULT 1,
    impact_radius_km INTEGER NOT NULL DEFAULT 10,
    price_impact VARCHAR(20) NOT NULL, -- low, medium, high, very_high
    adjustment_percentage DECIMAL(5,2) NOT NULL DEFAULT 0,
    description TEXT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Insert default seasonal periods
INSERT OR IGNORE INTO seasonal_periods (name, start_date, end_date, multiplier, description) VALUES
('Winter Peak', '12-01', '02-28', 1.3, 'Winter holiday season with higher demand'),
('Spring', '03-01', '05-31', 1.0, 'Regular spring season'),
('Summer Peak', '06-01', '08-31', 1.5, 'Summer vacation peak season'),
('Fall', '09-01', '11-30', 1.1, 'Fall season with moderate demand');

-- Insert sample special events
INSERT OR IGNORE INTO special_events (name, date, duration_days, impact_radius_km, price_impact, adjustment_percentage, description) VALUES
('Saudi National Day', '2024-09-23', 3, 50, 'high', 25, 'National celebration affecting accommodation demand'),
('Riyadh Season', '2024-10-15', 120, 25, 'very_high', 40, 'Major entertainment season in Riyadh'),
('Hajj Pilgrimage', '2024-06-15', 10, 100, 'very_high', 60, 'Annual Islamic pilgrimage affecting Mecca and surrounding areas');

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_pricing_rules_property_active ON pricing_rules(property_id, is_active);
CREATE INDEX IF NOT EXISTS idx_market_data_property_date ON market_data(property_id, date);
CREATE INDEX IF NOT EXISTS idx_pricing_history_property_date ON pricing_history(property_id, date);
CREATE INDEX IF NOT EXISTS idx_special_events_date ON special_events(date);