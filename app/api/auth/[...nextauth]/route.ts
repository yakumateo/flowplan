/**
 * app/api/auth/[...nextauth]/route.ts
 * Handler de NextAuth v5 — delega todos los métodos a los handlers generados.
 */

import { handlers } from '@/features/auth/infrastructure/auth.config'

export const { GET, POST } = handlers
