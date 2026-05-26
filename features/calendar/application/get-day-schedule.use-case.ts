/**
 * features/calendar/application/get-day-schedule.use-case.ts
 * Caso de uso: Obtener el schedule completo de un día.
 * Capa: application — coordina task.repository + calendar.service.
 */

import { taskRepository } from '@/features/tasks/infrastructure/task.repository'
import { buildDaySchedule } from './calendar.service'
import type { DaySchedule } from '../domain/calendar.entity'

interface GetDayScheduleParams {
  userId: string
  date: Date
  dayStartHour: number
  dayEndHour: number
}

export async function getDayScheduleUseCase({
  userId,
  date,
  dayStartHour,
  dayEndHour,
}: GetDayScheduleParams): Promise<DaySchedule> {
  const [tasks, floatingTasks] = await Promise.all([
    taskRepository.findByDate(userId, date),
    taskRepository.findFloating(userId),
  ])

  // Prisma devuelve Date objects, el tipo Task de nuestro dominio los espera
  // Hacemos un cast seguro ya que el schema de Prisma es compatible
  return buildDaySchedule(
    date,
    tasks as Parameters<typeof buildDaySchedule>[1],
    floatingTasks as Parameters<typeof buildDaySchedule>[2],
    dayStartHour,
    dayEndHour,
  )
}
