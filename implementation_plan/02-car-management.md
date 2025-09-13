# Phase 2: Car Management

## Business Context

Implement comprehensive car management functionality allowing users to add, edit, view, and delete their vehicles. This includes form handling, validation, CRUD operations with Supabase, and real-time UI updates. Users need to manage their garage of vehicles before they can start tracking fuel consumption.

## Current State

- ✅ Car types and interfaces defined (`src/types/index.ts`)
- ✅ CarCard component with mock data display
- ✅ Sample car data structure (`src/lib/sample-data.ts`)
- ✅ Zustand store structure for cars
- ✅ Dialog stories for Add Car form (static)
- ❌ No real car CRUD operations
- ❌ No form validation or submission
- ❌ No API integration with Supabase
- ❌ No error handling for car operations

## Implementation Tasks

### 1. Car API Layer

#### 1.1 Car API Service
**File**: `src/services/cars.ts`

```typescript
import { supabase } from '@/integrations/supabase/client';
import { Car, AddCarForm } from '@/types';
import { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

type CarRow = Tables<'cars'>;
type CarInsert = TablesInsert<'cars'>;
type CarUpdate = TablesUpdate<'cars'>;

export class CarService {
  static async getCars(): Promise<Car[]> {
    const { data, error } = await supabase
      .from('cars')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching cars:', error);
      throw new Error(`Failed to fetch cars: ${error.message}`);
    }

    return data as Car[];
  }

  static async getCarById(id: string): Promise<Car | null> {
    const { data, error } = await supabase
      .from('cars')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Car not found
      }
      console.error('Error fetching car:', error);
      throw new Error(`Failed to fetch car: ${error.message}`);
    }

    return data as Car;
  }

  static async createCar(carData: AddCarForm): Promise<Car> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User must be authenticated to create a car');
    }

    const carInsert: CarInsert = {
      ...carData,
      owner_id: user.id,
    };

    const { data, error } = await supabase
      .from('cars')
      .insert(carInsert)
      .select()
      .single();

    if (error) {
      console.error('Error creating car:', error);
      
      // Handle specific errors
      if (error.code === '23505' && error.message.includes('registration')) {
        throw new Error('A car with this registration number already exists');
      }
      
      throw new Error(`Failed to create car: ${error.message}`);
    }

    return data as Car;
  }

  static async updateCar(id: string, updates: Partial<AddCarForm>): Promise<Car> {
    const { data, error } = await supabase
      .from('cars')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating car:', error);
      
      if (error.code === '23505' && error.message.includes('registration')) {
        throw new Error('A car with this registration number already exists');
      }
      
      throw new Error(`Failed to update car: ${error.message}`);
    }

    return data as Car;
  }

  static async deleteCar(id: string): Promise<void> {
    const { error } = await supabase
      .from('cars')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting car:', error);
      throw new Error(`Failed to delete car: ${error.message}`);
    }
  }

  static async getCarCount(): Promise<number> {
    const { count, error } = await supabase
      .from('cars')
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.error('Error counting cars:', error);
      throw new Error(`Failed to count cars: ${error.message}`);
    }

    return count || 0;
  }
}
```

#### 1.2 Car React Query Hooks
**File**: `src/hooks/use-cars.ts`

