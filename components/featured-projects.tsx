"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Calendar, TrendingUp, Award, Check } from "lucide-react";

interface FeaturedProject {
  title: string;
  description: string;
  period: string;
  technologies: string[];
  metrics?: string[];
  achievements: string[];
  isOngoing: boolean;
  slug?: string;
}

const featuredProjects: FeaturedProject[] = [
  {
    title: "A-Cube e-Receipts SDK",
    description: "TypeScript-based NPM package for electronic receipt management with multi-platform support (Browser, Node.js, React Native).",
    period: "July 2025 - Present",
    technologies: ["TypeScript", "React", "React Native", "Expo", "IndexedDB"],
    metrics: [],
    achievements: [
      "Multi-platform SDK supporting web, mobile, and Node.js",
      "Type-safe implementation with Zod validation",
      "Intelligent caching system for offline operations",
      "mTLS authentication integration"
    ],
    isOngoing: true,
  },
  {
    title: "Expo Mutual TLS Module",
    description: "Open-source React Native/Expo module for mutual TLS client certificate authentication with hardware-backed security.",
    period: "July 2025 - Present",
    technologies: ["TypeScript", "Expo", "Swift", "Kotlin", "React Native"],
    metrics: [],
    achievements: [
      "Native iOS (Swift) and Android (Kotlin) implementations",
      "Hardware-backed security with Keychain/Keystore",
      "Biometric authentication support",
      "Open-source contribution to React Native ecosystem"
    ],
    isOngoing: true,
    slug: "expo-mutual-tls"
  },
  {
    title: "Invoice/PA Dashboard & A-Cube Products",
    description: "Comprehensive invoice and public administration management dashboard with modern UI and performance optimization.",
    period: "January 2025 - Present",
    technologies: ["React 18", "TypeScript", "Redux Toolkit", "Material-UI", "Vite"],
    metrics: ["40% bundle size reduction", "65% performance improvement", "4.8/5 user rating"],
    achievements: [
      "Advanced code-splitting for optimal performance",
      "Multi-language support with comprehensive localization",
      "PDF generation and document management",
      "Achieved 65% performance improvement through optimization"
    ],
    isOngoing: true,
  },
  {
    title: "Preservation API",
    description: "Digital archival service for long-term document preservation compliant with Italian regulatory standards.",
    period: "May 2023 - December 2024",
    technologies: ["Symfony 6.2+", "API Platform 3", "PostgreSQL", "JWT", "AWS S3", "AWS Lambda"],
    metrics: ["200+ Behat scenarios", "PHPStan level 8"],
    achievements: [
      "Italian regulatory compliance for digital archival",
      "AWS S3/Lambda integration for scalable storage",
      "200+ automated test scenarios with Behat",
      "Achieved PHPStan level 8 code quality"
    ],
    isOngoing: false,
  },
];

export default function FeaturedProjects() {
  return (
    <div className="space-y-8">
      {featuredProjects.map((project, index) => (
        <div
          key={index}
          className="group relative overflow-hidden rounded-lg border bg-card p-6 shadow-sm transition-all hover:shadow-md hover:border-primary/50"
        >
          {/* Ongoing Badge */}
          {project.isOngoing && (
            <div className="absolute right-4 top-4">
              <Badge variant="default" className="font-semibold">
                Ongoing
              </Badge>
            </div>
          )}

          <div className="space-y-4">
            {/* Header */}
            <div>
              <h3 className="text-xl font-semibold text-foreground mb-2 pr-20">
                {project.title}
              </h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                <Calendar className="h-4 w-4" />
                <span>{project.period}</span>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                {project.description}
              </p>
            </div>

            {/* Metrics (if available) */}
            {project.metrics && project.metrics.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {project.metrics.map((metric, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-1.5 rounded-md bg-primary/10 px-3 py-1.5 text-sm font-semibold text-primary"
                  >
                    <TrendingUp className="h-3.5 w-3.5" />
                    {metric}
                  </div>
                ))}
              </div>
            )}

            {/* Achievements */}
            <div>
              <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground">
                <Award className="h-4 w-4" />
                Key Achievements
              </h4>
              <ul className="grid gap-2 sm:grid-cols-2">
                {project.achievements.map((achievement, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span>{achievement}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Technologies */}
            <div className="flex flex-wrap gap-2 pt-2">
              {project.technologies.map((tech) => (
                <Badge key={tech} variant="secondary" className="text-xs">
                  {tech}
                </Badge>
              ))}
            </div>

            {/* View Details Link (if slug available) */}
            {project.slug && (
              <div className="pt-2">
                <Link
                  href={`/projects/${project.slug}`}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-primary transition-colors hover:text-primary/80"
                >
                  View detailed case study
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            )}
          </div>
        </div>
      ))}

      {/* View All Projects Link */}
      <div className="pt-4 text-center">
        <Link
          href="/about#work-experience"
          className="inline-flex items-center gap-2 rounded-md border px-6 py-3 text-sm font-semibold transition-colors hover:bg-accent"
        >
          View all 9 projects in timeline
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
