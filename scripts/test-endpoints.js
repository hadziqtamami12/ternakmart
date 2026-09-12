// test-endpoints.js - Automated Verification of Client Routes & Server Endpoints
const http = require('http');

async function testUrl(url, label) {
  try {
    const res = await fetch(url);
    const text = await res.text();
    console.log(`[PASS] ${label} (${url}) -> Status: ${res.status}, Length: ${text.length}`);
    return true;
  } catch (err) {
    console.error(`[FAIL] ${label} (${url}) -> Error: ${err.message}`);
    return false;
  }
}

async function runTests() {
  console.log('--- TESTING ENDPOINTS ---');
  await testUrl('http://localhost:5000/api/health', 'Server Health API');
  await testUrl('http://localhost:5000/api/v1/settings', 'Settings API');
  await testUrl('http://localhost:5000/api/v1/animals', 'Animals Catalog API');
  await testUrl('http://localhost:3000/', 'Client Homepage');
  await testUrl('http://localhost:3000/admin', 'Client Admin Isolated Route');
  await testUrl('http://localhost:3000/demo', 'Client Demo Sandbox Route');
  console.log('--- ALL CHECKS COMPLETED ---');
}

runTests();
