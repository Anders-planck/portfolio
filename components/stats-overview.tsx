"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Code, Briefcase, Award, Users } from "lucide-react";

const stats = [
  {
    icon: Briefcase,
    label: "Years Experience",
    value: "3+",
    description: "Professional development",
  },
  {
    icon: Code,
    label: "Technologies",
    value: "20+",
    description: "Languages & frameworks",
  },
  {
    icon: Award,
    label: "Projects",
    value: "15+",
    description: "Enterprise solutions",
  },
  {
    icon: Users,
    label: "Languages",
    value: "3",
    description: "Spoken fluently",
  },
];

export default function StatsOverview() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.label} className="transition-colors hover:bg-accent">
            <CardContent className="flex flex-col items-center p-6 text-center">
              <Icon className="mb-3 h-8 w-8 text-primary" />
              <div className="mb-1 text-3xl font-bold">{stat.value}</div>
              <div className="mb-1 text-sm font-semibold">{stat.label}</div>
              <div className="text-xs text-muted-foreground">
                {stat.description}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
