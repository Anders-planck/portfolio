import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { MapPin, Briefcase, Code2 } from 'lucide-react'
import authorImage from '@/public/images/authors/me2.jpg'

export default function Intro() {
  const topSkills = ['React', 'Next.js', 'TypeScript', 'PHP', 'Laravel'];

  return (
    <section className='flex items-center gap-x-10 gap-y-8 flex-col md:flex-row md:gap-y-0'>
      <div className='mt-2 flex-1 md:mt-0'>
        <div className='mb-4 flex items-center gap-2 text-sm text-muted-foreground'>
          <MapPin className='h-4 w-4' />
          <span>Ferrara, Italy</span>
          <span className='mx-2'>•</span>
          <Briefcase className='h-4 w-4' />
          <span>Full-Stack Developer</span>
        </div>

        <h1 className='title no-underline mb-4'>
          Hello, I&apos;m Anders!
        </h1>

        <p className='text-lg font-light text-foreground mb-3'>
          Full-Stack Developer specializing in building exceptional digital experiences
        </p>

        <p className='font-light text-muted-foreground mb-6'>
          I craft scalable web applications with <strong className='font-semibold text-foreground'>3+ years of experience</strong> in modern technologies.
          Passionate about clean code, performance optimization, and creating intuitive user interfaces that solve real-world problems.
        </p>

        {/* Top Skills */}
        <div className='mb-6'>
          <div className='mb-2 flex items-center gap-2 text-sm font-semibold'>
            <Code2 className='h-4 w-4' />
            <span>Core Technologies</span>
          </div>
          <div className='flex flex-wrap gap-2'>
            {topSkills.map((skill) => (
              <Badge key={skill} variant="secondary" className='text-sm'>
                {skill}
              </Badge>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className='flex flex-wrap gap-3'>
          <Link
            href='/about'
            className='rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90'
          >
            More About Me
          </Link>
          <Link
            href='/#contact'
            className='rounded-md border px-5 py-2.5 text-sm font-semibold transition-colors hover:bg-accent'
          >
            Get In Touch
          </Link>
        </div>
      </div>

      <div className='relative'>
        <div className='relative h-[240px] w-[240px] md:h-[280px] md:w-[280px]'>
          <div className='absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 blur-2xl' />
          <Image
            src={authorImage}
            alt='Anders Planck - Full-Stack Developer'
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
