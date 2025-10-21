import type { Metadata } from "next";
import Intro from "@/components/intro";
import FeaturedProjects from "@/components/featured-projects";
import ContactForm from "@/components/contact-form";
import StatsOverview from "@/components/stats-overview";
import SkillsRadarChart from "@/components/skills-radar-chart";
import { Separator } from "@/components/ui/separator";
import { Download } from "lucide-react";

export const metadata: Metadata = {
  title: 'Home',
  description: 'Portfolio di Anders Planck - Full-Stack Developer specializzato in React, Next.js, TypeScript, PHP, Laravel. Scopri progetti, competenze tecniche, visualizza grafici interattivi skills e scarica il CV. 3+ anni esperienza.',
  alternates: {
    canonical: 'https://anders-games.com',
  },
  openGraph: {
    title: 'Anders Planck | Full-Stack Developer Portfolio',
    description: 'Full-Stack Developer con 3+ anni di esperienza in React, Next.js, TypeScript, PHP, Laravel. Portfolio progetti e blog tecnico.',
    url: 'https://anders-games.com',
    type: 'website',
  },
};

export default function HomePage() {
  return (
    <section className="py-44 md:py-32">
      <div className="container mx-auto max-w-4xl">
        <Intro />

        {/* Floating Download CV Button */}
        <a
          href="/cv.pdf"
          download="Anders_Planck_CV.pdf"
          className="fixed bottom-8 right-8 z-50 flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-lg transition-all hover:scale-105 hover:shadow-xl"
          aria-label="Download CV"
        >
          <Download className="h-5 w-5" />
          <span className="hidden sm:inline">Download CV</span>
        </a>

        {/* At a Glance - Numerical Validation */}
        <div className="my-24">
          <h2 className="title mb-8">At a Glance</h2>
          <StatsOverview />
        </div>

        <Separator className="my-12" />

        {/* Skills Proficiency - Primary Visualization */}
        <div className="my-24">
          <h2 className="title mb-8">Technical Proficiency</h2>
          <p className="mb-8 text-muted-foreground">
            Top 3 skills from each technology domain showing depth of expertise
          </p>
          <SkillsRadarChart />
        </div>

        <Separator className="my-12" />

        {/* Featured Projects - Real Work */}
        <div className="my-24">
          <h2 className="title mb-8">Featured Projects</h2>
          <p className="mb-8 text-muted-foreground">
            Showcasing real-world enterprise projects with measurable impact and modern tech stacks
          </p>
          <FeaturedProjects />
        </div>

        <Separator className="my-12" />

        {/* Contact Section */}
        <section id="contact" className="mt-24 scroll-mt-24">
          <h2 className="title mb-4">Let&apos;s Work Together</h2>
          <p className="mb-8 text-muted-foreground">
            Open to new opportunities and collaborations. Get in touch to discuss your project.
          </p>
          <ContactForm compact />
        </section>
      </div>
    </section>
  );
}
