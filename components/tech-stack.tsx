"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { technicalCompetencies } from "@/lib/cv-data";
import {
  Server,
  Code,
  Database,
  Cloud,
  GitBranch,
  Boxes,
} from "lucide-react";

const categoryIcons = {
  backend: Server,
  frontend: Code,
  database: Database,
  devops: Cloud,
  api: Boxes,
  methodologies: GitBranch,
};

const categoryLabels = {
  backend: "Backend & Server",
  frontend: "Frontend & UI",
  database: "Database",
  devops: "DevOps & Cloud",
  api: "API & Communication",
  methodologies: "Methodologies & Quality",
};

export default function TechStack() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Technology Stack</CardTitle>
        <CardDescription>
          Comprehensive overview of technologies and methodologies
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 md:grid-cols-2">
          {Object.entries(technicalCompetencies).map(([category, items]) => {
            const Icon = categoryIcons[category as keyof typeof categoryIcons];
            const label = categoryLabels[category as keyof typeof categoryLabels];

            return (
              <div key={category} className="space-y-3">
                <div className="flex items-center gap-2 font-semibold">
                  {Icon && <Icon className="h-4 w-4 text-primary" />}
                  <h3 className="text-sm">{label}</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {items.map((item) => (
                    <Badge key={item} variant="secondary" className="font-normal">
                      {item}
                    </Badge>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
