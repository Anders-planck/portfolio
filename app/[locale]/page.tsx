import type { Metadata } from "next";
import { getTranslations } from 'next-intl/server';
import Intro from "@/components/intro";
import FeaturedProjects from "@/components/featured-projects";
import ContactForm from "@/components/contact-form";
import StatsOverview from "@/components/stats-overview";
import SkillsRadarChart from "@/components/skills-radar-chart";
import { Separator } from "@/components/ui/separator";
import { Download } from "lucide-react";
import type { Locale } from "@/i18n/config";

type Props = {
  params: Promise<{ locale: Locale }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'home.meta' });

  return {
    title: t('title'),
    description: t('description'),
    alternates: {
      canonical: `https://anders-games.com/${locale}`,
    },
    openGraph: {
      title: 'Anders Planck | Full-Stack Developer Portfolio',
      description: t('description'),
      url: `https://anders-games.com/${locale}`,
      type: 'website',
      locale: locale === 'en' ? 'en_US' : locale === 'it' ? 'it_IT' : 'fr_FR',
    },
  };
}

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'home' });
  const tCommon = await getTranslations({ locale, namespace: 'common' });

  return (
    <section className="py-44 md:py-32">
      <div className="container mx-auto max-w-4xl">
        <Intro />

        {/* Floating Download CV Button */}
        <a
          href="/cv.pdf"
          download="Anders_Planck_CV.pdf"
          className="fixed bottom-8 right-8 z-50 flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-lg transition-all hover:scale-105 hover:shadow-xl"
          aria-label={tCommon('downloadCV')}
        >
          <Download className="h-5 w-5" />
          <span className="hidden sm:inline">{tCommon('downloadCV')}</span>
        </a>

        {/* At a Glance - Numerical Validation */}
        <div className="my-24">
          <h2 className="title mb-8">{t('atAGlance')}</h2>
          <StatsOverview />
        </div>

        <Separator className="my-12" />

        {/* Skills Proficiency - Primary Visualization */}
        <div className="my-24">
          <h2 className="title mb-8">{t('technicalProficiency')}</h2>
          <p className="mb-8 text-muted-foreground">
            {t('technicalProficiencyDesc')}
          </p>
          <SkillsRadarChart />
        </div>

        <Separator className="my-12" />

        {/* Featured Projects - Real Work */}
        <div className="my-24">
          <h2 className="title mb-8">{t('featuredProjects')}</h2>
          <p className="mb-8 text-muted-foreground">
            {t('featuredProjectsDesc')}
          </p>
          <FeaturedProjects />
        </div>

        <Separator className="my-12" />

        {/* Contact Section */}
        <section id="contact" className="mt-24 scroll-mt-24">
          <h2 className="title mb-4">{t('letsWorkTogether')}</h2>
          <p className="mb-8 text-muted-foreground">
            {t('letsWorkTogetherDesc')}
          </p>
          <ContactForm compact />
        </section>
      </div>
    </section>
  );
}
