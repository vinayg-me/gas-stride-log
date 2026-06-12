import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { TrendingUp } from 'lucide-react';
import { useMileageTrends } from '@/hooks/use-analytics';
import { ChartCard } from './chart-card';
import { useChartConfig } from '@/hooks/use-chart-config';
import { useCars } from '@/hooks/use-cars';
import { getCarUnits } from '@/lib/units';

interface MileageChartProps {
  carId: string;
  months?: number;
  height?: number;
  className?: string;
  fuelType?: string;
}

export function MileageChart({ carId, months = 12, height = 300, className, fuelType = 'petrol' }: MileageChartProps) {
  const { data: mileageData = [], isLoading, error } = useMileageTrends(carId, months);
  const { commonAxisProps, commonTooltipProps, commonGridProps, defaultMargin } = useChartConfig();
  const { data: cars = [] } = useCars();
  const car = cars.find(c => c.id === carId);
  const { efficiencyUnit } = getCarUnits(car);

  const isElectric = car?.fuel_type === 'electric';
  const isCng = car?.fuel_type === 'cng';

  return (
    <ChartCard
      title={isElectric ? "Efficiency Trends" : "Mileage Trends"}
      subtitle={isElectric ? "Energy efficiency over time (full-to-full method)" : "Fuel efficiency over time (full-to-full method)"}
      icon={TrendingUp}
      isLoading={isLoading}
      error={error}
      dataLength={mileageData.length}
      emptyMessage={isElectric ? "No efficiency data available. Add more logs with full charges." : "No mileage data available. Add more fuel logs with full fills."}
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
            label={{ value: efficiencyUnit, angle: -90, position: 'insideLeft' }}
          />
          <Tooltip
            {...commonTooltipProps}
            formatter={(value: number) => [
              `${value.toFixed(2)} ${efficiencyUnit}`,
              isElectric ? 'Efficiency' : 'Mileage'
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
            name={isElectric ? "Efficiency" : `Mileage (${efficiencyUnit})`}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
