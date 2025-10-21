"use client";

import { useEffect, useState } from "react";
import { skills } from "@/lib/cv-data";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

// Hook to get current theme colors from CSS variables
function useThemeColors() {
  const [colors, setColors] = useState({
    chart1: "oklch(0.5553 0.1455 48.9975)",
    chart2: "oklch(0.5534 0.0116 58.0708)",
    chart3: "oklch(0.5538 0.1207 66.4416)",
    chart4: "oklch(0.5534 0.0116 58.0708)",
    chart5: "oklch(0.6806 0.1423 75.8340)",
  });

  useEffect(() => {
    const updateColors = () => {
      const root = document.documentElement;
      const style = getComputedStyle(root);

      setColors({
        chart1: style.getPropertyValue("--chart-1").trim() || "oklch(0.5553 0.1455 48.9975)",
        chart2: style.getPropertyValue("--chart-2").trim() || "oklch(0.5534 0.0116 58.0708)",
        chart3: style.getPropertyValue("--chart-3").trim() || "oklch(0.5538 0.1207 66.4416)",
        chart4: style.getPropertyValue("--chart-4").trim() || "oklch(0.5534 0.0116 58.0708)",
        chart5: style.getPropertyValue("--chart-5").trim() || "oklch(0.6806 0.1423 75.8340)",
      });
    };

    updateColors();

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === "class") {
          updateColors();
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  return colors;
}

export default function SkillsDonutChart() {
  const themeColors = useThemeColors();

  // Map categories to theme chart colors
  const categoryColors: Record<string, string> = {
    Backend: themeColors.chart1,
    Frontend: themeColors.chart2,
    Database: themeColors.chart3,
    DevOps: themeColors.chart4,
    API: themeColors.chart5,
  };
  // Calculate average proficiency per category
  const categoryData = Object.entries(
    skills.reduce(
      (acc, skill) => {
        if (!acc[skill.category]) {
          acc[skill.category] = { total: 0, count: 0 };
        }
        acc[skill.category].total += skill.level;
        acc[skill.category].count += 1;
        return acc;
      },
      {} as Record<string, { total: number; count: number }>
    )
  ).map(([category, data]) => ({
    name: category,
    value: Math.round(data.total / data.count),
    count: data.count,
  }));

  return (
    <div className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={categoryData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={5}
            dataKey="value"
            label={({ name, value }) => `${name}: ${value}%`}
            labelLine={{ stroke: "hsl(var(--foreground))", strokeWidth: 1 }}
          >
            {categoryData.map((entry) => (
              <Cell
                key={`cell-${entry.name}`}
                fill={categoryColors[entry.name]}
                stroke="hsl(var(--background))"
                strokeWidth={2}
              />
            ))}
          </Pie>
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload;
                return (
                  <div className="rounded-lg border bg-background p-3 shadow-md">
                    <p className="font-semibold">{data.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Average: {data.value}%
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {data.count} skills
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            formatter={(value, entry) => {
              const data = entry.payload as { count: number };
              return `${value} (${data.count})`;
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
