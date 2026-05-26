/**
 * app/api/tasks/[id]/route.ts
 * PATCH  /api/tasks/:id  → actualizar tarea
 * DELETE /api/tasks/:id  → eliminar tarea (requiere confirmación en el cliente)
 *
 * Capa DELGADA.
 */

import { NextRequest, NextResponse } from 'next/server'
import { getSessionOrDevUser } from '@/shared/infrastructure/dev-auth'
import { updateTaskUseCase } from '@/features/tasks/application/update-task.use-case'
import { deleteTaskUseCase } from '@/features/tasks/application/delete-task.use-case'
import { UpdateTaskSchema } from '@/features/tasks/domain/task.entity'
import type { ApiErrorResponse } from '@/shared/types'

interface RouteParams {
  params: Promise<{ id: string }>
}

// ---------------------------------------------------------------------------
// PATCH
// ---------------------------------------------------------------------------

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSessionOrDevUser()
    if (!session?.user?.id) {
      return NextResponse.json<ApiErrorResponse>({ error: 'No autenticado' }, { status: 401 })
    }

    const { id } = await params
    const body: unknown = await req.json()
    const parsed = UpdateTaskSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json<ApiErrorResponse>(
        { error: 'Datos inválidos', details: parsed.error.message },
        { status: 422 },
      )
    }

    const task = await updateTaskUseCase(session.user.id, id, parsed.data)
    return NextResponse.json({ data: task })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error interno'
    if (message === 'Tarea no encontrada') {
      return NextResponse.json<ApiErrorResponse>({ error: message }, { status: 404 })
    }
    console.error('[PATCH /api/tasks/:id]', err)
    return NextResponse.json<ApiErrorResponse>({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

// ---------------------------------------------------------------------------
// DELETE
// ---------------------------------------------------------------------------

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSessionOrDevUser()
    if (!session?.user?.id) {
      return NextResponse.json<ApiErrorResponse>({ error: 'No autenticado' }, { status: 401 })
    }

    const { id } = await params
    await deleteTaskUseCase(session.user.id, id)
    return new NextResponse(null, { status: 204 })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error interno'
    if (message === 'Tarea no encontrada') {
      return NextResponse.json<ApiErrorResponse>({ error: message }, { status: 404 })
    }
    console.error('[DELETE /api/tasks/:id]', err)
    return NextResponse.json<ApiErrorResponse>({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
