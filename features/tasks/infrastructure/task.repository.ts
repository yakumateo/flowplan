/**
 * features/tasks/infrastructure/task.repository.ts
 * Repositorio de tareas — ÚNICA capa que accede a Prisma.
 * Capa: infrastructure.
 *
 * REGLAS:
 * - Todos los métodos incluyen `where: { userId }` (aislamiento por usuario).
 * - Nunca se expone lógica de negocio aquí — solo queries.
 * - Los métodos de escritura múltiple usan prisma.$transaction.
 */

import { prisma, Prisma } from '@/shared/infrastructure/db'
import { startOfDay, endOfDay } from '@/shared/utils/dates'
import type { PreparedNewTask, PreparedUpdateTask } from '../application/task.service'
import type { BulkUpdateItem } from '../domain/task.entity'

// ---------------------------------------------------------------------------
// Queries de lectura
// ---------------------------------------------------------------------------

/** Obtiene todas las tareas del día dado (startTime entre inicio y fin del día) */
async function findByDate(userId: string, date: Date) {
  return prisma.task.findMany({
    where: {
      userId,
      startTime: {
        gte: startOfDay(date),
        lte: endOfDay(date),
      },
      status: { not: 'CANCELLED' },
    },
    orderBy: { startTime: 'asc' },
  })
}

/** Obtiene tareas de un rango de fechas (para vista semana) */
async function findByDateRange(userId: string, start: Date, end: Date) {
  return prisma.task.findMany({
    where: {
      userId,
      startTime: {
        gte: startOfDay(start),
        lte: endOfDay(end),
      },
      status: { not: 'CANCELLED' },
    },
    orderBy: { startTime: 'asc' },
  })
}

/** Obtiene las tareas floating (sin hora asignada) del usuario */
async function findFloating(userId: string) {
  return prisma.task.findMany({
    where: {
      userId,
      isFloating: true,
      status: { not: 'CANCELLED' },
    },
    orderBy: [{ position: 'asc' }, { createdAt: 'asc' }],
  })
}

/** Obtiene una tarea por ID, verificando que pertenece al usuario */
async function findById(userId: string, taskId: string) {
  return prisma.task.findFirst({
    where: { id: taskId, userId },
  })
}

// ---------------------------------------------------------------------------
// Mutaciones
// ---------------------------------------------------------------------------

async function create(userId: string, data: PreparedNewTask) {
  return prisma.task.create({
    data: {
      userId,
      title: data.title,
      description: data.description,
      startTime: data.startTime,
      endTime: data.endTime,
      duration: data.duration,
      priority: data.priority,
      category: data.category,
      isRecurring: data.isRecurring,
      // Prisma requires Prisma.JsonNull (not JS null) for nullable Json fields
      recurrence: data.recurrence ?? Prisma.JsonNull,
      isFloating: data.isFloating,
    },
  })
}

async function update(userId: string, taskId: string, data: PreparedUpdateTask) {
  // Desestructurar recurrence del resto para manejarlo por separado
  const { recurrence, ...rest } = data

  return prisma.task.update({
    where: { id: taskId, userId },
    data: {
      ...rest,
      // Prisma.JsonNull es requerido para borrar un campo Json nullable
      ...(recurrence !== undefined && {
        recurrence: recurrence === null
          ? Prisma.JsonNull
          : (recurrence as Prisma.InputJsonValue),
      }),
    },
  })
}


async function remove(userId: string, taskId: string) {
  return prisma.task.delete({
    where: { id: taskId, userId },
  })
}

/** Cancela una tarea (cambia status a CANCELLED, no la borra físicamente) */
async function cancel(userId: string, taskId: string) {
  return prisma.task.update({
    where: { id: taskId, userId },
    data: { status: 'CANCELLED' },
  })
}

/** Actualiza múltiples tareas en una transacción atómica */
async function bulkUpdate(userId: string, updates: BulkUpdateItem[]) {
  return prisma.$transaction(
    updates.map((item) =>
      prisma.task.update({
        where: { id: item.id, userId },
        data: {
          ...(item.startTime !== undefined && {
            startTime: item.startTime ? new Date(item.startTime) : null,
          }),
          ...(item.endTime !== undefined && {
            endTime: item.endTime ? new Date(item.endTime) : null,
          }),
          ...(item.status !== undefined && { status: item.status }),
          ...(item.title !== undefined && { title: item.title }),
          ...(item.priority !== undefined && { priority: item.priority }),
          ...(item.category !== undefined && { category: item.category }),
          ...(item.duration !== undefined && { duration: item.duration }),
          ...(item.isFloating !== undefined && { isFloating: item.isFloating }),
        },
      }),
    ),
  )
}

// ---------------------------------------------------------------------------
// Export del repositorio como objeto (no clase — lógica funcional)
// ---------------------------------------------------------------------------

export const taskRepository = {
  findByDate,
  findByDateRange,
  findFloating,
  findById,
  create,
  update,
  delete: remove,
  cancel,
  bulkUpdate,
}
