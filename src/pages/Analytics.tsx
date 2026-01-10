import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useOverallAnalytics } from '@/hooks/use-analytics';
import { useCars } from '@/hooks/use-cars';
import { MileageChart } from '@/components/charts/mileage-chart';
import { SpendingChart } from '@/components/charts/spending-chart';
import { CostPerKmChart } from '@/components/charts/cost-per-km-chart';
import { FuelPriceChart } from '@/components/charts/fuel-price-chart';
import { Car, BarChart3, TrendingUp, Wallet, LayoutDashboard } from 'lucide-react';

export default function Analytics() {
  const [selectedCarId, setSelectedCarId] = useState<string>('all');
  const [timeRange, setTimeRange] = useState<string>('12');

  const { data: cars = [], isLoading: isLoadingCars } = useCars();
  
  const carIds = selectedCarId === 'all' 
    ? cars.map(c => c.id) 
    : [selectedCarId];

  const { data: overallStats, isLoading: isLoadingStats } = useOverallAnalytics(carIds);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1 
      } 
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  if (isLoadingCars) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Pre-select first car if available and no car selected (optional behavior)
  // For now keeping 'all' as default.

  return (
    <div className="min-h-screen bg-gradient-hero">
      <div className="container py-8 px-4">
        <div className="space-y-6 pb-20 md:pb-6">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground mt-1">
            Insights into your fuel consumption and spending
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Select value={selectedCarId} onValueChange={setSelectedCarId}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <Car className="w-4 h-4 mr-2 text-muted-foreground" />
              <SelectValue placeholder="Select Vehicle" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Vehicles</SelectItem>
              {cars.map((car) => (
                <SelectItem key={car.id} value={car.id}>
                  {car.registration} - {car.make}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-full sm:w-[150px]">
              <BarChart3 className="w-4 h-4 mr-2 text-muted-foreground" />
              <SelectValue placeholder="Time Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3">Last 3 Months</SelectItem>
              <SelectItem value="6">Last 6 Months</SelectItem>
              <SelectItem value="12">Last 12 Months</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </motion.div>

      {/* Stats Overview */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        <StatCard
          title="Total Spend"
          value={`₹${(overallStats?.totalSpend || 0).toLocaleString()}`}
          icon={<Wallet className="w-4 h-4 text-primary" />}
          description="Total fuel cost"
          isLoading={isLoadingStats}
        />
        <StatCard
          title="Avg. Mileage"
          value={`${(overallStats?.averageMileage || 0).toFixed(1)} km/L`}
          icon={<TrendingUp className="w-4 h-4 text-green-500" />}
          description="Weighted average"
          isLoading={isLoadingStats}
        />
        <StatCard
          title="Cost / KM"
          value={`₹${(overallStats?.costPerKm || 0).toFixed(2)}`}
          icon={<TrendingUp className="w-4 h-4 text-orange-500" />}
          description="Running efficiency"
          isLoading={isLoadingStats}
        />
        <StatCard
          title="Total Distance"
          value={`${(overallStats?.totalDistance || 0).toLocaleString()} km`}
          icon={<LayoutDashboard className="w-4 h-4 text-blue-500" />}
          description="Total km tracked"
          isLoading={isLoadingStats}
        />
      </motion.div>

      <Tabs defaultValue="mileage" className="space-y-6">
        <TabsList className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border rounded-lg p-1 w-full justify-start overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
          <TabsTrigger value="mileage" className="flex-1 min-w-[100px]">Mileage</TabsTrigger>
          <TabsTrigger value="spending" className="flex-1 min-w-[100px]">Spending</TabsTrigger>
          <TabsTrigger value="efficiency" className="flex-1 min-w-[100px]">Efficiency</TabsTrigger>
          <TabsTrigger value="prices" className="flex-1 min-w-[100px]">Fuel Prices</TabsTrigger>
        </TabsList>

        <motion.div
           initial={{ opacity: 0, y: 10 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.2 }}
        >
          {selectedCarId === 'all' ? (
             <Alert className="mb-6 bg-primary/5 border-primary/20">
               <AlertDescription>
                 Please select a specific vehicle to view detailed charts. Aggregated charts for all vehicles coming soon.
               </AlertDescription>
             </Alert>
          ) : (
            <>
              <TabsContent value="mileage">
                <MileageChart carId={selectedCarId} months={Number(timeRange)} />
              </TabsContent>
              <TabsContent value="spending">
                <SpendingChart carId={selectedCarId} months={Number(timeRange)} />
              </TabsContent>
              <TabsContent value="efficiency">
                <CostPerKmChart carId={selectedCarId} months={Number(timeRange)} />
              </TabsContent>
              <TabsContent value="prices">
                <FuelPriceChart carId={selectedCarId} months={Number(timeRange)} />
              </TabsContent>
            </>
          )}

          {selectedCarId === 'all' && (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 opacity-50 pointer-events-none grayscale">
                <Card className="h-[300px] flex items-center justify-center">
                  <p className="text-muted-foreground">Select a vehicle to view chart</p>
                </Card>
                <Card className="h-[300px] flex items-center justify-center">
                  <p className="text-muted-foreground">Select a vehicle to view chart</p>
                </Card>
             </div>
          )}
        </motion.div>
      </Tabs>
      </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, description, isLoading }: any) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between space-y-0 pb-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          {icon}
        </div>
        <div>
          {isLoading ? (
            <div className="h-7 w-24 bg-muted animate-pulse rounded" />
          ) : (
            <div className="text-2xl font-bold">{value}</div>
          )}
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
}
