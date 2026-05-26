/**
 * features/tasks/application/update-task.use-case.ts
 * Caso de uso: Actualizar una tarea (parcialmente).
 * Capa: application — orquesta service + repository.
 */

import { prepareUpdateTask } from './task.service'
import { taskRepository } from '../infrastructure/task.repository'
import type { UpdateTask } from '../domain/task.entity'

export async function updateTaskUseCase(
  userId: string,
  taskId: string,
  data: UpdateTask,
) {
  // Obtener la tarea actual para poder recalcular endTime si es necesario
  const currentTask = await taskRepository.findById(userId, taskId)
  if (!currentTask) {
    throw new Error('Tarea no encontrada')
  }

  const prepared = prepareUpdateTask(data, {
    startTime: currentTask.startTime,
    duration: currentTask.duration,
  })

  return taskRepository.update(userId, taskId, prepared)
}
