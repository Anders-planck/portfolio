"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { bio, professionalGoal, softSkills } from "@/lib/cv-data";
import { Target, Lightbulb } from "lucide-react";

export default function ProfessionalSummary() {
  return (
    <div className="space-y-6">
      {/* Bio */}
      <Card>
        <CardHeader>
          <CardTitle>About Me</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="leading-relaxed text-muted-foreground">{bio}</p>
        </CardContent>
      </Card>

      {/* Professional Goal */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Professional Goal
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="leading-relaxed text-muted-foreground">
            {professionalGoal}
          </p>
        </CardContent>
      </Card>

      {/* Soft Skills */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            Soft Skills
          </CardTitle>
          <CardDescription>
            Personal qualities that drive my professional success
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {softSkills.map((skill) => (
              <div
                key={skill.name}
                className="rounded-lg border bg-card p-4 transition-colors hover:bg-accent"
              >
                <h4 className="mb-1 font-semibold">{skill.name}</h4>
                <p className="text-sm text-muted-foreground">
                  {skill.description}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
