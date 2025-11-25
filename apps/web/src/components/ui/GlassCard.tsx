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

  // Map intensity to CSS class
  const intensityClasses = {
    light: 'glass-card-light',
    medium: 'glass-card-base',
    strong: 'glass-card-strong',
  }

  const baseClasses = cn(
    intensityClasses[intensity],
    paddingClasses[padding],
    hover && 'glass-card-hover',
    className
  )

  return (
    <div 
      className={baseClasses}
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
        'text-xl font-semibold text-primary tracking-tight',
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
      className={cn('text-sm text-secondary', className)}
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
