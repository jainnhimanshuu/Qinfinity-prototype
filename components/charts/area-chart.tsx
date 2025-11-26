"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface AreaChartData {
  name: string;
  [key: string]: string | number;
}

interface AreaChartProps {
  data: AreaChartData[];
  dataKeys: string[];
  colors?: string[];
  height?: number;
  showLegend?: boolean;
  stacked?: boolean;
}

export function CustomAreaChart({ data, dataKeys, colors = ["#006FEE", "#7828C8", "#F31260", "#F5A524"], height = 300, showLegend = true, stacked = false }: AreaChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <defs>
          {dataKeys.map((key, index) => (
            <linearGradient key={key} id={`color${key}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={colors[index % colors.length]} stopOpacity={0.8} />
              <stop offset="95%" stopColor={colors[index % colors.length]} stopOpacity={0.1} />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid strokeDasharray="3 3" className="stroke-default-200" />
        <XAxis dataKey="name" className="text-xs" stroke="currentColor" />
        <YAxis className="text-xs" stroke="currentColor" />
        <Tooltip
          contentStyle={{
            backgroundColor: "var(--heroui-background)",
            border: "1px solid var(--heroui-border)",
            borderRadius: "8px",
          }}
        />
        {showLegend && <Legend />}
        {dataKeys.map((key, index) => (
          <Area
            key={key}
            type="monotone"
            dataKey={key}
            stroke={colors[index % colors.length]}
            fill={`url(#color${key})`}
            stackId={stacked ? "1" : undefined}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );
}

