/**
 * features/calendar/view/hooks/useCalendar.ts
 * Hook de calendario: consume el store de Zustand + hace fetch del schedule.
 * Capa: view.
 */

'use client'

import { useQuery } from '@tanstack/react-query'
import { useCalendarStore } from '@/shared/store/calendarStore'
import { useTasks, useFloatingTasks } from '@/features/tasks/view/hooks/useTasks'
import {
  buildDaySchedule,
  buildWeekSchedule,
  generateHourSlots,
  getCurrentTimeOffset,
} from '@/features/calendar/application/calendar.service'
import { getWeekStart, formatDateString, getWeekDays } from '@/shared/utils/dates'

export function useCalendar() {
  const { activeDate, view, dayStartHour, dayEndHour, goToPrev, goToNext, goToToday, setView, setActiveDate } =
    useCalendarStore()

  const date = new Date(activeDate + 'T00:00:00')
  const weekStart = getWeekStart(date)
  const weekDays = getWeekDays(weekStart)

  // Fetch tareas del día activo
  const { data: dayTasks = [], isLoading: isLoadingDay } = useTasks(activeDate)
  const { data: floatingTasks = [], isLoading: isLoadingFloating } = useFloatingTasks()

  // Para semana: necesitamos los 7 días
  const weekDateStrings = weekDays.map((d) => formatDateString(d))

  // Timeline del día
  const hourSlots = generateHourSlots(dayStartHour, dayEndHour)
  const currentTimeOffset = getCurrentTimeOffset(dayStartHour, dayEndHour)

  // DaySchedule construido en cliente (sin llamada extra al server)
  const daySchedule = buildDaySchedule(
    date,
    dayTasks as Parameters<typeof buildDaySchedule>[1],
    floatingTasks as Parameters<typeof buildDaySchedule>[2],
    dayStartHour,
    dayEndHour,
  )

  return {
    // Estado del store
    activeDate,
    view,
    date,
    weekStart,
    weekDays,
    weekDateStrings,
    dayStartHour,
    dayEndHour,

    // Datos calculados
    daySchedule,
    hourSlots,
    currentTimeOffset,
    floatingTasks,

    // Estado de carga
    isLoading: isLoadingDay || isLoadingFloating,

    // Acciones
    goToPrev,
    goToNext,
    goToToday,
    setView,
    setActiveDate,
  }
}
