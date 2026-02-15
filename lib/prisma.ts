import { PrismaClient } from '../generated/prisma-client';
import { PrismaPg } from '@prisma/adapter-pg';

const url = process.env.DATABASE_URL || '';

console.log('[Prisma] DATABASE_URL exists:', !!url);
console.log('[Prisma] DATABASE_URL host:', url.includes('db.prisma.io') ? 'db.prisma.io' : 'other');

// For db.prisma.io, use the URL directly without modification
// Prisma 7 with @prisma/adapter-pg handles the connection properly
const isAccelerate = url.startsWith('prisma://') || url.startsWith('prisma+postgres://');

const globalForPrisma = global as unknown as { prisma: PrismaClient | undefined };

const prismaOptions: any = {
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
};

// Use PrismaPg adapter for all standard PostgreSQL connections (including db.prisma.io)
// Only use accelerateUrl for explicit prisma:// protocol URLs
if (isAccelerate) {
  console.log('[Prisma] Using Accelerate mode');
  prismaOptions.accelerateUrl = url;
} else {
  console.log('[Prisma] Using PrismaPg adapter mode');
  prismaOptions.adapter = new PrismaPg({ connectionString: url });
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient(prismaOptions);

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