```typescript
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CarService } from '@/services/cars';
import { Car, AddCarForm } from '@/types';
import { toast } from '@/hooks/use-toast';

export const CAR_QUERY_KEYS = {
  all: ['cars'] as const,
  lists: () => [...CAR_QUERY_KEYS.all, 'list'] as const,
  list: (filters: string) => [...CAR_QUERY_KEYS.lists(), { filters }] as const,
  details: () => [...CAR_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...CAR_QUERY_KEYS.details(), id] as const,
};

export function useCars() {
  return useQuery({
    queryKey: CAR_QUERY_KEYS.lists(),
    queryFn: CarService.getCars,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useCar(id: string) {
  return useQuery({
    queryKey: CAR_QUERY_KEYS.detail(id),
    queryFn: () => CarService.getCarById(id),
    enabled: !!id,
  });
}

export function useCreateCar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (carData: AddCarForm) => CarService.createCar(carData),
    onSuccess: (newCar) => {
      // Update the cars list cache
      queryClient.setQueryData<Car[]>(CAR_QUERY_KEYS.lists(), (oldCars = []) => [
        newCar,
        ...oldCars,
      ]);

      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: CAR_QUERY_KEYS.lists() });

      toast({
        title: "Car Added Successfully",
        description: `${newCar.make} ${newCar.model} has been added to your garage.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to Add Car",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useUpdateCar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<AddCarForm> }) =>
      CarService.updateCar(id, updates),
    onSuccess: (updatedCar) => {
      // Update the specific car in cache
      queryClient.setQueryData<Car>(
        CAR_QUERY_KEYS.detail(updatedCar.id),
        updatedCar
      );

      // Update the car in the list cache
      queryClient.setQueryData<Car[]>(CAR_QUERY_KEYS.lists(), (oldCars = []) =>
        oldCars.map((car) => (car.id === updatedCar.id ? updatedCar : car))
      );

      // Invalidate queries to ensure consistency
      queryClient.invalidateQueries({ queryKey: CAR_QUERY_KEYS.all });

      toast({
        title: "Car Updated Successfully",
        description: `${updatedCar.make} ${updatedCar.model} has been updated.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to Update Car",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useDeleteCar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => CarService.deleteCar(id),
    onSuccess: (_, deletedId) => {
      // Remove the car from the list cache
      queryClient.setQueryData<Car[]>(CAR_QUERY_KEYS.lists(), (oldCars = []) =>
        oldCars.filter((car) => car.id !== deletedId)
      );

      // Remove the specific car from cache
      queryClient.removeQueries({ queryKey: CAR_QUERY_KEYS.detail(deletedId) });

      // Invalidate queries to ensure consistency
      queryClient.invalidateQueries({ queryKey: CAR_QUERY_KEYS.lists() });

      toast({
        title: "Car Deleted Successfully",
        description: "The car has been removed from your garage.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to Delete Car",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}
```

### 2. Car Form Components

#### 2.1 Add/Edit Car Form
**File**: `src/components/cars/car-form.tsx`

```typescript
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Car } from 'lucide-react';
import { Car as CarType, AddCarForm } from '@/types';

const carFormSchema = z.object({
  registration: z
    .string()
    .min(1, 'Registration number is required')
    .max(20, 'Registration number must be less than 20 characters')
    .regex(
      /^[A-Z]{2}[-\s]?\d{2}[-\s]?[A-Z]{1,2}[-\s]?\d{4}$/i,
      'Please enter a valid Indian registration number (e.g., KA-01-AB-1234)'
    ),
  make: z
    .string()
    .min(1, 'Make is required')
    .max(50, 'Make must be less than 50 characters'),
  model: z
    .string()
    .min(1, 'Model is required')
    .max(50, 'Model must be less than 50 characters'),
  fuel_type: z.literal('petrol'),
  tank_capacity_l: z
    .number()
    .positive('Tank capacity must be positive')
    .max(200, 'Tank capacity seems too large')
    .optional(),
  year: z
    .number()
    .int('Year must be a whole number')
    .min(1900, 'Year must be after 1900')
    .max(new Date().getFullYear() + 1, 'Year cannot be in the future')
    .optional(),
});

interface CarFormProps {
  car?: CarType;
  onSubmit: (data: AddCarForm) => void;
  onCancel: () => void;
  isLoading?: boolean;
  className?: string;
}

export function CarForm({ car, onSubmit, onCancel, isLoading = false, className }: CarFormProps) {
  const form = useForm<AddCarForm>({
    resolver: zodResolver(carFormSchema),
    defaultValues: {
      registration: car?.registration || '',
      make: car?.make || '',
      model: car?.model || '',
      fuel_type: 'petrol',
      tank_capacity_l: car?.tank_capacity_l || undefined,
      year: car?.year || undefined,
    },
  });

  // Reset form when car changes
  useEffect(() => {
    if (car) {
      form.reset({
        registration: car.registration,
        make: car.make,
        model: car.model,
        fuel_type: car.fuel_type,
        tank_capacity_l: car.tank_capacity_l || undefined,
        year: car.year || undefined,
      });
    }
  }, [car, form]);

  const handleSubmit = (data: AddCarForm) => {
    // Format registration number
    const formattedData = {
      ...data,
      registration: data.registration.toUpperCase().replace(/\s+/g, '-'),
    };
    onSubmit(formattedData);
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Car className="h-5 w-5" />
          {car ? 'Edit Car' : 'Add New Car'}
        </CardTitle>
        <CardDescription>
          {car 
            ? 'Update your vehicle information'
            : 'Enter the details of your vehicle to start tracking fuel consumption'
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="registration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Registration Number</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="KA-01-AB-1234"
                        {...field}
                        disabled={isLoading}
                        className="uppercase"
                        onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                      />
                    </FormControl>
                    <FormDescription>
                      Enter your vehicle's registration number
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="fuel_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fuel Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select fuel type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="petrol">Petrol</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Currently only petrol vehicles are supported
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="make"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Make</FormLabel>
                    <FormControl>
                      <Input placeholder="Honda" {...field} disabled={isLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="model"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Model</FormLabel>
                    <FormControl>
                      <Input placeholder="City" {...field} disabled={isLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="year"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Year (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="2020"
                        {...field}
                        disabled={isLoading}
                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormDescription>
                      Manufacturing year of your vehicle
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tank_capacity_l"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tank Capacity (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.1"
                        placeholder="40"
                        {...field}
                        disabled={isLoading}
                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormDescription>
                      Fuel tank capacity in liters
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button type="submit" disabled={isLoading} className="flex-1">
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {car ? 'Update Car' : 'Add Car'}
              </Button>
              <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading} className="flex-1">
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
```

#### 2.2 Car Dialog Components
**File**: `src/components/cars/car-dialog.tsx`

```typescript
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { CarForm } from './car-form';
import { DeleteCarDialog } from './delete-car-dialog';
import { Car, AddCarForm } from '@/types';
import { useCreateCar, useUpdateCar } from '@/hooks/use-cars';

interface AddCarDialogProps {
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function AddCarDialog({ trigger, open, onOpenChange }: AddCarDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const createCarMutation = useCreateCar();

  const handleOpenChange = (newOpen: boolean) => {
    if (onOpenChange) {
      onOpenChange(newOpen);
    } else {
      setIsOpen(newOpen);
    }
  };

  const handleSubmit = async (data: AddCarForm) => {
    try {
      await createCarMutation.mutateAsync(data);
      handleOpenChange(false);
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  const isControlled = open !== undefined && onOpenChange !== undefined;
  const dialogOpen = isControlled ? open : isOpen;

  return (
    <Dialog open={dialogOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Car
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Car</DialogTitle>
        </DialogHeader>
        <CarForm
          onSubmit={handleSubmit}
          onCancel={() => handleOpenChange(false)}
          isLoading={createCarMutation.isPending}
          className="border-0 shadow-none"
        />
      </DialogContent>
    </Dialog>
  );
}

interface EditCarDialogProps {
  car: Car;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function EditCarDialog({ car, trigger, open, onOpenChange }: EditCarDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const updateCarMutation = useUpdateCar();

  const handleOpenChange = (newOpen: boolean) => {
    if (onOpenChange) {
      onOpenChange(newOpen);
    } else {
      setIsOpen(newOpen);
    }
  };

  const handleSubmit = async (data: AddCarForm) => {
    try {
      await updateCarMutation.mutateAsync({ id: car.id, updates: data });
      handleOpenChange(false);
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  const isControlled = open !== undefined && onOpenChange !== undefined;
  const dialogOpen = isControlled ? open : isOpen;

  return (
    <Dialog open={dialogOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Car</DialogTitle>
        </DialogHeader>
        <CarForm
          car={car}
          onSubmit={handleSubmit}
          onCancel={() => handleOpenChange(false)}
          isLoading={updateCarMutation.isPending}
          className="border-0 shadow-none"
        />
      </DialogContent>
    </Dialog>
  );
}
```

#### 2.3 Delete Car Dialog
**File**: `src/components/cars/delete-car-dialog.tsx`

```typescript
import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Trash2, Loader2 } from 'lucide-react';
import { Car } from '@/types';
import { useDeleteCar } from '@/hooks/use-cars';

interface DeleteCarDialogProps {
  car: Car;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function DeleteCarDialog({ car, trigger, open, onOpenChange }: DeleteCarDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const deleteCarMutation = useDeleteCar();

  const handleOpenChange = (newOpen: boolean) => {
    if (onOpenChange) {
      onOpenChange(newOpen);
    } else {
      setIsOpen(newOpen);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteCarMutation.mutateAsync(car.id);
      handleOpenChange(false);
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  const isControlled = open !== undefined && onOpenChange !== undefined;
  const dialogOpen = isControlled ? open : isOpen;

  return (
    <AlertDialog open={dialogOpen} onOpenChange={handleOpenChange}>
      <AlertDialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Car</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete <strong>{car.make} {car.model}</strong> ({car.registration})?
            <br />
            <br />
            This action cannot be undone. All fuel logs associated with this car will also be deleted.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteCarMutation.isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={deleteCarMutation.isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {deleteCarMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Delete Car
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
```

### 3. Updated Car Card Component

#### 3.1 Enhanced Car Card
**File**: `src/components/ui/car-card.tsx` (Update existing)

```typescript
import { motion } from "framer-motion";
import { Car, Plus, MoreVertical, Edit, Trash2, Fuel, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Car as CarType, CarStats } from "@/types";
import { EditCarDialog } from "@/components/cars/car-dialog";
import { DeleteCarDialog } from "@/components/cars/delete-car-dialog";
import { cn } from "@/lib/utils";

interface CarCardProps {
  car?: CarType;
  stats?: CarStats;
  isAddCard?: boolean;
  onAddClick?: () => void;
  onViewDetails?: (carId: string) => void;
  onAddFuelLog?: (carId: string) => void;
  className?: string;
}

export function CarCard({
  car,
  stats,
  isAddCard = false,
  onAddClick,
  onViewDetails,
  onAddFuelLog,
  className,
}: CarCardProps) {
  if (isAddCard) {
    return (
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={cn("h-full", className)}
      >
        <Card className="h-full glass-card border-dashed border-2 border-muted-foreground/25 hover:border-primary/50 transition-all duration-300 cursor-pointer group">
          <CardContent 
            className="flex flex-col items-center justify-center h-full min-h-[200px] p-6"
            onClick={onAddClick}
          >
            <div className="rounded-full bg-primary/10 p-4 mb-4 group-hover:bg-primary/20 transition-colors">
              <Plus className="h-8 w-8 text-primary" />
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

  if (!car) {
    return null;
  }

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn("h-full", className)}
    >
      <Card className="h-full glass-card hover:glow-primary transition-all duration-300 group">
        <CardContent className="p-6 h-full flex flex-col">
          {/* Header with car info and actions */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="rounded-full bg-primary/10 p-2">
                <Car className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">
                  {car.make} {car.model}
                </h3>
                <p className="text-sm text-muted-foreground">{car.registration}</p>
                {car.year && (
                  <Badge variant="secondary" className="mt-1">
                    {car.year}
                  </Badge>
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
                <EditCarDialog car={car} trigger={
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Car
                  </DropdownMenuItem>
                } />
                <DeleteCarDialog car={car} trigger={
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Car
                  </DropdownMenuItem>
                } />
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Stats */}
          {stats && (
            <div className="flex-1 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-3 rounded-lg bg-background/50">
                  <div className="text-lg font-bold text-primary">
                    {stats.avg_kmpl.toFixed(1)}
                  </div>
                  <div className="text-xs text-muted-foreground">km/L</div>
                </div>
                <div className="text-center p-3 rounded-lg bg-background/50">
                  <div className="text-lg font-bold text-secondary">
                    ₹{stats.cost_per_km.toFixed(2)}
                  </div>
                  <div className="text-xs text-muted-foreground">per km</div>
                </div>
              </div>
              
              <div className="text-sm text-muted-foreground space-y-1">
                <div className="flex justify-between">
                  <span>Last fill:</span>
                  <span>{new Date(stats.last_fill_date).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>30-day spend:</span>
                  <span>₹{stats.last_30_days_spend.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total logs:</span>
                  <span>{stats.fuel_logs_count}</span>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 mt-4 pt-4 border-t border-border/50">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewDetails?.(car.id)}
              className="flex-1"
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              Details
            </Button>
            <Button
              size="sm"
              onClick={() => onAddFuelLog?.(car.id)}
              className="flex-1 bg-gradient-primary hover:opacity-90"
            >
              <Fuel className="h-4 w-4 mr-2" />
              Add Log
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
```

### 4. Update Dashboard to Use Real Data

#### 4.1 Update Dashboard Component
**File**: `src/pages/Dashboard.tsx` (Update existing)

```typescript
// Dashboard Page - Main homepage with CRED-inspired design

import { motion } from "framer-motion";
import { Plus, Fuel, TrendingUp, DollarSign, Route, Calendar } from "lucide-react";
import { StatCard } from "@/components/ui/stat-card";
import { CarCard } from "@/components/ui/car-card";
import { Button } from "@/components/ui/button";
import { FloatingActionButton } from "@/components/ui/floating-action-button";
import { AddCarDialog } from "@/components/cars/car-dialog";
import { useCars } from "@/hooks/use-cars";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import heroImage from "@/assets/hero-fuel-tracking.jpg";

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
  const { data: cars = [], isLoading, error } = useCars();

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
              title="Total Cars"
              value={cars.length.toString()}
              subtitle="In your garage"
              icon={Car}
              variant="premium"
            />
            <StatCard
              title="Average Mileage"
              value="—"
              subtitle="Across all vehicles"
              icon={Fuel}
              trend={{ value: 0, isPositive: true }}
            />
            <StatCard
              title="Cost per KM"
              value="—"
              subtitle="Running cost"
              icon={DollarSign}
            />
            <StatCard
              title="Monthly Spend"
              value="—"
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
            <AddCarDialog trigger={
              <Button variant="outline" className="hover:bg-primary/10">
                <Plus className="w-4 h-4 mr-2" />
                Add Car
              </Button>
            } />
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
                <AddCarDialog trigger={
                  <CarCard
                    isAddCard
                    onAddClick={() => {}} // Handled by dialog trigger
                  />
                } />
              </motion.div>
            </div>
          )}
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
```

## Testing Implementation

### Unit Tests

#### 4.1 Car Service Tests
**File**: `src/services/__tests__/cars.test.ts`

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CarService } from '../cars';
import { supabase } from '@/integrations/supabase/client';
import { AddCarForm } from '@/types';

// Mock Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(),
    auth: {
      getUser: vi.fn(),
    },
  },
}));

