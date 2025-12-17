// Test with different TLS options
require('dotenv').config({ path: '.env.local' });
const { MongoClient } = require('mongodb');

const baseUri = process.env.MONGODB_URI;

console.log('=== Testing Multiple Connection Strategies ===\n');

async function testConnection(description, uri, options = {}) {
    console.log(`Testing: ${description}`);
    console.log(`Options: ${JSON.stringify(options)}`);

    try {
        const client = new MongoClient(uri, options);
        await client.connect();
        console.log('✅ SUCCESS!\n');
        await client.close();
        return true;
    } catch (e) {
        console.log('❌ FAILED');
        console.log(`   Error: ${e.code} - ${e.message.substring(0, 100)}\n`);
        return false;
    }
}

(async () => {
    // Test 1: Default (what we've been trying)
    await testConnection(
        'Default (no options)',
        baseUri
    );

    // Test 2: Explicit TLS settings with allow invalid
    await testConnection(
        'With tlsAllowInvalidCertificates',
        baseUri,
        {
            tls: true,
            tlsAllowInvalidCertificates: true,
            tlsAllowInvalidHostnames: true
        }
    );

    // Test 3: Standard TLS (explicit)
    await testConnection(
        'Standard connection string (non-SRV)',
        baseUri.replace('mongodb+srv://', 'mongodb://').replace('/?', ':27017/?tls=true&'),
        { tls: true }
    );

    console.log('=== Tests Complete ===');
    process.exit(0);
})();
