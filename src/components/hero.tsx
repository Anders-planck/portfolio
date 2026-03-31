import { bio } from '#/data/cv-data'
import { siteConfig } from '#/data/site'

export function Hero() {
  return (
    <div className='pt-20 max-md:pt-12 max-sm:pt-8'>
      <h1 className='display mb-6 text-[56px] leading-[1.08] font-normal max-md:text-[44px] max-sm:text-[36px]'>
        {bio.headline.replace('scale.', '')}
        <em className='text-accent italic'>scale.</em>
      </h1>
      <p className='text-fg-muted max-w-[420px] text-sm leading-[1.8] font-light'>
        {bio.description}
      </p>
      <div className='mt-8 flex gap-3 max-sm:flex-col'>
        <a
          href='#projects'
          className='border-accent text-accent hover:bg-accent/10 inline-flex items-center justify-center border px-7 py-3 text-[11px] font-medium tracking-[2px] uppercase transition-colors'
        >
          View Projects
        </a>
        <a
          href={siteConfig.cvUrl}
          download
          className='border-fg/12 text-fg-muted hover:border-fg/25 hover:text-fg inline-flex items-center justify-center border px-7 py-3 text-[11px] tracking-[2px] uppercase transition-colors'
        >
          Download CV
        </a>
      </div>
    </div>
  )
}
