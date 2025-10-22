"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Code, Briefcase, Award, Users } from "lucide-react";
import { useTranslations } from 'next-intl';

export default function StatsOverview() {
  const t = useTranslations('home.stats');

  const stats = [
    {
      icon: Briefcase,
      key: "yearsExperience",
      href: "/about#work-experience",
    },
    {
      icon: Code,
      key: "technologies",
      href: "/about#skills",
    },
    {
      icon: Award,
      key: "projects",
      href: "/projects",
    },
    {
      icon: Users,
      key: "languages",
      href: "/about#languages",
    },
  ];
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Link key={stat.key} href={stat.href}>
            <Card className="h-full transition-all hover:bg-accent hover:border-primary/50 hover:shadow-md cursor-pointer group">
              <CardContent className="flex flex-col items-center p-6 text-center">
                <Icon className="mb-3 h-8 w-8 text-primary transition-transform group-hover:scale-110" />
                <div className="mb-1 text-3xl font-bold">{t(`${stat.key}.value`)}</div>
                <div className="mb-1 text-sm font-semibold">{t(`${stat.key}.label`)}</div>
                <div className="text-xs text-muted-foreground">
                  {t(`${stat.key}.description`)}
                </div>
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
