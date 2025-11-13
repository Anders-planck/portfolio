import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { MapPin, Briefcase, Code2, Share2 } from 'lucide-react'
import authorImage from '@/public/images/authors/me2.jpg'
import { getTranslations } from 'next-intl/server'
import { SocialLinks, DEFAULT_SOCIAL_LINKS } from '@/components/social-links'
import { Highlighter } from '@/components/ui/highlighter'

export default async function Intro() {
  const [t, footerT] = await Promise.all([
    getTranslations('home.intro'),
    getTranslations('footer'),
  ])
  const topSkills = ['React', 'Next.js', 'TypeScript', 'Express.js' , 'Symfony'];

  return (
    <section className='flex items-center gap-x-10 gap-y-8 flex-col md:flex-row md:gap-y-0'>
      <div className='mt-2 flex-1 md:mt-0'>
        <div className='mb-4 flex items-center gap-2 text-sm text-muted-foreground'>
          <MapPin className='h-4 w-4' />
          <span>{t('location')}</span>
          <span className='mx-2'>•</span>
          <Briefcase className='h-4 w-4' />
          <span>{t('role')}</span>
        </div>

        <h1 className='title text-4xl no-underline mb-4'>
          {t.rich('greeting', {
            highlight: (chunks) => (
              <Highlighter action="highlight" color="var(--color-primary)">
                {chunks}
              </Highlighter>
            ),
          })}
        </h1>

        <p className='text-lg font-light text-foreground mb-3'>
          {t('tagline')}
        </p>

        <p className='font-light text-muted-foreground mb-6'>
          {t('descriptionBefore')}{' '}
          <strong className='font-semibold text-accent-foreground'>
            <Highlighter action="box" color="var(--color-primary)">
              {t('yearsExperience')}
            </Highlighter>
            </strong>
          {' '}{t('descriptionAfter')}
        </p>

        {/* Top Skills */}
        <div className='mb-6'>
          <div className='mb-2 flex items-center gap-2 text-sm font-semibold'>
            <Code2 className='h-4 w-4' />
            <span>{t('coreTechnologies')}</span>
          </div>
          <div className='flex flex-wrap gap-4 text-sm'>
            {topSkills.map((skill) => (
              <Highlighter key={skill} action="underline" color="var(--color-primary)">
                {skill}
              </Highlighter>
            ))}
          </div>
        </div>

        {/* Social Links */}
        <div className='mb-6'>
          <div className='mb-2 flex items-center gap-2 text-sm font-semibold'>
            <Share2 className='h-4 w-4' />
            <span>{t('socialTitle')}</span>
          </div>
          <SocialLinks
            links={DEFAULT_SOCIAL_LINKS}
            showLabels={false}
            ariaLabelResolver={(link) => footerT(`social.${link.id}`)}
            labelResolver={(link) => footerT(`social.${link.id}`)}
            className='flex flex-wrap gap-2'
            linkClassName='rounded-md border px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground'
          />
        </div>

        {/* CTA */}
        <div className='flex flex-wrap gap-3'>
          <Link
            href='/about'     
            className='rounded-md border px-5 py-2.5 text-sm font-semibold transition-colors hover:bg-accent'
            >
            {t('moreAboutMe')}
          </Link>
          <Link
            href='/#contact'
            className='rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90'
          >
            {t('getInTouch')}
          </Link>
        </div>
      </div>

      <div className='relative'>
        <div className='relative h-[240px] w-[240px] md:h-[280px] md:w-[280px]'>
          <div className='absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 blur-2xl' />
          <Image
            src={authorImage}
            alt={t('imageAlt')}
            width={280}
            height={280}
            className='relative rounded-2xl object-cover shadow-xl'
            priority
          />
        </div>
      </div>
    </section>
  )
}
