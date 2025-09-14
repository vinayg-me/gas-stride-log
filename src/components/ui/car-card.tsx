// CarCard Component - CRED-inspired card for car information

import React from "react";
import { motion } from "framer-motion";
import {
  Car,
  Plus,
  MoreVertical,
  Fuel,
  TrendingUp,
  Edit,
  Trash2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AddCarDialog, EditCarDialog } from "@/components/cars/car-dialog";
import { DeleteCarDialog } from "@/components/cars/delete-car-dialog";
import { cn } from "@/lib/utils";
import { Car as CarType, CarStats } from "@/types";
import { useCarStatistics } from "@/hooks/use-fuel-logs";
import { AddFuelLogDialog } from "@/components/fuel-logs/fuel-log-dialog";

interface CarCardProps {
  car?: CarType;
  stats?: CarStats;
  isAddCard?: boolean;
  onAddClick?: () => void;
  onViewDetails?: (carId: string) => void;
  onAddFuelLog?: (carId: string) => void;
  className?: string;
  asDialogTrigger?: boolean; // New prop to indicate if used as dialog trigger
}

export const CarCard = React.forwardRef<HTMLDivElement, CarCardProps>(
  (
    {
      car,
      stats,
      isAddCard = false,
      onAddClick,
      onViewDetails,
      onAddFuelLog,
      className,
      asDialogTrigger = false,
    },
    ref
  ) => {
    if (isAddCard) {
      return (
        <motion.div
          ref={ref}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={cn("h-full", className)}
          {...(asDialogTrigger && { style: { cursor: "pointer" } })}
        >
          <Card
            className={cn(
              "glass-card border-dashed border-2 border-muted-foreground/25 hover:border-primary/50 transition-all duration-300 h-full"
            )}
            {...(!asDialogTrigger && { onClick: onAddClick })}
          >
            <CardContent className="flex flex-col items-center justify-center h-full min-h-[200px] p-6">
              <div className="rounded-full bg-primary/10 p-4 mb-4 group-hover:bg-primary/20 transition-colors">
                <AddCarDialog
                  trigger={
                    <Plus
                      className="h-8 w-8 text-primary cursor-pointer"
                      data-testid="add-car-button-card"
                    />
                  }
                />
              </div>
              <h3 className="text-lg font-semibold text-muted-foreground group-hover:text-foreground transition-colors">
                Add New Car
              </h3>
              <p className="text-sm text-muted-foreground text-center mt-2">
                Start tracking fuel consumption for another vehicle
              </p>
            </CardContent>
          </Card>
        </motion.div>
      );
    }

    if (!car) return null;

    // compute stats from live fuel logs if available
    const { data: carStats } = useCarStatistics(car.id);

    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        whileHover={{ y: -4 }}
        className={cn("group", className)}
      >
        <Card className="glass-card hover:shadow-glow transition-all duration-300 hover:border-primary/20">
          <CardContent className="p-6">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <motion.div
                  whileHover={{ rotate: 10 }}
                  className="p-2 rounded-lg bg-secondary/10 text-secondary"
                >
                  <Car className="w-5 h-5" />
                </motion.div>
                <div>
                  <h3 className="font-semibold text-foreground text-lg">
                    {car.registration}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {car.make} {car.model}
                  </p>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <EditCarDialog
                    car={car}
                    trigger={
                      <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Car
                      </DropdownMenuItem>
                    }
                  />
                  <DeleteCarDialog
                    car={car}
                    trigger={
                      <DropdownMenuItem
                        onSelect={(e) => e.preventDefault()}
                        className="text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Car
                      </DropdownMenuItem>
                    }
                  />
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Stats */}
            {(stats || (carStats && carStats.logCount > 1)) && (
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-1">
                    <Fuel className="w-3 h-3 text-primary" />
                    <span className="text-xs text-muted-foreground">
                      Avg km/L
                    </span>
                  </div>
                  <p className="text-lg font-bold text-foreground">
                    {(stats?.avg_kmpl ?? carStats?.averageMileage ?? 0).toFixed(1)}
                  </p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-1">
                    <TrendingUp className="w-3 h-3 text-accent" />
                    <span className="text-xs text-muted-foreground">₹/km</span>
                  </div>
                  <p className="text-lg font-bold text-foreground">
                    {(stats?.cost_per_km ?? carStats?.costPerKm ?? 0).toFixed(2)}
                  </p>
                </div>
              </div>
            )}

            {/* Quick Info */}
            <div className="flex items-center justify-between mb-4">
              <Badge variant="secondary" className="text-xs">
                {car.fuel_type.toUpperCase()}
              </Badge>
              {car.year && (
                <span className="text-xs text-muted-foreground">
                  {car.year}
                </span>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onViewDetails?.(car.id)}
                className="flex-1 hover:bg-primary/10 hover:border-primary"
              >
                View Details
              </Button>
              <AddFuelLogDialog
                cars={[car]}
                defaultCarId={car.id}
                trigger={
                  <Button
                    size="sm"
                    onClick={() => onAddFuelLog?.(car.id)}
                    className="flex-1 bg-gradient-primary hover:opacity-90"
                  >
                    Add Fuel
                  </Button>
                }
              />
            </div>

            {/* Last fill info */}
            {stats && (
              <div className="mt-3 pt-3 border-t border-border/20">
                <p className="text-xs text-muted-foreground">
                  Last fill:{" "}
                  {new Date(stats.last_fill_date).toLocaleDateString()}
                </p>
                <p className="text-xs text-muted-foreground">
                  30-day spend: ₹{stats.last_30_days_spend.toFixed(0)}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    );
  }
);

CarCard.displayName = "CarCard";
