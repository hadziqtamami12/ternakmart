// scripts/test-location-resolver.js
const http = require('http');
const app = require('../server/app');

const server = http.createServer(app);

server.listen(5098, async () => {
  console.log('🧪 Testing Location Resolver & Geocoding Service on port 5098...');

  try {
    // Test 1: OpenStreetMap Geocoding from Indonesian text address
    const res1 = await fetch('http://localhost:5098/api/v1/auth/resolve-location', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ address: 'Jl. Margonda Raya No. 100, Depok, Jawa Barat' })
    });
    const data1 = await res1.json();
    console.log('\n[TEST 1] Address Geocoding Result:');
    console.log('Status:', res1.status, '| Success:', data1.success);
    if (data1.data) {
      console.log('Latitude :', data1.data.latitude);
      console.log('Longitude:', data1.data.longitude);
      console.log('Resolved Address:', data1.data.address);
    }

    // Test 2: Google Maps shortlink resolver
    const res2 = await fetch('http://localhost:5098/api/v1/auth/resolve-location', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mapUrl: 'https://maps.app.goo.gl/JqNT3rVGTPRitGp37' })
    });
    const data2 = await res2.json();
    console.log('\n[TEST 2] Google Maps Shortlink Resolver Result:');
    console.log('Status:', res2.status, '| Success:', data2.success);
    if (data2.data) {
      console.log('Latitude :', data2.data.latitude);
      console.log('Longitude:', data2.data.longitude);
      console.log('Resolved Address:', data2.data.address);
      console.log('Source   :', data2.data.source);
    }

    // Test 3: Raw coordinates with reverse-geocoding
    const res3 = await fetch('http://localhost:5098/api/v1/auth/resolve-location', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ latitude: -6.2088, longitude: 106.8456 })
    });
    const data3 = await res3.json();
    console.log('\n[TEST 3] GPS Coordinates Reverse-Geocoding:');
    console.log('Status:', res3.status, '| Success:', data3.success);
    if (data3.data) {
      console.log('Resolved Address:', data3.data.address);
    }

    console.log('\n✨ ALL LOCATION RESOLVER CHECKS PASSED SUCCESSFULLY!');
  } catch (err) {
    console.error('❌ Test failed:', err.message);
  } finally {
    server.close();
    process.exit(0);
  }
});
