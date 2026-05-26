/**
 * features/tasks/application/delete-task.use-case.ts
 * Caso de uso: Eliminar permanentemente una tarea.
 * Capa: application — requiere confirmación explícita del usuario (verificado en el route handler).
 *
 * IMPORTANTE: La eliminación física solo ocurre cuando el usuario confirma
 * explícitamente. El route handler que llama este use case DEBE verificar
 * que viene de una acción confirmada (no de un error de navegación).
 */

import { taskRepository } from '../infrastructure/task.repository'

export async function deleteTaskUseCase(
  userId: string,
  taskId: string,
): Promise<void> {
  const existing = await taskRepository.findById(userId, taskId)
  if (!existing) {
    throw new Error('Tarea no encontrada')
  }

  await taskRepository.delete(userId, taskId)
}
