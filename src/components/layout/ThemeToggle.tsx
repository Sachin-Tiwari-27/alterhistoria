import { Sun, Moon } from 'lucide-react'
import { useUIStore } from '@/store/uiStore'

export function ThemeToggle() {
  const theme = useUIStore((s) => s.theme)
  const toggleTheme = useUIStore((s) => s.toggleTheme)

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
      title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
    </button>
  )
}
