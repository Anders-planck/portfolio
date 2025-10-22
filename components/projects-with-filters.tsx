'use client'

import { useState, useMemo, useCallback } from 'react'
import { ProjectMetadata } from '@/lib/projects'
import Projects from '@/components/projects'
import Pagination from '@/components/pagination'
import ProjectFilters from '@/components/projects-filters'
import { useTranslations } from 'next-intl'

interface ProjectsWithFiltersProps {
  initialProjects: ProjectMetadata[]
}

export default function ProjectsWithFilters({ initialProjects }: ProjectsWithFiltersProps) {
  const t = useTranslations('projects')
  const [filteredProjects, setFilteredProjects] = useState<ProjectMetadata[]>(initialProjects)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(4)

  // Calculate pagination
  const totalPages = Math.ceil(filteredProjects.length / itemsPerPage)

  // Get current page Projects
  const paginatedProjects = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return filteredProjects.slice(startIndex, endIndex)
  }, [filteredProjects, currentPage, itemsPerPage])

  // Reset to page 1 when filters change
  const handleFilteredProjectsChange = useCallback((Projects: ProjectMetadata[]) => {
    setFilteredProjects(Projects)
    setCurrentPage(1)
  }, [])

  // Handle items per page change
  const handleItemsPerPageChange = useCallback((items: number) => {
    setItemsPerPage(items)
    setCurrentPage(1) // Reset to first page
  }, [])

  return (
    <>
      <ProjectFilters
        Projects={initialProjects}
        onFilteredProjectsChange={handleFilteredProjectsChange}
      />

      {filteredProjects.length > 0 ? (
        <>
          <Projects projects={paginatedProjects} />

          {filteredProjects.length > itemsPerPage && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              itemsPerPage={itemsPerPage}
              onItemsPerPageChange={handleItemsPerPageChange}
              totalItems={filteredProjects.length}
            />
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg">{t('noProjects')}</p>
          <p className="text-muted-foreground text-sm mt-2">
            {t('adjustFilters')}
          </p>
        </div>
      )}
    </>
  )
}