const mockSupabaseQuery = {
  select: vi.fn().mockReturnThis(),
  insert: vi.fn().mockReturnThis(),
  update: vi.fn().mockReturnThis(),
  delete: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  single: vi.fn().mockReturnThis(),
  order: vi.fn().mockReturnThis(),
};

describe('CarService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (supabase.from as any).mockReturnValue(mockSupabaseQuery);
  });

  describe('getCars', () => {
    it('should fetch cars successfully', async () => {
      const mockCars = [
        { id: '1', make: 'Honda', model: 'City', registration: 'KA-01-AB-1234' },
      ];

      mockSupabaseQuery.order.mockResolvedValue({
        data: mockCars,
        error: null,
      });

      const result = await CarService.getCars();

      expect(supabase.from).toHaveBeenCalledWith('cars');
      expect(mockSupabaseQuery.select).toHaveBeenCalledWith('*');
      expect(mockSupabaseQuery.order).toHaveBeenCalledWith('created_at', { ascending: false });
      expect(result).toEqual(mockCars);
    });

    it('should throw error when fetch fails', async () => {
      const mockError = { message: 'Database error' };
      mockSupabaseQuery.order.mockResolvedValue({
        data: null,
        error: mockError,
      });

      await expect(CarService.getCars()).rejects.toThrow('Failed to fetch cars: Database error');
    });
  });

  describe('createCar', () => {
    it('should create car successfully', async () => {
      const mockUser = { id: 'user-1' };
      const carData: AddCarForm = {
        registration: 'KA-01-AB-1234',
        make: 'Honda',
        model: 'City',
        fuel_type: 'petrol',
      };
      const mockCreatedCar = { id: 'car-1', ...carData, owner_id: 'user-1' };

      (supabase.auth.getUser as any).mockResolvedValue({
        data: { user: mockUser },
      });

      mockSupabaseQuery.single.mockResolvedValue({
        data: mockCreatedCar,
        error: null,
      });

      const result = await CarService.createCar(carData);

      expect(supabase.auth.getUser).toHaveBeenCalled();
      expect(supabase.from).toHaveBeenCalledWith('cars');
      expect(mockSupabaseQuery.insert).toHaveBeenCalledWith({
        ...carData,
        owner_id: 'user-1',
      });
      expect(result).toEqual(mockCreatedCar);
    });

    it('should throw error when user not authenticated', async () => {
      (supabase.auth.getUser as any).mockResolvedValue({
        data: { user: null },
      });

      const carData: AddCarForm = {
        registration: 'KA-01-AB-1234',
        make: 'Honda',
        model: 'City',
        fuel_type: 'petrol',
      };

      await expect(CarService.createCar(carData)).rejects.toThrow(
        'User must be authenticated to create a car'
      );
    });

    it('should handle duplicate registration error', async () => {
      const mockUser = { id: 'user-1' };
      const carData: AddCarForm = {
        registration: 'KA-01-AB-1234',
        make: 'Honda',
        model: 'City',
        fuel_type: 'petrol',
      };

      (supabase.auth.getUser as any).mockResolvedValue({
        data: { user: mockUser },
      });

      mockSupabaseQuery.single.mockResolvedValue({
        data: null,
        error: { code: '23505', message: 'duplicate key value violates unique constraint "cars_owner_id_registration_key"' },
      });

      await expect(CarService.createCar(carData)).rejects.toThrow(
        'A car with this registration number already exists'
      );
    });
  });
});
```

#### 4.2 Car Form Tests
**File**: `src/components/cars/__tests__/car-form.test.tsx`

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { CarForm } from '../car-form';
import { AddCarForm } from '@/types';

const mockOnSubmit = vi.fn();
const mockOnCancel = vi.fn();

describe('CarForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render form fields correctly', () => {
    render(
      <CarForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByLabelText(/registration number/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/make/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/model/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/fuel type/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/year/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/tank capacity/i)).toBeInTheDocument();
  });

  it('should submit form with valid data', async () => {
    const user = userEvent.setup();
    
    render(
      <CarForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    await user.type(screen.getByLabelText(/registration number/i), 'ka-01-ab-1234');
    await user.type(screen.getByLabelText(/make/i), 'Honda');
    await user.type(screen.getByLabelText(/model/i), 'City');
    await user.type(screen.getByLabelText(/year/i), '2020');
    await user.type(screen.getByLabelText(/tank capacity/i), '40');

    await user.click(screen.getByRole('button', { name: /add car/i }));

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        registration: 'KA-01-AB-1234',
        make: 'Honda',
        model: 'City',
        fuel_type: 'petrol',
        year: 2020,
        tank_capacity_l: 40,
      });
    });
  });

  it('should show validation errors for invalid data', async () => {
    const user = userEvent.setup();
    
    render(
      <CarForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    await user.click(screen.getByRole('button', { name: /add car/i }));

    await waitFor(() => {
      expect(screen.getByText(/registration number is required/i)).toBeInTheDocument();
      expect(screen.getByText(/make is required/i)).toBeInTheDocument();
      expect(screen.getByText(/model is required/i)).toBeInTheDocument();
    });

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('should validate registration number format', async () => {
    const user = userEvent.setup();
    
    render(
      <CarForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    await user.type(screen.getByLabelText(/registration number/i), 'invalid');
    await user.click(screen.getByRole('button', { name: /add car/i }));

    await waitFor(() => {
      expect(screen.getByText(/please enter a valid indian registration number/i)).toBeInTheDocument();
    });

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('should populate form when editing existing car', () => {
    const existingCar = {
      id: '1',
      owner_id: 'user-1',
      registration: 'KA-01-AB-1234',
      make: 'Honda',
      model: 'City',
      fuel_type: 'petrol' as const,
      year: 2020,
      tank_capacity_l: 40,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    };

    render(
      <CarForm
        car={existingCar}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByDisplayValue('KA-01-AB-1234')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Honda')).toBeInTheDocument();
    expect(screen.getByDisplayValue('City')).toBeInTheDocument();
    expect(screen.getByDisplayValue('2020')).toBeInTheDocument();
    expect(screen.getByDisplayValue('40')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /update car/i })).toBeInTheDocument();
  });
});
```

