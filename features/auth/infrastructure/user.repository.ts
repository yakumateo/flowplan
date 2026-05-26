/**
 * features/auth/infrastructure/user.repository.ts
 * Repositorio de usuarios — ÚNICA capa que accede a Prisma para auth.
 * Capa: infrastructure.
 */

import { prisma } from '@/shared/infrastructure/db'
import type { RegisterUserInput } from '../domain/user.entity'

/** Busca un usuario por email */
async function findByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      name: true,
      image: true,
      emailVerified: true,
    },
  })
}

/** Busca un usuario por ID */
async function findById(id: string) {
  return prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      name: true,
      image: true,
      emailVerified: true,
    },
  })
}

/**
 * Crea un nuevo usuario con su UserSettings por defecto.
 * Usa transacción para garantizar atomicidad.
 * La contraseña ya debe venir hasheada.
 */
async function createWithSettings(
  data: RegisterUserInput & { passwordHash: string },
) {
  return prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        email: data.email,
        name: data.name,
        // password no está en el schema de Prisma — NextAuth con Credentials
        // guarda el hash en la tabla Account o en un campo extendido.
        // Por simplicidad en esta fase, guardamos el hash en un campo temporal.
        // TODO: mover a tabla Account con provider='credentials' en siguiente iteración.
      },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        emailVerified: true,
        createdAt: true,
      },
    })

    // UserSettings con valores por defecto
    await tx.userSettings.create({
      data: {
        userId: user.id,
        dayStartHour: 7,
        dayEndHour: 22,
        defaultDuration: 60,
        theme: 'dark',
        timezone: 'America/Lima',
        aiCallsToday: 0,
        aiCallsLimit: 20,
      },
    })

    // Guardar password hash en Account table (patrón NextAuth Credentials)
    await tx.account.create({
      data: {
        userId: user.id,
        type: 'credentials',
        provider: 'credentials',
        providerAccountId: user.id,
        // Guardamos el hash en refresh_token como campo disponible
        // En producción considerar campo custom en User
        refresh_token: data.passwordHash,
      },
    })

    return user
  })
}

/** Obtiene el hash de contraseña almacenado en Account para verificación */
async function getPasswordHash(userId: string): Promise<string | null> {
  const account = await prisma.account.findFirst({
    where: { userId, provider: 'credentials' },
    select: { refresh_token: true },
  })
  return account?.refresh_token ?? null
}

export const userRepository = {
  findByEmail,
  findById,
  createWithSettings,
  getPasswordHash,
}
