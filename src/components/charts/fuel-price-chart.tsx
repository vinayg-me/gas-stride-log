import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { TrendingUp } from 'lucide-react';
import { useFuelPriceTrends } from '@/hooks/use-analytics';
import { ChartCard } from './chart-card';
import { useChartConfig } from '@/hooks/use-chart-config';
import { useCars } from '@/hooks/use-cars';
import { getCarUnits } from '@/lib/units';

interface FuelPriceChartProps {
  carId: string;
  months?: number;
  height?: number;
  className?: string;
}

export function FuelPriceChart({ carId, months = 12, height = 300, className }: FuelPriceChartProps) {
  const { data: priceData = [], isLoading, error } = useFuelPriceTrends(carId, months);
  const { commonAxisProps, commonTooltipProps, commonGridProps, defaultMargin } = useChartConfig();
  const { data: cars = [] } = useCars();
  const car = cars.find(c => c.id === carId);
  const { currencySymbol, volumeUnit } = getCarUnits(car);

  const isElectric = car?.fuel_type === 'electric';
  const labelPrefix = isElectric ? 'Charging' : 'Fuel';

  return (
    <ChartCard
      title={`${labelPrefix} Price Trends`}
      subtitle={`Historical ${labelPrefix.toLowerCase()} price fluctuations`}
      icon={TrendingUp}
      isLoading={isLoading}
      error={error}
      dataLength={priceData.length}
      emptyMessage={`No ${labelPrefix.toLowerCase()} price data available.`}
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
            label={{ value: `${currencySymbol}/${volumeUnit}`, angle: -90, position: 'insideLeft' }}
            domain={['auto', 'auto']}
          />
          <Tooltip
            {...commonTooltipProps}
            formatter={(value: number) => [
              `${currencySymbol}${value.toFixed(2)} /${volumeUnit}`,
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
            name={`Price (${currencySymbol}/${volumeUnit})`}
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
