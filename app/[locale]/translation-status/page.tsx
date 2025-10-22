import type { Metadata } from 'next'
import TranslationStatus from '@/components/translation-status'
import { getTranslationStatus } from '@/lib/translation-utils'
import type { Locale } from '@/i18n/config'

type Props = {
  params: Promise<{ locale: Locale }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params

  return {
    title: 'Translation Status',
    description: 'Track translation progress across all languages',
    alternates: {
      canonical: `https://anders-games.com/${locale}/translation-status`,
    },
  }
}

export default async function TranslationStatusPage() {
  const statuses = getTranslationStatus()

  return (
    <section className="pb-24 pt-44 md:pt-40">
      <div className="container max-w-4xl">
        <h1 className="title mb-8">Translation Status</h1>
        <p className="mb-12 text-muted-foreground">
          Track the progress of translations across all supported languages. This page shows how many blog posts and projects have been translated for each language.
        </p>
        <TranslationStatus statuses={statuses} />
      </div>
    </section>
  )
}
