"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { workExperience } from "@/lib/cv-data";
import { Briefcase, Calendar } from "lucide-react";
import { useTranslations } from "next-intl";

export default function ExperienceHighlights() {
  const t = useTranslations("about.timeline");
  const tCv = useTranslations("cv");

  return (
    <div className="space-y-6">
      {workExperience.map((work, workIndex) => (
        work.projects.map((project, projectIndex) => (
          <Card key={`${workIndex}-${projectIndex}`}>
            <CardHeader>
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="h-5 w-5" />
                    {project.title}
                  </CardTitle>
                  <CardDescription className="mt-1 font-semibold">
                    {work.company}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  {project.period}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {tCv(`experience.${workIndex}.projects.${projectIndex}.description`)}
              </p>

              <div className="space-y-2">
                <h4 className="text-sm font-semibold">{t("keyAchievements")}</h4>
                <ul className="space-y-1 text-sm">
                  {project.achievements.map((_, achIndex) => (
                    <li key={achIndex} className="flex items-start gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
                      <span className="text-muted-foreground">
                        {tCv(`experience.${workIndex}.projects.${projectIndex}.achievements.${achIndex}`)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex flex-wrap gap-2">
                {project.technologies.map((tech) => (
                  <Badge key={tech} variant="secondary">
                    {tech}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        ))
      ))}
    </div>
  );
}
