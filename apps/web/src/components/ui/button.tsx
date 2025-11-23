import { cn } from '../../lib/utils'
import { ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
}

export function Button({ 
  className, 
  variant = 'default', 
  size = 'md',
  ...props 
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF9500] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
        {
          'bg-[#FF9500] text-white hover:bg-[#FF8500] active:bg-[#FF7500] shadow-md hover:shadow-lg': variant === 'default',
          'border border-[#16250F]/20 bg-white hover:bg-[#F5F1E8] hover:border-[#FF9500]': variant === 'outline',
          'hover:bg-[#F5F1E8]': variant === 'ghost',
          'h-8 px-3 text-sm': size === 'sm',
          'h-11 px-4 py-2.5': size === 'md',
          'h-12 px-6 text-base': size === 'lg',
        },
        className
      )}
      {...props}
    />
  )
}

