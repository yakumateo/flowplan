/**
 * features/calendar/view/components/CalendarDay.tsx
 * Vista del calendario de un día completo con timeline de horas y bloques de tareas.
 * Componente "tonto": recibe el daySchedule y callbacks, no contiene lógica de negocio.
 */

'use client'

import { useRef, useState, useEffect } from 'react'
import { AnimatePresence } from 'framer-motion'
import { TaskBlock } from '@/features/tasks/view/components/TaskBlock'
import { CurrentTimeLine } from './CurrentTimeLine'
import type { DaySchedule } from '@/features/calendar/domain/calendar.entity'

const GUTTER_WIDTH = 56 // px — ancho columna de horas (var(--timeline-gutter))
const HOUR_HEIGHT = 60  // px — 1 hora = 60px = 1min por px

interface CalendarDayProps {
  schedule: DaySchedule
  onTaskClick: (taskId: string) => void
}

export function CalendarDay({ schedule, onTaskClick }: CalendarDayProps) {
  const timelineRef = useRef<HTMLDivElement>(null)
  const [timelineWidth, setTimelineWidth] = useState(600)

  useEffect(() => {
    if (!timelineRef.current) return
    const updateWidth = () => {
      if (timelineRef.current) {
        setTimelineWidth(timelineRef.current.offsetWidth - GUTTER_WIDTH)
      }
    }
    updateWidth()

    // Usar ResizeObserver para medir de forma reactiva
    const observer = new ResizeObserver(updateWidth)
    observer.observe(timelineRef.current)
    return () => observer.disconnect()
  }, [])

  const { slots, dayStartHour, dayEndHour, totalHeightPx } = schedule
  const hours = Array.from(
    { length: dayEndHour - dayStartHour },
    (_, i) => dayStartHour + i,
  )

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Timeline scrollable */}
      <div className="flex-1 overflow-y-auto">
        <div
          ref={timelineRef}
          className="timeline-grid"
          style={{ height: totalHeightPx, minHeight: totalHeightPx }}
        >
          {/* Columna de horas */}
          {hours.map((hour) => {
            const topPx = (hour - dayStartHour) * HOUR_HEIGHT
            return (
              <div
                key={hour}
                className="timeline-hour-line"
                style={{ top: topPx }}
                aria-hidden="true"
              >
                {/* Label de hora */}
                <span
                  className="absolute text-[11px] text-[var(--text-muted)] select-none"
                  style={{
                    left: 0,
                    top: -9,
                    width: GUTTER_WIDTH - 8,
                    textAlign: 'right',
                  }}
                >
                  {hour}:00
                </span>
              </div>
            )
          })}

          {/* Línea de hora actual */}
          <CurrentTimeLine dayStartHour={dayStartHour} dayEndHour={dayEndHour} />

          {/* Área de bloques de tareas */}
          <div
            className="absolute"
            style={{
              left: GUTTER_WIDTH,
              top: 0,
              right: 0,
              bottom: 0,
            }}
          >
            <AnimatePresence>
              {slots.map((slot) => (
                <TaskBlock
                  key={slot.task.id}
                  slot={slot}
                  totalColumns={slot.totalColumns}
                  column={slot.column}
                  timelineWidth={timelineWidth}
                  onClick={onTaskClick}
                />
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}
