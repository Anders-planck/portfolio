"use client"

import React, { memo } from "react"

interface AuroraTextProps {
  children: React.ReactNode
  className?: string
  colors?: string[]
  speed?: number
}

export const AuroraText = memo(
  ({
    children,
  className = "",
    colors,
    speed = 1,
  }: AuroraTextProps) => {
    const gradientOverride =
      colors && colors.length
        ? `linear-gradient(135deg, ${[...colors, colors[0]].join(", ")})`
        : undefined

    const durationOverride = speed !== 1 ? `${10 / speed}s` : undefined

    const gradientStyle =
      gradientOverride || durationOverride
        ? ({
            ...(gradientOverride && { "--aurora-gradient": gradientOverride }),
            ...(durationOverride && { "--aurora-duration": durationOverride }),
          } as React.CSSProperties)
        : undefined

    return (
      <span className={`relative inline-block ${className}`}>
        <span className="sr-only">{children}</span>
        <span
          className="aurora-text animate-aurora relative bg-size-[200%_auto]"
          style={gradientStyle}
          aria-hidden="true"
        >
          {children}
        </span>
      </span>
    )
  }
)

AuroraText.displayName = "AuroraText"
