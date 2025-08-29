#!/usr/bin/env node

/**
 * Database Migration Runner for HabibiStay
 * Applies payment system enhancements
 */

const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

async function runMigration() {
  try {
    console.log('🚀 Starting payment system migration...');
    
    // Database path - adjust this based on your setup
    const dbPath = process.env.DATABASE_PATH || './database.db';
    
    if (!fs.existsSync(dbPath)) {
      console.error('❌ Database file not found:', dbPath);
      process.exit(1);
    }
    
    // Backup database first
    const backupPath = `${dbPath}.backup-${Date.now()}`;
    console.log('📦 Creating backup:', backupPath);
    fs.copyFileSync(dbPath, backupPath);
    
    // Open database connection
    const db = new Database(dbPath);
    console.log('📊 Connected to database');
    
    // Read migration file
    const migrationPath = path.join(__dirname, 'payment_enhancement.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    // Split into individual statements
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log(`📝 Executing ${statements.length} migration statements...`);
    
    // Execute migration in transaction
    const migration = db.transaction(() => {
      statements.forEach((statement, index) => {
        try {
          db.exec(statement + ';');
          console.log(`✅ Statement ${index + 1}/${statements.length} executed`);
        } catch (error) {
          console.error(`❌ Error in statement ${index + 1}:`, error.message);
          console.error('Statement:', statement);
          throw error;
        }
      });
    });
    
    migration();
    
    console.log('🎉 Payment system migration completed successfully!');
    console.log('💾 Database backup saved at:', backupPath);
    
    // Close database
    db.close();
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('\n🔧 To restore from backup:');
    console.error(`   cp ${dbPath}.backup-* ${dbPath}`);
    process.exit(1);
  }
}

// Run migration if called directly
if (require.main === module) {
  runMigration();
}

module.exports = { runMigration };