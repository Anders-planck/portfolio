import ProjectsWithFilters from '@/components/projects-with-filters'
import { getProjects } from '@/lib/projects'
import React from 'react'

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
