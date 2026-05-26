/**
 * app/(dashboard)/day/page.tsx
 * Página de vista diaria — delega al CalendarDay + TaskSidebar.
 */

'use client'

import { Modal } from '@/shared/ui/Modal'
import { TaskForm } from '@/features/tasks/view/components/TaskForm'
import { TaskSidebar } from '@/features/tasks/view/components/TaskSidebar'
import { CalendarDay } from '@/features/calendar/view/components/CalendarDay'
import { TaskCard } from '@/features/tasks/view/components/TaskCard'
import { useCalendar } from '@/features/calendar/view/hooks/useCalendar'
import { useCreateTask } from '@/features/tasks/view/hooks/useTasks'
import { useUiStore } from '@/shared/store/uiStore'
import type { Task } from '@/features/tasks/domain/task.entity'

export default function DayPage() {
  const {
    daySchedule,
    floatingTasks,
    isLoading,
  } = useCalendar()

  const { isNewTaskOpen, openNewTask, closeNewTask, activeSidebarTaskId, openTaskSidebar } =
    useUiStore()

  const createTask = useCreateTask()

  // Encontrar la tarea activa del sidebar
  const activeTask: Task | null =
    activeSidebarTaskId
      ? ([...daySchedule.slots.map((s) => s.task), ...floatingTasks].find(
          (t) => t.id === activeSidebarTaskId,
        ) ?? null)
      : null

  function handleTaskClick(taskId: string) {
    openTaskSidebar(taskId)
  }

  return (
    <div className="flex h-full overflow-hidden">
      {/* ── PANEL IZQUIERDO: Tareas flotantes ────────────────────────── */}
      <aside
        className="w-[240px] flex-shrink-0 flex flex-col overflow-hidden"
        style={{ borderRight: '1px solid var(--border-subtle)' }}
      >
        <div className="px-4 pt-4 pb-2 flex items-center justify-between">
          <h2 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
            Sin horario
          </h2>
          <span className="text-xs text-[var(--text-muted)]">
            {floatingTasks.length}
          </span>
        </div>

        <div className="flex-1 overflow-y-auto px-3 pb-4 flex flex-col gap-1.5">
          {floatingTasks.length === 0 ? (
            <p className="text-xs text-[var(--text-muted)] px-1 pt-2">
              No hay tareas flotantes
            </p>
          ) : (
            floatingTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onClick={(t) => handleTaskClick(t.id)}
              />
            ))
          )}
        </div>

        {/* Botón nueva tarea al pie */}
        <div className="px-3 pb-4">
          <button
            id="floating-new-task-btn"
            onClick={openNewTask}
            className="w-full py-2 px-3 rounded-[8px] text-xs text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--elevated)] border border-dashed border-[var(--border-subtle)] transition-all"
          >
            + Agregar tarea
          </button>
        </div>
      </aside>

      {/* ── ÁREA PRINCIPAL: Calendario del día ──────────────────────── */}
      <div className="flex-1 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-[var(--accent-primary)] border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-[var(--text-muted)]">Cargando tareas…</p>
            </div>
          </div>
        ) : (
          <CalendarDay schedule={daySchedule} onTaskClick={handleTaskClick} />
        )}
      </div>

      {/* ── SIDEBAR DE TAREA ────────────────────────────────────────── */}
      <TaskSidebar task={activeTask} />

      {/* ── MODAL NUEVA TAREA ───────────────────────────────────────── */}
      <Modal isOpen={isNewTaskOpen} onClose={closeNewTask} title="Nueva tarea" size="md">
        <TaskForm
          onSubmit={(data) => createTask.mutate(data)}
          onCancel={closeNewTask}
          isLoading={createTask.isPending}
        />
      </Modal>
    </div>
  )
}
