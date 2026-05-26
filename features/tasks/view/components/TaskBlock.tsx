/**
 * features/tasks/view/components/TaskBlock.tsx
 * Bloque de tarea posicionado absolutamente en el timeline del calendario.
 * Usa layoutId para animaciones automáticas de reordenamiento con Framer Motion.
 * Componente "tonto": no contiene lógica de negocio.
 */

'use client'

import { motion } from 'framer-motion'
import { CategoryBadge } from '@/shared/ui/Badge'
import {
  CATEGORY_COLORS,
  PRIORITY_LABELS,
  type Category,
  type Priority,
} from '@/features/tasks/domain/value-objects'
import { formatTimeRange } from '@/shared/utils/dates'
import type { TimeSlot } from '@/features/calendar/domain/calendar.entity'

interface TaskBlockProps {
  slot: TimeSlot
  totalColumns: number
  column: number
  /** Ancho del área del timeline (sin el gutter de horas) */
  timelineWidth: number
  onClick: (taskId: string) => void
}

export function TaskBlock({ slot, totalColumns, column, timelineWidth, onClick }: TaskBlockProps) {
  const { task, topPx, heightPx } = slot
  const color = CATEGORY_COLORS[task.category as Category]

  // Calcular posición horizontal para tareas superpuestas
  const colWidth = timelineWidth / totalColumns
  const leftPx = column * colWidth
  const widthPx = colWidth - (totalColumns > 1 ? 4 : 0) // gap entre columnas

  const isDone = task.status === 'DONE'
  const isShort = heightPx < 40

  return (
    <motion.div
      layout
      layoutId={`task-${task.id}`}
      onClick={() => onClick(task.id)}
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 400, damping: 35 }}
      className="task-block select-none"
      style={{
        top: topPx,
        left: leftPx,
        width: widthPx,
        height: heightPx,
        backgroundColor: `${color}22`,
        borderLeft: `3px solid ${color}`,
        borderTop: `1px solid ${color}40`,
        borderRight: `1px solid ${color}20`,
        borderBottom: `1px solid ${color}20`,
        opacity: isDone ? 0.5 : 1,
      }}
      title={`${task.title} (${PRIORITY_LABELS[task.priority as Priority]})`}
    >
      <div className="flex flex-col h-full px-2 py-1 overflow-hidden">
        {/* Título */}
        <p
          className={[
            'text-[12px] font-semibold leading-tight',
            isDone ? 'line-through text-[var(--text-muted)]' : '',
          ].join(' ')}
          style={{ color: isDone ? undefined : color }}
        >
          {task.title}
        </p>

        {/* Hora y badge — solo si el bloque tiene suficiente altura */}
        {!isShort && (
          <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
            {task.startTime && task.endTime && (
              <span className="text-[10px] text-[var(--text-muted)]">
                {formatTimeRange(new Date(task.startTime), new Date(task.endTime))}
              </span>
            )}
            <CategoryBadge category={task.category as Category} />
          </div>
        )}
      </div>
    </motion.div>
  )
}
