// Load environment variables
require('dotenv').config({ path: '.env.local' });

const { MongoClient } = require('mongodb');

console.log('Testing MongoDB connection...');
console.log('URI:', process.env.MONGODB_URI ? 'Found (hidden for security)' : 'NOT FOUND');

(async () => {
    try {
        const client = new MongoClient(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 10000,
            // Do NOT set any TLS options - let the driver use defaults for Atlas SRV
        });

        console.log('Attempting to connect...');
        await client.connect();
        console.log('✅ Successfully connected to MongoDB Atlas!');

        // Try to list databases to verify connection works
        const adminDb = client.db().admin();
        const dbs = await adminDb.listDatabases();
        console.log('Available databases:', dbs.databases.map(db => db.name).join(', '));

        await client.close();
        console.log('Connection closed successfully.');
    } catch (e) {
        console.error('❌ Connection failed!');
        console.error('Error name:', e.name);
        console.error('Error message:', e.message);
        console.error('Full error:', e);
    }
})();
