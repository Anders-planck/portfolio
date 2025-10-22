import Projects from '@/components/projects';
import { getProjects } from '@/lib/projects';
import Link from 'next/link';
import React from 'react';
import { getTranslations } from 'next-intl/server';

export default async function RecentProjects() {
    const t = await getTranslations("components.recentProjects");
    const projects = await getProjects(1);
  return (
    <section className='pb-24'>
        <div>
            <h2 className='title mb-12'>{t("title")}</h2>

            <Projects projects={projects} />

            <Link
                href="/projects"
                className='mt-8 inline-flex items-center gap-2 text-muted-foreground hover:text-foreground underline'
            >
               <span>{t("allProjects")}</span>
            </Link>
        </div>
    </section>
  )
}
