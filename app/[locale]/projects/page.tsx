import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server';
import ProjectsWithFilters from '@/components/projects-with-filters'
import { getProjects } from '@/lib/projects'
import type { Locale } from '@/i18n/config';

type Props = {
  params: Promise<{ locale: Locale }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'projects.meta' });

  return {
    title: t('title'),
    description: t('description'),
    alternates: {
      canonical: `https://anders-games.com/${locale}/projects`,
    },
    openGraph: {
      title: `${t('title')} | Anders Planck`,
      description: t('description'),
      url: `https://anders-games.com/${locale}/projects`,
      type: 'website',
      locale: locale === 'en' ? 'en_US' : locale === 'it' ? 'it_IT' : 'fr_FR',
    },
  };
}

export default async function ProjectsPages({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'projects' });
  const projects = await getProjects(undefined, locale);

  return (
    <section className='pb-24 pt-44 md:pt-40'>
      <div className='container max-w-4xl'>
        <h1 className='title mb-12'>{t('title')}</h1>
        <ProjectsWithFilters initialProjects={projects} />
      </div>
    </section>
  )
}
