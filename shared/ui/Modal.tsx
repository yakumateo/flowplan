/**
 * shared/ui/Modal.tsx
 * Modal base con overlay animado (Framer Motion).
 * Usado por confirmaciones de delete, SpotlightModal, etc.
 */

'use client'

import { useEffect, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  /** Ancho del modal (clase Tailwind). Default: "max-w-md" */
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
}

export function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
  // Cerrar con Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isOpen, onClose])

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />
          {/* Panel */}
          <motion.div
            key="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? 'modal-title' : undefined}
            initial={{ opacity: 0, scale: 0.96, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -8 }}
            transition={{ type: 'spring', duration: 0.3, bounce: 0.2 }}
            className={[
              'fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
              'w-full mx-4',
              sizeClasses[size],
              'bg-[var(--surface)] border border-[var(--border-visible)]',
              'rounded-[12px] shadow-[0_24px_64px_rgba(0,0,0,0.5)]',
              'overflow-hidden',
            ].join(' ')}
          >
            {title && (
              <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-subtle)]">
                <h2
                  id="modal-title"
                  className="text-[15px] font-semibold text-[var(--text-primary)]"
                >
                  {title}
                </h2>
                <button
                  onClick={onClose}
                  className="w-7 h-7 flex items-center justify-center rounded-[6px] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--elevated)] transition-all"
                  aria-label="Cerrar modal"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path
                      d="M1 1l12 12M13 1L1 13"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
              </div>
            )}
            <div className="p-6">{children}</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
