'use client'

import ThemeToggle from '@/components/theme-toggle'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React from 'react'

const HeaderLinks = [
  { href: '/posts', label: 'Posts' },
  { href: '/projects', label: 'Projects' },
  { href: '#contact', label: 'Contact', isAnchor: true },
]

export default function Header() {
  const pathname = usePathname()
  const [bannerHeight, setBannerHeight] = React.useState(0)
  const [isScrolled, setIsScrolled] = React.useState(false)

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

  return (
    <header
      className={`fixed inset-x-0 z-50 bg-background/75 py-6 backdrop-blur-sm transition-all duration-300 ${
        isScrolled ? 'shadow-md' : ''
      }`}
      style={{ top: `${bannerHeight}px` }}
    >
        <nav className='container mx-auto flex max-w-4xl items-center justify-between px-2 md:px-0'>
            <div>
                <Link href="/" className='font-serif title text-2xl font-bold'>AP</Link>
            </div>

            <ul className='flex items-center gap-6 text-sm font-light text-muted-foreground'>
                {HeaderLinks.map(({ href, label, isAnchor }) => (
                    <li key={href} className='transition-colors hover:text-foreground'>
                        {isAnchor ? (
                          <a href={href} onClick={handleContactClick} className='cursor-pointer'>
                            {label}
                          </a>
                        ) : (
                          <Link href={href}>{label}</Link>
                        )}
                    </li>
                ))}
            </ul>

            <div>
                <ThemeToggle />
            </div>
        </nav>
    </header>
  )
}
