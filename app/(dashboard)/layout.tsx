/**
 * app/(dashboard)/layout.tsx
 * Layout principal del dashboard: header de navegación + área de contenido.
 * Envuelve todo con QueryClientProvider y TanStack Query DevTools (solo dev).
 */

'use client'

import { useState, type ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AnimatePresence, motion } from 'framer-motion'
import { useCalendarStore } from '@/shared/store/calendarStore'
import { useUiStore } from '@/shared/store/uiStore'
import { Button } from '@/shared/ui/Button'
import { formatDayHeader, isToday } from '@/shared/utils/dates'

interface DashboardLayoutProps {
  children: ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { retry: 1, refetchOnWindowFocus: false },
        },
      }),
  )

  return (
    <QueryClientProvider client={queryClient}>
      <DashboardShell>{children}</DashboardShell>
    </QueryClientProvider>
  )
}

// ---------------------------------------------------------------------------
// Shell interno (puede usar los stores de Zustand)
// ---------------------------------------------------------------------------

function DashboardShell({ children }: { children: ReactNode }) {
  const { activeDate, view, goToPrev, goToNext, goToToday, setView } = useCalendarStore()
  const { toasts, removeToast, openNewTask } = useUiStore()

  const date = new Date(activeDate + 'T00:00:00')
  const todayActive = isToday(date)

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[var(--background)]">
      {/* ── HEADER ────────────────────────────────────────────────────── */}
      <header
        className="flex items-center gap-4 px-5 py-3 flex-shrink-0"
        style={{ borderBottom: '1px solid var(--border-subtle)' }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2 mr-2">
          <div className="w-7 h-7 rounded-[8px] bg-[var(--accent-primary)] flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <rect x="1" y="1" width="5" height="5" rx="1.5" fill="white" />
              <rect x="8" y="1" width="5" height="5" rx="1.5" fill="white" opacity="0.6" />
              <rect x="1" y="8" width="5" height="5" rx="1.5" fill="white" opacity="0.6" />
              <rect x="8" y="8" width="5" height="5" rx="1.5" fill="white" opacity="0.3" />
            </svg>
          </div>
          <span className="text-[15px] font-semibold text-[var(--text-primary)]">FlowPlan</span>
        </div>

        {/* Navegación de fecha */}
        <div className="flex items-center gap-1">
          <button
            id="nav-prev-btn"
            onClick={goToPrev}
            className="w-8 h-8 flex items-center justify-center rounded-[6px] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--elevated)] transition-all"
            aria-label="Anterior"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          <button
            id="nav-today-btn"
            onClick={goToToday}
            className={[
              'px-3 py-1.5 rounded-[6px] text-xs font-medium transition-all',
              todayActive
                ? 'bg-[var(--accent-soft)] text-[var(--accent-primary)]'
                : 'text-[var(--text-secondary)] hover:bg-[var(--elevated)] hover:text-[var(--text-primary)]',
            ].join(' ')}
          >
            Hoy
          </button>

          <button
            id="nav-next-btn"
            onClick={goToNext}
            className="w-8 h-8 flex items-center justify-center rounded-[6px] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--elevated)] transition-all"
            aria-label="Siguiente"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M5 2l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        {/* Título de fecha */}
        <h1 className="text-sm font-medium text-[var(--text-secondary)] capitalize">
          {formatDayHeader(date)}
        </h1>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Toggle vista */}
        <div
          className="flex rounded-[8px] p-0.5"
          style={{ backgroundColor: 'var(--elevated)', border: '1px solid var(--border-subtle)' }}
        >
          {(['day', 'week'] as const).map((v) => (
            <button
              key={v}
              id={`view-toggle-${v}`}
              onClick={() => setView(v)}
              className={[
                'px-3 py-1.5 rounded-[6px] text-xs font-medium transition-all capitalize',
                view === v
                  ? 'bg-[var(--surface)] text-[var(--text-primary)] shadow-sm'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]',
              ].join(' ')}
            >
              {v === 'day' ? 'Día' : 'Semana'}
            </button>
          ))}
        </div>

        {/* Nueva tarea */}
        <Button id="new-task-btn" size="sm" onClick={openNewTask}>
          + Nueva tarea
        </Button>
      </header>

      {/* ── CONTENIDO PRINCIPAL ───────────────────────────────────────── */}
      <main className="flex-1 overflow-hidden">
        {children}
      </main>

      {/* ── TOAST NOTIFICATIONS ───────────────────────────────────────── */}
      <div
        className="fixed bottom-5 right-5 flex flex-col gap-2 z-[var(--z-toast)]"
        aria-live="polite"
        aria-label="Notificaciones"
      >
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 4, scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className="flex items-center gap-3 px-4 py-3 rounded-[10px] shadow-xl text-sm"
              style={{
                backgroundColor: 'var(--elevated)',
                border: `1px solid ${
                  toast.type === 'success'
                    ? 'var(--success)'
                    : toast.type === 'error'
                    ? 'var(--error)'
                    : 'var(--border-visible)'
                }40`,
                color:
                  toast.type === 'success'
                    ? 'var(--success)'
                    : toast.type === 'error'
                    ? 'var(--error)'
                    : 'var(--text-primary)',
              }}
            >
              <span>
                {toast.type === 'success' ? '✓' : toast.type === 'error' ? '✕' : 'ℹ'}
              </span>
              <span className="text-[var(--text-primary)]">{toast.message}</span>
              <button
                onClick={() => removeToast(toast.id)}
                className="ml-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                aria-label="Cerrar notificación"
              >
                ×
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}
