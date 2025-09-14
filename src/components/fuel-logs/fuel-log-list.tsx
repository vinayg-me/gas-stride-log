import { motion } from 'framer-motion';
import { MoreVertical, Edit, Trash2, Receipt, Fuel, MapPin, FileText } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FuelLog, Car } from '@/types';
import { EditFuelLogDialog } from './fuel-log-dialog';
import { DeleteFuelLogDialog } from './delete-fuel-log-dialog';
import { useFuelLogs, useCarMileage } from '@/hooks/use-fuel-logs';
import { cn } from '@/lib/utils';

interface FuelLogListProps {
  carId?: string;
  cars?: Car[];
  className?: string;
}

export function FuelLogList({ carId, cars = [], className }: FuelLogListProps) {
  const { data: fuelLogs = [], isLoading, error } = useFuelLogs(carId);
  const { data: mileageData } = useCarMileage(carId || '');

  if (error) {
    return (
      <Alert variant="destructive" className={className}>
        <AlertDescription>
          Failed to load fuel logs. Please try refreshing the page.
        </AlertDescription>
      </Alert>
    );
  }

  if (isLoading) {
    return (
      <div className={cn("flex items-center justify-center py-8", className)}>
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (fuelLogs.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Fuel className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold text-muted-foreground mb-2">
            No Fuel Logs Yet
          </h3>
          <p className="text-sm text-muted-foreground text-center">
            Start tracking your fuel consumption by adding your first fuel log entry.
          </p>
        </CardContent>
      </Card>
    );
  }

  const logsWithMileage = mileageData?.logs || fuelLogs.map(log => ({ ...log }));

  return (
    <div className={cn("space-y-4", className)}>
      {logsWithMileage.map((log, index) => {
        const car = cars.find(c => c.id === log.car_id);
        
        return (
          <motion.div
            key={log.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className="glass-card hover:glow-primary transition-all duration-300 group">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="rounded-full bg-primary/10 p-2">
                      <Fuel className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-foreground">
                          {log.liters}L
                        </h3>
                        {log.is_partial && (
                          <Badge variant="secondary" className="text-xs">
                            Partial
                          </Badge>
                        )}
                        {log.mileage && (
                          <Badge variant="outline" className="text-xs">
                            {log.mileage.toFixed(1)} km/L
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {new Date(log.filled_at).toLocaleDateString('en-IN', {
                          weekday: 'short',
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </p>
                      {car && !carId && (
                        <p className="text-xs text-muted-foreground">
                          {car.make} {car.model}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <EditFuelLogDialog 
                        cars={cars}
                        fuelLog={log} 
                        trigger={
                          <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Log
                          </DropdownMenuItem>
                        } 
                      />
                      <DeleteFuelLogDialog 
                        fuelLog={log} 
                        trigger={
                          <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Log
                          </DropdownMenuItem>
                        } 
                      />
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="text-center p-3 rounded-lg bg-background/50">
                    <div className="text-lg font-bold text-primary">
                      {log.odometer_km.toLocaleString()}
                    </div>
                    <div className="text-xs text-muted-foreground">km</div>
                  </div>
                  
                  {log.price_per_l && (
                    <div className="text-center p-3 rounded-lg bg-background/50">
                      <div className="text-lg font-bold text-secondary">
                        ₹{log.price_per_l.toFixed(2)}
                      </div>
                      <div className="text-xs text-muted-foreground">per liter</div>
                    </div>
                  )}
                  
                  {log.total_cost && (
                    <div className="text-center p-3 rounded-lg bg-background/50">
                      <div className="text-lg font-bold text-green-500">
                        ₹{log.total_cost.toFixed(2)}
                      </div>
                      <div className="text-xs text-muted-foreground">total</div>
                    </div>
                  )}

                  {log.distance && (
                    <div className="text-center p-3 rounded-lg bg-background/50">
                      <div className="text-lg font-bold text-orange-500">
                        {log.distance}
                      </div>
                      <div className="text-xs text-muted-foreground">km driven</div>
                    </div>
                  )}
                </div>

                {(log.station || log.notes || log.receipt_url) && (
                  <div className="space-y-2 pt-4 border-t border-border/50">
                    {log.station && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>{log.station}</span>
                      </div>
                    )}
                    
                    {log.notes && (
                      <div className="flex items-start gap-2 text-sm text-muted-foreground">
                        <FileText className="h-4 w-4 mt-0.5" />
                        <span>{log.notes}</span>
                      </div>
                    )}
                    
                    {log.receipt_url && (
                      <div className="flex items-center gap-2">
                        <Receipt className="h-4 w-4 text-muted-foreground" />
                        <Button
                          variant="link"
                          size="sm"
                          className="p-0 h-auto text-sm"
                          onClick={() => window.open(log.receipt_url, '_blank')}
                        >
                          View Receipt
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}
