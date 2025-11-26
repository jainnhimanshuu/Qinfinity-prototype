"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface LineChartData {
  name: string;
  [key: string]: string | number;
}

interface LineChartProps {
  data: LineChartData[];
  dataKeys: string[];
  colors?: string[];
  height?: number;
  showLegend?: boolean;
}

export function CustomLineChart({ data, dataKeys, colors = ["#006FEE", "#7828C8", "#F31260", "#F5A524"], height = 300, showLegend = true }: LineChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
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
          <Line
            key={key}
            type="monotone"
            dataKey={key}
            stroke={colors[index % colors.length]}
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}

