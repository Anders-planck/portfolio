"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Code, Briefcase, Award, Users } from "lucide-react";

const stats = [
  {
    icon: Briefcase,
    label: "Years Experience",
    value: "3+",
    description: "Professional development",
    href: "/about#work-experience",
  },
  {
    icon: Code,
    label: "Technologies",
    value: "20+",
    description: "Languages & frameworks",
    href: "/about#skills",
  },
  {
    icon: Award,
    label: "Projects",
    value: "15+",
    description: "Enterprise solutions",
    href: "/projects",
  },
  {
    icon: Users,
    label: "Languages",
    value: "3",
    description: "Spoken fluently",
    href: "/about#languages",
  },
];

export default function StatsOverview() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Link key={stat.label} href={stat.href}>
            <Card className="h-full transition-all hover:bg-accent hover:border-primary/50 hover:shadow-md cursor-pointer group">
              <CardContent className="flex flex-col items-center p-6 text-center">
                <Icon className="mb-3 h-8 w-8 text-primary transition-transform group-hover:scale-110" />
                <div className="mb-1 text-3xl font-bold">{stat.value}</div>
                <div className="mb-1 text-sm font-semibold">{stat.label}</div>
                <div className="text-xs text-muted-foreground">
                  {stat.description}
                </div>
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
