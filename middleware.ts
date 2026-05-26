/**
 * middleware.ts — RAÍZ del proyecto (no dentro de /app)
 *
 * Protege todas las rutas del dashboard y API.
 * Usa la config Edge-compatible de NextAuth v5 (sin Prisma).
 *
 * Rutas públicas (sin autenticación):
 *   - /            → redirect a /day
 *   - /login       → página de login
 *   - /register    → página de registro
 *   - /api/auth/*  → handlers de NextAuth (login, callback, etc.)
 *
 * Rutas protegidas:
 *   - /day, /week  → dashboard (redirect a /login si no hay sesión)
 *   - /api/tasks/* → API de tareas (401 si no hay sesión — lo maneja el route handler)
 *   - /api/ai/*    → API de IA
 *   - /api/settings/* → API de settings
 *
 * DEV BYPASS: Si NEXT_PUBLIC_DEV_BYPASS=true en desarrollo,
 * el middleware permite todas las rutas sin verificar sesión.
 * Los route handlers usan getSessionOrDevUser() para inyectar la sesión dev.
 *
 * NOTA: El middleware solo verifica el JWT en el Edge Runtime.
 * Los route handlers realizan una segunda verificación por seguridad en profundidad.
 */

import NextAuth from 'next-auth'
import { edgeAuthConfig } from '@/features/auth/infrastructure/auth-edge.config'

const { auth } = NextAuth(edgeAuthConfig)

export default auth((req) => {
  const { pathname } = req.nextUrl
  const isAuthenticated = !!req.auth?.user

  // ── Dev bypass: en desarrollo con NEXT_PUBLIC_DEV_BYPASS=true ──────────────
  // El middleware deja pasar todo. Los route handlers inyectan la sesión dev.
  const isBypassActive =
    process.env.NODE_ENV === 'development' &&
    process.env.NEXT_PUBLIC_DEV_BYPASS === 'true'

  if (isBypassActive) return undefined

  // ── Rutas de API protegidas ─────────────────────────────────────────────────
  const isProtectedApi =
    pathname.startsWith('/api/') && !pathname.startsWith('/api/auth')

  if (isProtectedApi && !isAuthenticated) {
    return new Response(
      JSON.stringify({ error: 'No autenticado' }),
      {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      },
    )
  }

  // ── Páginas del dashboard sin sesión → /login ───────────────────────────────
  const isDashboardPage =
    pathname.startsWith('/day') ||
    pathname.startsWith('/week') ||
    pathname.startsWith('/settings')

  if (isDashboardPage && !isAuthenticated) {
    const loginUrl = new URL('/login', req.nextUrl.origin)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return Response.redirect(loginUrl)
  }

  // ── Ya autenticado en página de auth → dashboard ────────────────────────────
  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/register')
  if (isAuthPage && isAuthenticated) {
    return Response.redirect(new URL('/day', req.nextUrl.origin))
  }

  return undefined
})

export const config = {
  /*
   * Aplicar middleware a todas las rutas excepto assets estáticos y archivos.
   */
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
