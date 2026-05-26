/**
 * features/auth/view/components/RegisterForm.tsx
 * Formulario de registro de nueva cuenta.
 * Llama a POST /api/auth/register — lógica en el use case correspondiente.
 */

'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { z } from 'zod'
import { Input } from '@/shared/ui/Input'
import { Button } from '@/shared/ui/Button'

// ---------------------------------------------------------------------------
// Schema de validación (inline, propio de este formulario)
// ---------------------------------------------------------------------------

const RegisterSchema = z
  .object({
    name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(80),
    email: z.string().email('Email inválido'),
    password: z
      .string()
      .min(8, 'La contraseña debe tener al menos 8 caracteres')
      .max(100),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  })

type RegisterInput = z.infer<typeof RegisterSchema>

// ---------------------------------------------------------------------------
// Componente
// ---------------------------------------------------------------------------

export function RegisterForm() {
  const router = useRouter()
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(RegisterSchema),
  })

  async function onSubmit(data: RegisterInput) {
    setServerError(null)

    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: data.name,
        email: data.email,
        password: data.password,
      }),
    })

    if (!res.ok) {
      const body = await res.json().catch(() => ({})) as { error?: string }
      setServerError(body.error ?? 'Error al crear la cuenta. Inténtalo de nuevo.')
      return
    }

    // Registro exitoso → ir al login con parámetro de éxito
    router.push('/login?registered=1')
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="w-full max-w-[400px] flex flex-col gap-6"
    >
      {/* Header */}
      <div className="flex flex-col gap-1.5 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-9 h-9 rounded-[10px] bg-[var(--accent-primary)] flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 14 14" fill="none">
              <rect x="1" y="1" width="5" height="5" rx="1.5" fill="white" />
              <rect x="8" y="1" width="5" height="5" rx="1.5" fill="white" opacity="0.6" />
              <rect x="1" y="8" width="5" height="5" rx="1.5" fill="white" opacity="0.6" />
              <rect x="8" y="8" width="5" height="5" rx="1.5" fill="white" opacity="0.3" />
            </svg>
          </div>
          <span className="text-xl font-bold text-[var(--text-primary)]">FlowPlan</span>
        </div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Crear cuenta</h1>
        <p className="text-sm text-[var(--text-secondary)]">Empieza a planificar con IA</p>
      </div>

      {/* Error del servidor */}
      {serverError && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="px-4 py-3 rounded-[8px] text-sm text-[var(--error)] border border-[var(--error)]/30 bg-[var(--error)]/10"
        >
          {serverError}
        </motion.div>
      )}

      {/* Formulario */}
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
        <Input
          id="register-name"
          label="Nombre"
          placeholder="Tu nombre"
          autoComplete="name"
          error={errors.name?.message}
          {...register('name')}
        />

        <Input
          id="register-email"
          label="Email"
          type="email"
          placeholder="tu@email.com"
          autoComplete="email"
          error={errors.email?.message}
          {...register('email')}
        />

        <Input
          id="register-password"
          label="Contraseña"
          type="password"
          placeholder="Mínimo 8 caracteres"
          autoComplete="new-password"
          error={errors.password?.message}
          {...register('password')}
        />

        <Input
          id="register-confirm-password"
          label="Confirmar contraseña"
          type="password"
          placeholder="Repite la contraseña"
          autoComplete="new-password"
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />

        <Button
          id="register-submit-btn"
          type="submit"
          isLoading={isSubmitting}
          className="w-full mt-1"
        >
          Crear cuenta
        </Button>
      </form>

      {/* Link al login */}
      <p className="text-center text-sm text-[var(--text-secondary)]">
        ¿Ya tienes cuenta?{' '}
        <Link
          href="/login"
          className="text-[var(--accent-primary)] hover:underline font-medium transition-all"
        >
          Iniciar sesión
        </Link>
      </p>
    </motion.div>
  )
}
