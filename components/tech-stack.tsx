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
import { useTranslations } from "next-intl";

const categoryIcons = {
  backend: Server,
  frontend: Code,
  database: Database,
  devops: Cloud,
  api: Boxes,
  methodologies: GitBranch,
};

export default function TechStack() {
  const t = useTranslations("about.techStack");

  const categoryLabels: Record<string, string> = {
    backend: t("categories.backend"),
    frontend: t("categories.frontend"),
    database: t("categories.database"),
    devops: t("categories.devops"),
    api: t("categories.api"),
    methodologies: t("categories.methodologiesQuality"),
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
        <CardDescription>
          {t("description")}
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
