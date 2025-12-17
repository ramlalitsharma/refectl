// Simple MongoDB connection test - no custom configuration
require('dotenv').config({ path: '.env.local' });
const { MongoClient } = require('mongodb');

console.log('=== MongoDB Connection Test ===');
console.log('Node.js version:', process.version);
console.log('MongoDB URI present:', !!process.env.MONGODB_URI);
console.log('');

(async () => {
    try {
        // Use ONLY the URI - no custom options at all
        // Let the driver use its defaults
        const client = new MongoClient(process.env.MONGODB_URI);

        console.log('Connecting to MongoDB Atlas...');
        await client.connect();
        console.log('✅ Successfully connected!');

        // List databases to verify
        const adminDb = client.db().admin();
        const dbs = await adminDb.listDatabases();
        console.log('Databases:', dbs.databases.map(db => db.name).join(', '));

        await client.close();
        console.log('✅ Connection closed successfully');
        process.exit(0);
    } catch (e) {
        console.error('❌ Connection failed!');
        console.error('Error code:', e.code);
        console.error('Error message:', e.message);
        if (e.cause) {
            console.error('Caused by:', e.cause.message || e.cause);
        }
        process.exit(1);
    }
})();
