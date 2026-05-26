/**
 * shared/infrastructure/dev-auth.ts
 * Helper de autenticación con bypass para desarrollo.
 *
 * SOLO activo si:
 *   NODE_ENV === 'development' AND NEXT_PUBLIC_DEV_BYPASS === 'true'
 *
 * En ese modo, retorna una sesión simulada sin necesidad de login,
 * y garantiza que el usuario de desarrollo exista en la DB (upsert).
 *
 * En producción o sin bypass: delega a auth() de NextAuth normalmente.
 *
 * IMPORTANTE: NEXT_PUBLIC_DEV_BYPASS es un string, no booleano.
 * No usar para nada sensible — es solo para acelerar el desarrollo local.
 */

import { auth } from '@/features/auth/infrastructure/auth.config'
import { prisma } from './db'

const DEV_USER_ID = 'dev-user-id-local-only'
const DEV_USER_EMAIL = 'dev@flowplan.local'
const DEV_USER_NAME = 'Dev User'

/** Sesión simulada para desarrollo */
const DEV_SESSION = {
  user: {
    id: DEV_USER_ID,
    email: DEV_USER_EMAIL,
    name: DEV_USER_NAME,
    image: null,
  },
  expires: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(), // 24h
}

/** Garantiza que el usuario dev existe en la DB */
async function ensureDevUserExists(): Promise<void> {
  await prisma.$transaction(async (tx) => {
    await tx.user.upsert({
      where: { id: DEV_USER_ID },
      update: {},
      create: {
        id: DEV_USER_ID,
        email: DEV_USER_EMAIL,
        name: DEV_USER_NAME,
      },
    })

    await tx.userSettings.upsert({
      where: { userId: DEV_USER_ID },
      update: {},
      create: {
        userId: DEV_USER_ID,
        dayStartHour: 7,
        dayEndHour: 22,
        defaultDuration: 60,
        theme: 'dark',
        timezone: 'America/Lima',
        aiCallsToday: 0,
        aiCallsLimit: 20,
      },
    })
  })
}

let devUserInitialized = false

/**
 * Obtiene la sesión actual.
 * En dev con bypass activado: retorna sesión simulada (y crea el user si no existe).
 * En producción o sin bypass: llama a auth() de NextAuth.
 */
export async function getSessionOrDevUser() {
  const isBypassActive =
    process.env.NODE_ENV === 'development' &&
    process.env.NEXT_PUBLIC_DEV_BYPASS === 'true'

  if (isBypassActive) {
    // Inicializar el usuario dev solo una vez por proceso
    if (!devUserInitialized) {
      await ensureDevUserExists()
      devUserInitialized = true
    }
    return DEV_SESSION
  }

  // Producción o bypass desactivado: auth() real de NextAuth
  return auth()
}
