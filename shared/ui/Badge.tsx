/**
 * shared/ui/Badge.tsx
 * Badge/chip para mostrar categorías, prioridades y estados.
 */

'use client'

import { CATEGORY_COLORS, type Category } from '@/features/tasks/domain/value-objects'

interface BadgeProps {
  label: string
  color?: string
  className?: string
}

export function Badge({ label, color, className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-[4px] text-[11px] font-medium ${className}`}
      style={
        color
          ? {
              backgroundColor: `${color}26`, // 15% opacity
              color,
              border: `1px solid ${color}40`,
            }
          : {
              backgroundColor: 'var(--elevated)',
              color: 'var(--text-secondary)',
              border: '1px solid var(--border-subtle)',
            }
      }
    >
      {label}
    </span>
  )
}

/** Badge de categoría — usa los colores definidos en value-objects */
export function CategoryBadge({ category }: { category: Category }) {
  const color = CATEGORY_COLORS[category]
  const labels: Record<Category, string> = {
    TRABAJO: 'Trabajo',
    PERSONAL: 'Personal',
    SALUD: 'Salud',
    OTRO: 'Otro',
  }
  return <Badge label={labels[category]} color={color} />
}
