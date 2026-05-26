/**
 * features/calendar/domain/value-objects.ts
 * Value objects del dominio Calendar: validación de rangos temporales.
 * Capa: domain — lógica pura, sin dependencias externas.
 */

import { z } from 'zod'

// ---------------------------------------------------------------------------
// TimeRange — rango de tiempo validado
// ---------------------------------------------------------------------------

export const TimeRangeSchema = z.object({
  start: z.date(),
  end: z.date(),
}).refine((data) => data.end > data.start, {
  message: 'La hora de fin debe ser posterior a la de inicio',
  path: ['end'],
})

export type TimeRange = z.infer<typeof TimeRangeSchema>

// ---------------------------------------------------------------------------
// HourSlot — cada celda del timeline (una hora)
// ---------------------------------------------------------------------------

export const HourSlotSchema = z.object({
  hour: z.number().int().min(0).max(23),
  label: z.string(), // "9:00", "14:00"
  isCurrentHour: z.boolean(),
})

export type HourSlot = z.infer<typeof HourSlotSchema>

// ---------------------------------------------------------------------------
// CalendarView — qué vista está activa
// ---------------------------------------------------------------------------

export const CalendarViewSchema = z.enum(['day', 'week'])
export type CalendarView = z.infer<typeof CalendarViewSchema>
