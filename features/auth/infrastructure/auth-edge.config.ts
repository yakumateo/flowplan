/**
 * features/auth/infrastructure/auth-edge.config.ts
 * Configuración MÍNIMA de NextAuth para el Edge Runtime (middleware).
 *
 * IMPORTANTE: Esta config NO puede importar Prisma ni @prisma/adapter-pg
 * porque el Edge Runtime de Next.js no soporta módulos nativos de Node.js.
 * Solo define los callbacks de sesión JWT necesarios para verificar el token.
 *
 * La config completa (con providers y Prisma) está en auth.config.ts.
 */

import NextAuth from 'next-auth'
import type { NextAuthConfig } from 'next-auth'

/**
 * Config reducida para Edge: solo verifica el JWT, sin tocar DB.
 * Los providers se omiten aquí — no son necesarios para verificar sesiones.
 */
export const edgeAuthConfig: NextAuthConfig = {
  providers: [],

  callbacks: {
    authorized({ auth, request }) {
      // auth = sesión actual (null si no autenticado)
      // request = NextRequest entrante
      const { pathname } = request.nextUrl

      // Rutas públicas — siempre accesibles
      const isPublicPage = pathname === '/' ||
        pathname.startsWith('/login') ||
        pathname.startsWith('/register')

      // Rutas de API pública — NextAuth handlers
      const isAuthApi = pathname.startsWith('/api/auth')

      if (isPublicPage || isAuthApi) return true

      // Para cualquier otra ruta: requiere sesión
      return !!auth?.user
    },
  },

  pages: {
    signIn: '/login',
    error: '/login',
  },

  session: { strategy: 'jwt' },
}

export const { auth: edgeAuth } = NextAuth(edgeAuthConfig)
