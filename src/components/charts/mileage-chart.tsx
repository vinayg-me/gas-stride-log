import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { TrendingUp } from 'lucide-react';
import { useMileageTrends } from '@/hooks/use-analytics';
import { ChartCard } from './chart-card';
import { useChartConfig } from '@/hooks/use-chart-config';

interface MileageChartProps {
  carId: string;
  months?: number;
  height?: number;
  className?: string;
}

export function MileageChart({ carId, months = 12, height = 300, className }: MileageChartProps) {
  const { data: mileageData = [], isLoading, error } = useMileageTrends(carId, months);
  const { commonAxisProps, commonTooltipProps, commonGridProps, defaultMargin } = useChartConfig();

  return (
    <ChartCard
      title="Mileage Trends"
      subtitle="Fuel efficiency over time (full-to-full method)"
      icon={TrendingUp}
      isLoading={isLoading}
      error={error}
      dataLength={mileageData.length}
      emptyMessage="No mileage data available. Add more fuel logs with full fills."
      height={height}
      className={className}
    >
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={mileageData} margin={defaultMargin}>
          <CartesianGrid {...commonGridProps} />
          <XAxis 
            dataKey="date" 
            {...commonAxisProps}
            tickFormatter={(value) => new Date(value).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
          />
          <YAxis 
            {...commonAxisProps}
            label={{ value: 'km/L', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip
            {...commonTooltipProps}
            formatter={(value: number) => [
              `${value.toFixed(2)} km/L`,
              'Mileage'
            ]}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="kmpl"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: 'hsl(var(--primary))', strokeWidth: 2 }}
            name="Mileage (km/L)"
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
