/**
 * app/api/auth/register/route.ts
 * POST /api/auth/register — Registro de nuevos usuarios.
 *
 * Capa DELGADA: valida input Zod → delega al use case → devuelve respuesta.
 * La lógica de negocio (hash, unicidad, creación) está en el use case.
 */

import { NextRequest, NextResponse } from 'next/server'
import { RegisterUserSchema } from '@/features/auth/domain/user.entity'
import {
  registerUserUseCase,
  UserAlreadyExistsError,
} from '@/features/auth/application/register-user.use-case'
import type { ApiErrorResponse } from '@/shared/types'

export async function POST(req: NextRequest) {
  try {
    const body: unknown = await req.json()

    // Validar input con Zod
    const parsed = RegisterUserSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json<ApiErrorResponse>(
        { error: 'Datos inválidos', details: parsed.error.message },
        { status: 422 },
      )
    }

    // Delegar al use case
    const user = await registerUserUseCase(parsed.data)

    return NextResponse.json({ data: user }, { status: 201 })
  } catch (err) {
    if (err instanceof UserAlreadyExistsError) {
      return NextResponse.json<ApiErrorResponse>(
        { error: 'Este email ya está registrado' },
        { status: 409 },
      )
    }

    console.error('[POST /api/auth/register]', err)
    return NextResponse.json<ApiErrorResponse>(
      { error: 'Error interno del servidor' },
      { status: 500 },
    )
  }
}
