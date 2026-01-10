import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { IndianRupee } from 'lucide-react';
import { useCostPerKmTrends } from '@/hooks/use-analytics';
import { ChartCard } from './chart-card';
import { useChartConfig } from '@/hooks/use-chart-config';

interface CostPerKmChartProps {
  carId: string;
  months?: number;
  height?: number;
  className?: string;
}

export function CostPerKmChart({ carId, months = 12, height = 300, className }: CostPerKmChartProps) {
  const { data: costData = [], isLoading, error } = useCostPerKmTrends(carId, months);
  const { commonAxisProps, commonTooltipProps, commonGridProps, defaultMargin } = useChartConfig();

  return (
    <ChartCard
      title="Cost per KM Trends"
      subtitle="Running cost efficiency per kilometer"
      icon={IndianRupee}
      isLoading={isLoading}
      error={error}
      dataLength={costData.length}
      emptyMessage="No enough data to calculate cost per KM. Requires at least 2 consecutive fuel logs."
      height={height}
      className={className}
    >
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={costData} margin={defaultMargin}>
          <CartesianGrid {...commonGridProps} />
          <XAxis 
            dataKey="date" 
            {...commonAxisProps}
            tickFormatter={(value) => new Date(value).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
          />
          <YAxis 
            {...commonAxisProps}
            label={{ value: '₹/km', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip
            {...commonTooltipProps}
            formatter={(value: number) => [
              `₹${value.toFixed(2)} /km`,
              'Cost'
            ]}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="value"
            stroke="hsl(var(--destructive))"
            strokeWidth={2}
            dot={{ fill: 'hsl(var(--destructive))', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: 'hsl(var(--destructive))', strokeWidth: 2 }}
            name="Cost (₹/km)"
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
