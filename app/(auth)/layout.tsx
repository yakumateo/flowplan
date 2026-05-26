/**
 * app/(auth)/layout.tsx
 * Layout centrado para páginas de autenticación (login, register).
 * Fondo con gradiente sutil y patrón de puntos.
 */

import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  title: 'FlowPlan — Acceso',
  description: 'Inicia sesión o crea tu cuenta en FlowPlan',
}

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div
      className="min-h-screen flex items-center justify-center p-6"
      style={{
        background: `
          radial-gradient(ellipse at 20% 50%, rgba(124, 111, 247, 0.08) 0%, transparent 60%),
          radial-gradient(ellipse at 80% 20%, rgba(52, 211, 153, 0.05) 0%, transparent 50%),
          var(--background)
        `,
      }}
    >
      {/* Patrón de puntos decorativo */}
      <div
        className="fixed inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          backgroundImage: `radial-gradient(circle, var(--border-subtle) 1px, transparent 1px)`,
          backgroundSize: '32px 32px',
          opacity: 0.4,
        }}
      />

      {/* Contenido */}
      <main className="relative z-10 flex items-center justify-center w-full">
        {children}
      </main>
    </div>
  )
}
