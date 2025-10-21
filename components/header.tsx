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
    <header className='fixed inset-x-0 top-0 z-50 bg-background/75 py-6 backdrop-blur-sm'>
        <nav className='container mx-auto flex max-w-3xl items-center justify-between px-2 md:px-0'>
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
