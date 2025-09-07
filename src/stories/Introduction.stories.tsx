import type { Meta, StoryObj } from '@storybook/react';
import { motion } from 'framer-motion';
import { Fuel, TrendingUp, DollarSign, Route, Calendar, Car, Plus } from 'lucide-react';
import { StatCard } from '@/components/ui/stat-card';
import { CarCard } from '@/components/ui/car-card';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const meta = {
  title: 'Introduction/FuelTrackr Design System',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Welcome to FuelTrackr Storybook! This design system showcases all the components used in the fuel tracking application, built with a CRED-inspired design language.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const IntroductionContent = () => (
  <div className="min-h-screen bg-gradient-hero p-8">
    <div className="max-w-6xl mx-auto space-y-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <h1 className="text-4xl md:text-6xl font-bold text-foreground">
          FuelTrackr{" "}
          <span className="bg-gradient-primary bg-clip-text text-transparent">
            Design System
          </span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          A comprehensive component library built with React, TypeScript, and Tailwind CSS, 
          featuring CRED-inspired design with glassmorphism effects and smooth animations.
        </p>
      </motion.div>

      {/* Design Principles */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-6"
      >
        <h2 className="text-2xl font-bold text-foreground">Design Principles</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="glass-card border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <Fuel className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-foreground">Dark Theme First</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Elegant dark UI with high contrast and premium feel, optimized for fuel tracking workflows.
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card border-accent/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-accent/10 text-accent">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-foreground">Glassmorphism</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Subtle transparency and blur effects create depth and visual hierarchy throughout the interface.
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card border-secondary/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-secondary/10 text-secondary">
                  <DollarSign className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-foreground">Smooth Animations</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Framer Motion powered micro-interactions and spring animations for delightful user experience.
              </p>
            </CardContent>
          </Card>
        </div>
      </motion.section>

      {/* Component Showcase */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="space-y-6"
      >
        <h2 className="text-2xl font-bold text-foreground">Component Showcase</h2>
        
        {/* Stat Cards */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Statistics Cards</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Average Mileage"
              value="18.5 km/L"
              subtitle="Across all vehicles"
              icon={Fuel}
              variant="premium"
              trend={{ value: 5.2, isPositive: true }}
            />
            <StatCard
              title="Cost per KM"
              value="₹6.20"
              subtitle="Running cost"
              icon={DollarSign}
              trend={{ value: 2.1, isPositive: false }}
            />
            <StatCard
              title="Total Distance"
              value="16.4K km"
              subtitle="Lifetime distance"
              icon={Route}
            />
            <StatCard
              title="Monthly Spend"
              value="₹4,200"
              subtitle="This month"
              icon={Calendar}
              variant="glass"
            />
          </div>
        </div>

        {/* Car Cards */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Vehicle Cards</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <CarCard
              car={{
                id: "1",
                owner_id: "user1",
                registration: "KA-01-AB-1234",
                make: "Honda",
                model: "City",
                fuel_type: "petrol",
                tank_capacity_l: 40,
                year: 2022,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              }}
              stats={{
                car_id: "1",
                avg_kmpl: 19.2,
                cost_per_km: 5.8,
                total_spend: 15000,
                total_liters: 520,
                total_distance: 10000,
                last_fill_date: "2024-01-15",
                last_30_days_spend: 2500,
                fuel_logs_count: 25,
              }}
              onViewDetails={() => {}}
              onAddFuelLog={() => {}}
            />
            <CarCard
              isAddCard
              onAddClick={() => {}}
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Action Buttons</h3>
          <div className="flex flex-wrap gap-4">
            <Button size="lg" className="bg-gradient-primary hover:opacity-90">
              <Plus className="w-5 h-5 mr-2" />
              Add Fuel Log
            </Button>
            <Button variant="outline" size="lg" className="hover:bg-primary/10">
              View Analytics
            </Button>
            <Button variant="secondary" size="lg">
              <Car className="w-4 h-4 mr-2" />
              Add Car
            </Button>
          </div>
        </div>
      </motion.section>

      {/* Getting Started */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="space-y-6"
      >
        <h2 className="text-2xl font-bold text-foreground">Getting Started</h2>
        <Card className="glass-card border-border/20">
          <CardContent className="p-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Development</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>• Run <code className="bg-muted px-2 py-1 rounded">pnpm storybook</code> to start the development server</p>
                <p>• Navigate through components using the sidebar</p>
                <p>• Use the Controls panel to interact with component props</p>
                <p>• View the Docs tab for component documentation and usage examples</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.section>
    </div>
  </div>
);

export const Introduction: Story = {
  render: () => <IntroductionContent />,
};
