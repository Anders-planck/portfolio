'use client'

import { X } from 'lucide-react'
import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'

type BannerType = 'info' | 'warning' | 'error' | 'success'

interface SystemBannerProps {
  message?: string
  type?: BannerType
  dismissible?: boolean
}

const bannerStyles: Record<BannerType, string> = {
  info: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20',
  warning: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20',
  error: 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20',
  success: 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20',
}

export default function SystemBanner({
  message,
  type,
  dismissible = true,
}: SystemBannerProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)

  useEffect(() => {
    // Get environment variables
    const showBanner = process.env.NEXT_PUBLIC_SHOW_BANNER === 'true'
    const envMessage = process.env.NEXT_PUBLIC_BANNER_MESSAGE || '🚧 Website under construction - New features coming soon!'
    const envType = (process.env.NEXT_PUBLIC_BANNER_TYPE as BannerType) || 'info'

    // Debug logging (remove in production)
    console.log('Banner Debug:', {
      showBanner,
      envMessage,
      envType,
      NEXT_PUBLIC_SHOW_BANNER: process.env.NEXT_PUBLIC_SHOW_BANNER,
    })

    if (!showBanner) {
      setIsVisible(false)
      return
    }

    // Check if user has previously dismissed the banner
    const dismissed = dismissible ? localStorage.getItem('system-banner-dismissed') : null

    if (!dismissed) {
      setIsVisible(true)
    }
  }, [dismissible])

  const handleDismiss = () => {
    setIsDismissed(true)
    setIsVisible(false)
    if (dismissible) {
      localStorage.setItem('system-banner-dismissed', 'true')
    }
  }

  if (!isVisible || isDismissed) {
    return null
  }

  const bannerMessage = message || process.env.NEXT_PUBLIC_BANNER_MESSAGE || '🚧 Website under construction - New features coming soon!'
  const bannerType: BannerType = (type || process.env.NEXT_PUBLIC_BANNER_TYPE as BannerType) || 'info'

  return (
    <div
      className={cn(
        'fixed top-0 left-0 right-0 z-50 border-b transition-all duration-300',
        bannerStyles[bannerType]
      )}
      role="alert"
      aria-live="polite"
    >
      <div className="container mx-auto flex items-center justify-between gap-4 px-4 py-3">
        <div className="flex-1 text-center text-sm font-medium">
          {bannerMessage}
        </div>
        {dismissible && (
          <button
            onClick={handleDismiss}
            className="shrink-0 rounded-lg p-1 transition-colors hover:bg-black/5 dark:hover:bg-white/5"
            aria-label="Dismiss banner"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  )
}
