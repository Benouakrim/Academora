import { PrismaClient } from '@prisma/client';

// Create a singleton instance of Prisma Client
// This prevents multiple instances from being created in development
// and ensures connection pooling works correctly

let prisma;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient({
    log: ['error', 'warn'],
  });
} else {
  // In development, use global to prevent multiple instances during hot-reload
  if (!global.__prisma) {
    global.__prisma = new PrismaClient({
      log: ['query', 'error', 'warn'],
    });
  }
  prisma = global.__prisma;
}

// Handle graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

export default prisma;

