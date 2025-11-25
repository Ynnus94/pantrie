import { cn } from '../../lib/utils'

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'secondary' | 'success' | 'warning' | 'danger' | 'outline' | 'accent'
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        {
          'bg-[rgba(0,0,0,0.06)] text-primary': variant === 'default',
          'bg-[var(--bg-glass-light)] text-secondary border border-[var(--border-subtle)]': variant === 'secondary',
          'bg-[rgba(34,197,94,0.15)] text-[#166534] border border-[rgba(34,197,94,0.25)]': variant === 'success',
          'bg-[rgba(251,191,36,0.15)] text-[#92400e] border border-[rgba(251,191,36,0.25)]': variant === 'warning',
          'bg-[rgba(239,68,68,0.15)] text-[#b91c1c] border border-[rgba(239,68,68,0.25)]': variant === 'danger',
          'border border-[rgba(0,0,0,0.12)] bg-transparent text-secondary': variant === 'outline',
          'bg-[rgba(212,165,116,0.15)] text-[#A67C52] border border-[rgba(212,165,116,0.25)]': variant === 'accent',
        },
        className
      )}
      {...props}
    />
  )
}
