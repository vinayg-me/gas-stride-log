import { ResponsiveContainer, ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { DollarSign } from 'lucide-react';
import { useSpendingTrends } from '@/hooks/use-analytics';
import { ChartCard } from './chart-card';
import { useChartConfig } from '@/hooks/use-chart-config';

interface SpendingChartProps {
  carId: string;
  months?: number;
  height?: number;
  className?: string;
}

export function SpendingChart({ carId, months = 12, height = 300, className }: SpendingChartProps) {
  const { data: spendingData = [], isLoading, error } = useSpendingTrends(carId, months);
  const { commonAxisProps, commonTooltipProps, commonGridProps, defaultMargin } = useChartConfig();

  return (
    <ChartCard
      title="Monthly Spending"
      subtitle="Fuel spending and consumption by month"
      icon={DollarSign}
      isLoading={isLoading}
      error={error}
      dataLength={spendingData.length}
      emptyMessage="No spending data available. Add more fuel logs to see trends."
      height={height}
      className={className}
    >
      <ResponsiveContainer width="100%" height={height}>
        <ComposedChart data={spendingData} margin={defaultMargin}>
          <CartesianGrid {...commonGridProps} />
          <XAxis 
            dataKey="date" 
            {...commonAxisProps}
            tickFormatter={(value) => new Date(value + '-01').toLocaleDateString('en-IN', { month: 'short', year: '2-digit' })}
          />
          <YAxis 
            yAxisId="amount"
            {...commonAxisProps}
            label={{ value: 'Amount (₹)', angle: -90, position: 'insideLeft' }}
          />
          <YAxis 
            yAxisId="liters"
            orientation="right"
            {...commonAxisProps}
            label={{ value: 'Liters', angle: 90, position: 'insideRight' }}
          />
          <Tooltip
            {...commonTooltipProps}
            labelFormatter={(value) => new Date(value + '-01').toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
            formatter={(value: number, name: string) => {
              if (name === 'Amount') return [`₹${value.toLocaleString()}`, 'Amount'];
              if (name === 'Liters') return [`${value.toFixed(1)}L`, 'Liters'];
              return [value, name];
            }}
          />
          <Legend />
          <Bar
            yAxisId="amount"
            dataKey="amount"
            fill="hsl(var(--primary))"
            name="Amount"
            radius={[2, 2, 0, 0]}
          />
          <Line
            yAxisId="liters"
            type="monotone"
            dataKey="liters"
            stroke="hsl(var(--secondary))"
            strokeWidth={2}
            dot={{ fill: 'hsl(var(--secondary))', strokeWidth: 2, r: 4 }}
            name="Liters"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
