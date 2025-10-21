import type { Metadata } from 'next';
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
  skills,
  languages,
  softSkills,
  professionalGoal
} from '@/lib/cv-data';

export const metadata: Metadata = {
  title: 'About',
  description: 'Learn more about Anders Planck - Full-Stack Developer with 3+ years of experience. Professional journey, technical expertise, values, and what drives my passion for software engineering.',
  alternates: {
    canonical: 'https://anders-games.com/about',
  },
  openGraph: {
    title: 'About Anders Planck | Full-Stack Developer',
    description: 'Professional journey, technical expertise, and what drives my passion for software engineering.',
    url: 'https://anders-games.com/about',
    type: 'profile',
  },
};

export default function AboutPage() {
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
  const workTimeline: TimelineItem[] = workExperience.map(exp => ({
    type: 'work' as const,
    title: exp.role,
    organization: exp.company,
    period: exp.period,
    location: exp.location,
    description: exp.description,
    projects: exp.projects,
    isOngoing: exp.isOngoing,
  }));

  // Convert education to timeline format
  const educationTimeline: TimelineItem[] = education.map(edu => ({
    type: 'education' as const,
    title: edu.degree,
    organization: edu.institution,
    period: edu.period,
    location: edu.location,
    description: edu.description,
    isOngoing: edu.isOngoing,
  }));

  // Convert personal projects to timeline format
  const projectsTimeline: TimelineItem[] = personalProjects.map(project => ({
    type: 'project' as const,
    title: project.title,
    organization: 'Personal Project',
    period: project.year,
    description: project.description,
    technologies: project.technologies,
    achievements: project.achievements,
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
            <h1 className="title mb-4">About Me</h1>
            <p className="mb-6 text-lg text-muted-foreground">
              Full-Stack Developer specializing in modern web technologies
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
          <h2 className="mb-8 text-2xl font-bold">Professional Vision</h2>
          <p className="leading-relaxed text-muted-foreground">
            {professionalGoal}
          </p>
        </div>

        <Separator className="my-12" />

        {/* Journey & Story */}
        <div className="mb-16">
          <h2 className="mb-8 text-2xl font-bold">My Journey</h2>
          <div className="space-y-4 leading-relaxed text-muted-foreground">
            <p>
              I&apos;m a passionate Full-Stack Developer based in Ferrara, Italy, with over 3 years of professional experience
              building scalable web applications and contributing to innovative projects. My journey in software development
              began with a fascination for how code can solve real-world problems and create meaningful user experiences.
            </p>
            <p>
              Throughout my career, I&apos;ve specialized in both backend and frontend technologies, with a strong focus on
              PHP frameworks (Laravel, Symfony) and modern JavaScript ecosystem (React, Next.js, TypeScript). I believe
              in writing clean, maintainable code and following best practices that stand the test of time.
            </p>
            <p>
              What drives me is the constant learning and evolution in our field. Whether it&apos;s exploring new frameworks,
              optimizing performance, or solving complex architectural challenges, I approach each project with curiosity
              and dedication to delivering high-quality solutions.
            </p>
          </div>
        </div>

        <Separator className="my-12" />

        {/* Work Experience Timeline */}
        <div id="work-experience" className="mb-24 scroll-mt-24">
          <h2 className="mb-8 text-2xl font-bold">Work Experience</h2>
          <Timeline items={workTimeline} showProjects={true} />
        </div>

        <Separator className="my-12" />

        {/* Education Timeline */}
        <div className="mb-24">
          <h2 className="mb-8 text-2xl font-bold">Education</h2>
          <Timeline items={educationTimeline} />
        </div>

        <Separator className="my-12" />

        {/* Personal Projects Timeline */}
        <div className="mb-24">
          <h2 className="mb-8 text-2xl font-bold">Personal Projects</h2>
          <Timeline items={projectsTimeline} />
        </div>

        <Separator className="my-12" />

        {/* Technical Skills */}
        <div id="skills" className="mb-24 scroll-mt-24">
          <h2 className="mb-8 text-2xl font-bold">Technical Expertise</h2>
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
          <h2 className="mb-8 text-2xl font-bold">Languages</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {languages.map((language) => (
              <div key={language.name} className="rounded-lg border p-4">
                <h3 className="font-semibold">{language.name}</h3>
                <p className="text-sm text-muted-foreground">{language.level}</p>
              </div>
            ))}
          </div>
        </div>

        <Separator className="my-12" />

        {/* Soft Skills */}
        <div className="mb-16">
          <h2 className="mb-8 text-2xl font-bold">Professional Strengths</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {softSkills.map((skill) => (
              <div key={skill.name} className="rounded-lg border p-4">
                <h3 className="mb-2 font-semibold">{skill.name}</h3>
                <p className="text-sm text-muted-foreground">{skill.description}</p>
              </div>
            ))}
          </div>
        </div>

        <Separator className="my-12" />

        {/* Values & Approach */}
        <div className="mb-16">
          <h2 className="mb-8 text-2xl font-bold">My Approach</h2>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">💡 Continuous Learning</h3>
              <p className="text-sm text-muted-foreground">
                I stay updated with the latest technologies and best practices through continuous learning,
                experimentation, and contributing to open-source projects.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-semibold">🎯 User-Centric Development</h3>
              <p className="text-sm text-muted-foreground">
                Every line of code should serve a purpose and contribute to a better user experience.
                I prioritize accessibility, performance, and intuitive design.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-semibold">🔧 Clean Code Advocate</h3>
              <p className="text-sm text-muted-foreground">
                Writing maintainable, well-documented code is not optional. I follow SOLID principles
                and design patterns to ensure long-term code quality.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-semibold">🤝 Collaborative Mindset</h3>
              <p className="text-sm text-muted-foreground">
                Great software is built by great teams. I value open communication, code reviews,
                and knowledge sharing to elevate the entire team.
              </p>
            </div>
          </div>
        </div>

        <Separator className="my-12" />

        {/* Outside of Work */}
        <div className="mb-24">
          <h2 className="mb-8 text-2xl font-bold">Beyond Code</h2>
          <p className="leading-relaxed text-muted-foreground">
            When I&apos;m not coding, you&apos;ll find me exploring new technologies through side projects,
            contributing to open-source communities, or staying active with outdoor activities.
            I believe that maintaining a healthy work-life balance fuels creativity and productivity
            in professional work.
          </p>
        </div>

        {/* CTA */}
        <div className="rounded-lg border bg-muted/30 p-8 text-center">
          <h2 className="mb-4 text-2xl font-bold">Let&apos;s Build Something Together</h2>
          <p className="mb-6 text-muted-foreground">
            I&apos;m always open to discussing new projects, creative ideas, or opportunities to be part of your vision.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/#contact"
              className="rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Get In Touch
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
