#!/usr/bin/env node

/**
 * HabibiStay Database Seeder
 * Seeds initial data: admin user, sample properties, pricing rules, AI config
 * Usage: npm run build && npm run seed
 * Requires: DB_URL in .env, PostgreSQL/D1 connection
 */

import { Pool } from 'pg'; // For PostgreSQL; adjust for D1 if needed
import { config } from 'dotenv';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment
config({ path: path.resolve(process.cwd(), '.env') });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database connection
const pool = new Pool({
  connectionString: process.env.DB_URL,
  max: parseInt(process.env.DB_POOL_SIZE || '10'),
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Types (align with shared/types.ts)
const BookingStatus = { PENDING: 'pending', CONFIRMED: 'confirmed', CANCELLED: 'cancelled' };
const UserRole = { ADMIN: 'admin', OWNER: 'owner', USER: 'user' };
const PropertyStatus = { ACTIVE: 'active', INACTIVE: 'inactive', PENDING: 'pending' };

// Seed functions
async function createAdminUser() {
  const hashedPassword = await bcrypt.hash('admin123', 12); // Change in production
  const adminId = uuidv4();
  
  const query = `
    INSERT INTO users (id, email, password_hash, role, first_name, last_name, phone, is_active, created_at)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
    ON CONFLICT (email) DO NOTHING
    RETURNING id;
  `;
  
  const values = [
    adminId,
    'admin@habibistay.com',
    hashedPassword,
    UserRole.ADMIN,
    'Admin',
    'User',
    '+966501234567',
    true,
  ];
  
  try {
    const result = await pool.query(query, values);
    console.log(`✅ Admin user created: ${result.rows[0]?.id || 'Already exists'}`);
    return result.rows[0]?.id;
  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
    throw error;
  }
}

async function createSampleProperties(adminId) {
  const sampleProperties = [
    {
      title: 'Luxury Riyadh Apartment',
      description: 'Modern 2-bedroom apartment in city center with pool access.',
      location: 'Riyadh, Saudi Arabia',
      price_per_night: 450.00,
      max_guests: 4,
      bedrooms: 2,
      bathrooms: 2,
      amenities: ['wifi', 'pool', 'parking', 'ac', 'kitchen'],
      images: ['https://via.placeholder.com/800x600?text=Riyadh+Apt'],
      owner_id: adminId, // Admin as test owner
      status: PropertyStatus.ACTIVE,
      is_featured: true,
    },
    {
      title: 'Cozy Jeddah Villa',
      description: 'Beachfront villa with private garden and sea views.',
      location: 'Jeddah, Saudi Arabia',
      price_per_night: 750.00,
      max_guests: 6,
      bedrooms: 3,
      bathrooms: 3,
      amenities: ['beach', 'garden', 'wifi', 'parking', 'laundry'],
      images: ['https://via.placeholder.com/800x600?text=Jeddah+Villa'],
      owner_id: adminId,
      status: PropertyStatus.ACTIVE,
      is_featured: false,
    },
    {
      title: 'Downtown Dammam Studio',
      description: 'Compact studio perfect for business travelers.',
      location: 'Dammam, Saudi Arabia',
      price_per_night: 250.00,
      max_guests: 2,
      bedrooms: 1,
      bathrooms: 1,
      amenities: ['wifi', 'ac', 'kitchenette', 'gym'],
      images: ['https://via.placeholder.com/800x600?text=Dammam+Studio'],
      owner_id: adminId,
      status: PropertyStatus.PENDING,
      is_featured: false,
    },
  ];

  const query = `
    INSERT INTO properties (
      id, title, description, location, price_per_night, max_guests, bedrooms, bathrooms,
      amenities, images, owner_id, status, is_featured, created_at
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW())
    ON CONFLICT (id) DO NOTHING
    RETURNING id, title;
  `;

  let createdCount = 0;
  for (const prop of sampleProperties) {
    const propId = uuidv4();
    const values = [
      propId,
      prop.title,
      prop.description,
      prop.location,
      prop.price_per_night,
      prop.max_guests,
      prop.bedrooms,
      prop.bathrooms,
      JSON.stringify(prop.amenities),
      JSON.stringify(prop.images),
      prop.owner_id,
      prop.status,
      prop.is_featured,
    ];

    try {
      const result = await pool.query(query, values);
      if (result.rows.length > 0) {
        console.log(`✅ Property created: ${prop.title} (ID: ${propId})`);
        createdCount++;
      }
    } catch (error) {
      console.error(`❌ Error creating property ${prop.title}:`, error.message);
    }
  }
  
  console.log(`📊 Created ${createdCount} sample properties`);
}

async function createPricingRules() {
  const sampleRules = [
    {
      name: 'Weekend Premium',
      type: 'multiplier',
      value: 1.25,
      applies_to: 'friday,saturday',
      property_id: null, // Global rule
      priority: 1,
      is_active: true,
    },
    {
      name: 'Long Stay Discount',
      type: 'percentage_discount',
      value: 15, // 15%
      min_nights: 7,
      property_id: null,
      priority: 2,
      is_active: true,
    },
    {
      name: 'Peak Season Surcharge',
      type: 'multiplier',
      value: 1.5,
      date_range: '2025-12-01 to 2026-01-05', // Hajj/Christmas
      property_id: null,
      priority: 3,
      is_active: true,
    },
  ];

  const query = `
    INSERT INTO pricing_rules (
      id, name, type, value, applies_to, min_nights, date_range, property_id, priority, is_active, created_at
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
    ON CONFLICT (id) DO NOTHING
    RETURNING id, name;
  `;

  let createdCount = 0;
  for (const rule of sampleRules) {
    const ruleId = uuidv4();
    const values = [
      ruleId,
      rule.name,
      rule.type,
      rule.value,
      rule.applies_to || null,
      rule.min_nights || null,
      rule.date_range || null,
      rule.property_id,
      rule.priority,
      rule.is_active,
    ];

    try {
      const result = await pool.query(query, values);
      if (result.rows.length > 0) {
        console.log(`✅ Pricing rule created: ${rule.name}`);
        createdCount++;
      }
    } catch (error) {
      console.error(`❌ Error creating pricing rule ${rule.name}:`, error.message);
    }
  }
  
  console.log(`📊 Created ${createdCount} pricing rules`);
}

async function createAIConfig() {
  const defaultConfig = {
    provider: 'openai',
    model: process.env.AI_MODEL || 'gpt-4o-mini',
    temperature: parseFloat(process.env.AI_TEMPERATURE || '0.7'),
    max_tokens: parseInt(process.env.AI_MAX_TOKENS || '1000'),
    rate_limit: parseInt(process.env.AI_RATE_LIMIT || '10'),
    moderation_enabled: true,
    api_key_encrypted: null, // Will be set via admin panel; encrypt in production
    is_active: true,
  };

  const query = `
    INSERT INTO ai_config (
      id, provider, model, temperature, max_tokens, rate_limit,
      moderation_enabled, api_key_encrypted, is_active, created_at
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
    ON CONFLICT (id) DO UPDATE SET
      model = EXCLUDED.model,
      temperature = EXCLUDED.temperature,
      max_tokens = EXCLUDED.max_tokens,
      rate_limit = EXCLUDED.rate_limit,
      is_active = EXCLUDED.is_active
    RETURNING id;
  `;

  const configId = uuidv4();
  const values = [
    configId,
    defaultConfig.provider,
    defaultConfig.model,
    defaultConfig.temperature,
    defaultConfig.max_tokens,
    defaultConfig.rate_limit,
    defaultConfig.moderation_enabled,
    defaultConfig.api_key_encrypted,
    defaultConfig.is_active,
  ];

  try {
    const result = await pool.query(query, values);
    console.log(`✅ AI Config initialized: ${defaultConfig.model} model`);
    return result.rows[0]?.id;
  } catch (error) {
    console.error('❌ Error creating AI config:', error.message);
    throw error;
  }
}

async function createSampleBookings(adminId) {
  // Create a few test bookings linked to sample properties
  // Note: This assumes properties exist; in full seed, get property IDs first
  const sampleBookings = [
    {
      guest_id: adminId, // Self-booking for test
      property_id: null, // Will be updated after property creation
      check_in_date: '2025-10-01',
      check_out_date: '2025-10-05',
      guests: 2,
      total_price: 1800.00, // 4 nights x 450 SAR
      status: BookingStatus.CONFIRMED,
      notes: 'Test booking for development',
    },
  ];

  const query = `
    INSERT INTO bookings (
      id, guest_id, property_id, check_in_date, check_out_date, guests,
      total_price, status, notes, created_at
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
    ON CONFLICT (id) DO NOTHING
    RETURNING id;
  `;

  let createdCount = 0;
  for (const booking of sampleBookings) {
    const bookingId = uuidv4();
    // Placeholder property_id; in production, query real IDs
    const values = [
      bookingId,
      booking.guest_id,
      booking.property_id || uuidv4(), // Temp ID
      booking.check_in_date,
      booking.check_out_date,
      booking.guests,
      booking.total_price,
      booking.status,
      booking.notes,
    ];

    try {
      await pool.query(query, values);
      console.log(`✅ Sample booking created: ${booking.check_in_date} to ${booking.check_out_date}`);
      createdCount++;
    } catch (error) {
      console.error(`❌ Error creating booking:`, error.message);
    }
  }
  
  console.log(`📊 Created ${createdCount} sample bookings`);
}

// Main seed execution
async function main() {
  console.log('🌱 Starting HabibiStay database seeding...');
  console.log(`📡 Connecting to: ${process.env.DB_URL?.split('@')[1] || 'Unknown DB'}`);
  
  try {
    // Test connection
    await pool.query('SELECT 1');
    console.log('✅ Database connection successful');

    // Run seeds in order
    const adminId = await createAdminUser();
    await createSampleProperties(adminId);
    await createPricingRules();
    await createAIConfig();
    await createSampleBookings(adminId);

    console.log('\n🎉 Seeding completed successfully!');
    console.log('\n👤 Admin Login: admin@habibistay.com / admin123');
    console.log('🔑 Change password immediately in production');
    console.log('\n🏠 Sample properties available for testing bookings');
    
  } catch (error) {
    console.error('\n💥 Seeding failed:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
    console.log('🔌 Database connection closed');
  }
}

// Handle errors globally
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { createAdminUser, createSampleProperties, createPricingRules, createAIConfig };
