/**
 * features/auth/view/components/LoginForm.tsx
 * Formulario de inicio de sesión.
 * Componente "tonto": recibe callbacks, la lógica está en NextAuth.
 */

'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { z } from 'zod'
import { Input } from '@/shared/ui/Input'
import { Button } from '@/shared/ui/Button'

// ---------------------------------------------------------------------------
// Schema de validación
// ---------------------------------------------------------------------------

const LoginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'La contraseña es requerida'),
})

type LoginInput = z.infer<typeof LoginSchema>

// ---------------------------------------------------------------------------
// Mensajes de error de NextAuth
// ---------------------------------------------------------------------------

const AUTH_ERRORS: Record<string, string> = {
  CredentialsSignin: 'Email o contraseña incorrectos',
  OAuthSignin: 'Error al conectar con Google',
  OAuthCallback: 'Error al conectar con Google',
  Default: 'Ocurrió un error. Inténtalo de nuevo.',
}

// ---------------------------------------------------------------------------
// Componente
// ---------------------------------------------------------------------------

export function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') ?? '/day'
  const errorParam = searchParams.get('error')

  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [serverError, setServerError] = useState<string | null>(
    errorParam ? (AUTH_ERRORS[errorParam] ?? AUTH_ERRORS.Default) : null,
  )

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(LoginSchema),
  })

  async function onSubmit(data: LoginInput) {
    setServerError(null)
    const result = await signIn('credentials', {
      email: data.email,
      password: data.password,
      redirect: false,
    })

    if (result?.error) {
      setServerError(AUTH_ERRORS[result.error] ?? AUTH_ERRORS.Default)
      return
    }

    router.push(callbackUrl)
    router.refresh()
  }

  async function handleGoogleSignIn() {
    setIsGoogleLoading(true)
    setServerError(null)
    try {
      await signIn('google', { callbackUrl })
    } catch {
      setServerError(AUTH_ERRORS.Default)
      setIsGoogleLoading(false)
    }
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
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Bienvenido de vuelta</h1>
        <p className="text-sm text-[var(--text-secondary)]">Inicia sesión para continuar</p>
      </div>

      {/* Error global */}
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
          id="login-email"
          label="Email"
          type="email"
          placeholder="tu@email.com"
          autoComplete="email"
          error={errors.email?.message}
          {...register('email')}
        />

        <Input
          id="login-password"
          label="Contraseña"
          type="password"
          placeholder="••••••••"
          autoComplete="current-password"
          error={errors.password?.message}
          {...register('password')}
        />

        <Button
          id="login-submit-btn"
          type="submit"
          isLoading={isSubmitting}
          className="w-full mt-1"
        >
          Iniciar sesión
        </Button>
      </form>

      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-[var(--border-subtle)]" />
        <span className="text-xs text-[var(--text-muted)]">o continúa con</span>
        <div className="flex-1 h-px bg-[var(--border-subtle)]" />
      </div>

      {/* Google */}
      <Button
        id="login-google-btn"
        type="button"
        variant="secondary"
        isLoading={isGoogleLoading}
        onClick={handleGoogleSignIn}
        className="w-full"
      >
        <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
        Continuar con Google
      </Button>

      {/* Link a registro */}
      <p className="text-center text-sm text-[var(--text-secondary)]">
        ¿No tienes cuenta?{' '}
        <Link
          href="/register"
          className="text-[var(--accent-primary)] hover:underline font-medium transition-all"
        >
          Crear cuenta
        </Link>
      </p>
    </motion.div>
  )
}
