/**
 * app/(auth)/login/page.tsx
 * Página de inicio de sesión — delgada, solo renderiza LoginForm.
 */

import type { Metadata } from 'next'
import { Suspense } from 'react'
import { LoginForm } from '@/features/auth/view/components/LoginForm'

export const metadata: Metadata = {
  title: 'Iniciar sesión — FlowPlan',
  description: 'Accede a tu cuenta de FlowPlan para planificar tu día con IA',
}

export default function LoginPage() {
  return (
    // Suspense es necesario porque LoginForm usa useSearchParams()
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}
