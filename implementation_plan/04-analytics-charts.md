# Phase 4: Analytics & Charts

## Business Context

Implement comprehensive analytics and data visualization features using Recharts to provide users with insights into their fuel consumption patterns, costs, and efficiency trends. This includes mileage trends, cost analysis, monthly spending charts, and fuel price tracking with interactive filters and responsive design.

## Current State

- ✅ Recharts library integrated
- ✅ Simple chart component structure
- ✅ Chart data types defined (`src/types/index.ts`)
- ✅ Mock chart data in Storybook stories
- ❌ No real chart data integration
- ❌ No analytics calculations
- ❌ No interactive filters
- ❌ No responsive chart design

## Implementation Tasks

### 1. Analytics Service Layer

#### 1.1 Analytics Data Service
**File**: `src/services/analytics.ts`

```typescript
import { FuelLogService } from './fuel-logs';
import { CarService } from './cars';
import { MileageChartData, SpendChartData, ChartDataPoint } from '@/types';

export class AnalyticsService {
  static async getMileageTrends(carId: string, months: number = 12): Promise<MileageChartData[]> {
    const { logs } = await FuelLogService.calculateMileageForCar(carId);
    
    // Filter logs with mileage data from the last N months
    const cutoffDate = new Date();
    cutoffDate.setMonth(cutoffDate.getMonth() - months);
    
    const mileageData = logs
      .filter(log => log.mileage && new Date(log.filled_at) >= cutoffDate)
      .map(log => ({
        date: log.filled_at,
        value: log.mileage!,
        label: `${log.mileage!.toFixed(1)} km/L`,
        kmpl: log.mileage!,
        distance: log.distance || 0,
        liters: log.liters,
      }))
      .reverse(); // Chronological order
    
    return mileageData;
  }

  static async getSpendingTrends(carId: string, months: number = 12): Promise<SpendChartData[]> {
    const logs = await FuelLogService.getFuelLogs(carId);
    
    // Group logs by month
    const monthlyData = new Map<string, { amount: number; liters: number; fills: number }>();
    
    const cutoffDate = new Date();
    cutoffDate.setMonth(cutoffDate.getMonth() - months);
    
    logs
      .filter(log => new Date(log.filled_at) >= cutoffDate)
      .forEach(log => {
        const monthKey = new Date(log.filled_at).toISOString().slice(0, 7); // YYYY-MM
        const existing = monthlyData.get(monthKey) || { amount: 0, liters: 0, fills: 0 };
        
        monthlyData.set(monthKey, {
          amount: existing.amount + (log.total_cost || 0),
          liters: existing.liters + log.liters,
          fills: existing.fills + 1,
        });
      });
    
    // Convert to chart data
    const spendData: SpendChartData[] = Array.from(monthlyData.entries())
      .map(([month, data]) => ({
        date: month,
        value: data.amount,
        label: `₹${data.amount.toLocaleString()}`,
        amount: data.amount,
        liters: data.liters,
        fills: data.fills,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
    
    return spendData;
  }

  static async getCostPerKmTrends(carId: string, months: number = 12): Promise<ChartDataPoint[]> {
    const logs = await FuelLogService.getFuelLogs(carId);
    
    // Calculate cost per km for periods between fills
    const costData: ChartDataPoint[] = [];
    const cutoffDate = new Date();
    cutoffDate.setMonth(cutoffDate.getMonth() - months);
    
    const sortedLogs = logs
      .filter(log => new Date(log.filled_at) >= cutoffDate)
      .sort((a, b) => new Date(a.filled_at).getTime() - new Date(b.filled_at).getTime());
    
    for (let i = 1; i < sortedLogs.length; i++) {
      const currentLog = sortedLogs[i];
      const previousLog = sortedLogs[i - 1];
      
      const distance = currentLog.odometer_km - previousLog.odometer_km;
      const cost = currentLog.total_cost || 0;
      
      if (distance > 0 && cost > 0) {
        const costPerKm = cost / distance;
        costData.push({
          date: currentLog.filled_at,
          value: costPerKm,
          label: `₹${costPerKm.toFixed(2)}/km`,
        });
      }
    }
    
    return costData;
  }

  static async getFuelPriceTrends(carId: string, months: number = 12): Promise<ChartDataPoint[]> {
    const logs = await FuelLogService.getFuelLogs(carId);
    
    const cutoffDate = new Date();
    cutoffDate.setMonth(cutoffDate.getMonth() - months);
    
    const priceData = logs
      .filter(log => log.price_per_l && new Date(log.filled_at) >= cutoffDate)
      .map(log => ({
        date: log.filled_at,
        value: log.price_per_l!,
        label: `₹${log.price_per_l!.toFixed(2)}/L`,
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    return priceData;
  }

  static async getOverallAnalytics(carIds?: string[]): Promise<{
    totalCars: number;
    totalSpend: number;
    totalLiters: number;
    totalDistance: number;
    averageMileage: number;
    costPerKm: number;
    monthlySpend: number;
  }> {
    let cars;
    if (carIds) {
      cars = await Promise.all(carIds.map(id => CarService.getCarById(id)));
      cars = cars.filter(car => car !== null);
    } else {
      cars = await CarService.getCars();
    }
    
    const allStats = await Promise.all(
      cars.map(car => FuelLogService.getCarStatistics(car!.id))
    );
    
    const totalSpend = allStats.reduce((sum, stats) => sum + stats.totalSpend, 0);
    const totalLiters = allStats.reduce((sum, stats) => sum + stats.totalLiters, 0);
    const totalDistance = allStats.reduce((sum, stats) => sum + stats.totalDistance, 0);
    const monthlySpend = allStats.reduce((sum, stats) => sum + stats.last30DaysSpend, 0);
    
    // Calculate weighted average mileage
    const totalMileageWeighted = allStats.reduce((sum, stats) => {
      return sum + (stats.averageMileage * stats.totalDistance);
    }, 0);
    const averageMileage = totalDistance > 0 ? totalMileageWeighted / totalDistance : 0;
    
    const costPerKm = totalDistance > 0 ? totalSpend / totalDistance : 0;
    
    return {
      totalCars: cars.length,
      totalSpend,
      totalLiters,
      totalDistance,
      averageMileage,
      costPerKm,
      monthlySpend,
    };
  }
}
```

