/**
 * app/api/tasks/route.ts
 * GET  /api/tasks?date=YYYY-MM-DD   → tareas del día
 * GET  /api/tasks?floating=true     → tareas flotantes
 * POST /api/tasks                   → crear tarea
 *
 * Capa DELGADA: valida input con Zod, delega al use case, devuelve respuesta.
 * NO contiene lógica de negocio.
 */

import { NextRequest, NextResponse } from 'next/server'
import { getSessionOrDevUser } from '@/shared/infrastructure/dev-auth'
import { createTaskUseCase } from '@/features/tasks/application/create-task.use-case'
import { taskRepository } from '@/features/tasks/infrastructure/task.repository'
import { NewTaskSchema } from '@/features/tasks/domain/task.entity'
import type { ApiErrorResponse } from '@/shared/types'

// ---------------------------------------------------------------------------
// GET
// ---------------------------------------------------------------------------

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionOrDevUser()
    if (!session?.user?.id) {
      return NextResponse.json<ApiErrorResponse>({ error: 'No autenticado' }, { status: 401 })
    }

    const { searchParams } = req.nextUrl
    const dateStr = searchParams.get('date')
    const floating = searchParams.get('floating')

    if (floating === 'true') {
      const tasks = await taskRepository.findFloating(session.user.id)
      return NextResponse.json({ data: tasks })
    }

    if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      return NextResponse.json<ApiErrorResponse>(
        { error: 'Parámetro date requerido (YYYY-MM-DD)' },
        { status: 400 },
      )
    }

    const date = new Date(dateStr + 'T00:00:00')
    const tasks = await taskRepository.findByDate(session.user.id, date)
    return NextResponse.json({ data: tasks })
  } catch (err) {
    console.error('[GET /api/tasks]', err)
    return NextResponse.json<ApiErrorResponse>(
      { error: 'Error interno del servidor' },
      { status: 500 },
    )
  }
}

// ---------------------------------------------------------------------------
// POST
// ---------------------------------------------------------------------------

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionOrDevUser()
    if (!session?.user?.id) {
      return NextResponse.json<ApiErrorResponse>({ error: 'No autenticado' }, { status: 401 })
    }

    const body: unknown = await req.json()
    const parsed = NewTaskSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json<ApiErrorResponse>(
        { error: 'Datos inválidos', details: parsed.error.message },
        { status: 422 },
      )
    }

    const task = await createTaskUseCase(session.user.id, parsed.data)
    return NextResponse.json({ data: task }, { status: 201 })
  } catch (err) {
    console.error('[POST /api/tasks]', err)
    return NextResponse.json<ApiErrorResponse>(
      { error: 'Error interno del servidor' },
      { status: 500 },
    )
  }
}
