export interface ProjectResult {
  value: string
  label: string
}

export interface Project {
  slug: string
  title: string
  summary: string
  tags: string[]
  role: string
  company: string
  year: string
  impact: string
  challenge: string
  solution: string[]
  results: ProjectResult[]
  learnings: string
  github?: string
  live?: string
}

export const projects: Project[] = [
  {
    slug: 'open-banking-ui',
    title: 'Open Banking UI',
    summary:
      'PSD2-compliant SEPA payment interface enabling multi-bank aggregation with real-time transaction flows for financial institutions.',
    tags: ['React', 'TypeScript', 'Vite', 'React Intl', 'PDF.js'],
    role: 'Frontend Lead',
    company: 'A-Cube S.R.L.',
    year: '2024',
    impact:
      'Processed 50K+ transactions in first quarter. Reduced onboarding time by 60%.',
    challenge:
      "Financial institutions needed a unified interface to comply with PSD2 regulations while aggregating data from multiple banking providers. The existing solution was fragmented, slow, and couldn't handle the transaction volume required by enterprise clients.",
    solution: [
      'Component library with strict typing for financial data handling',
      'Optimistic UI updates with rollback for transaction reliability',
      'Multi-bank API abstraction layer for provider-agnostic integration',
      'Real-time WebSocket feeds for live transaction monitoring',
      'Multi-language support with React Intl for EU-wide deployment'
    ],
    results: [
      { value: '50K+', label: 'Transactions Q1' },
      { value: '-60%', label: 'Onboarding time' },
      { value: '99.7%', label: 'Uptime' }
    ],
    learnings:
      "Working with financial data at scale taught me that type safety isn't a luxury — it's infrastructure. Every loosely typed boundary became a production incident waiting to happen. This project cemented my commitment to TypeScript-first architecture."
  },
  {
    slug: 'stripe-app-extension',
    title: 'Stripe App Extension',
    summary:
      'Enterprise-grade Stripe marketplace app for electronic invoicing with advanced state management and form validation.',
    tags: ['React', 'TypeScript', 'Stripe API', 'Context API'],
    role: 'Frontend Developer',
    company: 'A-Cube S.R.L.',
    year: '2024',
    impact:
      'Automated 85% of manual reconciliation. Adopted by 3 enterprise clients.',
    challenge:
      "Enterprise clients needed a Stripe-native solution for Italian electronic invoicing. The challenge was managing complex form state across 8 views without Redux, while staying within Stripe's app extension constraints.",
    solution: [
      '6-level React Context architecture replacing Redux for optimized performance',
      '8 primary views with advanced form validation and conditional logic',
      '173 memoization instances for render optimization in constrained environment',
      'Custom error boundary system for Stripe extension sandboxed runtime'
    ],
    results: [
      { value: '85%', label: 'Automation rate' },
      { value: '3', label: 'Enterprise clients' },
      { value: '173', label: 'Memoized components' }
    ],
    learnings:
      "Building within Stripe's extension sandbox forced creative solutions. No Redux, limited bundle size, restricted APIs. Constraints breed better architecture — the 6-level context system outperformed what Redux would have delivered."
  },
  {
    slug: 'expo-mutual-tls',
    title: 'Expo Mutual TLS',
    summary:
      'Open-source React Native/Expo module for mutual TLS authentication across iOS and Android platforms with biometric support.',
    tags: ['React Native', 'Expo', 'Swift', 'Kotlin', 'TypeScript'],
    role: 'Mobile Developer',
    company: 'A-Cube S.R.L.',
    year: '2025',
    impact: 'Open-source module used in production by enterprise banking apps.',
    challenge:
      'Enterprise banking apps required mTLS certificate authentication on mobile devices. No existing Expo module supported this — native implementations existed but were fragmented across platforms with no unified React Native API.',
    solution: [
      'Native iOS implementation in Swift with Keychain integration',
      'Native Android implementation in Kotlin with KeyStore',
      'Unified TypeScript API surface for cross-platform usage',
      'Biometric authentication support for certificate access',
      'Comprehensive event management system for connection lifecycle'
    ],
    results: [
      { value: '2', label: 'Platforms (iOS/Android)' },
      { value: '100%', label: 'API parity' },
      { value: 'OSS', label: 'Open source' }
    ],
    learnings:
      'Bridging native and JavaScript worlds taught me to think in two paradigms simultaneously. The key insight: design the TypeScript API first, then implement native — not the other way around.'
  },
  {
    slug: 'wortschatz',
    title: 'Wortschatz',
    summary:
      'German vocabulary learning app for Italian speakers with AI-powered enrichment, FSRS spaced repetition, and conversational practice.',
    tags: ['Expo', 'React Native', 'Gemini AI', 'FSRS', 'TypeScript'],
    role: 'Creator & Developer',
    company: 'Personal',
    year: '2026',
    impact:
      'Personal project combining mobile development, AI integration, and learning science.',
    challenge:
      "Existing language learning apps are generic and don't leverage AI for contextual enrichment. I wanted an app that combines scientifically-proven spaced repetition (FSRS algorithm) with AI-generated examples and conversational practice.",
    solution: [
      'FSRS spaced repetition algorithm for optimal review scheduling',
      'Gemini AI integration for vocabulary enrichment and example generation',
      'Conversational practice mode with AI-powered dialogue',
      'Graded reading system adapted to learner level',
      'Offline-first architecture with sync capabilities'
    ],
    results: [
      { value: 'FSRS', label: 'Algorithm' },
      { value: 'Gemini', label: 'AI engine' },
      { value: 'Offline', label: 'First arch' }
    ],
    learnings:
      'Building a learning app forced me to deeply understand the FSRS algorithm and how to integrate LLMs into a mobile experience without destroying UX. The key: pre-generate and cache AI responses, never block the UI on API calls.',
    github: 'https://github.com/Anders-planck/wortschatz'
  },
  {
    slug: 'parseur',
    title: 'Parseur',
    summary:
      'Intelligent document parsing platform that extracts, validates, and auto-corrects structured data from PDFs and images using an LLM-only approach.',
    tags: ['Next.js', 'TypeScript', 'OpenAI', 'Claude', 'Prisma', 'PostgreSQL'],
    role: 'Creator & Developer',
    company: 'Personal',
    year: '2025',
    impact:
      'Full-stack AI platform with multi-LLM pipeline for document intelligence.',
    challenge:
      'Extracting structured data from unstructured documents (PDFs, images) is notoriously hard. Traditional OCR pipelines are brittle and require manual rules per document type. I wanted a system that could understand any document layout using LLMs, with auto-correction and validation.',
    solution: [
      'Multi-LLM pipeline combining OpenAI GPT-4o and Anthropic Claude 3.5 Sonnet',
      'Intelligent extraction with auto-correction and Zod schema validation',
      'S3-compatible storage with MinIO for local development',
      'Background job processing with Inngest for async document pipelines',
      'Full-stack Next.js 16 app with Prisma ORM and PostgreSQL'
    ],
    results: [
      { value: '2', label: 'LLM providers' },
      { value: 'Auto', label: 'Correction' },
      { value: 'Live', label: 'parseur.vercel.app' }
    ],
    learnings:
      'Multi-LLM orchestration taught me that no single model excels at everything. GPT-4o handles visual layout understanding better, Claude excels at structured reasoning. The key is composing them — not choosing between them.',
    github: 'https://github.com/Anders-planck/parseur',
    live: 'https://parseur.vercel.app'
  }
]

export function getProjectBySlug(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug)
}

export function getFeaturedProjects(): Project[] {
  return projects.slice(0, 3)
}
