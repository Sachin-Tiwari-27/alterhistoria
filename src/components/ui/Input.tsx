import { cn } from '@/lib/utils'

type InputProps = React.InputHTMLAttributes<HTMLInputElement>

export function Input({ className, ...props }: InputProps) {
  return (
    <input
      className={cn(
        'w-full bg-input border border-border rounded-sm px-3 py-2 text-sm text-foreground',
        'placeholder:text-muted-foreground outline-none focus:border-primary transition-colors',
        'disabled:opacity-60',
        className
      )}
      {...props}
    />
  )
}