### Integration Tests with MSW

#### 4.3 Car Management Integration Tests
**File**: `src/components/cars/__tests__/car-integration.test.tsx`

```typescript
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '@/contexts/auth-context';
import { AddCarDialog } from '../car-dialog';
import { Dashboard } from '@/pages/Dashboard';

// Mock Supabase endpoints
const server = setupServer(
  rest.get('https://bkfzqrzshlmjxwgdnkak.supabase.co/rest/v1/cars', (req, res, ctx) => {
    return res(
      ctx.json([
        {
          id: '1',
          owner_id: 'user-1',
          registration: 'KA-01-AB-1234',
          make: 'Honda',
          model: 'City',
          fuel_type: 'petrol',
          year: 2020,
          tank_capacity_l: 40,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
      ])
    );
  }),

  rest.post('https://bkfzqrzshlmjxwgdnkak.supabase.co/rest/v1/cars', (req, res, ctx) => {
    return res(
      ctx.json({
        id: '2',
        owner_id: 'user-1',
        registration: 'KA-05-CD-5678',
        make: 'Maruti',
        model: 'Swift',
        fuel_type: 'petrol',
        year: 2021,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      })
    );
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function TestWrapper({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          {children}
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

describe('Car Management Integration', () => {
  it('should load and display cars from API', async () => {
    render(
      <TestWrapper>
        <Dashboard />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Honda City')).toBeInTheDocument();
      expect(screen.getByText('KA-01-AB-1234')).toBeInTheDocument();
    });
  });

  it('should create new car through dialog', async () => {
    const user = userEvent.setup();

    render(
      <TestWrapper>
        <AddCarDialog />
      </TestWrapper>
    );

    // Open dialog
    await user.click(screen.getByRole('button', { name: /add car/i }));

    // Fill form
    await user.type(screen.getByLabelText(/registration number/i), 'KA-05-CD-5678');
    await user.type(screen.getByLabelText(/make/i), 'Maruti');
    await user.type(screen.getByLabelText(/model/i), 'Swift');
    await user.type(screen.getByLabelText(/year/i), '2021');

    // Submit form
    await user.click(screen.getByRole('button', { name: /add car/i }));

    // Should show success message
    await waitFor(() => {
      expect(screen.getByText(/car added successfully/i)).toBeInTheDocument();
    });
  });
});
```

