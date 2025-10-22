import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import Image from 'next/image';
import Link from 'next/link';
import { Mail, Github, Linkedin, MapPin, Briefcase } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import authorImage from '@/public/images/authors/me2.jpg';
import { Timeline, TimelineItem } from '@/components/timeline';
import {
  workExperience,
  education,
  personalProjects,
  skills
} from '@/lib/cv-data';
import type { Locale } from '@/i18n/config';

type Props = {
  params: Promise<{ locale: Locale }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'about.meta' });

  return {
    title: t('title'),
    description: t('description'),
    alternates: {
      canonical: `https://anders-games.com/${locale}/about`,
    },
    openGraph: {
      title: 'About Anders Planck | Full-Stack Developer',
      description: t('description'),
      url: `https://anders-games.com/${locale}/about`,
      type: 'profile',
      locale: locale === 'en' ? 'en_US' : locale === 'it' ? 'it_IT' : 'fr_FR',
    },
  };
}

export default async function AboutPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'about' });
  const tCv = await getTranslations({ locale, namespace: 'cv' });

  const contactInfo = [
    { icon: MapPin, label: 'Ferrara, Italy', href: null },
    { icon: Mail, label: 'anders.jipwouo@gmail.com', href: 'mailto:anders.jipwouo@gmail.com' },
    { icon: Github, label: 'Anders-planck', href: 'https://github.com/Anders-planck' },
    { icon: Linkedin, label: 'LinkedIn Profile', href: 'https://linkedin.com/in/anders-planck-53184b1b4' },
  ];

  // Group skills by category
  const skillsByCategory = skills.reduce((acc, skill) => {
    if (!acc[skill.category]) {
      acc[skill.category] = [];
    }
    acc[skill.category].push(skill);
    return acc;
  }, {} as Record<string, typeof skills>);

  // Convert work experience to timeline format
  const workTimeline: TimelineItem[] = workExperience.map((exp, expIndex) => ({
    type: 'work' as const,
    title: exp.role,
    organization: exp.company,
    period: exp.period,
    location: exp.location,
    description: tCv(`experience.${expIndex}.description`),
    projects: exp.projects.map((proj, projIndex) => ({
      title: proj.title,
      period: proj.period,
      description: tCv(`experience.${expIndex}.projects.${projIndex}.description`),
      technologies: proj.technologies,
      achievements: proj.achievements.map((_, achIndex) =>
        tCv(`experience.${expIndex}.projects.${projIndex}.achievements.${achIndex}`)
      ),
      metrics: proj.metrics,
      isOngoing: proj.isOngoing,
    })),
    isOngoing: exp.isOngoing,
  }));

  // Convert education to timeline format
  const educationTimeline: TimelineItem[] = education.map((edu, eduIndex) => ({
    type: 'education' as const,
    title: edu.degree,
    organization: edu.institution,
    period: edu.period,
    location: edu.location,
    description: tCv(`education.${eduIndex}.description`),
    isOngoing: edu.isOngoing,
  }));

  // Convert personal projects to timeline format
  const projectsTimeline: TimelineItem[] = personalProjects.map((project, projIndex) => ({
    type: 'project' as const,
    title: project.title,
    organization: 'Personal Project',
    period: project.year,
    description: tCv(`personalProjects.${projIndex}.description`),
    technologies: project.technologies,
    achievements: project.achievements.map((_, achIndex) =>
      tCv(`personalProjects.${projIndex}.achievements.${achIndex}`)
    ),
    isOngoing: false,
  }));

  return (
    <section className="py-44 md:py-32">
      <div className="container mx-auto max-w-4xl">
        {/* Hero Section */}
        <div className="mb-16 flex flex-col items-center gap-8 md:flex-row">
          <div className="relative h-48 w-48 overflow-hidden rounded-2xl md:h-56 md:w-56">
            <Image
              src={authorImage}
              alt="Anders Planck"
              fill
              className="object-cover"
              priority
            />
          </div>

          <div className="flex-1 text-center md:text-left">
            <h1 className="title mb-4">{t('aboutMe')}</h1>
            <p className="mb-6 text-lg text-muted-foreground">
              {t('subtitle')}
            </p>

            {/* Contact Info */}
            <div className="flex flex-wrap justify-center gap-4 md:justify-start">
              {contactInfo.map(({ icon: Icon, label, href }) => (
                <div key={label} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Icon className="h-4 w-4" />
                  {href ? (
                    <Link href={href} target="_blank" rel="noopener noreferrer" className="hover:text-foreground">
                      {label}
                    </Link>
                  ) : (
                    <span>{label}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <Separator className="my-12" />

        {/* Professional Goal */}
        <div className="mb-16">
          <h2 className="mb-8 text-2xl font-bold">{t('professionalVision')}</h2>
          <p className="leading-relaxed text-muted-foreground">
            {tCv('professionalGoal')}
          </p>
        </div>

        <Separator className="my-12" />

        {/* Journey & Story */}
        <div className="mb-16">
          <h2 className="mb-8 text-2xl font-bold">{t('myJourney')}</h2>
          <div className="space-y-4 leading-relaxed text-muted-foreground">
            <p>{t('journeyP1')}</p>
            <p>{t('journeyP2')}</p>
            <p>{t('journeyP3')}</p>
          </div>
        </div>

        <Separator className="my-12" />

        {/* Work Experience Timeline */}
        <div id="work-experience" className="mb-24 scroll-mt-24">
          <h2 className="mb-8 text-2xl font-bold">{t('workExperience')}</h2>
          <Timeline items={workTimeline} showProjects={true} />
        </div>

        <Separator className="my-12" />

        {/* Education Timeline */}
        <div className="mb-24">
          <h2 className="mb-8 text-2xl font-bold">{t('education')}</h2>
          <Timeline items={educationTimeline} />
        </div>

        <Separator className="my-12" />

        {/* Personal Projects Timeline */}
        <div className="mb-24">
          <h2 className="mb-8 text-2xl font-bold">{t('personalProjects')}</h2>
          <Timeline items={projectsTimeline} />
        </div>

        <Separator className="my-12" />

        {/* Technical Skills */}
        <div id="skills" className="mb-24 scroll-mt-24">
          <h2 className="mb-8 text-2xl font-bold">{t('technicalExpertise')}</h2>
          <div className="space-y-6">
            {Object.entries(skillsByCategory).map(([category, categorySkills]) => (
              <div key={category}>
                <h3 className="mb-3 text-lg font-semibold">{category}</h3>
                <div className="flex flex-wrap gap-2">
                  {categorySkills
                    .sort((a, b) => b.level - a.level)
                    .map((skill) => (
                      <Badge key={skill.name} variant="outline" className="text-sm">
                        {skill.name}
                      </Badge>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <Separator className="my-12" />

        {/* Languages */}
        <div id="languages" className="mb-16 scroll-mt-24">
          <h2 className="mb-8 text-2xl font-bold">{t('languages')}</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {['french', 'italian', 'english'].map((langKey) => (
              <div key={langKey} className="rounded-lg border p-4">
                <h3 className="font-semibold">{tCv(`languages.${langKey}`)}</h3>
                <p className="text-sm text-muted-foreground">
                  {tCv(`languages.${langKey === 'french' ? 'native' : langKey === 'italian' ? 'b2' : 'b1'}`)}
                </p>
              </div>
            ))}
          </div>
        </div>

        <Separator className="my-12" />

        {/* Soft Skills */}
        <div className="mb-16">
          <h2 className="mb-8 text-2xl font-bold">{t('professionalStrengths')}</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {['problemSolving', 'teamCollaboration', 'adaptability', 'qualityFocus'].map((skillKey) => (
              <div key={skillKey} className="rounded-lg border p-4">
                <h3 className="mb-2 font-semibold">{tCv(`softSkills.${skillKey}.name`)}</h3>
                <p className="text-sm text-muted-foreground">{tCv(`softSkills.${skillKey}.description`)}</p>
              </div>
            ))}
          </div>
        </div>

        <Separator className="my-12" />

        {/* Values & Approach */}
        <div className="mb-16">
          <h2 className="mb-8 text-2xl font-bold">{t('myApproach')}</h2>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">💡 {t('continuousLearning')}</h3>
              <p className="text-sm text-muted-foreground">
                {t('continuousLearningDesc')}
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-semibold">🎯 {t('userCentricDev')}</h3>
              <p className="text-sm text-muted-foreground">
                {t('userCentricDevDesc')}
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-semibold">🔧 {t('cleanCode')}</h3>
              <p className="text-sm text-muted-foreground">
                {t('cleanCodeDesc')}
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-semibold">🤝 {t('collaborative')}</h3>
              <p className="text-sm text-muted-foreground">
                {t('collaborativeDesc')}
              </p>
            </div>
          </div>
        </div>

        <Separator className="my-12" />

        {/* Outside of Work */}
        <div className="mb-24">
          <h2 className="mb-8 text-2xl font-bold">{t('beyondCode')}</h2>
          <p className="leading-relaxed text-muted-foreground">
            {t('beyondCodeDesc')}
          </p>
        </div>

        {/* CTA */}
        <div className="rounded-lg border bg-muted/30 p-8 text-center">
          <h2 className="mb-4 text-2xl font-bold">{t('letsBuildTogether')}</h2>
          <p className="mb-6 text-muted-foreground">
            {t('letsBuildTogetherDesc')}
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href={`/${locale}#contact`}
              className="rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              {t('getInTouch')}
            </Link>
            <Link
              href="/cv.pdf"
              download="Anders_Planck_CV.pdf"
              className="flex items-center gap-2 rounded-md border px-6 py-3 text-sm font-semibold transition-colors hover:bg-accent"
            >
              <Briefcase className="h-4 w-4" />
              Download CV
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
