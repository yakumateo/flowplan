/**
 * features/tasks/view/components/TaskCard.tsx
 * Tarjeta de tarea en la lista de flotantes (sin horario asignado).
 * Componente "tonto": recibe datos por props, no contiene lógica de negocio.
 */

'use client'

import { motion } from 'framer-motion'
import { CategoryBadge } from '@/shared/ui/Badge'
import {
  PRIORITY_LABELS,
  CATEGORY_COLORS,
  type Priority,
  type Category,
} from '@/features/tasks/domain/value-objects'
import type { Task } from '@/features/tasks/domain/task.entity'

interface TaskCardProps {
  task: Task
  onClick: (task: Task) => void
}

const priorityDot: Record<Priority, string> = {
  HIGH:   '#f87171',
  MEDIUM: '#fbbf24',
  LOW:    '#6b7280',
}

export function TaskCard({ task, onClick }: TaskCardProps) {
  const color = CATEGORY_COLORS[task.category as Category]

  return (
    <motion.div
      layout
      layoutId={`task-card-${task.id}`}
      onClick={() => onClick(task)}
      whileHover={{ x: 2 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className="group flex items-center gap-3 px-3 py-2.5 rounded-[8px] cursor-pointer"
      style={{ backgroundColor: `${color}12`, border: `1px solid ${color}30` }}
    >
      {/* Dot de prioridad */}
      <span
        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
        style={{ backgroundColor: priorityDot[task.priority as Priority] }}
        title={PRIORITY_LABELS[task.priority as Priority]}
      />

      {/* Título */}
      <span className="flex-1 text-sm text-[var(--text-primary)] truncate">
        {task.title}
      </span>

      {/* Duración */}
      <span className="text-xs text-[var(--text-muted)] flex-shrink-0">
        {task.duration}min
      </span>

      {/* Categoría */}
      <CategoryBadge category={task.category as Category} />
    </motion.div>
  )
}