## Storybook Updates

#### 4.4 Car Component Stories
**File**: `src/components/cars/car-form.stories.tsx`

```typescript
import type { Meta, StoryObj } from '@storybook/react';
import { CarForm } from './car-form';
import { action } from '@storybook/addon-actions';

const meta = {
  title: 'Cars/CarForm',
  component: CarForm,
  parameters: {
    layout: 'centered',
  },
  args: {
    onSubmit: action('onSubmit'),
    onCancel: action('onCancel'),
  },
  tags: ['autodocs'],
} satisfies Meta<typeof CarForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const AddCar: Story = {};

export const EditCar: Story = {
  args: {
    car: {
      id: '1',
      owner_id: 'user-1',
      registration: 'KA-01-AB-1234',
      make: 'Honda',
      model: 'City',
      fuel_type: 'petrol',
      year: 2020,
      tank_capacity_l: 40,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
  },
};

export const Loading: Story = {
  args: {
    isLoading: true,
  },
};
```

**File**: `src/components/cars/car-dialog.stories.tsx`

```typescript
import type { Meta, StoryObj } from '@storybook/react';
import { AddCarDialog } from './car-dialog';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

const meta = {
  title: 'Cars/AddCarDialog',
  component: AddCarDialog,
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <QueryClientProvider client={queryClient}>
        <Story />
      </QueryClientProvider>
    ),
  ],
  tags: ['autodocs'],
} satisfies Meta<typeof AddCarDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const CustomTrigger: Story = {
  args: {
    trigger: <button>Custom Add Car Button</button>,
  },
};
```

