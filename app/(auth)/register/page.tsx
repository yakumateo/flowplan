/**
 * app/(auth)/register/page.tsx
 * Página de registro — delgada, solo renderiza RegisterForm.
 */

import type { Metadata } from 'next'
import { RegisterForm } from '@/features/auth/view/components/RegisterForm'

export const metadata: Metadata = {
  title: 'Crear cuenta — FlowPlan',
  description: 'Crea tu cuenta en FlowPlan y empieza a planificar con IA',
}

export default function RegisterPage() {
  return <RegisterForm />
}
