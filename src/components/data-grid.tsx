import { getYearsOfExperience, skillCategories } from '#/data/cv-data'
import { projects } from '#/data/projects'
import type { GitHubData } from '#/lib/github'

export function DataGrid({ github }: { github?: GitHubData }) {
  const years = getYearsOfExperience()

  return (
    <div className='bg-border grid grid-cols-2 gap-px self-start'>
      {skillCategories.map((cat) => (
        <div key={cat.label} className='bg-surface p-5'>
          <div className='label mb-2.5'>{cat.label}</div>
          {cat.items.map((item) => (
            <div
              key={item}
              className={`display text-[15px] leading-[1.6] ${item === cat.accent ? 'text-accent' : 'text-fg'}`}
            >
              {item}
            </div>
          ))}
        </div>
      ))}

      {/* Experience */}
      <div className='bg-surface p-5'>
        <div className='label mb-2.5'>Experience</div>
        <div className='display text-4xl leading-none'>{years}+</div>
        <div className='text-fg-subtle mt-1 text-[10px]'>
          years · {projects.length} projects
        </div>
      </div>

      {/* GitHub — live data */}
      <div className='bg-surface p-5'>
        <div className='label mb-2.5'>GitHub</div>
        {github ? (
          <>
            <div className='display text-fg text-[15px] leading-[1.6]'>
              <span className='text-accent'>{github.contributions}+</span>{' '}
              contributions
            </div>
            <div className='display text-fg text-[15px] leading-[1.6]'>
              Active <span className='text-accent'>{github.lastActive}</span>
            </div>
            <div className='text-fg-subtle mt-1.5 text-[10px]'>
              {github.topLanguages.join(' · ')}
            </div>
          </>
        ) : (
          <div className='text-fg-subtle text-[10px]'>Loading...</div>
        )}
      </div>
    </div>
  )
}
