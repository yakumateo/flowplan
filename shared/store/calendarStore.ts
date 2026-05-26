/**
 * shared/store/calendarStore.ts
 * Estado global del calendario: fecha activa, vista (day|week), preferencias.
 */

import { create } from 'zustand'
import { getTodayString, getWeekStart, formatDateString } from '@/shared/utils/dates'
import type { CalendarView } from '@/features/calendar/domain/value-objects'

interface CalendarState {
  /** Fecha seleccionada como string YYYY-MM-DD */
  activeDate: string
  /** Vista activa: 'day' | 'week' */
  view: CalendarView
  /** Hora de inicio del timeline (configurable en settings) */
  dayStartHour: number
  /** Hora de fin del timeline */
  dayEndHour: number

  // Actions
  setActiveDate: (date: string) => void
  setView: (view: CalendarView) => void
  goToToday: () => void
  goToPrev: () => void
  goToNext: () => void
  setHours: (start: number, end: number) => void
}

export const useCalendarStore = create<CalendarState>((set, get) => ({
  activeDate: getTodayString(),
  view: 'day',
  dayStartHour: 7,
  dayEndHour: 22,

  setActiveDate: (date) => set({ activeDate: date }),
  setView: (view) => set({ view }),
  setHours: (start, end) => set({ dayStartHour: start, dayEndHour: end }),

  goToToday: () => set({ activeDate: getTodayString() }),

  goToPrev: () => {
    const { activeDate, view } = get()
    const current = new Date(activeDate + 'T00:00:00')
    if (view === 'day') {
      current.setDate(current.getDate() - 1)
    } else {
      current.setDate(current.getDate() - 7)
    }
    set({ activeDate: formatDateString(current) })
  },

  goToNext: () => {
    const { activeDate, view } = get()
    const current = new Date(activeDate + 'T00:00:00')
    if (view === 'day') {
      current.setDate(current.getDate() + 1)
    } else {
      current.setDate(current.getDate() + 7)
    }
    set({ activeDate: formatDateString(current) })
  },
}))
