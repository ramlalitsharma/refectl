
require('dotenv').config({ path: '.env.local' });
const { MongoClient } = require('mongodb');

async function testConnection() {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
        console.error('❌ MONGODB_URI is missing from .env.local');
        return;
    }

    console.log('Testing MongoDB connection...');
    // Mask password for safety
    const maskedUri = uri.replace(/:([^:@]+)@/, ':****@');
    console.log(`URI: ${maskedUri}`);

    try {
        const client = new MongoClient(uri, {
            connectTimeoutMS: 5000,
            serverSelectionTimeoutMS: 5000,
        });
        await client.connect();
        console.log('✅ Connected successfully!');

        const db = client.db('lms');
        console.log(`Database: ${db.databaseName}`);

        const collections = await db.listCollections().toArray();
        console.log('Collections:', collections.map(c => c.name).join(', '));

        if (collections.length > 0) {
            const firstCol = collections[0].name;
            console.log(`Reading from ${firstCol}...`);
            const doc = await db.collection(firstCol).findOne({});
            console.log('Sample doc found:', !!doc);
        } else {
            console.warn('⚠️ No collections found in lms database!');
        }

        await client.close();
    } catch (error) {
        console.error('❌ Connection Failed:', error.message);
        if (error.code) console.error('Error Code:', error.code);
        if (error.cause) console.error('Cause:', error.cause);
    }
}

testConnection();
