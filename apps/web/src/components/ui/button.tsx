import { cn } from '../../lib/utils'
import { ButtonHTMLAttributes, forwardRef } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'honey' | 'glass' | 'outline' | 'ghost' | 'secondary' | 'destructive'
  size?: 'sm' | 'md' | 'lg' | 'icon'
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(({ 
  className, 
  variant = 'default', 
  size = 'md',
  style,
  ...props 
}, ref) => {
  // Minimal Apple-standard variant styles with muted gold accent
  const variantStyles: Record<string, React.CSSProperties> = {
    default: {
      background: 'linear-gradient(135deg, #D4A574 0%, #C19A6B 100%)',
      backdropFilter: 'blur(8px)',
      WebkitBackdropFilter: 'blur(8px)',
      boxShadow: '0 4px 16px rgba(212, 165, 116, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
    },
    honey: {
      background: 'linear-gradient(135deg, #D4A574 0%, #C19A6B 100%)',
      backdropFilter: 'blur(8px)',
      WebkitBackdropFilter: 'blur(8px)',
      boxShadow: '0 4px 16px rgba(212, 165, 116, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
    },
    glass: {
      background: 'rgba(255, 255, 255, 0.6)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
    },
    outline: {
      background: 'rgba(255, 255, 255, 0.5)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
    },
    ghost: {},
    secondary: {
      background: 'rgba(255, 255, 255, 0.6)',
      backdropFilter: 'blur(8px)',
      WebkitBackdropFilter: 'blur(8px)',
    },
    destructive: {
      background: 'rgba(239, 68, 68, 0.9)',
      backdropFilter: 'blur(8px)',
      WebkitBackdropFilter: 'blur(8px)',
    },
  }

  return (
    <button
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center rounded-xl font-semibold transition-all duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4A574] focus-visible:ring-offset-2',
        'disabled:pointer-events-none disabled:opacity-50',
        'active:scale-[0.98]',
        {
          // Primary (Muted Gold)
          'text-white border-none hover:-translate-y-0.5 hover:shadow-[0_6px_24px_rgba(212,165,116,0.35)]': variant === 'default' || variant === 'honey',
          // Glass
          'text-[#1a1a1a] border border-[rgba(0,0,0,0.08)] hover:bg-white/75 hover:-translate-y-0.5 hover:border-[rgba(0,0,0,0.12)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)]': variant === 'glass',
          // Outline
          'text-[#1a1a1a] border border-[rgba(0,0,0,0.12)] hover:bg-white/65 hover:-translate-y-0.5': variant === 'outline',
          // Ghost
          'text-[#1a1a1a] hover:bg-white/50': variant === 'ghost',
          // Secondary
          'text-[#1a1a1a] border border-[rgba(0,0,0,0.08)] hover:bg-white/75': variant === 'secondary',
          // Destructive
          'text-white border-none hover:bg-red-600': variant === 'destructive',
          // Sizes
          'h-8 px-3 text-sm': size === 'sm',
          'h-11 px-5 py-2.5': size === 'md',
          'h-12 px-6 text-base': size === 'lg',
          'h-10 w-10 p-0': size === 'icon',
        },
        className
      )}
      style={{ ...variantStyles[variant], ...style }}
      {...props}
    />
  )
})

Button.displayName = 'Button'
