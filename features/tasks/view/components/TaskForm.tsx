/**
 * features/tasks/view/components/TaskForm.tsx
 * Formulario para crear/editar una tarea.
 * Usa react-hook-form + zod. Componente "tonto": recibe callbacks, no muta directamente.
 */

'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/shared/ui/Button'
import { Input, Textarea, Select } from '@/shared/ui/Input'
import { NewTaskSchema } from '@/features/tasks/domain/task.entity'
import {
  PRIORITY_LABELS,
  CATEGORY_LABELS,
  PrioritySchema,
  CategorySchema,
  RecurrenceSchema,
  type Priority,
  type Category,
} from '@/features/tasks/domain/value-objects'
import { z } from 'zod'

// Schema específico para el formulario local.
// Admite el formato local de datetime-local ("YYYY-MM-DDTHH:mm")
const TaskFormSchema = z.object({
  title: z.string().min(1, 'El título es obligatorio').max(200),
  description: z.string().max(1000).optional(),
  startTime: z.string().optional().refine(
    (val) => !val || !isNaN(Date.parse(val)),
    { message: 'Fecha/hora inválida' }
  ),
  duration: z.number().int().min(5, 'Mínimo 5 minutos').max(480),
  priority: PrioritySchema.default('MEDIUM'),
  category: CategorySchema.default('TRABAJO'),
  isRecurring: z.boolean().default(false),
  recurrence: RecurrenceSchema.optional(),
  isFloating: z.boolean().default(false),
})

type TaskFormInput = z.input<typeof TaskFormSchema>
type NewTaskInput = z.input<typeof NewTaskSchema>

interface TaskFormProps {
  defaultValues?: Partial<NewTaskInput>
  onSubmit: (data: NewTaskInput) => void
  onCancel: () => void
  isLoading?: boolean
  submitLabel?: string
}

const priorityOptions = (Object.keys(PRIORITY_LABELS) as Priority[]).map((p) => ({
  value: p,
  label: PRIORITY_LABELS[p],
}))

const categoryOptions = (Object.keys(CATEGORY_LABELS) as Category[]).map((c) => ({
  value: c,
  label: CATEGORY_LABELS[c],
}))

const durationOptions = [
  { value: '15', label: '15 min' },
  { value: '30', label: '30 min' },
  { value: '45', label: '45 min' },
  { value: '60', label: '1 hora' },
  { value: '90', label: '1h 30min' },
  { value: '120', label: '2 horas' },
  { value: '180', label: '3 horas' },
  { value: '240', label: '4 horas' },
]

export function TaskForm({
  defaultValues,
  onSubmit,
  onCancel,
  isLoading = false,
  submitLabel = 'Crear tarea',
}: TaskFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TaskFormInput>({
    resolver: zodResolver(TaskFormSchema),
    defaultValues: {
      priority: 'MEDIUM',
      category: 'TRABAJO',
      duration: 60,
      isRecurring: false,
      isFloating: false,
      ...defaultValues,
    } as unknown as TaskFormInput, // Cast because defaultValues contains ISO strings, but the form handles local strings
  })

  const onSubmitForm = (data: TaskFormInput) => {
    const formattedData: NewTaskInput = {
      ...data,
      startTime: !data.isFloating && data.startTime && data.startTime !== ''
        ? new Date(data.startTime).toISOString()
        : null,
    }
    onSubmit(formattedData)
  }

  return (
    <form onSubmit={handleSubmit(onSubmitForm)} className="flex flex-col gap-4" noValidate>
      {/* Título */}
      <Input
        id="task-title"
        label="Título"
        placeholder="¿Qué necesitas hacer?"
        error={errors.title?.message}
        autoFocus
        {...register('title')}
      />

      {/* Descripción */}
      <Textarea
        id="task-description"
        label="Descripción"
        placeholder="Notas adicionales (opcional)"
        rows={3}
        {...register('description')}
      />

      {/* Hora de inicio */}
      <Input
        id="task-start-time"
        label="Hora de inicio"
        type="datetime-local"
        error={errors.startTime?.message}
        {...register('startTime')}
      />

      {/* Duración + Prioridad en fila */}
      <div className="grid grid-cols-2 gap-3">
        <Select
          id="task-duration"
          label="Duración"
          options={durationOptions}
          {...register('duration', { valueAsNumber: true })}
        />
        <Select
          id="task-priority"
          label="Prioridad"
          options={priorityOptions}
          {...register('priority')}
        />
      </div>

      {/* Categoría */}
      <Select
        id="task-category"
        label="Categoría"
        options={categoryOptions}
        {...register('category')}
      />

      {/* Flotante */}
      <label className="flex items-center gap-2 text-sm text-[var(--text-secondary)] cursor-pointer">
        <input
          id="task-is-floating"
          type="checkbox"
          className="w-4 h-4 rounded accent-[var(--accent-primary)]"
          {...register('isFloating')}
        />
        Sin horario fijo (tarea flotante)
      </label>

      {/* Acciones */}
      <div className="flex gap-2 pt-2">
        <Button
          id="task-form-cancel"
          type="button"
          variant="ghost"
          onClick={onCancel}
          className="flex-1"
        >
          Cancelar
        </Button>
        <Button
          id="task-form-submit"
          type="submit"
          isLoading={isLoading}
          className="flex-1"
        >
          {submitLabel}
        </Button>
      </div>
    </form>
  )
}