### 2. Analytics React Query Hooks

#### 2.1 Analytics Hooks
**File**: `src/hooks/use-analytics.ts`

```typescript
import { useQuery } from '@tanstack/react-query';
import { AnalyticsService } from '@/services/analytics';

export const ANALYTICS_QUERY_KEYS = {
  all: ['analytics'] as const,
  mileageTrends: (carId: string, months: number) => [...ANALYTICS_QUERY_KEYS.all, 'mileage', carId, months] as const,
  spendingTrends: (carId: string, months: number) => [...ANALYTICS_QUERY_KEYS.all, 'spending', carId, months] as const,
  costPerKmTrends: (carId: string, months: number) => [...ANALYTICS_QUERY_KEYS.all, 'cost-per-km', carId, months] as const,
  fuelPriceTrends: (carId: string, months: number) => [...ANALYTICS_QUERY_KEYS.all, 'fuel-price', carId, months] as const,
  overallAnalytics: (carIds?: string[]) => [...ANALYTICS_QUERY_KEYS.all, 'overall', carIds] as const,
};

export function useMileageTrends(carId: string, months: number = 12) {
  return useQuery({
    queryKey: ANALYTICS_QUERY_KEYS.mileageTrends(carId, months),
    queryFn: () => AnalyticsService.getMileageTrends(carId, months),
    enabled: !!carId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useSpendingTrends(carId: string, months: number = 12) {
  return useQuery({
    queryKey: ANALYTICS_QUERY_KEYS.spendingTrends(carId, months),
    queryFn: () => AnalyticsService.getSpendingTrends(carId, months),
    enabled: !!carId,
    staleTime: 10 * 60 * 1000,
  });
}

export function useCostPerKmTrends(carId: string, months: number = 12) {
  return useQuery({
    queryKey: ANALYTICS_QUERY_KEYS.costPerKmTrends(carId, months),
    queryFn: () => AnalyticsService.getCostPerKmTrends(carId, months),
    enabled: !!carId,
    staleTime: 10 * 60 * 1000,
  });
}

export function useFuelPriceTrends(carId: string, months: number = 12) {
  return useQuery({
    queryKey: ANALYTICS_QUERY_KEYS.fuelPriceTrends(carId, months),
    queryFn: () => AnalyticsService.getFuelPriceTrends(carId, months),
    enabled: !!carId,
    staleTime: 10 * 60 * 1000,
  });
}

export function useOverallAnalytics(carIds?: string[]) {
  return useQuery({
    queryKey: ANALYTICS_QUERY_KEYS.overallAnalytics(carIds),
    queryFn: () => AnalyticsService.getOverallAnalytics(carIds),
    staleTime: 5 * 60 * 1000,
  });
}
```

### 3. Chart Components

