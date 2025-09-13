#!/usr/bin/env node

/**
 * Environment Validation Script
 * Validates environment variables and configuration before deployment
 */

import { config } from 'dotenv';
import { existsSync } from 'fs';
import path from 'path';

// Load environment variables
config();

// Color codes for console output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
};

// Print colored messages
const printError = (msg) => console.log(`${colors.red}[ERROR]${colors.reset} ${msg}`);
const printWarning = (msg) => console.log(`${colors.yellow}[WARNING]${colors.reset} ${msg}`);
const printSuccess = (msg) => console.log(`${colors.green}[SUCCESS]${colors.reset} ${msg}`);
const printInfo = (msg) => console.log(`${colors.blue}[INFO]${colors.reset} ${msg}`);

// Environment validation rules
const validationRules = {
  // Critical - Required for basic functionality
  critical: [
    {
      key: 'DB_URL',
      description: 'Database connection string',
      validator: (value) => value && (value.startsWith('postgresql://') || value.includes('.sql')),
      example: 'postgresql://user:pass@localhost:5432/habibistay'
    },
    {
      key: 'JWT_SECRET',
      description: 'JWT signing secret',
      validator: (value) => value && value.length >= 32,
      example: 'A secure random string at least 32 characters long'
    },
    {
      key: 'SESSION_SECRET',
      description: 'Session encryption secret',
      validator: (value) => value && value.length >= 32,
      example: 'A secure random string at least 32 characters long'
    }
  ],
  
  // Important - Required for production
  important: [
    {
      key: 'NODE_ENV',
      description: 'Application environment',
      validator: (value) => ['development', 'production', 'test'].includes(value),
      example: 'production'
    },
    {
      key: 'FRONTEND_URL',
      description: 'Frontend application URL',
      validator: (value) => value && (value.startsWith('http://') || value.startsWith('https://')),
      example: 'https://habibistay.com'
    },
    {
      key: 'API_URL',
      description: 'Backend API URL',
      validator: (value) => value && (value.startsWith('http://') || value.startsWith('https://')),
      example: 'https://api.habibistay.com'
    }
  ],
  
  // Features - Required for specific functionality
  features: [
    {
      key: 'OPENAI_API_KEY',
      description: 'OpenAI API key for AI chat',
      validator: (value) => value && value.startsWith('sk-'),
      example: 'sk-your_openai_api_key_here',
      feature: 'AI Chat'
    },
    {
      key: 'MYFATOORAH_API_KEY',
      description: 'MyFatoorah payment gateway API key',
      validator: (value) => value && value.length > 10,
      example: 'your_myfatoorah_api_key',
      feature: 'Payments'
    },
    {
      key: 'GETMOCHA_CLIENT_ID',
      description: '@getmocha OAuth client ID',
      validator: (value) => value && value.length > 5,
      example: 'your_getmocha_client_id',
      feature: 'Authentication'
    },
    {
      key: 'RESEND_API_KEY',
      description: 'Resend email service API key',
      validator: (value) => value && value.startsWith('re_'),
      example: 're_your_resend_api_key',
      feature: 'Email Notifications'
    }
  ],
  
  // Optional - Enhanced functionality
  optional: [
    {
      key: 'PAYPAL_CLIENT_ID',
      description: 'PayPal client ID for international payments',
      validator: (value) => !value || value.length > 10,
      example: 'your_paypal_client_id'
    },
    {
      key: 'R2_BUCKET_NAME',
      description: 'Cloudflare R2 bucket for file uploads',
      validator: (value) => !value || value.length > 0,
      example: 'habibistay-images'
    },
    {
      key: 'SENTRY_DSN',
      description: 'Sentry error tracking DSN',
      validator: (value) => !value || value.startsWith('https://'),
      example: 'https://your_sentry_dsn'
    },
    {
      key: 'REDIS_URL',
      description: 'Redis connection for caching and rate limiting',
      validator: (value) => !value || value.startsWith('redis://'),
      example: 'redis://localhost:6379'
    }
  ]
};

// Validation results
let validationResults = {
  critical: { passed: 0, failed: 0, issues: [] },
  important: { passed: 0, failed: 0, issues: [] },
  features: { passed: 0, failed: 0, issues: [] },
  optional: { passed: 0, failed: 0, issues: [] }
};

// Validate a group of environment variables
function validateGroup(groupName, rules) {
  printInfo(`Validating ${groupName} configuration...`);
  
  rules.forEach(rule => {
    const value = process.env[rule.key];
    const isValid = rule.validator(value);
    
    if (isValid) {
      validationResults[groupName].passed++;
    } else {
      validationResults[groupName].failed++;
      validationResults[groupName].issues.push({
        key: rule.key,
        description: rule.description,
        example: rule.example,
        feature: rule.feature || null,
        current: value ? '[SET BUT INVALID]' : '[NOT SET]'
      });
    }
  });
}

