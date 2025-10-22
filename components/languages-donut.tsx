"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

// Hook to get current theme colors from CSS variables
function useThemeColors() {
  const [colors, setColors] = useState({
    chart1: "oklch(0.5553 0.1455 48.9975)",
    chart2: "oklch(0.5534 0.0116 58.0708)",
    chart3: "oklch(0.5538 0.1207 66.4416)",
  });

  useEffect(() => {
    const updateColors = () => {
      const root = document.documentElement;
      const style = getComputedStyle(root);

      setColors({
        chart1: style.getPropertyValue("--chart-1").trim() || "oklch(0.5553 0.1455 48.9975)",
        chart2: style.getPropertyValue("--chart-2").trim() || "oklch(0.5534 0.0116 58.0708)",
        chart3: style.getPropertyValue("--chart-3").trim() || "oklch(0.5538 0.1207 66.4416)",
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

export default function LanguagesDonut() {
  const themeColors = useThemeColors();
  const tCv = useTranslations("cv.languages");

  const languages = [
    { key: 'french', level: 'native', proficiency: 100 },
    { key: 'italian', level: 'b2', proficiency: 75 },
    { key: 'english', level: 'b1', proficiency: 65 },
  ];

  // Map languages to theme chart colors
  const languageColors: Record<string, string> = {
    french: themeColors.chart1,
    italian: themeColors.chart2,
    english: themeColors.chart3,
  };

  const chartData = languages.map((language) => ({
    key: language.key,
    name: tCv(language.key),
    value: language.proficiency,
    level: tCv(language.level),
  }));

  return (
    <div className="h-[350px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={70}
            outerRadius={110}
            paddingAngle={5}
            dataKey="value"
            label={({ name, value }) => `${name}: ${value}%`}
            labelLine={{ stroke: "hsl(var(--foreground))", strokeWidth: 1 }}
          >
            {chartData.map((entry) => (
              <Cell
                key={`cell-${entry.key}`}
                fill={languageColors[entry.key]}
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
                  <div
                    className="rounded-lg border-2 bg-background p-4 shadow-lg"
                    style={{
                      borderColor: languageColors[data.key],
                    }}
                  >
                    <div
                      className="mb-2 inline-block rounded px-2 py-1 text-xs font-bold text-white"
                      style={{
                        backgroundColor: languageColors[data.key],
                      }}
                    >
                      {data.name}
                    </div>
                    <p className="text-sm font-semibold">{data.level}</p>
                    <p
                      className="mt-1 text-lg font-bold"
                      style={{
                        color: languageColors[data.key],
                      }}
                    >
                      {data.value}%
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
              const data = entry.payload as { level: string };
              return `${value} (${data.level})`;
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
