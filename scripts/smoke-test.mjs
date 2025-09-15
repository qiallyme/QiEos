#!/usr/bin/env node

/**
 * QiEOS Smoke Test Script
 *
 * This script tests the core endpoints to verify the system is working correctly.
 * Run this after setting up your environment to ensure everything is connected.
 *
 * Usage:
 *   node scripts/smoke-test.mjs [--worker-url=http://localhost:8787] [--service-role-key=your_key]
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration
const DEFAULT_WORKER_URL = 'http://localhost:8787';
const DEFAULT_FASTAPI_URL = 'http://127.0.0.1:7130';

// Parse command line arguments
const args = process.argv.slice(2);
const config = {
  workerUrl: DEFAULT_WORKER_URL,
  fastapiUrl: DEFAULT_FASTAPI_URL,
  serviceRoleKey: null,
  verbose: false,
};

args.forEach(arg => {
  if (arg.startsWith('--worker-url=')) {
    config.workerUrl = arg.split('=')[1];
  } else if (arg.startsWith('--fastapi-url=')) {
    config.fastapiUrl = arg.split('=')[1];
  } else if (arg.startsWith('--service-role-key=')) {
    config.serviceRoleKey = arg.split('=')[1];
  } else if (arg === '--verbose' || arg === '-v') {
    config.verbose = true;
  } else if (arg === '--help' || arg === '-h') {
    console.log(`
QiEOS Smoke Test Script

Usage: node scripts/smoke-test.mjs [options]

Options:
  --worker-url=URL        Worker API URL (default: ${DEFAULT_WORKER_URL})
  --fastapi-url=URL       FastAPI backend URL (default: ${DEFAULT_FASTAPI_URL})
  --service-role-key=KEY  Supabase service role key for admin tests
  --verbose, -v           Show detailed output
  --help, -h              Show this help message

Examples:
  node scripts/smoke-test.mjs
  node scripts/smoke-test.mjs --worker-url=https://your-worker.workers.dev
  node scripts/smoke-test.mjs --service-role-key=your_key --verbose
`);
    process.exit(0);
  }
});

// Test results tracking
const results = {
  passed: 0,
  failed: 0,
  skipped: 0,
  tests: []
};

// Utility functions
function log(message, type = 'info') {
  const timestamp = new Date().toISOString();
  const prefix = {
    info: 'ℹ️',
    success: '✅',
    error: '❌',
    warning: '⚠️',
    skip: '⏭️'
  }[type] || 'ℹ️';

  if (config.verbose || type !== 'info') {
    console.log(`${prefix} [${timestamp}] ${message}`);
  }
}

function logTest(name, status, details = '') {
  results.tests.push({ name, status, details });
  if (status === 'PASS') {
    results.passed++;
    log(`${name}: PASS ${details}`, 'success');
  } else if (status === 'FAIL') {
    results.failed++;
    log(`${name}: FAIL ${details}`, 'error');
  } else {
    results.skipped++;
    log(`${name}: SKIP ${details}`, 'skip');
  }
}

async function makeRequest(url, options = {}) {
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });

    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }

    return {
      ok: response.ok,
      status: response.status,
      data,
      headers: Object.fromEntries(response.headers.entries())
    };
  } catch (error) {
    return {
      ok: false,
      status: 0,
      error: error.message,
      data: null
    };
  }
}

// Test functions
async function testWorkerHealth() {
  log('Testing Worker health endpoint...');
  const result = await makeRequest(`${config.workerUrl}/health`);

  if (result.ok && result.data?.ok) {
    logTest('Worker Health', 'PASS', `Status: ${result.status}`);
    return true;
  } else {
    logTest('Worker Health', 'FAIL', `Status: ${result.status}, Error: ${result.error || result.data?.error || 'Unknown'}`);
    return false;
  }
}

async function testFastAPIHealth() {
  log('Testing FastAPI health endpoint...');
  const result = await makeRequest(`${config.fastapiUrl}/health`);

  if (result.ok && result.data?.ok) {
    logTest('FastAPI Health', 'PASS', `Status: ${result.status}`);
    return true;
  } else {
    logTest('FastAPI Health', 'FAIL', `Status: ${result.status}, Error: ${result.error || result.data?.error || 'Unknown'}`);
    return false;
  }
}

async function testPublicKB() {
  log('Testing public KB endpoint...');
  const result = await makeRequest(`${config.workerUrl}/kb/public`);

  if (result.ok && result.data?.docs) {
    logTest('Public KB', 'PASS', `Found ${result.data.docs.length} docs`);
    return true;
  } else {
    logTest('Public KB', 'FAIL', `Status: ${result.status}, Error: ${result.error || result.data?.error || 'Unknown'}`);
    return false;
  }
}

async function testPrivateKB() {
  log('Testing private KB endpoint...');

  if (!config.serviceRoleKey) {
    logTest('Private KB', 'SKIP', 'No service role key provided');
    return true;
  }

  const result = await makeRequest(`${config.workerUrl}/kb/private`, {
    headers: {
      'Authorization': `Bearer ${config.serviceRoleKey}`
    }
  });

  if (result.ok && Array.isArray(result.data?.docs)) {
    logTest('Private KB', 'PASS', `Found ${result.data.docs.length} docs`);
    return true;
  } else {
    logTest('Private KB', 'FAIL', `Status: ${result.status}, Error: ${result.error || result.data?.error || 'Unknown'}`);
    return false;
  }
}

async function testAppsEndpoint() {
  log('Testing apps endpoint...');
  const result = await makeRequest(`${config.workerUrl}/api/apps`);

  if (result.ok && Array.isArray(result.data)) {
    logTest('Apps Endpoint', 'PASS', `Found ${result.data.length} apps`);
    return true;
  } else {
    logTest('Apps Endpoint', 'FAIL', `Status: ${result.status}, Error: ${result.error || result.data?.error || 'Unknown'}`);
    return false;
  }
}

async function testOrgsEndpoint() {
  log('Testing orgs endpoint...');

  if (!config.serviceRoleKey) {
    logTest('Orgs Endpoint', 'SKIP', 'No service role key provided');
    return true;
  }

  const result = await makeRequest(`${config.workerUrl}/orgs`, {
    headers: {
      'Authorization': `Bearer ${config.serviceRoleKey}`
    }
  });

  if (result.ok && Array.isArray(result.data?.orgs)) {
    logTest('Orgs Endpoint', 'PASS', `Found ${result.data.orgs.length} orgs`);
    return true;
  } else {
    logTest('Orgs Endpoint', 'FAIL', `Status: ${result.status}, Error: ${result.error || result.data?.error || 'Unknown'}`);
    return false;
  }
}

async function testContactsEndpoint() {
  log('Testing contacts endpoint...');

  if (!config.serviceRoleKey) {
    logTest('Contacts Endpoint', 'SKIP', 'No service role key provided');
    return true;
  }

  const result = await makeRequest(`${config.workerUrl}/crm/contacts`, {
    headers: {
      'Authorization': `Bearer ${config.serviceRoleKey}`
    }
  });

  if (result.ok && Array.isArray(result.data?.contacts)) {
    logTest('Contacts Endpoint', 'PASS', `Found ${result.data.contacts.length} contacts`);
    return true;
  } else {
    logTest('Contacts Endpoint', 'FAIL', `Status: ${result.status}, Error: ${result.error || result.data?.error || 'Unknown'}`);
    return false;
  }
}

// Main test runner
async function runTests() {
  log('🚀 Starting QiEOS Smoke Tests', 'info');
  log(`Worker URL: ${config.workerUrl}`, 'info');
  log(`FastAPI URL: ${config.fastapiUrl}`, 'info');
  log(`Service Role Key: ${config.serviceRoleKey ? 'Provided' : 'Not provided'}`, 'info');
  log('', 'info');

  // Test Worker health first
  const workerHealthy = await testWorkerHealth();

  // Test FastAPI health
  const fastapiHealthy = await testFastAPIHealth();

  // Test public endpoints (no auth required)
  await testPublicKB();
  await testAppsEndpoint();

  // Test private endpoints (auth required)
  await testPrivateKB();
  await testOrgsEndpoint();
  await testContactsEndpoint();

  // Summary
  log('', 'info');
  log('📊 Test Summary:', 'info');
  log(`✅ Passed: ${results.passed}`, 'success');
  log(`❌ Failed: ${results.failed}`, results.failed > 0 ? 'error' : 'info');
  log(`⏭️ Skipped: ${results.skipped}`, 'info');

  if (results.failed > 0) {
    log('', 'info');
    log('❌ Some tests failed. Check the output above for details.', 'error');
    log('', 'info');
    log('Common issues:', 'warning');
    log('• Worker not running: Run `pnpm -C workers/api dev`', 'info');
    log('• FastAPI not running: Start your Python backend', 'info');
    log('• Missing service role key: Get it from Supabase dashboard', 'info');
    log('• Database not set up: Run the migration SQL in Supabase', 'info');
    process.exit(1);
  } else {
    log('', 'info');
    log('🎉 All tests passed! Your QiEOS system is working correctly.', 'success');
    process.exit(0);
  }
}

// Handle errors
process.on('unhandledRejection', (error) => {
  log(`Unhandled error: ${error.message}`, 'error');
  process.exit(1);
});

// Run the tests
runTests().catch(error => {
  log(`Test runner error: ${error.message}`, 'error');
  process.exit(1);
});
