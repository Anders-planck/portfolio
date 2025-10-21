"use client"

import { Button } from '@/components/ui/button'
import { MoonIcon, SunIcon } from 'lucide-react'
import { useTheme } from 'next-themes'
import React from 'react'

export default function ThemeToggle() {
    const { resolvedTheme, setTheme } = useTheme()
    const [mounted, setMounted] = React.useState(false)

    React.useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) {
        return null
    }
  return (
    <Button
      size="sm"
      variant="ghost"
      onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
    >
      {resolvedTheme === 'dark' ? 
      (<SunIcon className='size-4 text-orange-300' />)
      : (<MoonIcon className='size-4 text-sky-950' />)}

      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
