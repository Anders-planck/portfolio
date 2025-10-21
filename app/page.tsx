import type { Metadata } from "next";
import Intro from "@/components/intro";
import RecentContent from "@/components/recent-content";
import ContactForm from "@/components/contact-form";
import StatsOverview from "@/components/stats-overview";
import SkillsDonutChart from "@/components/skills-donut-chart";
import LanguagesDonut from "@/components/languages-donut";
import TechStackDonut from "@/components/tech-stack-donut";
import { Separator } from "@/components/ui/separator";
import SkillsRadarChart from "@/components/skills-radar-chart";
import { Download } from "lucide-react";

export const metadata: Metadata = {
  title: 'Home',
  description: 'Anders Planck - Full-stack developer with expertise in React, Next.js, TypeScript, Node.js, and modern web technologies. View my portfolio, skills, and download my CV.',
  openGraph: {
    title: 'Anders Planck | Full-Stack Developer Portfolio',
    description: 'Full-stack developer with expertise in React, Next.js, TypeScript, Node.js, and modern web technologies.',
    url: 'https://andersplanck.dev',
    type: 'website',
  },
};

export default function HomePage() {
  return (
    <section className="py-32">
      <div className="container mx-auto max-w-3xl">
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

        {/* Core Competencies - Visual Skills Showcase */}
        <div className="my-16">
          <h2 className="title mb-8">Core Competencies</h2>
          <div className="grid gap-12 md:grid-cols-2">
            <div>
              <h3 className="text-lg font-semibold mb-2">Skills Distribution</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Expertise across technology domains
              </p>
              <SkillsDonutChart />
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Languages</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Multilingual communication abilities
              </p>
              <LanguagesDonut />
            </div>
          </div>
        </div>

        <Separator className="my-12" />

        {/* Technology Stack - Interactive Deep Dive */}
        <div className="mt-24 mb-24">
          <h2 className="title mb-8">Technology Stack</h2>
          <TechStackDonut />
        </div>

        <Separator className="my-12" />

          {/* Skills Deep Dive - Technical Proficiency */}
        <div className="my-16">
          <h2 className="title mb-8">Skills Deep Dive</h2>
          <p className="mb-6 text-muted-foreground">
            Top 3 skills from each technology domain
          </p>
          <SkillsRadarChart />
        </div>


        <Separator className="my-12" />
        {/* Recent Works - Blogs & Projects */}
        <RecentContent />

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