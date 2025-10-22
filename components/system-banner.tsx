'use client'

import { X } from 'lucide-react'
import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'

type BannerType = 'info' | 'warning' | 'error' | 'success'

interface SystemBannerProps {
  message?: string
  type?: BannerType
  dismissible?: boolean
}

const bannerStyles: Record<BannerType, string> = {
  info: 'bg-blue-500/20 text-blue-900 dark:text-blue-200 border-blue-500/40',
  warning: 'bg-yellow-500/30 text-yellow-900 dark:text-yellow-200 border-yellow-500/50',
  error: 'bg-red-500/20 text-red-900 dark:text-red-200 border-red-500/40',
  success: 'bg-green-500/20 text-green-900 dark:text-green-200 border-green-500/40',
}

export default function SystemBanner({
  message,
  type,
  dismissible = true,
}: SystemBannerProps) {
  const t = useTranslations("components.systemBanner");
  const [isVisible, setIsVisible] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)

  useEffect(() => {
    const showBanner = process.env.NEXT_PUBLIC_SHOW_BANNER === 'true'

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

  const bannerMessage = message || process.env.NEXT_PUBLIC_BANNER_MESSAGE || t("defaultMessage");
  const bannerType: BannerType = (type || process.env.NEXT_PUBLIC_BANNER_TYPE as BannerType) || 'info'

  return (
    <div
      className={cn(
        'w-full border-b-2 transition-all duration-300 backdrop-blur-sm shadow-md',
        dismissible ? '' : 'fixed top-0 left-0 right-0 z-[60]',
        bannerStyles[bannerType]
      )}
      role="alert"
      aria-live="polite"
    >
      <div className="container mx-auto flex items-center justify-between gap-4 px-4 py-4">
        <div className="flex-1 text-center text-base font-semibold tracking-wide">
          {bannerMessage}
        </div>
        {dismissible && (
          <button
            onClick={handleDismiss}
            className="shrink-0 rounded-lg p-1 transition-colors hover:bg-black/5 dark:hover:bg-white/5"
            aria-label={t("dismissBanner")}
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  )
}
