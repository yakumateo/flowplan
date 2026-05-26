/**
 * shared/utils/dates.ts
 * Funciones puras de utilidad para manejo de fechas y tiempo.
 * Usadas por calendar.service, task.service y componentes de UI.
 * NO importar Prisma ni React aquí — solo lógica pura.
 */

// ---------------------------------------------------------------------------
// Tipos auxiliares
// ---------------------------------------------------------------------------

export interface TimeRange {
  start: Date
  end: Date
}

// ---------------------------------------------------------------------------
// Constructores / parsers
// ---------------------------------------------------------------------------

/** Devuelve la fecha de hoy en formato YYYY-MM-DD en el timezone del sistema */
export function getTodayString(): string {
  return formatDateString(new Date())
}

/** Convierte una Date a string YYYY-MM-DD */
export function formatDateString(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/** Parsea un string YYYY-MM-DD a Date (medianoche local) */
export function parseDateString(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number)
  return new Date(year, month - 1, day)
}

/** Devuelve el inicio del día (00:00:00.000) */
export function startOfDay(date: Date): Date {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

/** Devuelve el fin del día (23:59:59.999) */
export function endOfDay(date: Date): Date {
  const d = new Date(date)
  d.setHours(23, 59, 59, 999)
  return d
}

// ---------------------------------------------------------------------------
// Aritmética de tiempo
// ---------------------------------------------------------------------------

/** Suma minutos a una fecha y devuelve la nueva fecha */
export function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60_000)
}

/** Diferencia en minutos entre dos fechas (end - start) */
export function diffInMinutes(start: Date, end: Date): number {
  return Math.round((end.getTime() - start.getTime()) / 60_000)
}

// ---------------------------------------------------------------------------
// Formatters para UI
// ---------------------------------------------------------------------------

/** Formatea una hora como "9:00" o "14:30" */
export function formatTime(date: Date): string {
  const h = date.getHours()
  const m = String(date.getMinutes()).padStart(2, '0')
  return `${h}:${m}`
}

/** Formatea un rango de tiempo como "9:00 – 10:30" */
export function formatTimeRange(start: Date, end: Date): string {
  return `${formatTime(start)} – ${formatTime(end)}`
}

/** Formatea minutos como "1h 30min" o "45min" */
export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}min`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m === 0 ? `${h}h` : `${h}h ${m}min`
}

/** Devuelve "Lunes 26 de mayo" */
export function formatDayHeader(date: Date): string {
  return date.toLocaleDateString('es', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
}

// ---------------------------------------------------------------------------
// Navegación de calendario
// ---------------------------------------------------------------------------

/** Avanza o retrocede N días */
export function shiftDays(date: Date, days: number): Date {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

/** Devuelve el lunes de la semana que contiene la fecha dada */
export function getWeekStart(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay() // 0=dom, 1=lun...
  const diff = day === 0 ? -6 : 1 - day // ajuste a lunes
  d.setDate(d.getDate() + diff)
  d.setHours(0, 0, 0, 0)
  return d
}

/** Devuelve los 7 días de la semana (lun-dom) que contiene la fecha dada */
export function getWeekDays(date: Date): Date[] {
  const monday = getWeekStart(date)
  return Array.from({ length: 7 }, (_, i) => shiftDays(monday, i))
}

/** Comprueba si dos fechas corresponden al mismo día calendario */
export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

/** Comprueba si la fecha es hoy */
export function isToday(date: Date): boolean {
  return isSameDay(date, new Date())
}

// ---------------------------------------------------------------------------
// Posicionamiento en calendario (px = minutos desde dayStartHour)
// ---------------------------------------------------------------------------

/**
 * Calcula el desplazamiento vertical en píxeles desde el inicio del día.
 * 1 minuto = 1px (la hora columna tiene 60px de altura por defecto).
 */
export function getTopOffset(date: Date, dayStartHour: number): number {
  const minutesFromStart =
    (date.getHours() - dayStartHour) * 60 + date.getMinutes()
  return Math.max(0, minutesFromStart)
}

/** Calcula la altura de un bloque en px dado su duración en minutos */
export function getBlockHeight(durationMinutes: number): number {
  return Math.max(durationMinutes, 15) // mínimo 15px para legibilidad
}

/** Formatea una fecha como "YYYY-MM-DDTHH:mm" (formato local para input datetime-local) */
export function formatToDatetimeLocal(date: Date | string | null | undefined): string {
  if (!date) return ''
  const d = new Date(date)
  if (isNaN(d.getTime())) return ''

  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const dateVal = String(d.getDate()).padStart(2, '0')
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  return `${y}-${m}-${dateVal}T${hours}:${minutes}`
}

