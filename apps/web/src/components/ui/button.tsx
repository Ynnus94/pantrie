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
  ...props 
}, ref) => {
  return (
    <button
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center rounded-xl font-semibold transition-all duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)] focus-visible:ring-offset-2',
        'disabled:pointer-events-none disabled:opacity-50',
        'active:scale-[0.98]',
        {
          // Primary (Accent button with gradient)
          'accent-button text-white border-none hover:-translate-y-0.5': variant === 'default' || variant === 'honey',
          // Glass
          'glass-button hover:-translate-y-0.5': variant === 'glass',
          // Outline
          'glass-button border-[var(--border-medium)] hover:-translate-y-0.5': variant === 'outline',
          // Ghost
          'text-[var(--text-primary)] hover:bg-[var(--bg-glass-light)]': variant === 'ghost',
          // Secondary
          'glass-button': variant === 'secondary',
          // Destructive
          'bg-red-500 text-white border-none hover:bg-red-600': variant === 'destructive',
          // Sizes
          'h-8 px-3 text-sm': size === 'sm',
          'h-11 px-5 py-2.5': size === 'md',
          'h-12 px-6 text-base': size === 'lg',
          'h-10 w-10 p-0': size === 'icon',
        },
        className
      )}
      {...props}
    />
  )
})

Button.displayName = 'Button'
