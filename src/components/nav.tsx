import { Link } from '@tanstack/react-router'
import { useState } from 'react'
import { ThemeToggle } from '#/components/theme-toggle'
import { siteConfig } from '#/data/site'

export function Nav() {
  const [open, setOpen] = useState(false)

  return (
    <nav className='relative flex items-center justify-between px-12 py-7 max-md:px-7 max-md:py-5 max-sm:px-5 max-sm:py-4'>
      {/* Brand */}
      <Link to='/' className='group flex items-center gap-3'>
        <div className='bg-accent h-2 w-2 rounded-full' />
        <span className='text-accent text-[11px] font-medium tracking-[3px] uppercase'>
          {siteConfig.name}
        </span>
      </Link>

      {/* Desktop nav */}
      <div className='flex items-center gap-7 max-sm:hidden'>
        {siteConfig.nav.map((item) => (
          <a
            key={item.href}
            href={item.href}
            className='hover:text-fg-muted text-[11px] tracking-[1px] text-[#5a5549] transition-colors'
          >
            {item.label}
          </a>
        ))}
        <a
          href={siteConfig.cvUrl}
          download
          className='text-accent border-accent border-b pb-0.5 text-[11px] tracking-[1px]'
        >
          résumé
        </a>
        <ThemeToggle />
      </div>

      {/* Mobile hamburger */}
      <button
        type='button'
        onClick={() => setOpen(!open)}
        className='hidden h-6 w-6 flex-col justify-center gap-[5px] max-sm:flex'
        aria-label='Toggle menu'
      >
        <span className='bg-accent block h-px w-full' />
        <span className='bg-accent block h-px w-full' />
        <span className='bg-accent block h-px w-full' />
      </button>

      {/* Mobile menu */}
      {open && (
        <div className='bg-bg/97 border-border absolute top-14 right-0 left-0 z-20 hidden flex-col gap-4 border-b p-5 backdrop-blur-xl max-sm:flex'>
          {siteConfig.nav.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className='text-fg-subtle text-[11px] tracking-[1px]'
            >
              {item.label}
            </a>
          ))}
          <a
            href={siteConfig.cvUrl}
            download
            className='text-accent text-[11px] tracking-[1px]'
          >
            résumé
          </a>
          <ThemeToggle />
        </div>
      )}
    </nav>
  )
}
