'use client'

import { Moon, Sun } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useTheme } from '@/components/theme-provider'

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  return (
    <Button
      variant="secondary"
      size="md"
      iconOnly
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      {theme === 'dark' ? <Moon className="size-5" /> : <Sun className="size-5" />}
    </Button>
  )
}
