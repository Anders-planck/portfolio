"use client";

import { useEffect, useState } from "react";
import { skills } from "@/lib/cv-data";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

// Hook to get current theme colors from CSS variables
function useThemeColors() {
  const [colors, setColors] = useState({
    foreground: "oklch(0.3660 0.0251 49.6085)",
    mutedForeground: "oklch(0.5534 0.0116 58.0708)",
    chart1: "oklch(0.5553 0.1455 48.9975)",
    chart2: "oklch(0.5534 0.0116 58.0708)",
    chart3: "oklch(0.5538 0.1207 66.4416)",
    chart4: "oklch(0.5534 0.0116 58.0708)",
    chart5: "oklch(0.6806 0.1423 75.8340)",
    border: "oklch(0.8866 0.0404 89.6994)",
  });

  useEffect(() => {
    const updateColors = () => {
      const root = document.documentElement;
      const style = getComputedStyle(root);

      setColors({
        foreground: style.getPropertyValue("--foreground").trim() || "oklch(0.3660 0.0251 49.6085)",
        mutedForeground: style.getPropertyValue("--muted-foreground").trim() || "oklch(0.5534 0.0116 58.0708)",
        chart1: style.getPropertyValue("--chart-1").trim() || "oklch(0.5553 0.1455 48.9975)",
        chart2: style.getPropertyValue("--chart-2").trim() || "oklch(0.5534 0.0116 58.0708)",
        chart3: style.getPropertyValue("--chart-3").trim() || "oklch(0.5538 0.1207 66.4416)",
        chart4: style.getPropertyValue("--chart-4").trim() || "oklch(0.5534 0.0116 58.0708)",
        chart5: style.getPropertyValue("--chart-5").trim() || "oklch(0.6806 0.1423 75.8340)",
        border: style.getPropertyValue("--border").trim() || "oklch(0.8866 0.0404 89.6994)",
      });
    };

    // Initial update
    updateColors();

    // Watch for theme changes
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

interface CustomAxisTickProps {
  payload?: { value: string };
  x?: string | number;
  y?: string | number;
  textAnchor?: "start" | "middle" | "end" | "inherit";
  fill?: string;
}

// Custom label component with theme awareness
function CustomAxisTick({ payload, x, y, textAnchor, fill }: CustomAxisTickProps) {
  return (
    <g className="recharts-layer recharts-polar-angle-axis-tick">
      <text
        stroke="none"
        x={x}
        y={y}
        textAnchor={textAnchor}
        fill={fill}
        style={{
          fontSize: "clamp(10px, 2vw, 13px)",
          fontWeight: 600,
        }}
      >
        <tspan x={x} dy="0em">
          {payload?.value}
        </tspan>
      </text>
    </g>
  );
}

export default function SkillsRadarChart() {
  const themeColors = useThemeColors();

  // Get all skills and organize by category
  const categories = ["Backend", "Frontend", "Database", "DevOps", "API"];

  // Map categories to theme chart colors
  const categoryColors: Record<string, string> = {
    Backend: themeColors.chart1,
    Frontend: themeColors.chart2,
    Database: themeColors.chart3,
    DevOps: themeColors.chart4,
    API: themeColors.chart5,
  };

  // Get top 3 skills from each category
  const topSkillsByCategory = categories.reduce((acc, category) => {
    const categorySkills = skills
      .filter(skill => skill.category === category)
      .sort((a, b) => b.level - a.level)
      .slice(0, 3);
    return { ...acc, [category]: categorySkills };
  }, {} as Record<string, typeof skills>);

  // Create unified data structure for radar chart
  const skillNames = Array.from(
    new Set(
      Object.values(topSkillsByCategory)
        .flat()
        .map(skill => skill.name)
    )
  );

  const radarData = skillNames.map(skillName => {
    const dataPoint: Record<string, string | number> = { skill: skillName };

    categories.forEach(category => {
      const skill = topSkillsByCategory[category].find(s => s.name === skillName);
      dataPoint[category] = skill ? skill.level : 0;
    });

    return dataPoint;
  });

  return (
    <div className="h-[450px] md:h-[500px]">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart
          data={radarData}
          margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
        >
          <PolarGrid
            stroke={themeColors.mutedForeground}
            strokeWidth={1}
            opacity={0.3}
          />
          <PolarAngleAxis
            dataKey="skill"
            tick={(props) => <CustomAxisTick {...props} fill={themeColors.foreground} />}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 100]}
            tick={{
              fill: themeColors.mutedForeground,
              fontSize: 10,
            }}
            tickCount={6}
          />

          {categories.map((category) => (
            <Radar
              key={category}
              name={category}
              dataKey={category}
              stroke={categoryColors[category]}
              fill={categoryColors[category]}
              fillOpacity={0.2}
              strokeWidth={2}
              dot={{ r: 4, strokeWidth: 2 }}
            />
          ))}

          <Tooltip
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="rounded-lg border-2 border-primary/20 bg-background/95 p-4 shadow-xl backdrop-blur-sm">
                    <p className="mb-3 text-sm font-bold ">{label}</p>
                    <div className="space-y-2">
                      {payload
                        .filter(p => p.value && p.value > 0)
                        .map((entry, index) => (
                          <div key={index} className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-2">
                              <div
                                className="h-3 w-3 rounded-full shadow-sm"
                                style={{ backgroundColor: entry.color }}
                              />
                              <span className="text-sm font-medium text-foreground">
                                {entry.name}
                              </span>
                            </div>
                            <span
                              className="text-sm font-bold"
                              style={{ color: entry.color }}
                            >
                              {entry.value}%
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>
                );
              }
              return null;
            }}
          />
          <Legend
            wrapperStyle={{
              paddingTop: "20px",
              fontSize: "clamp(11px, 2vw, 14px)",
              color: themeColors.foreground,
            }}
            iconType="circle"
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
