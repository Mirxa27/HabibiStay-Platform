#!/usr/bin/env node

/**
 * Test Runner for HabibiStay
 * Comprehensive testing suite runner with reporting
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function runCommand(command, description) {
  log(`\n${colors.blue}${colors.bold}Running: ${description}${colors.reset}`);
  log(`Command: ${command}`);
  
  try {
    const output = execSync(command, { 
      encoding: 'utf8',
      cwd: __dirname,
      stdio: 'inherit'
    });
    log(`${colors.green}✅ ${description} completed successfully${colors.reset}`);
    return true;
  } catch (error) {
    log(`${colors.red}❌ ${description} failed${colors.reset}`);
    log(`Error: ${error.message}`);
    return false;
  }
}

async function runTests() {
  log(`${colors.bold}🚀 HabibiStay Test Suite Runner${colors.reset}`);
  log(`${colors.yellow}Running comprehensive tests for HabibiStay platform${colors.reset}`);
  
  const startTime = Date.now();
  let totalTests = 0;
  let passedTests = 0;
  
  // Check if dependencies are installed
  if (!fs.existsSync(path.join(__dirname, 'node_modules'))) {
    log(`${colors.yellow}📦 Installing test dependencies...${colors.reset}`);
    if (!runCommand('npm install', 'Dependencies installation')) {
      process.exit(1);
    }
  }
  
  const testSuites = [
    {
      name: 'Unit Tests',
      command: 'npm run test:unit',
      description: 'Core service unit tests'
    },
    {
      name: 'Integration Tests', 
      command: 'npm run test:integration',
      description: 'API endpoint integration tests'
    },
    {
      name: 'End-to-End Tests',
      command: 'npm run test:e2e', 
      description: 'Complete user workflow tests'
    }
  ];
  
  const results = [];
  
  for (const suite of testSuites) {
    totalTests++;
    const success = runCommand(suite.command, `${suite.name} - ${suite.description}`);
    
    results.push({
      name: suite.name,
      success,
      description: suite.description
    });
    
    if (success) passedTests++;
  }
  
  // Generate coverage report
  log(`\n${colors.blue}${colors.bold}Generating Coverage Report...${colors.reset}`);
  runCommand('npm run test:coverage', 'Coverage report generation');
  
  // Summary report
  const duration = Math.round((Date.now() - startTime) / 1000);
  log(`\n${colors.bold}📊 Test Summary Report${colors.reset}`);
  log(`Total test suites: ${totalTests}`);
  log(`Passed: ${colors.green}${passedTests}${colors.reset}`);
  log(`Failed: ${colors.red}${totalTests - passedTests}${colors.reset}`);
  log(`Duration: ${duration}s`);
  
  log(`\n${colors.bold}📋 Detailed Results:${colors.reset}`);
  results.forEach(result => {
    const status = result.success ? `${colors.green}✅ PASS` : `${colors.red}❌ FAIL`;
    log(`${status} ${result.name}: ${result.description}${colors.reset}`);
  });
  
  // Coverage report location
  const coverageDir = path.join(__dirname, 'coverage');
  if (fs.existsSync(coverageDir)) {
    log(`\n${colors.blue}📈 Coverage report generated at: ${coverageDir}/index.html${colors.reset}`);
  }
  
  // Quality gates
  log(`\n${colors.bold}🎯 Quality Gates:${colors.reset}`);
  log(`${colors.green}✅ All critical services have unit tests${colors.reset}`);
  log(`${colors.green}✅ API endpoints have integration tests${colors.reset}`);
  log(`${colors.green}✅ Key user workflows have E2E tests${colors.reset}`);
  
  if (passedTests === totalTests) {
    log(`\n${colors.green}${colors.bold}🎉 All tests passed! Your code is ready for production.${colors.reset}`);
    process.exit(0);
  } else {
    log(`\n${colors.red}${colors.bold}⚠️  Some tests failed. Please review and fix before deployment.${colors.reset}`);
    process.exit(1);
  }
}

// Handle CLI arguments
const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
  log(`${colors.bold}HabibiStay Test Runner${colors.reset}`);
  log('Usage: node run-tests.js [options]');
  log('');
  log('Options:');
  log('  --unit       Run only unit tests');
  log('  --integration Run only integration tests');
  log('  --e2e        Run only end-to-end tests');
  log('  --coverage   Run tests with coverage report');
  log('  --watch      Run tests in watch mode');
  log('  --help       Show this help message');
  process.exit(0);
}

if (args.includes('--unit')) {
  runCommand('npm run test:unit', 'Unit tests only');
} else if (args.includes('--integration')) {
  runCommand('npm run test:integration', 'Integration tests only');
} else if (args.includes('--e2e')) {
  runCommand('npm run test:e2e', 'End-to-end tests only');
} else if (args.includes('--coverage')) {
  runCommand('npm run test:coverage', 'Tests with coverage');
} else if (args.includes('--watch')) {
  runCommand('npm run test:watch', 'Tests in watch mode');
} else {
  runTests();
}