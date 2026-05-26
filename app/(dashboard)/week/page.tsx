/**
 * app/(dashboard)/week/page.tsx
 * Página de vista semanal — delega al CalendarWeek.
 * Al hacer clic en un día, navega a la vista diaria de ese día.
 */

'use client'

import { useRouter } from 'next/navigation'
import { CalendarWeek } from '@/features/calendar/view/components/CalendarWeek'
import { TaskSidebar } from '@/features/tasks/view/components/TaskSidebar'
import { useCalendarStore } from '@/shared/store/calendarStore'
import { useCalendar } from '@/features/calendar/view/hooks/useCalendar'
import { useUiStore } from '@/shared/store/uiStore'
import { buildWeekSchedule } from '@/features/calendar/application/calendar.service'
import { useTasks } from '@/features/tasks/view/hooks/useTasks'
import { getWeekDays, formatDateString } from '@/shared/utils/dates'
import type { Task } from '@/features/tasks/domain/task.entity'

export default function WeekPage() {
  const router = useRouter()
  const { weekStart, weekDays, dayStartHour, dayEndHour, setActiveDate } = useCalendar()
  const { activeSidebarTaskId, openTaskSidebar } = useUiStore()

  // Fetch de cada día de la semana (usa el cache de TanStack Query)
  const weekDateStrings = weekDays.map((d) => formatDateString(d))
  const dayQueries = weekDateStrings.map((dateStr) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useTasks(dateStr)
  })

  const isLoading = dayQueries.some((q) => q.isLoading)
  const tasksByDay = dayQueries.map((q) => (q.data ?? []) as Task[])

  const weekSchedule = buildWeekSchedule(
    weekStart,
    tasksByDay as Parameters<typeof buildWeekSchedule>[1],
    dayStartHour,
    dayEndHour,
  )

  // Tarea activa para el sidebar
  const allTasks = tasksByDay.flat()
  const activeTask: Task | null =
    activeSidebarTaskId
      ? (allTasks.find((t) => t.id === activeSidebarTaskId) ?? null)
      : null

  function handleDayClick(dateStr: string) {
    setActiveDate(dateStr)
    router.push('/day')
  }

  return (
    <div className="flex h-full overflow-hidden">
      <div className="flex-1 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="w-8 h-8 border-2 border-[var(--accent-primary)] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <CalendarWeek
            schedule={weekSchedule}
            onTaskClick={openTaskSidebar}
            onDayClick={handleDayClick}
          />
        )}
      </div>
      <TaskSidebar task={activeTask} />
    </div>
  )
}
