"use client";

import { Badge } from "@/components/ui/badge";
import { skills } from "@/lib/cv-data";

export default function SkillsChart() {
  const categories = Array.from(new Set(skills.map((skill) => skill.category)));

  return (
    <div className="space-y-8">
      {categories.map((category) => (
        <div key={category} className="space-y-4">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="font-semibold">
              {category}
            </Badge>
          </div>
          <div className="space-y-3">
            {skills
              .filter((skill) => skill.category === category)
              .sort((a, b) => b.level - a.level)
              .map((skill) => (
                <div key={skill.name} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{skill.name}</span>
                    <span className="text-muted-foreground">{skill.level}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-secondary">
                    <div
                      className="h-full rounded-full bg-primary transition-all duration-500"
                      style={{ width: `${skill.level}%` }}
                    />
                  </div>
                </div>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}
