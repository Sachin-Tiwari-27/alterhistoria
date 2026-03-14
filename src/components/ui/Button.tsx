import { cn } from '@/lib/utils'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
}

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'font-cinzel tracking-widest transition-all rounded-sm disabled:opacity-40 disabled:cursor-not-allowed',
        {
          'bg-primary text-primary-foreground hover:opacity-90': variant === 'primary',
          'border border-border text-muted-foreground hover:border-primary hover:text-foreground': variant === 'outline',
          'text-muted-foreground hover:text-foreground hover:bg-muted': variant === 'ghost',
        },
        {
          'text-[8px] px-2.5 py-1': size === 'sm',
          'text-[10px] px-4 py-2': size === 'md',
          'text-xs px-6 py-3': size === 'lg',
        },
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}
