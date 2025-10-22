"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { skills } from "@/lib/cv-data";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { useTranslations } from "next-intl";

export default function SkillsComparisonChart() {
  const t = useTranslations("about.skillsComparison");
  // Get top 3 skills from each major category
  const categories = ["Backend", "Frontend", "DevOps"];

  const topSkillsByCategory = categories.flatMap((category) =>
    skills
      .filter((skill) => skill.category === category)
      .sort((a, b) => b.level - a.level)
      .slice(0, 3)
      .map((skill) => ({
        name: skill.name,
        level: skill.level,
        category: skill.category,
      }))
  );

  const chartData = topSkillsByCategory.reduce(
    (acc, skill) => {
      const existing = acc.find((item) => item.name === skill.name);
      if (existing) {
        existing[skill.category] = skill.level;
      } else {
        acc.push({
          name: skill.name,
          [skill.category]: skill.level,
        });
      }
      return acc;
    },
    [] as Array<Record<string, string | number>>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
        <CardDescription>
          {t("description")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
              <XAxis type="number" domain={[0, 100]} />
              <YAxis dataKey="name" type="category" width={100} />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="rounded-lg border bg-background p-3 shadow-md">
                        <p className="mb-2 font-semibold">{label}</p>
                        {payload.map((entry, index) => (
                          <p
                            key={index}
                            className="text-sm"
                            style={{ color: entry.color }}
                          >
                            {entry.name}: {entry.value}%
                          </p>
                        ))}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend />
              <Bar dataKey="Backend" fill="hsl(var(--chart-1))" />
              <Bar dataKey="Frontend" fill="hsl(var(--chart-2))" />
              <Bar dataKey="DevOps" fill="hsl(var(--chart-4))" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
