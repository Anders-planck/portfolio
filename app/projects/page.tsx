import type { Metadata } from 'next'
import ProjectsWithFilters from '@/components/projects-with-filters'
import { getProjects } from '@/lib/projects'
import React from 'react'

export const metadata: Metadata = {
  title: 'Projects',
  description: 'Explore my portfolio of web development projects, including full-stack applications, open-source contributions, and technical experiments.',
  openGraph: {
    title: 'Projects | Anders Planck',
    description: 'Portfolio of web development projects and open-source contributions.',
    url: 'https://anders-games.com/projects',
    type: 'website',
  },
}

export default async function ProjectsPages() {
  const projects = await getProjects()
  return (
    <section className='pb-24 pt-40'>
      <div className='container max-w-3xl'>
        <h1 className='title mb-12'>Projects</h1>
        <ProjectsWithFilters initialProjects={projects} />
      </div>
    </section>
  )
}
