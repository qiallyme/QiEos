#!/usr/bin/env node

// Quick test script to verify endpoints work

const SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ3cWtoam5rdW1td3R2ZnhncW1sIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjAwMzA0OSwiZXhwIjoyMDcxNTc5MDQ5fQ.IonJfbD_34jImKfPIfdEwUHPhLx0bnMRniq2wJ3Uqmc";

async function testEndpoint(url, options = {}) {
  try {
    const response = await fetch(url, options);
    const data = await response.json();
    console.log(`✅ ${url}: ${response.status} - ${JSON.stringify(data).substring(0, 100)}...`);
    return { success: true, data };
  } catch (error) {
    console.log(`❌ ${url}: ERROR - ${error.message}`);
    return { success: false, error };
  }
}

async function runTests() {
  console.log('🧪 Testing QiEOS Endpoints...\n');

  // Test public endpoints
  await testEndpoint('http://localhost:8787/health');
  await testEndpoint('http://localhost:8787/api/apps');
  await testEndpoint('http://localhost:8787/kb/public');

  // Test admin endpoints (no auth)
  await testEndpoint('http://localhost:8787/admin-test/kb');
  await testEndpoint('http://localhost:8787/admin-test/orgs');
  await testEndpoint('http://localhost:8787/admin-test/contacts');

  // Test private endpoints with service role
  await testEndpoint('http://localhost:8787/kb/private', {
    headers: { 'Authorization': `Bearer ${SERVICE_ROLE_KEY}` }
  });

  await testEndpoint('http://localhost:8787/orgs', {
    headers: { 'Authorization': `Bearer ${SERVICE_ROLE_KEY}` }
  });

  await testEndpoint('http://localhost:8787/crm/contacts', {
    headers: { 'Authorization': `Bearer ${SERVICE_ROLE_KEY}` }
  });

  console.log('\n🎯 Test complete!');
}

runTests().catch(console.error);
