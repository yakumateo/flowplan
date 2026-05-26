/**
 * features/calendar/domain/calendar.entity.ts
 * Entidades del dominio Calendar: TimeSlot y DaySchedule.
 * Capa: domain — tipos puros que describen la estructura del calendario.
 *
 * Importa tipos de tasks/domain (permitido: un feature puede importar el domain de otro).
 */

import { z } from 'zod'
import { TaskSchema } from '@/features/tasks/domain/task.entity'

// ---------------------------------------------------------------------------
// TimeSlot — un bloque de tarea posicionado en el timeline
// ---------------------------------------------------------------------------

export const TimeSlotSchema = z.object({
  task: TaskSchema,
  topPx: z.number(),       // offset vertical desde dayStartHour (en px)
  heightPx: z.number(),    // altura proporcional a duration (en px)
  column: z.number().int().min(0).default(0), // columna para tareas superpuestas
  totalColumns: z.number().int().min(1).default(1),
})

export type TimeSlot = z.infer<typeof TimeSlotSchema>

// ---------------------------------------------------------------------------
// DaySchedule — el schedule completo de un día
// ---------------------------------------------------------------------------

export const DayScheduleSchema = z.object({
  date: z.date(),
  slots: z.array(TimeSlotSchema),
  floatingTasks: z.array(TaskSchema), // tareas sin hora asignada
  dayStartHour: z.number().int().min(0).max(23),
  dayEndHour: z.number().int().min(0).max(23),
  totalHours: z.number().int(),
  totalHeightPx: z.number(), // dayEndHour - dayStartHour en px (60px/hora)
})

export type DaySchedule = z.infer<typeof DayScheduleSchema>

// ---------------------------------------------------------------------------
// WeekSchedule — los 7 días de la semana
// ---------------------------------------------------------------------------

export const WeekScheduleSchema = z.object({
  weekStart: z.date(), // lunes de la semana
  days: z.array(DayScheduleSchema), // 7 elementos (lun-dom)
})

export type WeekSchedule = z.infer<typeof WeekScheduleSchema>
