/**
 * shared/infrastructure/db.ts
 * Prisma client singleton con adapter pg (requerido por Prisma v7).
 *
 * Prisma v7 eliminó el query engine nativo y requiere un driver adapter.
 * Usamos @prisma/adapter-pg con el pool de pg para conexión a PostgreSQL (Supabase).
 */

import { PrismaClient, Prisma } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL

  if (!connectionString) {
    throw new Error('DATABASE_URL env variable is not set')
  }

  const pool = new pg.Pool({ connectionString })
  const adapter = new PrismaPg(pool)

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  })
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Re-export Prisma namespace para usar Prisma.JsonNull en repositorios
export { Prisma }
