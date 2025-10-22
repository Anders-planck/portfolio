"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Target, Lightbulb } from "lucide-react";
import { useTranslations } from "next-intl";

export default function ProfessionalSummary() {
  const t = useTranslations("about.professionalSummary");
  const tCv = useTranslations("cv");

  const softSkillKeys = ['problemSolving', 'teamCollaboration', 'adaptability', 'qualityFocus'] as const;

  return (
    <div className="space-y-6">
      {/* Bio */}
      <Card>
        <CardHeader>
          <CardTitle>{t("aboutMe")}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="leading-relaxed text-muted-foreground">{tCv('bio')}</p>
        </CardContent>
      </Card>

      {/* Professional Goal */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            {t("professionalGoal")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="leading-relaxed text-muted-foreground">
            {tCv('professionalGoal')}
          </p>
        </CardContent>
      </Card>

      {/* Soft Skills */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            {t("softSkills")}
          </CardTitle>
          <CardDescription>
            {t("softSkillsDescription")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {softSkillKeys.map((skillKey) => (
              <div
                key={skillKey}
                className="rounded-lg border bg-card p-4 transition-colors hover:bg-accent"
              >
                <h4 className="mb-1 font-semibold">{tCv(`softSkills.${skillKey}.name`)}</h4>
                <p className="text-sm text-muted-foreground">
                  {tCv(`softSkills.${skillKey}.description`)}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
