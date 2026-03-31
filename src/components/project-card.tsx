import { Link } from '@tanstack/react-router'
import type { Project } from '#/data/projects'

export function ProjectCard({ project }: { project: Project }) {
  return (
    <Link
      to='/projects/$slug'
      params={{ slug: project.slug }}
      className='bg-surface hover:bg-accent/[0.03] block p-7 transition-colors'
    >
      <div className='display text-fg mb-2 text-xl'>{project.title}</div>
      <div className='text-[11px] leading-[1.6] text-[#666]'>
        {project.summary.split('.')[0]}.
      </div>
      <div className='text-accent mt-3.5 text-[9px] tracking-[1px] uppercase'>
        {project.tags.join(' · ')}
      </div>
    </Link>
  )
}
