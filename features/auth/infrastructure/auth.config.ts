/**
 * features/auth/infrastructure/auth.config.ts
 * Configuración de NextAuth v5 (Auth.js).
 *
 * Exporta: { handlers, signIn, signOut, auth }
 * - `auth` se usa en route handlers para obtener la sesión del servidor.
 * - `handlers` se exporta en app/api/auth/[...nextauth]/route.ts
 *
 * Nota: Este archivo NO puede importarse en el proxy (Edge Runtime)
 * porque usa Prisma y pg (módulos Node.js). Para el proxy usar auth-edge.config.ts
 */

import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'
import Credentials from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from '@/shared/infrastructure/db'
import { z } from 'zod'
import type { NextAuthConfig } from 'next-auth'

const CredentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export const config: NextAuthConfig = {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID ?? '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
    }),
    Credentials({
      name: 'Email y contraseña',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Contraseña', type: 'password' },
      },
      async authorize(credentials) {
        const parsed = CredentialsSchema.safeParse(credentials)
        if (!parsed.success) return null

        // Buscar el usuario en la DB
        const user = await prisma.user.findUnique({
          where: { email: parsed.data.email },
          select: { id: true, email: true, name: true, image: true },
        })
        if (!user) return null

        // Obtener hash almacenado en Account (provider='credentials')
        const account = await prisma.account.findFirst({
          where: { userId: user.id, provider: 'credentials' },
          select: { refresh_token: true },
        })
        if (!account?.refresh_token) return null

        // Verificar contraseña con bcrypt
        const isValid = await bcrypt.compare(
          parsed.data.password,
          account.refresh_token,
        )
        if (!isValid) return null

        return { id: user.id, email: user.email, name: user.name, image: user.image }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      // Persistir el userId en el token JWT en el primer login
      if (user?.id) token.sub = user.id
      return token
    },
    async session({ session, token }) {
      // Hacer disponible el userId en session.user.id
      if (token.sub) session.user.id = token.sub
      return session
    },
  },

  pages: {
    signIn: '/login',
    error: '/login',
  },

  session: { strategy: 'jwt' },
}

export const { handlers, auth, signIn, signOut } = NextAuth(config)
