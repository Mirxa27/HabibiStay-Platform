#!/usr/bin/env node

// Comprehensive test runner for HabibiStay platform
// This script runs different test suites and generates reports

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// ANSI color codes for better output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

// Test suites configuration
const testSuites = {
  security: {
    name: 'Security Tests',
    command: 'npx vitest run src/test/security-utils.test.ts',
    description: 'Critical security functionality tests',
    required: true,
  },
  components: {
    name: 'Component Tests', 
    command: 'npx vitest run src/test/**/*.test.tsx',
    description: 'React component and UI tests',
    required: true,
  },
  api: {
    name: 'API Tests',
    command: 'npx vitest run src/test/api-endpoints.test.ts',
    description: 'Backend API endpoint tests',
    required: true,
  },
  e2e: {
    name: 'End-to-End Tests',
    command: 'npx vitest run src/test/e2e-flows.test.tsx',
    description: 'Complete user flow tests',
    required: false,
  },
  coverage: {
    name: 'Coverage Report',
    command: 'npx vitest run --coverage',
    description: 'Generate test coverage report',
    required: false,
  },
};

// Utility functions
function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logHeader(message) {
  log('\n' + '='.repeat(60), 'cyan');
  log(`  ${message}`, 'bright');
  log('='.repeat(60), 'cyan');
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

// Execute command with promise
function executeCommand(command, options = {}) {
  return new Promise((resolve, reject) => {
    const child = exec(command, options, (error, stdout, stderr) => {
      if (error) {
        reject({ error, stdout, stderr });
      } else {
        resolve({ stdout, stderr });
      }
    });

    // Stream output for real-time feedback
    if (options.showOutput) {
      child.stdout.on('data', (data) => process.stdout.write(data));
      child.stderr.on('data', (data) => process.stderr.write(data));
    }
  });
}

// Check if test files exist
function checkTestFiles() {
  logHeader('Checking Test Files');
  
  const testFiles = [
    'src/test/setup.ts',
    'src/test/utils.tsx',
    'src/test/security-utils.test.ts',
    'src/test/ChatBot.test.tsx',
    'src/test/property-search.test.tsx',
    'src/test/booking-system.test.tsx',
    'src/test/api-endpoints.test.ts',
    'src/test/e2e-flows.test.tsx',
    'vitest.config.ts',
  ];

  const missingFiles = testFiles.filter(file => !fs.existsSync(file));
  
  if (missingFiles.length > 0) {
    logError(`Missing test files: ${missingFiles.join(', ')}`);
    return false;
  }
  
  logSuccess('All test files found');
  return true;
}

// Check dependencies
async function checkDependencies() {
  logHeader('Checking Dependencies');
  
  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const requiredDeps = [
      'vitest',
      '@testing-library/react',
      '@testing-library/jest-dom',
      '@testing-library/user-event',
      'jsdom',
    ];
    
    const missingDeps = requiredDeps.filter(dep => 
      !packageJson.devDependencies[dep] && !packageJson.dependencies[dep]
    );
    
    if (missingDeps.length > 0) {
      logWarning(`Missing dependencies: ${missingDeps.join(', ')}`);
      logInfo('Run: npm install to install missing dependencies');
      return false;
    }
    
    logSuccess('All required dependencies found');
    return true;
  } catch (error) {
    logError(`Failed to check dependencies: ${error.message}`);
    return false;
  }
}

// Run individual test suite
async function runTestSuite(suiteKey, suite) {
  logHeader(`Running ${suite.name}`);
  logInfo(suite.description);
  
  try {
    const startTime = Date.now();
    const result = await executeCommand(suite.command, { showOutput: true });
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    
    logSuccess(`${suite.name} completed in ${duration}s`);
    return { success: true, duration, output: result.stdout };
  } catch (error) {
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    logError(`${suite.name} failed after ${duration}s`);
    
    if (error.stderr) {
      log('\nError output:', 'red');
      console.log(error.stderr);
    }
    
    return { success: false, duration, error: error.error };
  }
}

// Generate test report
function generateReport(results) {
  logHeader('Test Report');
  
  const totalSuites = Object.keys(results).length;
  const passedSuites = Object.values(results).filter(r => r.success).length;
  const failedSuites = totalSuites - passedSuites;
  
  log(`\nTest Suites: ${passedSuites} passed, ${failedSuites} failed, ${totalSuites} total`);
  
  Object.entries(results).forEach(([suite, result]) => {
    const status = result.success ? '✅ PASS' : '❌ FAIL';
    const color = result.success ? 'green' : 'red';
    log(`  ${status} ${testSuites[suite].name} (${result.duration}s)`, color);
  });
  
  // Check if all required tests passed
  const requiredSuites = Object.entries(testSuites)
    .filter(([, suite]) => suite.required)
    .map(([key]) => key);
  
  const requiredPassed = requiredSuites.every(suite => results[suite]?.success);
  
  if (requiredPassed) {
    logSuccess('\n🎉 All required tests passed!');
    return true;
  } else {
    logError('\n💥 Some required tests failed!');
    return false;
  }
}

// Main test runner
async function runTests(suites = Object.keys(testSuites)) {
  logHeader('HabibiStay Test Runner');
  logInfo('Running comprehensive test suite for HabibiStay platform');
  
  // Pre-flight checks
  if (!checkTestFiles()) {
    process.exit(1);
  }
  
  if (!(await checkDependencies())) {
    process.exit(1);
  }
  
  // Run test suites
  const results = {};
  
  for (const suiteKey of suites) {
    if (!testSuites[suiteKey]) {
      logWarning(`Unknown test suite: ${suiteKey}`);
      continue;
    }
    
    results[suiteKey] = await runTestSuite(suiteKey, testSuites[suiteKey]);
  }
  
  // Generate report
  const allPassed = generateReport(results);
  
  // Coverage summary
  if (results.coverage?.success) {
    logHeader('Coverage Summary');
    logInfo('Coverage report generated in ./coverage/index.html');
    logInfo('Run: open coverage/index.html to view detailed coverage report');
  }
  
  // Exit with appropriate code
  process.exit(allPassed ? 0 : 1);
}

// Handle command line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    return Object.keys(testSuites);
  }
  
  const validSuites = [];
  const invalidSuites = [];
  
  args.forEach(arg => {
    if (testSuites[arg]) {
      validSuites.push(arg);
    } else {
      invalidSuites.push(arg);
    }
  });
  
  if (invalidSuites.length > 0) {
    logError(`Invalid test suites: ${invalidSuites.join(', ')}`);
    logInfo(`Available suites: ${Object.keys(testSuites).join(', ')}`);
    process.exit(1);
  }
  
  return validSuites;
}

// Show help
function showHelp() {
  log('HabibiStay Test Runner', 'bright');
  log('\nUsage: node scripts/test-runner.js [suite1] [suite2] ...\n');
  
  log('Available test suites:', 'cyan');
  Object.entries(testSuites).forEach(([key, suite]) => {
    const required = suite.required ? ' (required)' : ' (optional)';
    log(`  ${key.padEnd(12)} - ${suite.description}${required}`);
  });
  
  log('\nExamples:', 'yellow');
  log('  node scripts/test-runner.js                    # Run all tests');
  log('  node scripts/test-runner.js security          # Run security tests only');
  log('  node scripts/test-runner.js security api      # Run security and API tests');
  log('  node scripts/test-runner.js coverage          # Generate coverage report');
}

// Entry point
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  showHelp();
  process.exit(0);
}

const suitesToRun = parseArgs();
runTests(suitesToRun).catch(error => {
  logError(`Test runner failed: ${error.message}`);
  process.exit(1);
});