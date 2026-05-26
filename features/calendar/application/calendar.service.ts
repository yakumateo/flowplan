/**
 * features/calendar/application/calendar.service.ts
 * Lógica de negocio del calendario: cálculo de slots, detección de conflictos,
 * posicionamiento de bloques en el timeline.
 * Capa: application — lógica pura, sin Prisma ni React.
 */

import {
  getTopOffset,
  getBlockHeight,
  formatTime,
  getWeekDays,
} from '@/shared/utils/dates'
import type { Task } from '@/features/tasks/domain/task.entity'
import type { TimeSlot, DaySchedule, WeekSchedule } from '../domain/calendar.entity'
import type { HourSlot } from '../domain/value-objects'

// ---------------------------------------------------------------------------
// Generación del array de horas del timeline
// ---------------------------------------------------------------------------

/**
 * Genera los slots de hora para el timeline (ej: 7, 8, ..., 22).
 * Cada slot tiene su label y si es la hora actual.
 */
export function generateHourSlots(
  dayStartHour: number,
  dayEndHour: number,
): HourSlot[] {
  const now = new Date()
  const currentHour = now.getHours()

  return Array.from({ length: dayEndHour - dayStartHour }, (_, i) => {
    const hour = dayStartHour + i
    return {
      hour,
      label: `${hour}:00`,
      isCurrentHour: hour === currentHour,
    }
  })
}

// ---------------------------------------------------------------------------
// Cálculo del offset de la línea de "hora actual"
// ---------------------------------------------------------------------------

/**
 * Retorna el offset en px de la línea roja de hora actual.
 * null si la hora actual está fuera del rango del timeline.
 */
export function getCurrentTimeOffset(
  dayStartHour: number,
  dayEndHour: number,
): number | null {
  const now = new Date()
  const currentHour = now.getHours()
  const currentMinute = now.getMinutes()

  if (currentHour < dayStartHour || currentHour >= dayEndHour) return null

  const minutesFromStart = (currentHour - dayStartHour) * 60 + currentMinute
  return minutesFromStart // 1min = 1px
}

// ---------------------------------------------------------------------------
// Conversión de Task[] a TimeSlot[] con posicionamiento
// ---------------------------------------------------------------------------

/**
 * Convierte tasks con startTime en TimeSlots posicionados en el timeline.
 * Maneja superposiciones calculando columnas.
 */
export function tasksToTimeSlots(
  tasks: Task[],
  dayStartHour: number,
): TimeSlot[] {
  const scheduledTasks = tasks.filter(
    (t) => t.startTime !== null && t.endTime !== null && !t.isFloating,
  )

  // Ordenar por hora de inicio
  const sorted = [...scheduledTasks].sort(
    (a, b) =>
      new Date(a.startTime!).getTime() - new Date(b.startTime!).getTime(),
  )

  // Detectar superposiciones y asignar columnas
  const slots: TimeSlot[] = []
  const groups: Task[][] = [] // grupos de tareas que se superponen

  for (const task of sorted) {
    const taskStart = new Date(task.startTime!)
    const taskEnd = new Date(task.endTime!)

    // Buscar grupo existente donde encaje
    let placed = false
    for (const group of groups) {
      const lastInGroup = group[group.length - 1]
      const lastEnd = new Date(lastInGroup.endTime!)

      if (taskStart >= lastEnd) {
        group.push(task)
        placed = true
        break
      }
    }

    if (!placed) {
      groups.push([task])
    }

    const topPx = getTopOffset(taskStart, dayStartHour)
    const heightPx = getBlockHeight(task.duration)

    slots.push({
      task,
      topPx,
      heightPx,
      column: 0, // se ajusta en el siguiente paso
      totalColumns: 1,
    })
  }

  // Detectar superposiciones reales para calcular columnas
  for (let i = 0; i < sorted.length; i++) {
    const taskA = sorted[i]
    const startA = new Date(taskA.startTime!)
    const endA = new Date(taskA.endTime!)
    const overlapping = sorted.filter((taskB, j) => {
      if (j === i) return false
      const startB = new Date(taskB.startTime!)
      const endB = new Date(taskB.endTime!)
      return startA < endB && endA > startB
    })

    if (overlapping.length > 0) {
      const totalColumns = overlapping.length + 1
      const column = sorted
        .slice(0, i)
        .filter((taskB) => {
          const startB = new Date(taskB.startTime!)
          const endB = new Date(taskB.endTime!)
          return startA < endB && endA > startB
        }).length

      const slotIndex = slots.findIndex((s) => s.task.id === taskA.id)
      if (slotIndex !== -1) {
        slots[slotIndex] = { ...slots[slotIndex], column, totalColumns }
      }
    }
  }

  return slots
}

// ---------------------------------------------------------------------------
// Construcción del DaySchedule
// ---------------------------------------------------------------------------

export function buildDaySchedule(
  date: Date,
  tasks: Task[],
  floatingTasks: Task[],
  dayStartHour: number,
  dayEndHour: number,
): DaySchedule {
  const totalHours = dayEndHour - dayStartHour
  const totalHeightPx = totalHours * 60

  return {
    date,
    slots: tasksToTimeSlots(tasks, dayStartHour),
    floatingTasks,
    dayStartHour,
    dayEndHour,
    totalHours,
    totalHeightPx,
  }
}

// ---------------------------------------------------------------------------
// Construcción del WeekSchedule
// ---------------------------------------------------------------------------

export function buildWeekSchedule(
  weekStartDate: Date,
  tasksByDay: Task[][],
  dayStartHour: number,
  dayEndHour: number,
): WeekSchedule {
  const days = getWeekDays(weekStartDate)

  return {
    weekStart: weekStartDate,
    days: days.map((day, i) =>
      buildDaySchedule(
        day,
        tasksByDay[i] ?? [],
        [], // floating tasks no se muestran en semana
        dayStartHour,
        dayEndHour,
      ),
    ),
  }
}
