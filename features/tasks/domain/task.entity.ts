/**
 * features/tasks/domain/task.entity.ts
 * Entidad Task y sus schemas Zod derivados.
 * Capa: domain — consume value-objects del mismo dominio, cero deps externas.
 *
 * Usada por:
 *   - application/ (use cases, service)
 *   - infrastructure/ (repository — para tipar retornos de Prisma)
 *   - view/ (hooks, componentes — para tipar props)
 *   - api/tasks/route.ts (para validar input con Zod)
 */

import { z } from 'zod'
import {
  PrioritySchema,
  CategorySchema,
  TaskStatusSchema,
  RecurrenceSchema,
} from './value-objects'

// ---------------------------------------------------------------------------
// Schema completo (representa un Task ya guardado en DB)
// ---------------------------------------------------------------------------

export const TaskSchema = z.object({
  id: z.string().cuid(),
  userId: z.string().cuid(),
  title: z.string().min(1, 'El título es obligatorio').max(200),
  description: z.string().max(1000).nullable().optional(),
  startTime: z.date().nullable().optional(),
  endTime: z.date().nullable().optional(),
  duration: z.number().int().min(5).max(480), // minutos (5min – 8h)
  priority: PrioritySchema,
  category: CategorySchema,
  status: TaskStatusSchema,
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).nullable().optional(),
  isRecurring: z.boolean(),
  recurrence: RecurrenceSchema.nullable().optional(),
  isFloating: z.boolean(),
  position: z.number().int().nullable().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

// ---------------------------------------------------------------------------
// Schema para CREAR una tarea (input del usuario)
// ---------------------------------------------------------------------------

export const NewTaskSchema = z.object({
  title: z.string().min(1, 'El título es obligatorio').max(200),
  description: z.string().max(1000).optional(),
  startTime: z.string().datetime({ offset: true }).nullable().optional(), // ISO 8601
  duration: z.number().int().min(5, 'Mínimo 5 minutos').max(480),
  priority: PrioritySchema.default('MEDIUM'),
  category: CategorySchema.default('TRABAJO'),
  isRecurring: z.boolean().default(false),
  recurrence: RecurrenceSchema.optional(),
  isFloating: z.boolean().default(false),
})

// ---------------------------------------------------------------------------
// Schema para ACTUALIZAR una tarea (todos los campos son opcionales)
// ---------------------------------------------------------------------------

export const UpdateTaskSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).nullable().optional(),
  startTime: z.string().datetime({ offset: true }).nullable().optional(),
  duration: z.number().int().min(5).max(480).optional(),
  priority: PrioritySchema.optional(),
  category: CategorySchema.optional(),
  status: TaskStatusSchema.optional(),
  isRecurring: z.boolean().optional(),
  recurrence: RecurrenceSchema.nullable().optional(),
  isFloating: z.boolean().optional(),
  position: z.number().int().nullable().optional(),
})

// ---------------------------------------------------------------------------
// Schema para bulk update (reorganización por IA)
// ---------------------------------------------------------------------------

export const BulkUpdateItemSchema = z.object({
  id: z.string().cuid(),
  startTime: z.string().datetime({ offset: true }).nullable().optional(),
  endTime: z.string().datetime({ offset: true }).nullable().optional(),
  status: TaskStatusSchema.optional(),
  title: z.string().min(1).max(200).optional(),
  priority: PrioritySchema.optional(),
  category: CategorySchema.optional(),
  duration: z.number().int().min(5).max(480).optional(),
  isFloating: z.boolean().optional(),
})

export const BulkUpdateSchema = z.object({
  updates: z.array(BulkUpdateItemSchema).min(1).max(50),
})

// ---------------------------------------------------------------------------
// Tipos inferidos
// ---------------------------------------------------------------------------

export type Task = z.infer<typeof TaskSchema>
export type NewTask = z.infer<typeof NewTaskSchema>
export type UpdateTask = z.infer<typeof UpdateTaskSchema>
export type BulkUpdateItem = z.infer<typeof BulkUpdateItemSchema>
export type BulkUpdate = z.infer<typeof BulkUpdateSchema>
