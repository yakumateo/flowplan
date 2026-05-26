/**
 * features/tasks/application/bulk-update.use-case.ts
 * Caso de uso: Actualizar múltiples tareas atómicamente.
 * Usado por la IA cuando el usuario confirma una reorganización del día.
 * Capa: application — delega al repository que usa prisma.$transaction.
 */

import { taskRepository } from '../infrastructure/task.repository'
import { addMinutes } from '@/shared/utils/dates'
import type { BulkUpdateItem } from '../domain/task.entity'

export async function bulkUpdateTasksUseCase(
  userId: string,
  updates: BulkUpdateItem[],
) {
  // Calcular endTime para cada item que tenga startTime + duration
  const enrichedUpdates = updates.map((item) => {
    const startTime = item.startTime ? new Date(item.startTime) : undefined
    const hasTimeUpdate = startTime !== undefined || item.duration !== undefined

    return {
      ...item,
      ...(hasTimeUpdate && startTime && item.duration
        ? { endTime: addMinutes(startTime, item.duration).toISOString() }
        : {}),
    }
  })

  return taskRepository.bulkUpdate(userId, enrichedUpdates)
}
