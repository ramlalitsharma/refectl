// Test script for health endpoint
// Run with: node test-health-endpoint.js

const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/health',
  method: 'GET',
};

console.log('🔍 Testing Health Endpoint...\n');
console.log(`Testing: http://${options.hostname}:${options.port}${options.path}\n`);

const req = http.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log('📊 Response Status:', res.statusCode);
    console.log('📋 Response Headers:', JSON.stringify(res.headers, null, 2));
    console.log('\n📦 Response Body:');
    
    try {
      const json = JSON.parse(data);
      console.log(JSON.stringify(json, null, 2));
      
      // Check health status
      if (json.status === 'ok' && json.services?.database === 'connected') {
        console.log('\n✅ Health Check: PASSED');
        console.log('   - Server is running');
        console.log('   - MongoDB is connected');
        console.log(`   - Database: ${json.services.databaseName || 'N/A'}`);
      } else if (json.status === 'degraded') {
        console.log('\n⚠️  Health Check: DEGRADED');
        console.log('   - Server is running');
        console.log('   - MongoDB connection failed');
        console.log(`   - Error: ${json.error || 'Unknown'}`);
      } else {
        console.log('\n❌ Health Check: FAILED');
        console.log('   - Unexpected response format');
      }
    } catch (e) {
      console.log(data);
      console.log('\n❌ Failed to parse JSON response');
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Request Error:', error.message);
  console.log('\n💡 Make sure the server is running:');
  console.log('   npm run dev');
});

req.end();

