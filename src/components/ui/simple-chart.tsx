// Simplified Chart Components - Temporary fix for TypeScript issues

import * as React from "react";
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import { cn } from "@/lib/utils";

interface ChartProps {
  data: any[];
  className?: string;
  children?: React.ReactNode;
}

interface SimpleTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: any;
}

const SimpleTooltip: React.FC<SimpleTooltipProps> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-card p-3 border border-border/20 shadow-lg">
        <p className="text-sm text-foreground font-medium">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export const ChartContainer: React.FC<ChartProps> = ({ children, className }) => (
  <div className={cn("w-full h-[300px]", className)}>
    {children}
  </div>
);

export const ChartTooltip = SimpleTooltip;

export { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer };