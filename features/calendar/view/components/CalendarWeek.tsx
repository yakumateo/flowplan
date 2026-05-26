/**
 * features/calendar/view/components/CalendarWeek.tsx
 * Vista semanal: 7 columnas (lun-dom) con el timeline compartido.
 */

'use client'

import { AnimatePresence } from 'framer-motion'
import { TaskBlock } from '@/features/tasks/view/components/TaskBlock'
import { CurrentTimeLine } from './CurrentTimeLine'
import { formatDateString, isSameDay, isToday } from '@/shared/utils/dates'
import type { WeekSchedule } from '@/features/calendar/domain/calendar.entity'

const GUTTER_WIDTH = 56
const HOUR_HEIGHT = 60

interface CalendarWeekProps {
  schedule: WeekSchedule
  onTaskClick: (taskId: string) => void
  onDayClick: (dateStr: string) => void
}

export function CalendarWeek({ schedule, onTaskClick, onDayClick }: CalendarWeekProps) {
  const { days } = schedule
  if (!days.length) return null

  const { dayStartHour, dayEndHour, totalHeightPx } = days[0]
  const hours = Array.from(
    { length: dayEndHour - dayStartHour },
    (_, i) => dayStartHour + i,
  )

  const dayNames = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Header de días */}
      <div
        className="flex border-b border-[var(--border-subtle)] flex-shrink-0"
        style={{ paddingLeft: GUTTER_WIDTH }}
      >
        {days.map((day, i) => {
          const isCurrentDay = isToday(day.date)
          const dateStr = formatDateString(day.date)
          return (
            <button
              key={dateStr}
              id={`week-day-${dateStr}`}
              onClick={() => onDayClick(dateStr)}
              className="flex-1 flex flex-col items-center py-2 hover:bg-[var(--elevated)] transition-colors rounded-t-[6px]"
            >
              <span className="text-[11px] text-[var(--text-muted)]">{dayNames[i]}</span>
              <span
                className={[
                  'text-[15px] font-medium mt-0.5 w-7 h-7 flex items-center justify-center rounded-full transition-colors',
                  isCurrentDay
                    ? 'bg-[var(--accent-primary)] text-white'
                    : 'text-[var(--text-secondary)]',
                ].join(' ')}
              >
                {day.date.getDate()}
              </span>
            </button>
          )
        })}
      </div>

      {/* Scrollable timeline */}
      <div className="flex-1 overflow-y-auto">
        <div className="flex" style={{ height: totalHeightPx }}>
          {/* Gutter de horas */}
          <div className="relative flex-shrink-0" style={{ width: GUTTER_WIDTH }}>
            {hours.map((hour) => (
              <div
                key={hour}
                className="absolute"
                style={{ top: (hour - dayStartHour) * HOUR_HEIGHT - 9, right: 8 }}
                aria-hidden="true"
              >
                <span className="text-[11px] text-[var(--text-muted)]">{hour}:00</span>
              </div>
            ))}
          </div>

          {/* Columnas de cada día */}
          {days.map((day, i) => {
            const dateStr = formatDateString(day.date)
            const isCurrentDay = isToday(day.date)
            return (
              <div
                key={dateStr}
                className="flex-1 relative border-l border-[var(--border-subtle)]"
                style={{
                  backgroundColor: isCurrentDay ? 'rgba(124,111,247,0.03)' : undefined,
                }}
              >
                {/* Líneas horizontales de hora */}
                {hours.map((hour) => (
                  <div
                    key={hour}
                    className="absolute left-0 right-0 border-t border-[var(--border-subtle)]"
                    style={{ top: (hour - dayStartHour) * HOUR_HEIGHT }}
                    aria-hidden="true"
                  />
                ))}

                {/* Línea de hora actual (solo en la columna del día actual) */}
                {isCurrentDay && (
                  <CurrentTimeLine
                    dayStartHour={dayStartHour}
                    dayEndHour={dayEndHour}
                  />
                )}

                {/* Bloques de tareas */}
                <AnimatePresence>
                  {day.slots.map((slot) => (
                    <TaskBlock
                      key={slot.task.id}
                      slot={slot}
                      totalColumns={slot.totalColumns}
                      column={slot.column}
                      timelineWidth={200} // aprox; el TaskBlock usa % cuando hay superposición
                      onClick={onTaskClick}
                    />
                  ))}
                </AnimatePresence>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
