/**
 * features/auth/view/hooks/useAuth.ts
 * Hook de autenticación para el cliente.
 * Expone session, status, y helpers de login/logout.
 */

'use client'

import { useSession, signIn, signOut } from 'next-auth/react'

export function useAuth() {
  const { data: session, status } = useSession()

  return {
    user: session?.user ?? null,
    isAuthenticated: status === 'authenticated',
    isLoading: status === 'loading',
    signIn: (provider?: string) => signIn(provider),
    signOut: () => signOut({ callbackUrl: '/login' }),
  }
}
