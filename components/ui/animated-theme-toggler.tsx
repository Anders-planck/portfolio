"use client"

import { useCallback, useRef } from "react"
import type { ReactNode } from "react"
import { Moon, Sun } from "lucide-react"
import { flushSync } from "react-dom"
import { useTheme } from "next-themes"

import { cn } from "@/lib/utils"

interface AnimatedThemeTogglerProps
  extends React.ComponentPropsWithoutRef<"button"> {
  duration?: number
  lightIcon?: ReactNode
  darkIcon?: ReactNode
}

export const AnimatedThemeToggler = ({
  className,
  duration = 400,
  lightIcon,
  darkIcon,
  ...props
}: AnimatedThemeTogglerProps) => {
  const { resolvedTheme, setTheme } = useTheme()
  const buttonRef = useRef<HTMLButtonElement>(null)
  const isDark = resolvedTheme === "dark"

  const toggleTheme = useCallback(() => {
    const nextTheme = isDark ? "light" : "dark"

    const applyTheme = () => {
      flushSync(() => {
        setTheme(nextTheme)
      })
    }

    if (
      typeof document === "undefined" ||
      typeof document.startViewTransition !== "function"
    ) {
      applyTheme()
      return
    }

    const transition = document.startViewTransition(() => {
      applyTheme()
    })

    transition.ready
      .then(() => {
        const button = buttonRef.current
        if (!button) return

        const { top, left, width, height } = button.getBoundingClientRect()
        const x = left + width / 2
        const y = top + height / 2
        const maxRadius = Math.hypot(
          Math.max(x, window.innerWidth - x),
          Math.max(y, window.innerHeight - y)
        )

        document.documentElement.animate(
          {
            clipPath: [
              `circle(0px at ${x}px ${y}px)`,
              `circle(${maxRadius}px at ${x}px ${y}px)`,
            ],
          },
          {
            duration,
            easing: "ease-in-out",
            pseudoElement: "::view-transition-new(root)",
          }
        )
      })
      .catch(() => {
        // graceful fallback if transitions fail
      })
  }, [isDark, duration, setTheme])

  return (
    <button
      ref={buttonRef}
      onClick={toggleTheme}
      className={cn(className)}
      {...props}
    >
      {isDark
        ? lightIcon ?? <Sun className="size-4" />
        : darkIcon ?? <Moon className="size-4" />}
      <span className="sr-only">Toggle theme</span>
    </button>
  )
}
