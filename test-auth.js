#!/usr/bin/env node

/**
 * HabibiStay Admin Test Authentication Helper
 * 
 * This script helps generate test authentication tokens for admin users
 * to test the HabibiStay application without going through OAuth flow.
 * 
 * Usage: node test-auth.js [email]
 */

import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import fs from 'fs';

// Configuration (should match your application settings)
const JWT_SECRET = process.env.JWT_SECRET || 'habibistay-super-secret-key-change-in-production';
const JWT_ALGORITHM = 'HS256';

// Test users
const testUsers = {
  'admin@habibistay.com': {
    id: 'admin-test-12345',
    email: 'admin@habibistay.com',
    name: 'HabibiStay Admin',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&h=300',
    phone: '+966-55-0800-669'
  },
  'owner@habibistay.com': {
    id: 'admin-owner-67890',
    email: 'owner@habibistay.com',
    name: 'Property Owner Admin',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&h=300',
    phone: '+966-55-0800-670'
  },
  'host@habibistay.com': {
    id: 'host-test-11111',
    email: 'host@habibistay.com',
    name: 'Test Property Host',
    role: 'host',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b9c11e97?auto=format&fit=crop&w=300&h=300',
    phone: '+966-55-0800-671'
  },
  'guest@habibistay.com': {
    id: 'guest-test-22222',
    email: 'guest@habibistay.com',
    name: 'Test Guest User',
    role: 'guest',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&h=300',
    phone: '+966-55-0800-672'
  }
};

function generateSessionId() {
  return crypto.randomBytes(16).toString('hex');
}

function generateAccessToken(user) {
  const sessionId = generateSessionId();
  
  const payload = {
    sub: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    sessionId,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // 24 hours
    iss: 'habibistay',
    aud: 'habibistay-app'
  };

  return jwt.sign(payload, JWT_SECRET, { algorithm: JWT_ALGORITHM });
}

function generateRefreshToken(user) {
  const sessionId = generateSessionId();
  
  const payload = {
    sub: user.id,
    sessionId,
    tokenVersion: 1,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60), // 30 days
    iss: 'habibistay',
    aud: 'habibistay-refresh'
  };

  return jwt.sign(payload, JWT_SECRET, { algorithm: JWT_ALGORITHM });
}

function main() {
  const requestedEmail = process.argv[2] || 'admin@habibistay.com';
  
  if (!testUsers[requestedEmail]) {
    console.error(`❌ User not found: ${requestedEmail}`);
    console.log('\n📋 Available test users:');
    Object.values(testUsers).forEach(user => {
      console.log(`   • ${user.email} (${user.role}) - ${user.name}`);
    });
    process.exit(1);
  }

  const user = testUsers[requestedEmail];
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  console.log('🎉 HabibiStay Test Authentication Tokens Generated!\n');
  
  console.log('👤 User Details:');
  console.log(`   ID:    ${user.id}`);
  console.log(`   Email: ${user.email}`);
  console.log(`   Name:  ${user.name}`);
  console.log(`   Role:  ${user.role}`);
  console.log(`   Phone: ${user.phone}\n`);

  console.log('🔑 Access Token (expires in 24 hours):');
  console.log(`   ${accessToken}\n`);

  console.log('🔄 Refresh Token (expires in 30 days):');
  console.log(`   ${refreshToken}\n`);

  console.log('🚀 How to use:');
  console.log('   1. Copy the access token above');
  console.log('   2. Add it to your API requests as a Bearer token:');
  console.log(`      Authorization: Bearer ${accessToken.substring(0, 20)}...`);
  console.log('   3. Or use browser dev tools to set localStorage:');
  console.log(`      localStorage.setItem('auth_token', '${accessToken.substring(0, 20)}...')\n`);

  console.log('🌐 Admin Dashboard URLs:');
  console.log('   Local:  http://localhost:8787/admin');
  console.log('   Admin:  http://localhost:8787/admin/dashboard');
  console.log('   Stats:  http://localhost:8787/api/admin/stats');

  // Save to file for easy access
  const authData = {
    user,
    tokens: {
      access_token: accessToken,
      refresh_token: refreshToken,
      token_type: 'Bearer',
      expires_in: 86400
    },
    generated_at: new Date().toISOString()
  };

  fs.writeFileSync('test-auth-tokens.json', JSON.stringify(authData, null, 2));
  console.log('\n💾 Tokens saved to: test-auth-tokens.json');
}

main();