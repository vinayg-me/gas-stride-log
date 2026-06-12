// Dashboard Page - Main homepage with CRED-inspired design

import { motion } from "framer-motion";
import {
  Plus,
  Fuel,
  TrendingUp,
  DollarSign,
  Route,
  Calendar,
  Car,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { StatCard } from "@/components/ui/stat-card";
import { CarCard } from "@/components/ui/car-card";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AddCarDialog } from "@/components/cars/car-dialog";
import { AddFuelLogDialog } from "@/components/fuel-logs/fuel-log-dialog";
import { FuelLogList } from "@/components/fuel-logs/fuel-log-list";
import { useOverallStatistics } from "@/hooks/use-fuel-logs";
import { FloatingActionButton } from "@/components/ui/floating-action-button";
import { useCars } from "@/hooks/use-cars";
import heroImage from "@/assets/hero-fuel-tracking.jpg";
import { useFeatureFlags } from "@/hooks/use-feature-flags";

// Keep mock data as fallback for overall stats (will be implemented in Phase 4)
const mockOverallStats = {
  total_cars: 0,
  avg_kmpl: 0,
  cost_per_km: 0,
  total_spend: 0,
  total_liters: 0,
  total_distance: 0,
  monthly_spend: 0,
  last_updated: new Date().toISOString(),
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { data: cars = [], isLoading, error } = useCars();
  const { data: overall } = useOverallStatistics(cars.map(c => c.id));
  const { data: flags } = useFeatureFlags();
  const showAnalytics = flags?.isEnabled('analytics_enabled') === true;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const handleViewDetails = (carId: string) => {
    // TODO: Navigate to car details page
    console.log("View details for:", carId);
  };

  const handleAddFuelLog = (carId: string) => {
    // TODO: Open fuel log dialog
    console.log("Add fuel log for:", carId);
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
        <Alert className="max-w-md" variant="destructive">
          <AlertDescription>
            Failed to load your cars. Please try refreshing the page.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const overallCurrency = overall?.baseCurrency || 'INR';
  const overallDistance = overall?.baseDistance || 'km';
  const overallVolume = overall?.baseVolume || 'L';

  let overallCurrencySymbol = overallCurrency;
  if (overallCurrency === 'INR') overallCurrencySymbol = '₹';
  else if (overallCurrency === 'USD') overallCurrencySymbol = '$';
  else if (overallCurrency === 'EUR') overallCurrencySymbol = '€';
  else if (overallCurrency === 'GBP') overallCurrencySymbol = '£';

  let overallEfficiencyUnit = `${overallDistance}/${overallVolume}`;
  if (overallDistance === 'mi' && overallVolume === 'gal') {
    overallEfficiencyUnit = 'mpg';
  }

  // Check if user has multiple cars with different currencies
  const hasMixedCurrencies = cars.length > 1 && new Set(cars.map(c => c.currency || 'INR')).size > 1;

  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="relative overflow-hidden"
      >
        <div className="absolute inset-0 z-0">
          <img
            src={heroImage}
            alt="Fuel tracking dashboard"
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
        </div>

        <div className="relative z-10 container py-16 px-4">
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-2xl"
          >
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-4">
              Smart Fuel{" "}
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                Tracking
              </span>
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Monitor your vehicle's fuel efficiency, track expenses, and
              optimize your driving with beautiful analytics.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <AddFuelLogDialog
                cars={cars}
                trigger={
                  <Button
                    size="lg"
                    className="bg-gradient-primary hover:opacity-90 glow-primary"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Add Fuel Log
                  </Button>
                }
              />
              <AddCarDialog
                trigger={
                  <Button
                    variant="outline"
                    size="lg"
                    className="hover:bg-primary/10"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Add Car
                  </Button>
                }
              />
              
              {showAnalytics && (
                <Button
                  variant="outline"
                  size="lg"
                  className="hover:bg-primary/10"
                  onClick={() => navigate('/analytics')}
                >
                  View Analytics
                </Button>
              )}
            </div>
          </motion.div>
        </div>
      </motion.section>

      <div className="container py-8 px-4">
        {/* Overall Stats */}
        <motion.section
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="mb-12"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Overall Performance</h2>
              {hasMixedCurrencies && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  ⚠️ Footnote: Multi-currency garage. Costs aggregated in {overallCurrency} ({overallCurrencySymbol}) based on static exchange rates.
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Total Cars"
              value={cars.length.toString()}
              subtitle="In your garage"
              icon={Car}
              variant="premium"
            />
            <StatCard
              title="Average Mileage"
              value={overall ? `${overall.averageMileage.toFixed(1)} ${overallEfficiencyUnit}` : '—'}
              subtitle="Across all vehicles"
              icon={Fuel}
              trend={overall ? { value: 0, isPositive: true } : undefined}
            />
            <StatCard
              title={`Cost per ${overallDistance.toUpperCase()}`}
              value={overall ? `${overallCurrencySymbol}${overall.costPerKm.toFixed(2)}` : '—'}
              subtitle="Running cost"
              icon={DollarSign}
            />
            <StatCard
              title="Monthly Spend"
              value={overall ? `${overallCurrencySymbol}${overall.last30DaysSpend.toLocaleString(undefined, { maximumFractionDigits: 0 })}` : '—'}
              subtitle="This month"
              icon={Calendar}
              variant="glass"
            />
          </div>
        </motion.section>

        {/* My Garage */}
        <motion.section
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="flex items-center justify-between mb-6"
          >
            <h2 className="text-2xl font-bold text-foreground">My Garage</h2>
            <AddCarDialog
              trigger={
                <Button variant="outline" className="hover:bg-primary/10">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Car
                </Button>
              }
            />
          </motion.div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cars.map((car, index) => (
                <motion.div
                  key={car.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <CarCard
                    car={car}
                    stats={undefined} // TODO: Implement car stats in Phase 4
                    onViewDetails={handleViewDetails}
                    onAddFuelLog={handleAddFuelLog}
                  />
                </motion.div>
              ))}

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: cars.length * 0.1 }}
              >
                <CarCard isAddCard />
              </motion.div>
            </div>
          )}
          {/* Recent fuel logs for first car */}
          {cars.length > 0 && (
            <div className="mt-12">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-foreground">Recent Fuel Logs</h3>
                <AddFuelLogDialog cars={cars} />
              </div>
              <FuelLogList cars={cars} />
            </div>
          )}
        </motion.section>
      </div>
    </div>
  );
}
