import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
