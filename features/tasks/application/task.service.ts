/**
 * features/tasks/application/task.service.ts
 * Lógica de negocio del dominio Task.
 * Capa: application — consume domain/, nunca toca Prisma directamente.
 *
 * El service prepara y valida datos ANTES de pasarlos al repository.
 */

import { addMinutes } from '@/shared/utils/dates'
import type { NewTask, UpdateTask } from '../domain/task.entity'

// ---------------------------------------------------------------------------
// Preparación de datos para crear
// ---------------------------------------------------------------------------

export interface PreparedNewTask {
  title: string
  description?: string | null
  startTime?: Date | null
  endTime?: Date | null
  duration: number
  priority: NewTask['priority']
  category: NewTask['category']
  isRecurring: boolean
  recurrence?: NewTask['recurrence'] | null
  isFloating: boolean
}

/**
 * Prepara una nueva tarea calculando endTime a partir de startTime + duration.
 * Si no hay startTime, la tarea es floating.
 */
export function prepareNewTask(data: NewTask): PreparedNewTask {
  const startTime = data.startTime ? new Date(data.startTime) : null
  const endTime = startTime ? addMinutes(startTime, data.duration) : null

  return {
    title: data.title.trim(),
    description: data.description?.trim() ?? null,
    startTime,
    endTime,
    duration: data.duration,
    priority: data.priority,
    category: data.category,
    isRecurring: data.isRecurring,
    recurrence: data.recurrence ?? null,
    isFloating: startTime === null ? true : data.isFloating,
  }
}

// ---------------------------------------------------------------------------
// Preparación de datos para actualizar
// ---------------------------------------------------------------------------

export interface PreparedUpdateTask {
  title?: string
  description?: string | null
  startTime?: Date | null
  endTime?: Date | null
  duration?: number
  priority?: UpdateTask['priority']
  category?: UpdateTask['category']
  status?: UpdateTask['status']
  isRecurring?: boolean
  recurrence?: UpdateTask['recurrence'] | null
  isFloating?: boolean
  position?: number | null
}

/**
 * Prepara una actualización parcial.
 * Si se cambia startTime o duration, recalcula endTime.
 */
export function prepareUpdateTask(
  data: UpdateTask,
  currentTask: { startTime: Date | null; duration: number },
): PreparedUpdateTask {
  const newStartTime =
    'startTime' in data
      ? data.startTime
        ? new Date(data.startTime)
        : null
      : undefined

  const effectiveStart = newStartTime ?? currentTask.startTime
  const effectiveDuration = data.duration ?? currentTask.duration

  const newEndTime =
    newStartTime !== undefined || data.duration !== undefined
      ? effectiveStart
        ? addMinutes(effectiveStart, effectiveDuration)
        : null
      : undefined

  return {
    ...(data.title !== undefined && { title: data.title.trim() }),
    ...(data.description !== undefined && { description: data.description }),
    ...(newStartTime !== undefined && { startTime: newStartTime }),
    ...(newEndTime !== undefined && { endTime: newEndTime }),
    ...(data.duration !== undefined && { duration: data.duration }),
    ...(data.priority !== undefined && { priority: data.priority }),
    ...(data.category !== undefined && { category: data.category }),
    ...(data.status !== undefined && { status: data.status }),
    ...(data.isRecurring !== undefined && { isRecurring: data.isRecurring }),
    ...(data.recurrence !== undefined && { recurrence: data.recurrence }),
    ...(data.isFloating !== undefined && { isFloating: data.isFloating }),
    ...(data.position !== undefined && { position: data.position }),
  }
}

// ---------------------------------------------------------------------------
// Validación de negocio: detección de conflictos de horario
// ---------------------------------------------------------------------------

export interface TimeConflict {
  taskId: string
  title: string
  start: Date
  end: Date
}

/**
 * Detecta si una tarea nueva/movida genera conflicto con tareas existentes.
 * Excluye la tarea actual si se está editando (por taskId).
 */
export function detectConflicts(
  newStart: Date,
  newEnd: Date,
  existingTasks: Array<{ id: string; title: string; startTime: Date | null; endTime: Date | null }>,
  excludeTaskId?: string,
): TimeConflict[] {
  return existingTasks
    .filter(
      (t) =>
        t.id !== excludeTaskId &&
        t.startTime !== null &&
        t.endTime !== null &&
        t.startTime < newEnd &&
        t.endTime > newStart,
    )
    .map((t) => ({
      taskId: t.id,
      title: t.title,
      start: t.startTime!,
      end: t.endTime!,
    }))
}
