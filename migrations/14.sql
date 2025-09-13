-- Add user device tokens table for push notifications
-- This migration creates the table to store user device tokens for push notifications

-- Create user device tokens table
CREATE TABLE IF NOT EXISTS user_device_tokens (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  device_token TEXT NOT NULL,
  device_type TEXT DEFAULT 'mobile', -- mobile, tablet, web
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_device_tokens_user_id ON user_device_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_user_device_tokens_device_token ON user_device_tokens(device_token);
CREATE INDEX IF NOT EXISTS idx_user_device_tokens_created_at ON user_device_tokens(created_at);