#### 3.1 Enhanced Chart Components
**File**: `src/components/charts/mileage-chart.tsx`

```typescript
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { TrendingUp } from 'lucide-react';
import { useMileageTrends } from '@/hooks/use-analytics';
import { MileageChartData } from '@/types';

interface MileageChartProps {
  carId: string;
  months?: number;
  height?: number;
  className?: string;
}

export function MileageChart({ carId, months = 12, height = 300, className }: MileageChartProps) {
  const { data: mileageData = [], isLoading, error } = useMileageTrends(carId, months);

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <Alert variant="destructive">
            <AlertDescription>
              Failed to load mileage data. Please try refreshing.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Mileage Trends
        </CardTitle>
        <CardDescription>
          Fuel efficiency over time (full-to-full method)
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center" style={{ height }}>
            <LoadingSpinner size="lg" />
          </div>
        ) : mileageData.length === 0 ? (
          <div className="flex items-center justify-center text-muted-foreground" style={{ height }}>
            <p>No mileage data available. Add more fuel logs with full fills.</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={height}>
            <LineChart data={mileageData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="date" 
                className="fill-muted-foreground text-xs"
                tickFormatter={(value) => new Date(value).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
              />
              <YAxis 
                className="fill-muted-foreground text-xs"
                label={{ value: 'km/L', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '6px',
                }}
                labelFormatter={(value) => new Date(value).toLocaleDateString('en-IN')}
                formatter={(value: number, name: string) => [
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
        )}
      </CardContent>
    </Card>
  );
}
```

#### 3.2 Spending Chart Component
**File**: `src/components/charts/spending-chart.tsx`

```typescript
import { ResponsiveContainer, ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { DollarSign } from 'lucide-react';
import { useSpendingTrends } from '@/hooks/use-analytics';

interface SpendingChartProps {
  carId: string;
  months?: number;
  height?: number;
  className?: string;
}

export function SpendingChart({ carId, months = 12, height = 300, className }: SpendingChartProps) {
  const { data: spendingData = [], isLoading, error } = useSpendingTrends(carId, months);

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <Alert variant="destructive">
            <AlertDescription>
              Failed to load spending data. Please try refreshing.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Monthly Spending
        </CardTitle>
        <CardDescription>
          Fuel spending and consumption by month
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center" style={{ height }}>
            <LoadingSpinner size="lg" />
          </div>
        ) : spendingData.length === 0 ? (
          <div className="flex items-center justify-center text-muted-foreground" style={{ height }}>
            <p>No spending data available. Add more fuel logs to see trends.</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={height}>
            <ComposedChart data={spendingData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="date" 
                className="fill-muted-foreground text-xs"
                tickFormatter={(value) => new Date(value + '-01').toLocaleDateString('en-IN', { month: 'short', year: '2-digit' })}
              />
              <YAxis 
                yAxisId="amount"
                className="fill-muted-foreground text-xs"
                label={{ value: 'Amount (₹)', angle: -90, position: 'insideLeft' }}
              />
              <YAxis 
                yAxisId="liters"
                orientation="right"
                className="fill-muted-foreground text-xs"
                label={{ value: 'Liters', angle: 90, position: 'insideRight' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '6px',
                }}
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
        )}
      </CardContent>
    </Card>
  );
}
```

### 4. Analytics Page

#### 4.1 Analytics Page Component
**File**: `src/pages/Analytics.tsx`

