/**
 * features/tasks/application/create-task.use-case.ts
 * Caso de uso: Crear una tarea nueva.
 * Capa: application — orquesta service + repository.
 */

import { prepareNewTask } from './task.service'
import { taskRepository } from '../infrastructure/task.repository'
import type { NewTask } from '../domain/task.entity'

export async function createTaskUseCase(
  userId: string,
  data: NewTask,
) {
  const prepared = prepareNewTask(data)
  return taskRepository.create(userId, prepared)
}
