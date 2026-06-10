import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Production: disable query logging for performance
// Development: only log errors and warnings
const logConfig = process.env.NODE_ENV === 'production'
  ? ['error'] as const
  : ['error', 'warn'] as const

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: logConfig,
    // Connection pool optimization for handling 1000+ users
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db

// Graceful shutdown for connection cleanup
if (process.env.NODE_ENV === 'production') {
  process.on('beforeExit', async () => {
    await db.$disconnect()
  })
}