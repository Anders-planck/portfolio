"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { technicalCompetencies } from "@/lib/cv-data";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, Sector } from "recharts";

// Hook to get current theme colors from CSS variables
function useThemeColors() {
  const [colors, setColors] = useState({
    chart1: "oklch(0.5553 0.1455 48.9975)",
    chart2: "oklch(0.5534 0.0116 58.0708)",
    chart3: "oklch(0.5538 0.1207 66.4416)",
    chart4: "oklch(0.5534 0.0116 58.0708)",
    chart5: "oklch(0.6806 0.1423 75.8340)",
    primary: "oklch(0.5553 0.1455 48.9975)",
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
        primary: style.getPropertyValue("--primary").trim() || "oklch(0.5553 0.1455 48.9975)",
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

const categoryLabels = {
  backend: "Backend & Server",
  frontend: "Frontend & UI",
  database: "Database",
  devops: "DevOps & Cloud",
  api: "API & Communication",
  methodologies: "Methodologies",
};

const renderActiveShape = (props: any) => {
  const {
    cx,
    cy,
    innerRadius,
    outerRadius,
    startAngle,
    endAngle,
    fill,
  } = props;

  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 10}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={outerRadius + 12}
        outerRadius={outerRadius + 15}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
    </g>
  );
};

export default function TechStackDonut() {
  const [activeIndex, setActiveIndex] = useState<number | undefined>(0);
  const themeColors = useThemeColors();

  // Map categories to theme chart colors
  const categoryColors: Record<string, string> = {
    backend: themeColors.chart1,
    frontend: themeColors.chart2,
    database: themeColors.chart3,
    devops: themeColors.chart4,
    api: themeColors.chart5,
    methodologies: themeColors.primary,
  };

  const chartData = Object.entries(technicalCompetencies).map(([category, items]) => ({
    name: categoryLabels[category as keyof typeof categoryLabels],
    value: items.length,
    color: categoryColors[category],
    items: items,
    category: category,
  }));

  const onPieEnter = (_: unknown, index: number) => {
    setActiveIndex(index);
  };

  const selectedCategory = activeIndex !== undefined ? chartData[activeIndex] : chartData[0];

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Donut Chart */}
      <div className="h-[350px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            {/* @ts-ignore */}
            <Pie
              // @ts-ignore
              activeIndex={activeIndex}
              activeShape={renderActiveShape}
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={110}
              paddingAngle={3}
              dataKey="value"
              onMouseEnter={onPieEnter}
              label={({ value }: any) => `${value}`}
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color}
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
                      className="rounded-lg border-2 bg-background p-3 shadow-lg"
                      style={{ borderColor: data.color }}
                    >
                      <p className="font-semibold">{data.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {data.value} technologies
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
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Selected Category Details */}
      <div className="flex flex-col justify-center space-y-4">
        <div
          className="inline-block rounded-lg px-4 py-2 text-sm font-bold text-white"
          style={{ backgroundColor: selectedCategory.color }}
        >
          {selectedCategory.name}
        </div>
        <p className="text-sm text-muted-foreground">
          {selectedCategory.value} technologies in this category
        </p>
        <div className="flex flex-wrap gap-2">
          {selectedCategory.items.map((item) => (
            <Badge
              key={item}
              variant="secondary"
              className="font-normal"
              style={{
                borderColor: selectedCategory.color,
                borderWidth: "1px",
              }}
            >
              {item}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
}
