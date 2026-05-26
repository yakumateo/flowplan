import { redirect } from 'next/navigation'

/**
 * app/page.tsx
 * Redirige a la vista de día por defecto.
 * La autenticación se verificará en el middleware (próxima fase).
 */
export default function HomePage() {
  redirect('/day')
}
