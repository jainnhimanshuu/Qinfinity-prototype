"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface BarChartData {
  name: string;
  [key: string]: string | number;
}

interface BarChartProps {
  data: BarChartData[];
  dataKeys: string[];
  colors?: string[];
  height?: number;
  showLegend?: boolean;
  horizontal?: boolean;
}

export function CustomBarChart({ data, dataKeys, colors = ["#006FEE", "#7828C8", "#F31260", "#F5A524"], height = 300, showLegend = true, horizontal = false }: BarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} layout={horizontal ? "vertical" : "horizontal"} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-default-200" />
        {horizontal ? (
          <>
            <XAxis type="number" className="text-xs" stroke="currentColor" />
            <YAxis dataKey="name" type="category" className="text-xs" stroke="currentColor" width={100} />
          </>
        ) : (
          <>
            <XAxis dataKey="name" className="text-xs" stroke="currentColor" />
            <YAxis className="text-xs" stroke="currentColor" />
          </>
        )}
        <Tooltip
          contentStyle={{
            backgroundColor: "var(--heroui-background)",
            border: "1px solid var(--heroui-border)",
            borderRadius: "8px",
          }}
        />
        {showLegend && <Legend />}
        {dataKeys.map((key, index) => (
          <Bar
            key={key}
            dataKey={key}
            fill={colors[index % colors.length]}
            radius={[4, 4, 0, 0]}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}

