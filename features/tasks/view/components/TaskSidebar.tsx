/**
 * features/tasks/view/components/TaskSidebar.tsx
 * Panel lateral deslizante para ver y editar el detalle de una tarea.
 * Se abre/cierra desde uiStore.activeSidebarTaskId.
 */

'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/shared/ui/Button'
import { Modal } from '@/shared/ui/Modal'
import { CategoryBadge } from '@/shared/ui/Badge'
import { TaskForm } from './TaskForm'
import { useUpdateTask, useDeleteTask } from '../hooks/useTasks'
import { useUiStore } from '@/shared/store/uiStore'
import {
  PRIORITY_LABELS,
  TASK_STATUS_LABELS,
  CATEGORY_COLORS,
  type Priority,
  type Category,
  type TaskStatus,
} from '@/features/tasks/domain/value-objects'
import { formatTimeRange, formatDuration, formatToDatetimeLocal } from '@/shared/utils/dates'
import type { Task, UpdateTask } from '@/features/tasks/domain/task.entity'

interface TaskSidebarProps {
  task: Task | null
}

export function TaskSidebar({ task }: TaskSidebarProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const closeTaskSidebar = useUiStore((s) => s.closeTaskSidebar)
  const updateTask = useUpdateTask()
  const deleteTask = useDeleteTask()

  const isOpen = task !== null

  function handleUpdate(data: UpdateTask) {
    if (!task) return
    updateTask.mutate(
      { id: task.id, data },
      { onSuccess: () => setIsEditing(false) },
    )
  }

  function handleDelete() {
    if (!task) return
    deleteTask.mutate(task.id)
    setShowDeleteConfirm(false)
  }

  const color = task ? CATEGORY_COLORS[task.category as Category] : undefined

  return (
    <>
      {/* Overlay al hacer clic fuera */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="sidebar-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[29] bg-black/30"
            onClick={closeTaskSidebar}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      {/* Panel lateral */}
      <AnimatePresence>
        {isOpen && task && (
          <motion.aside
            key="task-sidebar"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 34 }}
            className="fixed top-0 right-0 h-full z-[var(--z-sidebar)] flex flex-col"
            style={{
              width: 'var(--sidebar-width)',
              backgroundColor: 'var(--surface)',
              borderLeft: '1px solid var(--border-visible)',
              boxShadow: '-8px 0 40px rgba(0,0,0,0.4)',
            }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-5 py-4"
              style={{ borderBottom: '1px solid var(--border-subtle)' }}
            >
              <div className="flex items-center gap-2">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: color }}
                />
                <CategoryBadge category={task.category as Category} />
                <span className="text-xs text-[var(--text-muted)]">
                  {PRIORITY_LABELS[task.priority as Priority]}
                </span>
              </div>
              <button
                id="sidebar-close-btn"
                onClick={closeTaskSidebar}
                className="w-7 h-7 flex items-center justify-center rounded-[6px] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--elevated)] transition-all"
                aria-label="Cerrar panel"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            {/* Contenido */}
            <div className="flex-1 overflow-y-auto px-5 py-5">
              {isEditing ? (
                <TaskForm
                  defaultValues={{
                    title: task.title,
                    description: task.description ?? undefined,
                    duration: task.duration,
                    priority: task.priority as Priority,
                    category: task.category as Category,
                    isFloating: task.isFloating,
                    startTime: formatToDatetimeLocal(task.startTime),
                  }}
                  onSubmit={handleUpdate}
                  onCancel={() => setIsEditing(false)}
                  isLoading={updateTask.isPending}
                  submitLabel="Guardar cambios"
                />
              ) : (
                <div className="flex flex-col gap-5">
                  {/* Título */}
                  <h2 className="text-lg font-semibold text-[var(--text-primary)] leading-snug">
                    {task.title}
                  </h2>

                  {/* Meta */}
                  <div className="flex flex-col gap-2.5">
                    {task.startTime && task.endTime && (
                      <MetaRow
                        icon="🕐"
                        label="Horario"
                        value={formatTimeRange(new Date(task.startTime), new Date(task.endTime))}
                      />
                    )}
                    <MetaRow icon="⏱" label="Duración" value={formatDuration(task.duration)} />
                    <MetaRow icon="📌" label="Estado" value={TASK_STATUS_LABELS[task.status as TaskStatus]} />
                    {task.description && (
                      <div className="mt-2">
                        <p className="text-xs text-[var(--text-muted)] uppercase tracking-wide mb-1.5">Notas</p>
                        <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                          {task.description}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Quick status */}
                  <div className="flex gap-2 pt-1">
                    <QuickStatusButton
                      label="Completar"
                      isActive={task.status === 'DONE'}
                      onClick={() => handleUpdate({ status: 'DONE' })}
                      color="var(--success)"
                    />
                    <QuickStatusButton
                      label="En progreso"
                      isActive={task.status === 'IN_PROGRESS'}
                      onClick={() => handleUpdate({ status: 'IN_PROGRESS' })}
                      color="var(--info)"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Footer con acciones */}
            {!isEditing && (
              <div
                className="flex items-center gap-2 px-5 py-4"
                style={{ borderTop: '1px solid var(--border-subtle)' }}
              >
                <Button
                  id="sidebar-edit-btn"
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                  className="flex-1"
                >
                  Editar
                </Button>
                <Button
                  id="sidebar-delete-btn"
                  variant="danger"
                  size="sm"
                  onClick={() => setShowDeleteConfirm(true)}
                >
                  Eliminar
                </Button>
              </div>
            )}
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Modal de confirmación de eliminación */}
      <Modal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title="Eliminar tarea"
        size="sm"
      >
        <p className="text-sm text-[var(--text-secondary)] mb-5">
          ¿Seguro que quieres eliminar <strong className="text-[var(--text-primary)]">{task?.title}</strong>?
          Esta acción no se puede deshacer.
        </p>
        <div className="flex gap-2">
          <Button
            id="delete-cancel-btn"
            variant="ghost"
            onClick={() => setShowDeleteConfirm(false)}
            className="flex-1"
          >
            Cancelar
          </Button>
          <Button
            id="delete-confirm-btn"
            variant="danger"
            onClick={handleDelete}
            isLoading={deleteTask.isPending}
            className="flex-1"
          >
            Eliminar
          </Button>
        </div>
      </Modal>
    </>
  )
}

// ---------------------------------------------------------------------------
// Sub-componentes privados
// ---------------------------------------------------------------------------

function MetaRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="text-base w-5 text-center">{icon}</span>
      <span className="text-xs text-[var(--text-muted)] w-16">{label}</span>
      <span className="text-sm text-[var(--text-secondary)]">{value}</span>
    </div>
  )
}

function QuickStatusButton({
  label,
  isActive,
  onClick,
  color,
}: {
  label: string
  isActive: boolean
  onClick: () => void
  color: string
}) {
  return (
    <button
      onClick={onClick}
      className="flex-1 py-1.5 px-3 rounded-[6px] text-xs font-medium transition-all"
      style={{
        backgroundColor: isActive ? `${color}22` : 'var(--elevated)',
        color: isActive ? color : 'var(--text-secondary)',
        border: `1px solid ${isActive ? `${color}50` : 'var(--border-subtle)'}`,
      }}
    >
      {label}
    </button>
  )
}