```typescript
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MileageChart } from '@/components/charts/mileage-chart';
import { SpendingChart } from '@/components/charts/spending-chart';
import { CostPerKmChart } from '@/components/charts/cost-per-km-chart';
import { FuelPriceChart } from '@/components/charts/fuel-price-chart';
import { StatCard } from '@/components/ui/stat-card';
import { useCars } from '@/hooks/use-cars';
import { useCarStatistics } from '@/hooks/use-fuel-logs';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { TrendingUp, DollarSign, Fuel, Route, Calendar, Filter } from 'lucide-react';

export default function Analytics() {
  const { data: cars = [], isLoading: carsLoading } = useCars();
  const [selectedCarId, setSelectedCarId] = useState<string>('');
  const [timeRange, setTimeRange] = useState<number>(12);

  const { data: carStats, isLoading: statsLoading } = useCarStatistics(selectedCarId);

  // Auto-select first car if none selected
  if (!selectedCarId && cars.length > 0) {
    setSelectedCarId(cars[0].id);
  }

  const selectedCar = cars.find(car => car.id === selectedCarId);

  if (carsLoading) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (cars.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
        <Card className="max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <TrendingUp className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold text-muted-foreground mb-2">
              No Cars Available
            </h3>
            <p className="text-sm text-muted-foreground text-center mb-4">
              Add a car to your garage to start viewing analytics.
            </p>
            <Button onClick={() => window.location.href = '/'}>
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero">
      <div className="container py-8 px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-foreground mb-2">Analytics</h1>
          <p className="text-muted-foreground">
            Insights into your fuel consumption and spending patterns
          </p>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Filter className="h-5 w-5" />
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Car</label>
                  <Select value={selectedCarId} onValueChange={setSelectedCarId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a car" />
                    </SelectTrigger>
                    <SelectContent>
                      {cars.map((car) => (
                        <SelectItem key={car.id} value={car.id}>
                          {car.make} {car.model} ({car.registration})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Time Range</label>
                  <Select value={timeRange.toString()} onValueChange={(value) => setTimeRange(Number(value))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3">Last 3 months</SelectItem>
                      <SelectItem value="6">Last 6 months</SelectItem>
                      <SelectItem value="12">Last 12 months</SelectItem>
                      <SelectItem value="24">Last 24 months</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {selectedCar && (
                <div className="mt-4 p-4 rounded-lg bg-background/50">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold">{selectedCar.make} {selectedCar.model}</h3>
                    <Badge variant="outline">{selectedCar.registration}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {selectedCar.year && `${selectedCar.year} • `}
                    {selectedCar.fuel_type.charAt(0).toUpperCase() + selectedCar.fuel_type.slice(1)}
                    {selectedCar.tank_capacity_l && ` • ${selectedCar.tank_capacity_l}L tank`}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Statistics Cards */}
        {carStats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Average Mileage"
                value={`${carStats.averageMileage.toFixed(1)} km/L`}
                subtitle="Full-to-full method"
                icon={Fuel}
                variant="premium"
              />
              <StatCard
                title="Cost per KM"
                value={`₹${carStats.costPerKm.toFixed(2)}`}
                subtitle="Running cost"
                icon={DollarSign}
              />
              <StatCard
                title="Total Distance"
                value={`${(carStats.totalDistance / 1000).toFixed(1)}K km`}
                subtitle="Lifetime distance"
                icon={Route}
              />
              <StatCard
                title="Last 30 Days"
                value={`₹${carStats.last30DaysSpend.toLocaleString()}`}
                subtitle="Fuel spending"
                icon={Calendar}
                variant="glass"
              />
            </div>
          </motion.div>
        )}

        {/* Charts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Tabs defaultValue="mileage" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="mileage">Mileage</TabsTrigger>
              <TabsTrigger value="spending">Spending</TabsTrigger>
              <TabsTrigger value="cost-per-km">Cost/KM</TabsTrigger>
              <TabsTrigger value="fuel-price">Fuel Price</TabsTrigger>
            </TabsList>

            <TabsContent value="mileage" className="space-y-6">
              <MileageChart carId={selectedCarId} months={timeRange} height={400} />
            </TabsContent>

            <TabsContent value="spending" className="space-y-6">
              <SpendingChart carId={selectedCarId} months={timeRange} height={400} />
            </TabsContent>

            <TabsContent value="cost-per-km" className="space-y-6">
              <CostPerKmChart carId={selectedCarId} months={timeRange} height={400} />
            </TabsContent>

            <TabsContent value="fuel-price" className="space-y-6">
              <FuelPriceChart carId={selectedCarId} months={timeRange} height={400} />
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}
```

## Testing Implementation

### Unit Tests

#### 4.1 Analytics Service Tests
**File**: `src/services/__tests__/analytics.test.ts`

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AnalyticsService } from '../analytics';
import { FuelLogService } from '../fuel-logs';
import { CarService } from '../cars';

// Mock dependencies
vi.mock('../fuel-logs');
vi.mock('../cars');

