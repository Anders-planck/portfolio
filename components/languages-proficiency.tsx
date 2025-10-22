"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Globe } from "lucide-react";
import { useTranslations } from "next-intl";

export default function LanguagesProficiency() {
  const t = useTranslations("about.languages");
  const tCv = useTranslations("cv.languages");

  const languages = [
    { key: 'french', level: 'native', proficiency: 100 },
    { key: 'italian', level: 'b2', proficiency: 75 },
    { key: 'english', level: 'b1', proficiency: 65 },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5" />
          {t("title")}
        </CardTitle>
        <CardDescription>{t("description")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {languages.map((language) => (
          <div key={language.key} className="space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-medium">{tCv(language.key)}</span>
                <span className="ml-2 text-sm text-muted-foreground">
                  {tCv(language.level)}
                </span>
              </div>
              <span className="text-sm font-medium text-primary">
                {language.proficiency}%
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary to-primary/70 transition-all duration-500"
                style={{ width: `${language.proficiency}%` }}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
