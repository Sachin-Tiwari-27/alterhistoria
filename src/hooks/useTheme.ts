import { useEffect } from 'react'
import { useUIStore } from '@/store/uiStore'

export function useTheme() {
  const theme = useUIStore((s) => s.theme)
  const toggleTheme = useUIStore((s) => s.toggleTheme)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  return { theme, toggleTheme }
}
