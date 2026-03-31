import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { ContactModal } from '#/components/contact-modal'
import { DataGrid } from '#/components/data-grid'
import { Hero } from '#/components/hero'
import { ProjectRow } from '#/components/project-row'
import { Timeline } from '#/components/timeline'
import { bio, education, social, workExperience } from '#/data/cv-data'
import { projects } from '#/data/projects'
import { siteConfig } from '#/data/site'
import { fetchGitHubData, GITHUB_FALLBACK } from '#/lib/github'

export const Route = createFileRoute('/')({ component: Home })

function formatPeriod(start: string, end: string | null): string {
  const fmt = (d: string) => {
    const date = new Date(d)
    return date.toLocaleDateString('en', {
      month: 'short',
      year: 'numeric'
    })
  }
  return `${fmt(start)} — ${end ? fmt(end) : 'Present'}`
}

function Home() {
  const [contactOpen, setContactOpen] = useState(false)
  const { data: github } = useQuery({
    queryKey: ['github'],
    queryFn: () => fetchGitHubData(),
    initialData: GITHUB_FALLBACK,
    staleTime: 60 * 60 * 1000
  })

  return (
    <main className='page-wrap'>
      {/* ===== HERO ===== */}
      <section className='hero-grid'>
        <Hero />
        <DataGrid github={github} />
      </section>

      {/* ===== PROJECTS ===== */}
      <section id='projects' className='border-border mt-16 border-t pt-9'>
        <div className='label mb-5 tracking-[3px]'>Selected Work</div>
        <div>
          {projects.map((p) => (
            <ProjectRow key={p.slug} project={p} />
          ))}
        </div>
      </section>

      {/* ===== ABOUT ===== */}
      <section id='about' className='border-border mt-16 border-t pt-9 pb-16'>
        <div className='label mb-8 tracking-[3px]'>About</div>

        <div className='mb-12 grid grid-cols-[1fr_1.4fr] gap-10 max-md:grid-cols-1'>
          <div className='border-accent/10 relative aspect-square w-full overflow-hidden border max-md:max-w-[240px]'>
            <picture>
              <source srcSet='/images/avatar.webp' type='image/webp' />
              <img
                src='/images/avatar.png'
                alt='Anders Planck'
                className='h-full w-full object-cover'
                width={1024}
                height={1024}
              />
            </picture>
          </div>
          <div>
            <h2 className='display mb-4 text-4xl font-normal max-sm:text-3xl'>
              Anders <em className='text-accent italic'>Planck</em>
            </h2>
            {bio.about.map((p) => (
              <p
                key={p.slice(0, 20)}
                className='text-fg-muted mb-4 text-[13px] leading-[1.9] font-light'
              >
                {p}
              </p>
            ))}
            <div className='mt-5 flex gap-5'>
              <a
                href={social.github}
                target='_blank'
                rel='noopener noreferrer'
                className='text-accent border-accent/30 border-b pb-0.5 text-[10px] tracking-[1px] uppercase'
              >
                GitHub
              </a>
              <a
                href={social.linkedin}
                target='_blank'
                rel='noopener noreferrer'
                className='text-accent border-accent/30 border-b pb-0.5 text-[10px] tracking-[1px] uppercase'
              >
                LinkedIn
              </a>
              <a
                href={social.email}
                className='text-accent border-accent/30 border-b pb-0.5 text-[10px] tracking-[1px] uppercase'
              >
                Email
              </a>
            </div>
          </div>
        </div>

        <div className='mb-12'>
          <Timeline
            label='Experience'
            items={workExperience.map((w) => ({
              title: w.role,
              subtitle: w.company,
              period: formatPeriod(w.startDate, w.endDate),
              description: w.description,
              isCurrent: w.endDate === null
            }))}
          />
        </div>

        <Timeline
          label='Education'
          items={education.map((e) => ({
            title: e.degree,
            subtitle: e.institution,
            period: formatPeriod(e.startDate, e.endDate),
            isCurrent: !e.completed
          }))}
        />
      </section>

      {/* ===== CTA ===== */}
      <section className='border-border mt-16 border-t pt-16 pb-20 text-center'>
        <h2 className='display mb-4 text-3xl font-normal max-sm:text-2xl'>
          Let's build something{' '}
          <em className='text-accent italic'>together.</em>
        </h2>
        <p className='text-fg-muted mx-auto mb-8 max-w-[480px] text-sm font-light'>
          Looking for a software engineer who ships? I'm open to new
          opportunities, freelance projects, and interesting collaborations.
        </p>
        <div className='flex justify-center gap-3 max-sm:flex-col max-sm:items-center'>
          <button
            type='button'
            onClick={() => setContactOpen(true)}
            className='border-accent text-accent hover:bg-accent/10 inline-flex cursor-pointer items-center justify-center border px-7 py-3 text-[11px] font-medium tracking-[2px] uppercase transition-colors'
          >
            Get in Touch
          </button>
          <a
            href={siteConfig.cvUrl}
            download
            className='border-fg/12 text-fg-muted hover:border-fg/25 hover:text-fg inline-flex items-center justify-center border px-7 py-3 text-[11px] tracking-[2px] uppercase transition-colors'
          >
            Download CV
          </a>
        </div>
      </section>

      <ContactModal open={contactOpen} onClose={() => setContactOpen(false)} />
    </main>
  )
}
