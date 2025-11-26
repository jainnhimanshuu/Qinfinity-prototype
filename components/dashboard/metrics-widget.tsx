"use client";

import { Card, CardHeader, CardBody, Divider } from "@heroui/react";

interface MetricItem {
  label: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
}

interface MetricsWidgetProps {
  title: string;
  metrics: MetricItem[];
  columns?: 2 | 3 | 4;
}

export function MetricsWidget({ title, metrics, columns = 4 }: MetricsWidgetProps) {
  const gridCols = {
    2: "grid-cols-2",
    3: "grid-cols-3",
    4: "grid-cols-4",
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <h3 className="text-lg font-semibold">{title}</h3>
      </CardHeader>
      <Divider />
      <CardBody>
        <div className={`grid ${gridCols[columns]} gap-4`}>
          {metrics.map((metric, index) => (
            <div
              key={index}
              className="flex flex-col p-4 rounded-lg bg-default-50 dark:bg-default-100/50"
            >
              <span className="text-sm text-default-500 mb-1">{metric.label}</span>
              <span className="text-2xl font-bold">{metric.value}</span>
              {metric.change !== undefined && (
                <span
                  className={`text-xs mt-1 ${
                    metric.change > 0
                      ? "text-success"
                      : metric.change < 0
                      ? "text-danger"
                      : "text-default-400"
                  }`}
                >
                  {metric.change > 0 ? "+" : ""}
                  {metric.change}% {metric.changeLabel || "vs last period"}
                </span>
              )}
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}

