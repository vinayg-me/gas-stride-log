// Dashboard Page - Main homepage with CRED-inspired design

import { motion } from "framer-motion";
import { Plus, Fuel, TrendingUp, DollarSign, Route, Calendar } from "lucide-react";
import { StatCard } from "@/components/ui/stat-card";
import { CarCard } from "@/components/ui/car-card";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/store";
import { FloatingActionButton } from "@/components/ui/floating-action-button";
import heroImage from "@/assets/hero-fuel-tracking.jpg";

const mockOverallStats = {
  total_cars: 2,
  avg_kmpl: 18.5,
  cost_per_km: 6.2,
  total_spend: 25000,
  total_liters: 890,
  total_distance: 16450,
  monthly_spend: 4200,
  last_updated: new Date().toISOString(),
};

const mockCars = [
  {
    id: "1",
    owner_id: "user1",
    registration: "KA-01-AB-1234",
    make: "Honda",
    model: "City",
    fuel_type: "petrol" as const,
    tank_capacity_l: 40,
    year: 2022,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "2",
    owner_id: "user1",
    registration: "KA-05-CD-5678",
    make: "Maruti",
    model: "Swift",
    fuel_type: "petrol" as const,
    tank_capacity_l: 37,
    year: 2021,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const mockCarStats = {
  "1": {
    car_id: "1",
    avg_kmpl: 19.2,
    cost_per_km: 5.8,
    total_spend: 15000,
    total_liters: 520,
    total_distance: 10000,
    last_fill_date: "2024-01-15",
    last_30_days_spend: 2500,
    fuel_logs_count: 25,
  },
  "2": {
    car_id: "2",
    avg_kmpl: 17.8,
    cost_per_km: 6.6,
    total_spend: 10000,
    total_liters: 370,
    total_distance: 6450,
    last_fill_date: "2024-01-12",
    last_30_days_spend: 1700,
    fuel_logs_count: 18,
  },
};

export default function Dashboard() {
  const { cars, overallStats, carStats } = useAppStore();

  // Use mock data for now
  const displayStats = overallStats || mockOverallStats;
  const displayCars = cars.length > 0 ? cars : mockCars;
  const displayCarStats = Object.keys(carStats).length > 0 ? carStats : mockCarStats;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

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
              Monitor your vehicle's fuel efficiency, track expenses, and optimize your driving with beautiful analytics.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="bg-gradient-primary hover:opacity-90 glow-primary">
                <Plus className="w-5 h-5 mr-2" />
                Add Fuel Log
              </Button>
              <Button variant="outline" size="lg" className="hover:bg-primary/10">
                View Analytics
              </Button>
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
          <motion.h2 
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="text-2xl font-bold text-foreground mb-6"
          >
            Overall Performance
          </motion.h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Average Mileage"
              value={`${displayStats.avg_kmpl.toFixed(1)} km/L`}
              subtitle="Across all vehicles"
              icon={Fuel}
              variant="premium"
              trend={{ value: 5.2, isPositive: true }}
            />
            <StatCard
              title="Cost per KM"
              value={`₹${displayStats.cost_per_km.toFixed(2)}`}
              subtitle="Running cost"
              icon={DollarSign}
              trend={{ value: 2.1, isPositive: false }}
            />
            <StatCard
              title="Total Distance"
              value={`${(displayStats.total_distance / 1000).toFixed(1)}K km`}
              subtitle="Lifetime distance"
              icon={Route}
            />
            <StatCard
              title="Monthly Spend"
              value={`₹${displayStats.monthly_spend.toLocaleString()}`}
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
            <Button variant="outline" className="hover:bg-primary/10">
              <Plus className="w-4 h-4 mr-2" />
              Add Car
            </Button>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayCars.map((car, index) => (
              <motion.div
                key={car.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <CarCard
                  car={car}
                  stats={displayCarStats[car.id]}
                  onViewDetails={(carId) => console.log("View details for:", carId)}
                  onAddFuelLog={(carId) => console.log("Add fuel log for:", carId)}
                />
              </motion.div>
            ))}
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: displayCars.length * 0.1 }}
            >
              <CarCard
                isAddCard
                onAddClick={() => console.log("Add new car")}
              />
            </motion.div>
          </div>
        </motion.section>
      </div>

      {/* Floating Action Button */}
      <FloatingActionButton
        icon={Plus}
        onClick={() => console.log("Add fuel log")}
        label="Add Fuel Log"
      />
    </div>
  );
}