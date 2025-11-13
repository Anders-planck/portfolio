"use client"

import { AnimatedThemeToggler } from '@/components/ui/animated-theme-toggler'
import { MoonIcon, SunIcon } from 'lucide-react'
import React from 'react'

export default function ThemeToggle() {
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <AnimatedThemeToggler
     lightIcon={<SunIcon className='size-4 text-black dark:text-white' />}
      darkIcon={<MoonIcon className='size-4 text-black dark:text-white' />}
      aria-label='Toggle theme'
    />
  )
}
