"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

interface PieChartData {
  name: string;
  value: number;
}

interface PieChartProps {
  data: PieChartData[];
  colors?: string[];
  height?: number;
  showLegend?: boolean;
  innerRadius?: number;
  outerRadius?: number;
}

export function CustomPieChart({ data, colors = ["#006FEE", "#7828C8", "#F31260", "#F5A524", "#17C964", "#C20E49"], height = 300, showLegend = true, innerRadius = 0, outerRadius = 80 }: PieChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={data as any}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }: any) => `${name}: ${(percent * 100).toFixed(0)}%`}
          outerRadius={outerRadius}
          innerRadius={innerRadius}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: "var(--heroui-background)",
            border: "1px solid var(--heroui-border)",
            borderRadius: "8px",
          }}
        />
        {showLegend && <Legend />}
      </PieChart>
    </ResponsiveContainer>
  );
}

