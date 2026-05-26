/**
 * features/calendar/application/get-week-schedule.use-case.ts
 * Caso de uso: Obtener el schedule completo de una semana.
 * Capa: application — coordina task.repository + calendar.service.
 */

import { taskRepository } from '@/features/tasks/infrastructure/task.repository'
import { buildWeekSchedule } from './calendar.service'
import { getWeekDays, startOfDay, endOfDay } from '@/shared/utils/dates'
import type { WeekSchedule } from '../domain/calendar.entity'

interface GetWeekScheduleParams {
  userId: string
  weekStart: Date  // lunes de la semana
  dayStartHour: number
  dayEndHour: number
}

export async function getWeekScheduleUseCase({
  userId,
  weekStart,
  dayStartHour,
  dayEndHour,
}: GetWeekScheduleParams): Promise<WeekSchedule> {
  const days = getWeekDays(weekStart)
  const weekEnd = days[6] // domingo

  // Una sola query para toda la semana
  const allTasks = await taskRepository.findByDateRange(
    userId,
    startOfDay(days[0]),
    endOfDay(weekEnd),
  )

  // Distribuir las tareas por día
  const tasksByDay = days.map((day) =>
    allTasks.filter((task) => {
      if (!task.startTime) return false
      const taskDay = new Date(task.startTime)
      return (
        taskDay.getFullYear() === day.getFullYear() &&
        taskDay.getMonth() === day.getMonth() &&
        taskDay.getDate() === day.getDate()
      )
    }),
  )

  return buildWeekSchedule(
    weekStart,
    tasksByDay as Parameters<typeof buildWeekSchedule>[1],
    dayStartHour,
    dayEndHour,
  )
}
