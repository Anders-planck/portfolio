import React from 'react'
import Link from 'next/link'
import { Linkedin, Github, Mail, FileText, Rss } from 'lucide-react'
import { cn } from '@/lib/utils'

const socialLinks = [
  {
    name: 'LinkedIn',
    href: 'https://linkedin.com/in/anders-planck-53184b1b4',
    icon: Linkedin,
    label: 'Connect on LinkedIn',
  },
  {
    name: 'GitHub',
    href: 'https://github.com/Anders-planck',
    icon: Github,
    label: 'Follow on GitHub',
  },
  {
    name: 'Email',
    href: 'mailto:anders.jipwouo@gmail.com',
    icon: Mail,
    label: 'Send an email',
  },
]

const footerLinks = {
  content: [
    { href: '/posts', label: 'Posts' },
    { href: '/projects', label: 'Projects' },
  ],
  resources: [
    { href: '/rss', label: 'RSS Feed', icon: Rss },
    { href: '/resume', label: 'Resume', icon: FileText },
  ],
}

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t bg-background">
      <div className="container max-w-6xl py-12 md:py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand Section */}
          <div className="space-y-4 md:col-span-2">
            <Link href="/" className="inline-block">
              <span className="font-serif text-2xl font-bold">Anders Planck</span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-md">
              Software engineer based in Ferrara, Italy. Passionate about learning new technologies and building things that make life easier.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Content</h3>
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
            <h3 className="text-sm font-semibold">Resources</h3>
            <ul className="space-y-2 text-sm">
              {footerLinks.resources.map(({ href, label, icon: Icon }) => (
                <li key={href}>
                  <Link
                    href={href}
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
            © {currentYear} Anders Planck. All rights reserved.
          </p>

          {/* Social Links */}
          <div className="flex items-center gap-4">
            {socialLinks.map(({ name, href, icon: Icon, label }) => (
              <Link
                key={name}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className={cn(
                  'text-muted-foreground transition-colors hover:text-foreground',
                  'rounded-md p-2 hover:bg-accent'
                )}
              >
                <Icon className="h-5 w-5" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