// Print validation summary for a group
function printGroupSummary(groupName, results) {
  const total = results.passed + results.failed;
  const percentage = total > 0 ? Math.round((results.passed / total) * 100) : 0;
  
  if (results.failed === 0) {
    printSuccess(`${groupName.toUpperCase()}: ${results.passed}/${total} (${percentage}%) ✓`);
  } else if (results.passed > 0) {
    printWarning(`${groupName.toUpperCase()}: ${results.passed}/${total} (${percentage}%) - ${results.failed} issues`);
  } else {
    printError(`${groupName.toUpperCase()}: ${results.passed}/${total} (${percentage}%) - ${results.failed} issues`);
  }
}

// Print detailed issues
function printIssues(groupName, issues) {
  if (issues.length === 0) return;
  
  console.log(`\n${colors.yellow}${groupName.toUpperCase()} ISSUES:${colors.reset}`);
  issues.forEach(issue => {
    console.log(`  ❌ ${issue.key} ${issue.current}`);
    console.log(`     Description: ${issue.description}`);
    if (issue.feature) {
      console.log(`     Required for: ${issue.feature}`);
    }
    console.log(`     Example: ${issue.example}`);
    console.log();
  });
}

// Check file permissions and structure
function checkFileStructure() {
  printInfo('Checking project structure...');
  
  const requiredFiles = [
    '.env',
    'package.json',
    'src/worker/index.ts',
    'src/react-app/App.tsx',
    'migrations'
  ];
  
  const missingFiles = [];
  
  requiredFiles.forEach(file => {
    if (!existsSync(path.resolve(file))) {
      missingFiles.push(file);
    }
  });
  
  if (missingFiles.length > 0) {
    printError('Missing required files:');
    missingFiles.forEach(file => console.log(`  - ${file}`));
    return false;
  } else {
    printSuccess('Project structure is valid');
    return true;
  }
}

// Generate deployment readiness report
function generateReport() {
  console.log(`\n${colors.blue}==================================${colors.reset}`);
  console.log(`${colors.blue}  DEPLOYMENT READINESS REPORT     ${colors.reset}`);
  console.log(`${colors.blue}==================================${colors.reset}\n`);
  
  // Print group summaries
  Object.keys(validationResults).forEach(group => {
    printGroupSummary(group, validationResults[group]);
  });
  
  // Calculate overall readiness
  const criticalReady = validationResults.critical.failed === 0;
  const importantReady = validationResults.important.failed === 0;
  const hasFeatures = validationResults.features.passed > 0;
  
  console.log('\n' + '='.repeat(40));
  
  if (criticalReady && importantReady && hasFeatures) {
    printSuccess('🚀 READY FOR PRODUCTION DEPLOYMENT');
    console.log('   All critical and important variables are configured.');
    console.log('   Essential features are available.');
  } else if (criticalReady && importantReady) {
    printWarning('⚠️  READY FOR BASIC DEPLOYMENT');
    console.log('   Core functionality will work, but some features may be limited.');
  } else if (criticalReady) {
    printWarning('🔧 DEVELOPMENT READY ONLY');
    console.log('   Basic development setup complete, but not ready for production.');
  } else {
    printError('❌ NOT READY FOR DEPLOYMENT');
    console.log('   Critical configuration issues must be resolved first.');
  }
  
  console.log('\n' + '='.repeat(40));
  
  // Print detailed issues
  Object.keys(validationResults).forEach(group => {
    if (validationResults[group].issues.length > 0) {
      printIssues(group, validationResults[group].issues);
    }
  });
  
  // Print recommendations
  console.log(`${colors.blue}RECOMMENDATIONS:${colors.reset}`);
  
  if (!criticalReady) {
    console.log('1. 🔴 Fix all CRITICAL configuration issues before proceeding');
  }
  
  if (!importantReady) {
    console.log('2. 🟡 Configure IMPORTANT settings for production deployment');
  }
  
  if (validationResults.features.failed > 0) {
    console.log('3. 🔵 Add FEATURE API keys to enable full functionality');
  }
  
  if (validationResults.optional.failed > 0) {
    console.log('4. ⚪ Consider adding OPTIONAL services for enhanced features');
  }
  
  console.log('5. 📖 See .env.example for all available configuration options');
  console.log('6. 🔒 Use environment variable management tools for production secrets');
  
  return criticalReady;
}

// Main validation function
function main() {
  console.log(`${colors.green}HabibiStay Environment Validator${colors.reset}\n`);
  
  // Check if .env file exists
  if (!existsSync('.env')) {
    printError('.env file not found');
    console.log('Run: cp .env.example .env');
    process.exit(1);
  }
  
  // Check file structure
  if (!checkFileStructure()) {
    process.exit(1);
  }
  
  // Validate each group
  Object.keys(validationRules).forEach(group => {
    validateGroup(group, validationRules[group]);
  });
  
  // Generate and print report
  const isReady = generateReport();
  
  // Exit with appropriate code
  process.exit(isReady ? 0 : 1);
}

// Run validation if script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}