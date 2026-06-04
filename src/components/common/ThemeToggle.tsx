'use client'

import { useEffect } from 'react'
import { Sun, Moon } from 'lucide-react'
import { useUIStore } from '@/store/uiStore'

export function ThemeToggle() {
  const { theme, setTheme } = useUIStore()

  useEffect(() => {
    // Initialize from localStorage or system preference
    const stored = localStorage.getItem('estateflow-theme') as 'dark' | 'light' | null
    const initial = stored || 'dark'
    setTheme(initial)
  }, [setTheme])

  const toggle = () => {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    localStorage.setItem('estateflow-theme', next)
  }

  return (
    <button
      onClick={toggle}
      className="rounded-button p-2 text-sidebar-text hover:text-white hover:bg-white/10 transition-colors"
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  )
}
