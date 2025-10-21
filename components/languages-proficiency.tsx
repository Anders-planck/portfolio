"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { languages } from "@/lib/cv-data";
import { Globe } from "lucide-react";

export default function LanguagesProficiency() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5" />
          Languages
        </CardTitle>
        <CardDescription>Communication across cultures</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {languages.map((language) => (
          <div key={language.name} className="space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-medium">{language.name}</span>
                <span className="ml-2 text-sm text-muted-foreground">
                  {language.level}
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
