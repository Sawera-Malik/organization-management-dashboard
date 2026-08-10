import { ROLE_COLORS, ROLE_LABELS } from '../../auth/roles'
import type { UserRole } from '../../types/auth'

interface RoleBadgeProps {
  role: UserRole
  size?: 'sm' | 'md'
}

export function RoleBadge({ role, size = 'sm' }: RoleBadgeProps) {
  const colors = ROLE_COLORS[role]
  const label = ROLE_LABELS[role].toUpperCase()

  const sizeClasses =
    size === 'sm'
      ? 'px-2 py-0.5 text-[10px] tracking-widest'
      : 'px-3 py-1 text-xs tracking-widest'

  return (
    <span
      className={`inline-flex items-center rounded-full border font-bold ${sizeClasses} ${colors.bg} ${colors.text} ${colors.border}`}
    >
      {label}
    </span>
  )
}