## How to Test

### Manual Testing Checklist

#### Car CRUD Operations
- [ ] Create new car with valid data
- [ ] Create car with duplicate registration (should show error)
- [ ] Create car with invalid registration format (should show validation error)
- [ ] Edit existing car details
- [ ] Delete car (should show confirmation dialog)
- [ ] Cancel car creation/editing
- [ ] Form validation works for all required fields

#### UI/UX Testing
- [ ] Car cards display correctly with real data
- [ ] Loading states show during API calls
- [ ] Error states display appropriate messages
- [ ] Dialogs open/close correctly
- [ ] Form resets properly after submission
- [ ] Responsive design works on mobile

#### API Integration
- [ ] Cars load from Supabase on page refresh
- [ ] New cars appear immediately after creation
- [ ] Updated cars reflect changes immediately
- [ ] Deleted cars are removed from UI
- [ ] Error handling works for network failures

### Automated Testing

```bash
# Run unit tests
npm run test src/services/cars.test.ts
npm run test src/components/cars/

# Run integration tests
npm run test:integration src/components/cars/

# Run all car-related tests
npm run test -- --testNamePattern="car"

# Run tests with coverage
npm run test:coverage
```

## Definition of Done

- [ ] **CRUD Operations**: All car create, read, update, delete operations working
- [ ] **Form Validation**: Comprehensive validation with proper error messages
- [ ] **API Integration**: Real Supabase integration with error handling
- [ ] **UI Components**: Enhanced CarCard with real data and actions
- [ ] **Dialogs**: Add, edit, and delete dialogs working smoothly
- [ ] **Error Handling**: Proper error states and user feedback
- [ ] **Loading States**: Loading indicators during API operations
- [ ] **Unit Tests**: >80% coverage for car components and services
- [ ] **Integration Tests**: Car management flows tested with MSW
- [ ] **Storybook**: Car components documented with comprehensive stories
- [ ] **Manual Testing**: All car management scenarios tested
- [ ] **Code Review**: Code reviewed and approved
- [ ] **Dashboard Integration**: Dashboard shows real car data

## Notes

- **Data Validation**: Registration number format follows Indian standards
- **Error Handling**: User-friendly error messages for all failure scenarios
- **Performance**: Optimistic updates for better UX
- **Accessibility**: All form inputs properly labeled and accessible
- **Mobile**: Responsive design for car management on mobile devices
- **Future**: Car statistics will be implemented in Phase 4 (Analytics)
