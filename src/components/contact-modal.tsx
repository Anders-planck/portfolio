import { Linkedin, Mail, X } from 'lucide-react'
import { useCallback, useEffect, useRef } from 'react'
import { social } from '#/data/cv-data'

const channels = [
  {
    label: 'LinkedIn',
    description: "Let's connect professionally",
    href: social.linkedin,
    icon: Linkedin,
    external: true
  },
  {
    label: 'Email',
    description: 'Drop me a message directly',
    href: social.email,
    icon: Mail,
    external: false
  }
]

export function ContactModal({
  open,
  onClose
}: {
  open: boolean
  onClose: () => void
}) {
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open) {
      dialog.showModal()
    } else {
      dialog.close()
    }
  }, [open])

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent<HTMLDialogElement>) => {
      if (e.target === dialogRef.current) onClose()
    },
    [onClose]
  )

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleEsc)
    return () => document.removeEventListener('keydown', handleEsc)
  }, [onClose])

  if (!open) return null

  return (
    <dialog
      ref={dialogRef}
      onClick={handleBackdropClick}
      className='fixed inset-0 z-50 m-auto w-[90vw] max-w-[400px] bg-transparent backdrop:bg-black/60 backdrop:backdrop-blur-sm'
    >
      <div className='bg-bg border-border relative border p-8'>
        {/* Close button */}
        <button
          type='button'
          onClick={onClose}
          className='text-fg-subtle hover:text-fg absolute top-4 right-4 transition-colors'
          aria-label='Close'
        >
          <X size={16} strokeWidth={1.5} />
        </button>

        {/* Header */}
        <div className='mb-6'>
          <h3 className='display mb-2 text-2xl font-normal'>
            Get in <em className='text-accent italic'>Touch</em>
          </h3>
          <p className='text-fg-muted text-xs font-light'>
            Choose how you'd like to connect.
          </p>
        </div>

        {/* Options */}
        <div className='space-y-2'>
          {channels.map((ch) => (
            <a
              key={ch.label}
              href={ch.href}
              target={ch.external ? '_blank' : undefined}
              rel={ch.external ? 'noopener noreferrer' : undefined}
              onClick={onClose}
              className='border-border hover:border-accent/20 hover:bg-accent/[0.03] group flex items-center gap-4 border p-4 transition-colors'
            >
              <ch.icon
                size={18}
                strokeWidth={1.5}
                className='text-fg-subtle group-hover:text-accent transition-colors'
              />
              <div>
                <div className='text-fg text-sm font-medium'>{ch.label}</div>
                <div className='text-fg-subtle text-[11px]'>
                  {ch.description}
                </div>
              </div>
              <span className='display text-accent ml-auto text-lg opacity-0 transition-opacity group-hover:opacity-100'>
                →
              </span>
            </a>
          ))}
        </div>
      </div>
    </dialog>
  )
}
