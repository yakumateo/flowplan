/**
 * shared/ui/Button.tsx
 * Primitivo Button del design system.
 * Usa las CSS variables definidas en globals.css.
 */

'use client'

import { ButtonHTMLAttributes, forwardRef } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  isLoading?: boolean
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-[var(--accent-primary)] hover:bg-[var(--accent-hover)] text-white',
  secondary:
    'bg-[var(--surface)] hover:bg-[var(--elevated)] text-[var(--text-primary)] border border-[var(--border-visible)]',
  ghost:
    'bg-transparent hover:bg-[var(--elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]',
  danger:
    'bg-transparent hover:bg-[var(--error)]/10 text-[var(--error)] border border-[var(--error)]/40 hover:border-[var(--error)]',
}

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-xs rounded-[6px]',
  md: 'px-4 py-2 text-sm rounded-[8px]',
  lg: 'px-6 py-2.5 text-base rounded-[8px]',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      disabled,
      className = '',
      children,
      ...props
    },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={[
          'inline-flex items-center justify-center gap-2 font-medium',
          'transition-all duration-150 cursor-pointer',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          variantStyles[variant],
          sizeStyles[size],
          className,
        ].join(' ')}
        {...props}
      >
        {isLoading ? (
          <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : null}
        {children}
      </button>
    )
  },
)

Button.displayName = 'Button'
