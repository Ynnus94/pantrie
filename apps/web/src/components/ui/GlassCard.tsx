import React from 'react'
import { cn } from '../../lib/utils'

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  className?: string
  hover?: boolean
  intensity?: 'light' | 'medium' | 'strong'
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

export function GlassCard({ 
  children, 
  className, 
  hover = true,
  intensity = 'medium',
  padding = 'md',
  ...props 
}: GlassCardProps) {
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  }

  // Apple-standard intensity styles (higher opacity for minimal bg)
  const intensityStyles: Record<string, React.CSSProperties> = {
    light: {
      background: 'rgba(255, 255, 255, 0.6)',
      backdropFilter: 'blur(16px) saturate(140%)',
      WebkitBackdropFilter: 'blur(16px) saturate(140%)',
    },
    medium: {
      background: 'rgba(255, 255, 255, 0.7)',
      backdropFilter: 'blur(20px) saturate(150%)',
      WebkitBackdropFilter: 'blur(20px) saturate(150%)',
    },
    strong: {
      background: 'rgba(255, 255, 255, 0.8)',
      backdropFilter: 'blur(24px) saturate(160%)',
      WebkitBackdropFilter: 'blur(24px) saturate(160%)',
    },
  }

  const baseClasses = cn(
    'rounded-2xl border border-white/50',
    'shadow-[0_8px_32px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.9)]',
    'transition-all duration-300 ease-out',
    paddingClasses[padding],
    hover && 'hover:bg-white/80 hover:-translate-y-1 hover:shadow-[0_12px_48px_rgba(0,0,0,0.12),inset_0_1px_0_rgba(255,255,255,1)]',
    className
  )

  return (
    <div 
      className={baseClasses}
      style={intensityStyles[intensity]}
      {...props}
    >
      {children}
    </div>
  )
}

// Glass Card Header
export function GlassCardHeader({ 
  children, 
  className,
  ...props 
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div 
      className={cn('flex flex-col space-y-1.5', className)}
      {...props}
    >
      {children}
    </div>
  )
}

// Glass Card Title
export function GlassCardTitle({ 
  children, 
  className,
  ...props 
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 
      className={cn(
        'text-xl font-semibold text-[#1a1a1a] tracking-tight',
        className
      )}
      {...props}
    >
      {children}
    </h3>
  )
}

// Glass Card Description
export function GlassCardDescription({ 
  children, 
  className,
  ...props 
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p 
      className={cn('text-sm text-[#4a4a4a]', className)}
      {...props}
    >
      {children}
    </p>
  )
}

// Glass Card Content
export function GlassCardContent({ 
  children, 
  className,
  ...props 
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div 
      className={cn('mt-4', className)}
      {...props}
    >
      {children}
    </div>
  )
}
