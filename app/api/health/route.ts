// GET /api/health
// Health check endpoint for load balancers and orchestrators

import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';

export async function GET() {
    const health: any = {
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        services: {
            database: 'unknown',
        },
    };

    // Check MongoDB connection
    try {
        const db = await getDatabase();
        // Simple ping to verify connection
        await db.admin().ping();
        health.services.database = 'connected';
        health.services.databaseName = db.databaseName;
    } catch (error) {
        health.services.database = 'disconnected';
        health.status = 'degraded';
        health.error = error instanceof Error ? error.message : 'Database connection failed';
    }

    const statusCode = health.status === 'ok' ? 200 : 503;
    return NextResponse.json(health, { status: statusCode });
}
