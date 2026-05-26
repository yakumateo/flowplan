/**
 * types/next-auth.d.ts
 * Extensión de tipos de NextAuth v5 para añadir `id` a session.user.
 * Necesario porque TypeScript no lo incluye por defecto.
 */

import type { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
    } & DefaultSession['user']
  }
}
