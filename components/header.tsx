'use client'

import ThemeToggle from '@/components/theme-toggle'
import LanguageSwitcher from '@/components/language-switcher'
import Link from 'next/link'
import { usePathname, useParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import React from 'react'
import type { Locale } from '@/i18n/config'
import { Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer'

function getHeaderLinks(locale: Locale) {
  return [
    { href: `/${locale}/about`, label: 'about' },
    { href: `/${locale}/posts`, label: 'posts' },
    { href: `/${locale}/projects`, label: 'projects' },
    { href: '#contact', label: 'contact', isAnchor: true },
  ]
}

export default function Header() {
  const t = useTranslations('common.nav')
  const params = useParams()
  const pathname = usePathname()
  const currentLocale = (params.locale as Locale) || 'en'
  const HeaderLinks = getHeaderLinks(currentLocale)
  const [bannerHeight, setBannerHeight] = React.useState(0)
  const [isScrolled, setIsScrolled] = React.useState(false)
  const [drawerOpen, setDrawerOpen] = React.useState(false)

  React.useEffect(() => {
    const updateBannerHeight = () => {
      const banner = document.querySelector('[role="alert"]')
      setBannerHeight(banner ? banner.getBoundingClientRect().height : 0)
    }

    updateBannerHeight()
    window.addEventListener('resize', updateBannerHeight)

    // Observer for banner visibility changes
    const observer = new MutationObserver(updateBannerHeight)
    observer.observe(document.body, { childList: true, subtree: true })

    return () => {
      window.removeEventListener('resize', updateBannerHeight)
      observer.disconnect()
    }
  }, [])

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleContactClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    setDrawerOpen(false) // Close drawer on mobile

    if (pathname !== '/') {
      window.location.href = '/#contact'
    } else {
      const contactSection = document.getElementById('contact')
      if (contactSection) {
        contactSection.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        })
      }
    }
  }

  const handleLinkClick = () => {
    setDrawerOpen(false) // Close drawer when any link is clicked
  }

  return (
    <header
      className={`fixed inset-x-0 z-50 bg-background/75 py-6 backdrop-blur-sm transition-all duration-300 ${
        isScrolled ? 'shadow-md' : ''
      }`}
      style={{ top: `${bannerHeight}px` }}
    >
      <nav className='container mx-auto flex max-w-4xl items-center justify-between px-4 md:px-0'>
        {/* Logo */}
        <div>
          <Link href={`/${currentLocale}`} className='font-serif title text-2xl font-bold'>AP</Link>
        </div>

        {/* Desktop Navigation - hidden on mobile */}
        <ul className='hidden md:flex items-center gap-6 text-sm font-light text-muted-foreground'>
          {HeaderLinks.map(({ href, label, isAnchor }) => {
            const isActive = !isAnchor && pathname === href
            return (
              <li key={href} className='transition-colors hover:text-foreground'>
                {isAnchor ? (
                  <a href={href} onClick={handleContactClick} className='cursor-pointer'>
                    {t(label as 'about' | 'posts' | 'projects' | 'contact')}
                  </a>
                ) : (
                  <Link
                    href={href}
                    className={isActive ? 'text-foreground font-medium border-b-2 border-primary' : ''}
                  >
                    {t(label as 'about' | 'posts' | 'projects' | 'contact')}
                  </Link>
                )}
              </li>
            )
          })}
        </ul>

        {/* Desktop Controls - hidden on mobile */}
        <div className="hidden md:flex items-center gap-2">
          <LanguageSwitcher />
          <ThemeToggle />
        </div>

        {/* Mobile Drawer */}
        <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
          <DrawerTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon" aria-label="Open menu">
              <Menu className="h-6 w-6" />
            </Button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle className="text-left">Menu</DrawerTitle>
            </DrawerHeader>
            <div className="px-4 pb-8">
              {/* Mobile Navigation Links */}
              <ul className='flex flex-col gap-4 mb-6'>
                {HeaderLinks.map(({ href, label, isAnchor }) => {
                  const isActive = !isAnchor && pathname === href
                  return (
                    <li key={href} className='text-lg font-light text-muted-foreground transition-colors hover:text-foreground'>
                      {isAnchor ? (
                        <a href={href} onClick={handleContactClick} className='cursor-pointer block py-2'>
                          {t(label as 'about' | 'posts' | 'projects' | 'contact')}
                        </a>
                      ) : (
                        <Link
                          href={href}
                          onClick={handleLinkClick}
                          className={`block py-2 ${
                            isActive ? 'text-foreground font-medium border-l-4 border-primary pl-4 bg-primary/10' : ''
                          }`}
                        >
                          {t(label as 'about' | 'posts' | 'projects' | 'contact')}
                        </Link>
                      )}
                    </li>
                  )
                })}
              </ul>

              {/* Mobile Controls */}
              <div className="flex items-center gap-4 pt-4 border-t border-border">
                <LanguageSwitcher />
                <ThemeToggle />
              </div>
            </div>
          </DrawerContent>
        </Drawer>
      </nav>
    </header>
  )
}
