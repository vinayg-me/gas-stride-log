import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { TrendingUp } from 'lucide-react';
import { useFuelPriceTrends } from '@/hooks/use-analytics';
import { ChartCard } from './chart-card';
import { useChartConfig } from '@/hooks/use-chart-config';

interface FuelPriceChartProps {
  carId: string;
  months?: number;
  height?: number;
  className?: string;
}

export function FuelPriceChart({ carId, months = 12, height = 300, className }: FuelPriceChartProps) {
  const { data: priceData = [], isLoading, error } = useFuelPriceTrends(carId, months);
  const { commonAxisProps, commonTooltipProps, commonGridProps, defaultMargin } = useChartConfig();

  return (
    <ChartCard
      title="Fuel Price Trends"
      subtitle="Historical fuel price fluctuations"
      icon={TrendingUp}
      isLoading={isLoading}
      error={error}
      dataLength={priceData.length}
      emptyMessage="No fuel price data available."
      height={height}
      className={className}
    >
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={priceData} margin={defaultMargin}>
          <defs>
            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid {...commonGridProps} />
          <XAxis 
            dataKey="date" 
            {...commonAxisProps}
            tickFormatter={(value) => new Date(value).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
          />
          <YAxis 
            {...commonAxisProps}
            label={{ value: '₹/L', angle: -90, position: 'insideLeft' }}
            domain={['auto', 'auto']}
          />
          <Tooltip
            {...commonTooltipProps}
            formatter={(value: number) => [
              `₹${value.toFixed(2)} /L`,
              'Price'
            ]}
          />
          <Legend />
          <Area
            type="monotone"
            dataKey="value"
            stroke="hsl(var(--primary))"
            fillOpacity={1}
            fill="url(#colorPrice)"
            name="Price (₹/L)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
