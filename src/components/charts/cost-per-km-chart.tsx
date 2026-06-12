import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Wallet } from 'lucide-react';
import { useCostPerKmTrends } from '@/hooks/use-analytics';
import { ChartCard } from './chart-card';
import { useChartConfig } from '@/hooks/use-chart-config';
import { useCars } from '@/hooks/use-cars';
import { getCarUnits } from '@/lib/units';

interface CostPerKmChartProps {
  carId: string;
  months?: number;
  height?: number;
  className?: string;
}

export function CostPerKmChart({ carId, months = 12, height = 300, className }: CostPerKmChartProps) {
  const { data: costData = [], isLoading, error } = useCostPerKmTrends(carId, months);
  const { commonAxisProps, commonTooltipProps, commonGridProps, defaultMargin } = useChartConfig();
  const { data: cars = [] } = useCars();
  const car = cars.find(c => c.id === carId);
  const { currencySymbol, distanceUnit } = getCarUnits(car);

  const distLabel = distanceUnit === 'mi' ? 'Mile' : 'KM';

  return (
    <ChartCard
      title={`Cost per ${distLabel} Trends`}
      subtitle={`Running cost efficiency per ${distanceUnit === 'mi' ? 'mile' : 'kilometer'}`}
      icon={Wallet}
      isLoading={isLoading}
      error={error}
      dataLength={costData.length}
      emptyMessage={`Not enough data to calculate cost per ${distLabel}. Requires at least 2 consecutive fuel logs.`}
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
            label={{ value: `${currencySymbol}/${distanceUnit}`, angle: -90, position: 'insideLeft' }}
          />
          <Tooltip
            {...commonTooltipProps}
            formatter={(value: number) => [
              `${currencySymbol}${value.toFixed(2)} /${distanceUnit}`,
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
            name={`Cost (${currencySymbol}/${distanceUnit})`}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
