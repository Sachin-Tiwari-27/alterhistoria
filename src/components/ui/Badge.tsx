import { cn } from '@/lib/utils'

interface BadgeProps {
  variant?: 'default' | 'ally' | 'rival' | 'neutral'
  children: React.ReactNode
  className?: string
}

export function Badge({ variant = 'default', children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center text-[9px] px-1.5 py-0.5 rounded-sm border font-cinzel tracking-wide',
        {
          'bg-muted border-border text-muted-foreground': variant === 'default',
          'bg-green-900/30 border-green-900 text-green-400': variant === 'ally',
          'bg-red-900/30 border-red-900 text-red-400': variant === 'rival',
          'bg-muted/30 border-border/60 text-muted-foreground': variant === 'neutral',
        },
        className
      )}
    >
      {children}
    </span>
  )
}
