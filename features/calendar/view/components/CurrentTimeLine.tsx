/**
 * features/calendar/view/components/CurrentTimeLine.tsx
 * Línea roja que indica la hora actual en el timeline.
 * Se actualiza cada minuto con un interval.
 */

'use client'

import { useEffect, useState } from 'react'
import { getCurrentTimeOffset } from '@/features/calendar/application/calendar.service'

interface CurrentTimeLineProps {
  dayStartHour: number
  dayEndHour: number
  /** Offset desde el top del gutter (en px). Se recalcula cada minuto. */
}

export function CurrentTimeLine({ dayStartHour, dayEndHour }: CurrentTimeLineProps) {
  const [offset, setOffset] = useState<number | null>(() =>
    getCurrentTimeOffset(dayStartHour, dayEndHour),
  )

  useEffect(() => {
    const update = () => {
      setOffset(getCurrentTimeOffset(dayStartHour, dayEndHour))
    }

    // Actualizar al inicio del próximo minuto
    const msToNextMinute = (60 - new Date().getSeconds()) * 1000
    const timeout = setTimeout(() => {
      update()
      const interval = setInterval(update, 60_000)
      return () => clearInterval(interval)
    }, msToNextMinute)

    return () => clearTimeout(timeout)
  }, [dayStartHour, dayEndHour])

  if (offset === null) return null

  return (
    <div
      className="current-time-line"
      style={{ top: offset }}
      role="presentation"
      aria-hidden="true"
    />
  )
}
