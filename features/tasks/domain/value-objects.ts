/**
 * features/tasks/domain/value-objects.ts
 * Value objects del dominio Task: enums tipados con Zod.
 * Capa: domain — cero dependencias externas, lógica pura.
 *
 * Estos valores son la fuente de verdad para:
 *   - El schema de Prisma (enums Priority, TaskStatus, Category)
 *   - Los schemas Zod de la API
 *   - Los componentes de UI (colores, labels)
 */

import { z } from 'zod'

// ---------------------------------------------------------------------------
// Priority
// ---------------------------------------------------------------------------

export const PrioritySchema = z.enum(['HIGH', 'MEDIUM', 'LOW'])
export type Priority = z.infer<typeof PrioritySchema>

export const PRIORITY_LABELS: Record<Priority, string> = {
  HIGH: 'Alta',
  MEDIUM: 'Media',
  LOW: 'Baja',
}

// ---------------------------------------------------------------------------
// Category — colores definidos en globals.css como CSS variables
// ---------------------------------------------------------------------------

export const CategorySchema = z.enum(['TRABAJO', 'PERSONAL', 'SALUD', 'OTRO'])
export type Category = z.infer<typeof CategorySchema>

export const CATEGORY_LABELS: Record<Category, string> = {
  TRABAJO: 'Trabajo',
  PERSONAL: 'Personal',
  SALUD: 'Salud',
  OTRO: 'Otro',
}

/** Color hex de cada categoría (alineado con globals.css --category-*) */
export const CATEGORY_COLORS: Record<Category, string> = {
  TRABAJO: '#7C6FF7',
  PERSONAL: '#34D399',
  SALUD: '#F87171',
  OTRO: '#FBBF24',
}

// ---------------------------------------------------------------------------
// TaskStatus
// ---------------------------------------------------------------------------

export const TaskStatusSchema = z.enum([
  'PENDING',
  'IN_PROGRESS',
  'DONE',
  'CANCELLED',
])
export type TaskStatus = z.infer<typeof TaskStatusSchema>

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  PENDING: 'Pendiente',
  IN_PROGRESS: 'En progreso',
  DONE: 'Completada',
  CANCELLED: 'Cancelada',
}

// ---------------------------------------------------------------------------
// Recurrence (estructura JSON almacenada en Task.recurrence)
// ---------------------------------------------------------------------------

export const RecurrenceSchema = z.object({
  type: z.enum(['daily', 'weekly']),
  days: z.array(z.number().int().min(0).max(6)).optional(), // 0=dom..6=sáb
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
})
export type Recurrence = z.infer<typeof RecurrenceSchema>
