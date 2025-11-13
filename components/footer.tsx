'use client'

import React from 'react'
import Link from 'next/link'
import { FileText, Rss } from 'lucide-react'
import { useParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'
import type { Locale } from '@/i18n/config'
import { DEFAULT_SOCIAL_LINKS, SocialLinks } from '@/components/social-links'
import { AuroraText } from '@/components/ui/aurora-text'

export default function Footer() {
  const t = useTranslations('footer')
  const tNav = useTranslations('common.nav')
  const params = useParams()
  const currentLocale = (params.locale as Locale) || 'en'
  const currentYear = new Date().getFullYear()

  const footerLinks = {
    content: [
      { href: `/${currentLocale}/posts`, label: tNav('posts') },
      { href: `/${currentLocale}/projects`, label: tNav('projects') },
    ],
    resources: [
      { href: '/rss.xml', label: t('rssFeed'), icon: Rss },
      { href: '/cv.pdf', label: t('resume'), icon: FileText },
    ],
  }

  return (
    <footer className="border-t">
      <div className="container max-w-4xl py-12 md:py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand Section */}
          <div className="space-y-4 md:col-span-2">
            <Link href={`/${currentLocale}`} className="inline-block">
            <AuroraText 
            className='text-3xl font-bold'
            >
              Anders Planck
            </AuroraText>
            </Link>
            <p className="text-sm text-muted-foreground max-w-md">
              {t('description')}
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">{t('content')}</h3>
            <ul className="space-y-2 text-sm">
              {footerLinks.content.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">{t('resources')}</h3>
            <ul className="space-y-2 text-sm">
              {footerLinks.resources.map(({ href, label, icon: Icon }) => (
                <li key={href}>
                  <Link
                    href={href}
                    download
                    className="text-muted-foreground transition-colors hover:text-foreground inline-flex items-center gap-2"
                  >
                    {Icon && <Icon className="h-3.5 w-3.5" />}
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="my-8 border-t" />

        {/* Bottom Section */}
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          {/* Copyright */}
          <p className="text-sm text-muted-foreground">
            {t('copyright', { year: currentYear })}
          </p>

          {/* Social Links */}
          <SocialLinks
            links={DEFAULT_SOCIAL_LINKS}
            ariaLabelResolver={(link) => t(`social.${link.id}`)}
            className="flex items-center gap-4"
            linkClassName={cn(
              'rounded-md p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground'
            )}
          />
        </div>
      </div>
    </footer>
  )
}