describe('AnalyticsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getMileageTrends', () => {
    it('should return mileage trends for the specified period', async () => {
      const mockMileageData = {
        logs: [
          {
            id: '1',
            car_id: 'car-1',
            filled_at: '2024-01-15',
            odometer_km: 1500,
            liters: 35,
            mileage: 14.29,
            distance: 500,
            is_partial: false,
            created_at: '2024-01-15T00:00:00Z',
            updated_at: '2024-01-15T00:00:00Z',
          },
          {
            id: '2',
            car_id: 'car-1',
            filled_at: '2024-02-01',
            odometer_km: 2000,
            liters: 30,
            mileage: 16.67,
            distance: 500,
            is_partial: false,
            created_at: '2024-02-01T00:00:00Z',
            updated_at: '2024-02-01T00:00:00Z',
          },
        ],
        averageMileage: 15.48,
      };

      (FuelLogService.calculateMileageForCar as any).mockResolvedValue(mockMileageData);

      const result = await AnalyticsService.getMileageTrends('car-1', 12);

      expect(result).toHaveLength(2);
      expect(result[0]).toMatchObject({
        date: '2024-01-15',
        value: 14.29,
        kmpl: 14.29,
        distance: 500,
        liters: 35,
      });
      expect(result[1]).toMatchObject({
        date: '2024-02-01',
        value: 16.67,
        kmpl: 16.67,
        distance: 500,
        liters: 30,
      });
    });
  });

  describe('getSpendingTrends', () => {
    it('should group spending data by month', async () => {
      const mockLogs = [
        {
          id: '1',
          car_id: 'car-1',
          filled_at: '2024-01-15',
          odometer_km: 1000,
          liters: 40,
          total_cost: 4000,
          is_partial: false,
          created_at: '2024-01-15T00:00:00Z',
          updated_at: '2024-01-15T00:00:00Z',
        },
        {
          id: '2',
          car_id: 'car-1',
          filled_at: '2024-01-30',
          odometer_km: 1500,
          liters: 35,
          total_cost: 3500,
          is_partial: false,
          created_at: '2024-01-30T00:00:00Z',
          updated_at: '2024-01-30T00:00:00Z',
        },
        {
          id: '3',
          car_id: 'car-1',
          filled_at: '2024-02-15',
          odometer_km: 2000,
          liters: 30,
          total_cost: 3000,
          is_partial: false,
          created_at: '2024-02-15T00:00:00Z',
          updated_at: '2024-02-15T00:00:00Z',
        },
      ];

      (FuelLogService.getFuelLogs as any).mockResolvedValue(mockLogs);

      const result = await AnalyticsService.getSpendingTrends('car-1', 12);

      expect(result).toHaveLength(2);
      
      // January data (2 fills)
      expect(result[0]).toMatchObject({
        date: '2024-01',
        value: 7500,
        amount: 7500,
        liters: 75,
        fills: 2,
      });
      
      // February data (1 fill)
      expect(result[1]).toMatchObject({
        date: '2024-02',
        value: 3000,
        amount: 3000,
        liters: 30,
        fills: 1,
      });
    });
  });
});
```

## How to Test

### Manual Testing Checklist

#### Analytics Features
- [ ] Car selection filter works correctly
- [ ] Time range filter updates charts
- [ ] All chart types display data correctly
- [ ] Charts are responsive on mobile devices
- [ ] Loading states show during data fetch
- [ ] Error states display appropriate messages
- [ ] Empty states show when no data available
- [ ] Tooltips show correct formatted values
- [ ] Chart interactions work (hover, click)

#### Data Accuracy
- [ ] Mileage trends match manual calculations
- [ ] Spending trends group by month correctly
- [ ] Cost per km calculations are accurate
- [ ] Fuel price trends show correct values
- [ ] Statistics cards show correct totals
- [ ] Time range filtering works correctly

### Automated Testing

```bash
# Run analytics tests
npm run test src/services/analytics.test.ts
npm run test src/components/charts/
npm run test src/pages/Analytics.test.tsx

# Run all analytics related tests
npm run test -- --testNamePattern="analytics"

# Run tests with coverage
npm run test:coverage
```

## Definition of Done

- [ ] **Chart Components**: All chart types implemented with Recharts
- [ ] **Data Processing**: Analytics service calculates trends correctly
- [ ] **Interactive Filters**: Car and time range selection working
- [ ] **Responsive Design**: Charts work on all device sizes
- [ ] **Statistics**: Car statistics displayed accurately
- [ ] **Error Handling**: Proper error and empty states
- [ ] **Performance**: Charts load efficiently with large datasets
- [ ] **Unit Tests**: >80% coverage for analytics components
- [ ] **Integration Tests**: Chart data flow tested
- [ ] **Manual Testing**: All analytics scenarios verified
- [ ] **Accessibility**: Charts are accessible with proper labels
- [ ] **Code Review**: Code reviewed and approved

## Notes

- **Chart Library**: Uses Recharts for consistent, responsive charts
- **Data Accuracy**: All calculations match business logic from Phase 3
- **Performance**: Charts are optimized for large datasets
- **Mobile**: Responsive design ensures charts work on mobile
- **Future**: Can be extended with predictive analytics and insights
