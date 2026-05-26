/**
 * shared/ui/Input.tsx
 * Input y Select primitivos del design system.
 */

'use client'

import { forwardRef, InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react'

// ---------------------------------------------------------------------------
// Base styles compartidos
// ---------------------------------------------------------------------------

const baseInputClass = [
  'w-full bg-[var(--elevated)] border border-[var(--border-subtle)]',
  'text-[var(--text-primary)] placeholder:text-[var(--text-muted)]',
  'rounded-[8px] text-sm transition-all duration-150',
  'focus:outline-none focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-[var(--accent-primary)]/30',
  'disabled:opacity-50 disabled:cursor-not-allowed',
].join(' ')

// ---------------------------------------------------------------------------
// Input
// ---------------------------------------------------------------------------

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wide"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`${baseInputClass} px-3 py-2 ${error ? 'border-[var(--error)]' : ''} ${className}`}
          {...props}
        />
        {error && (
          <p className="text-xs text-[var(--error)]">{error}</p>
        )}
      </div>
    )
  },
)
Input.displayName = 'Input'

// ---------------------------------------------------------------------------
// Textarea
// ---------------------------------------------------------------------------

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className = '', id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wide"
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          className={`${baseInputClass} px-3 py-2 resize-none ${error ? 'border-[var(--error)]' : ''} ${className}`}
          {...props}
        />
        {error && (
          <p className="text-xs text-[var(--error)]">{error}</p>
        )}
      </div>
    )
  },
)
Textarea.displayName = 'Textarea'

// ---------------------------------------------------------------------------
// Select
// ---------------------------------------------------------------------------

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  options: { value: string; label: string }[]
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, className = '', id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wide"
          >
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={inputId}
          className={`${baseInputClass} px-3 py-2 ${error ? 'border-[var(--error)]' : ''} ${className}`}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && (
          <p className="text-xs text-[var(--error)]">{error}</p>
        )}
      </div>
    )
  },
)
Select.displayName = 'Select'
