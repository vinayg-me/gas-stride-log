import { useEffect, useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Car, Globe, Settings2 } from 'lucide-react';
import { Car as CarType, AddCarForm } from '@/types';

const COUNTRY_PRESETS = {
  IN: { name: 'India', currency: 'INR', distance_unit: 'km', volume_unit: 'L' },
  US: { name: 'United States', currency: 'USD', distance_unit: 'mi', volume_unit: 'gal' },
  GB: { name: 'United Kingdom', currency: 'GBP', distance_unit: 'mi', volume_unit: 'L' },
  EU: { name: 'Europe', currency: 'EUR', distance_unit: 'km', volume_unit: 'L' },
} as const;

const getCountryFromCarSettings = (currency?: string, distance?: string, volume?: string) => {
  if (!currency || !distance || !volume) return 'IN';
  if (currency === 'INR' && distance === 'km' && volume === 'L') return 'IN';
  if (currency === 'USD' && distance === 'mi' && volume === 'gal') return 'US';
  if (currency === 'GBP' && distance === 'mi' && volume === 'L') return 'GB';
  if (currency === 'EUR' && distance === 'km' && volume === 'L') return 'EU';
  return 'custom';
};

const INDIAN_STATES = new Set([
  'AN', 'AP', 'AR', 'AS', 'BR', 'CG', 'CH', 'DD', 'DL', 'DN', 'GA', 'GJ', 'HR', 'HP', 'JH', 'JK', 'KA', 'KL', 'LA', 'LD', 'MH', 'ML', 'MN', 'MP', 'MZ', 'NL', 'OD', 'OR', 'PB', 'PY', 'RJ', 'SK', 'TG', 'TN', 'TR', 'TS', 'UA', 'UP', 'UT', 'WB'
]);

const detectCountryFromRegistration = (reg: string): 'IN' | 'GB' | null => {
  const cleanReg = reg.trim().toUpperCase();
  if (cleanReg.length < 4) return null;

  const stateCode = cleanReg.slice(0, 2);
  const startsWithStateAndDigits = /^[A-Z]{2}[-\s]?\d{2}/i.test(cleanReg);
  
  if (INDIAN_STATES.has(stateCode) && startsWithStateAndDigits) {
    return 'IN';
  }

  // UK standard pattern: 2 letters + 2 digits + 3 letters (e.g. BD51 SMR)
  if (/^[A-Z]{2}\d{2}[-\s]?[A-Z]{3}$/i.test(cleanReg)) {
    return 'GB';
  }

  return null;
};

const carFormSchema = z.object({
  registration: z
    .string()
    .min(1, 'Registration number is required')
    .max(20, 'Registration number must be less than 20 characters')
    .regex(
      /^[A-Z0-9-\s]{2,15}$/i,
      'Please enter a valid registration number (letters, numbers, spaces, and hyphens)'
    ),
  make: z
    .string()
    .min(1, 'Make is required')
    .max(50, 'Make must be less than 50 characters'),
  model: z
    .string()
    .min(1, 'Model is required')
    .max(50, 'Model must be less than 50 characters'),
  fuel_type: z.enum(['petrol', 'diesel', 'electric', 'hybrid', 'cng', 'lpg']),
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
  country: z.enum(['IN', 'US', 'GB', 'EU', 'custom']).default('IN'),
  currency: z.string().min(1, 'Currency is required'),
  distance_unit: z.enum(['km', 'mi']),
  volume_unit: z.enum(['L', 'gal']),
});

interface CarFormProps {
  car?: CarType;
  onSubmit: (data: AddCarForm) => void;
  onCancel: () => void;
  isLoading?: boolean;
  className?: string;
}

export function CarForm({ car, onSubmit, onCancel, isLoading = false, className }: CarFormProps) {
  const [isCountryManuallySelected, setIsCountryManuallySelected] = useState(false);
  const [detectedMessage, setDetectedMessage] = useState<string | null>(null);

  const initialCountry = useMemo(() => 
    getCountryFromCarSettings(car?.currency, car?.distance_unit, car?.volume_unit),
    [car]
  );

  const form = useForm<AddCarForm>({
    resolver: zodResolver(carFormSchema),
    defaultValues: {
      registration: car?.registration || '',
      make: car?.make || '',
      model: car?.model || '',
      fuel_type: car?.fuel_type || 'petrol',
      tank_capacity_l: car?.tank_capacity_l || undefined,
      year: car?.year || undefined,
      country: initialCountry,
      currency: car?.currency || 'INR',
      distance_unit: car?.distance_unit || 'km',
      volume_unit: car?.volume_unit || 'L',
    },
  });

  // Reset form when car changes
  useEffect(() => {
    if (car) {
      const detected = getCountryFromCarSettings(car.currency, car.distance_unit, car.volume_unit);
      form.reset({
        registration: car.registration,
        make: car.make,
        model: car.model,
        fuel_type: car.fuel_type,
        tank_capacity_l: car.tank_capacity_l || undefined,
        year: car.year || undefined,
        country: detected,
        currency: car.currency || 'INR',
        distance_unit: car.distance_unit || 'km',
        volume_unit: car.volume_unit || 'L',
      });
      setIsCountryManuallySelected(true);
    }
  }, [car, form]);

  const registrationValue = form.watch('registration');
  const countryValue = form.watch('country');

  // Auto-detect country based on registration number
  useEffect(() => {
    if (isCountryManuallySelected || car) return;

    const detected = detectCountryFromRegistration(registrationValue);
    if (detected) {
      form.setValue('country', detected);
      const preset = COUNTRY_PRESETS[detected];
      form.setValue('currency', preset.currency);
      form.setValue('distance_unit', preset.distance_unit);
      form.setValue('volume_unit', preset.volume_unit);
      setDetectedMessage(`Detected registration format: preset settings for ${preset.name} applied.`);
    } else {
      setDetectedMessage(null);
    }
  }, [registrationValue, isCountryManuallySelected, car, form]);

  // Update presets reactively when country value is changed
  useEffect(() => {
    if (countryValue && countryValue !== 'custom') {
      const preset = COUNTRY_PRESETS[countryValue as keyof typeof COUNTRY_PRESETS];
      form.setValue('currency', preset.currency);
      form.setValue('distance_unit', preset.distance_unit);
      form.setValue('volume_unit', preset.volume_unit);
    }
  }, [countryValue, form]);

  const handleSubmit = (data: AddCarForm) => {
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
                      {detectedMessage ? (
                        <span className="text-emerald-500 font-medium">{detectedMessage}</span>
                      ) : (
                        "Enter your vehicle's registration number"
                      )}
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
                        <SelectItem value="diesel">Diesel</SelectItem>
                        <SelectItem value="electric">Electric (EV)</SelectItem>
                        <SelectItem value="hybrid">Hybrid</SelectItem>
                        <SelectItem value="cng">CNG</SelectItem>
                        <SelectItem value="lpg">LPG</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Select the primary fuel type for your vehicle
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Localization Settings */}
            <div className="rounded-lg border border-border/50 p-4 bg-muted/20 space-y-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground/80">
                <Globe className="w-4 h-4 text-primary" />
                Localization & Unit Settings
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country/Region Preset</FormLabel>
                      <Select 
                        value={field.value} 
                        onValueChange={(val) => {
                          setIsCountryManuallySelected(true);
                          field.onChange(val);
                        }} 
                        disabled={isLoading}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Country" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="IN">🇮🇳 India (₹, km, L)</SelectItem>
                          <SelectItem value="US">🇺🇸 United States ($, mi, gal)</SelectItem>
                          <SelectItem value="GB">🇬🇧 United Kingdom (£, mi, L)</SelectItem>
                          <SelectItem value="EU">🇪🇺 Europe (€, km, L)</SelectItem>
                          <SelectItem value="custom">⚙️ Custom / Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {countryValue !== 'custom' && (
                  <div className="flex flex-col justify-end pb-2">
                    <p className="text-xs text-muted-foreground bg-muted/40 p-2.5 rounded-md border border-border/30">
                      Using preset values: <br />
                      <strong>Currency:</strong> {COUNTRY_PRESETS[countryValue as keyof typeof COUNTRY_PRESETS]?.currency} |&nbsp;
                      <strong>Distance:</strong> {COUNTRY_PRESETS[countryValue as keyof typeof COUNTRY_PRESETS]?.distance_unit} |&nbsp;
                      <strong>Fuel:</strong> {form.watch('fuel_type') === 'electric' ? 'kWh' : (form.watch('fuel_type') === 'cng' ? 'kg' : COUNTRY_PRESETS[countryValue as keyof typeof COUNTRY_PRESETS]?.volume_unit)}
                    </p>
                  </div>
                )}
              </div>

              {countryValue === 'custom' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-border/40">
                  <FormField
                    control={form.control}
                    name="currency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Currency</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select Currency" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="INR">INR (₹)</SelectItem>
                            <SelectItem value="USD">USD ($)</SelectItem>
                            <SelectItem value="EUR">EUR (€)</SelectItem>
                            <SelectItem value="GBP">GBP (£)</SelectItem>
                            <SelectItem value="CAD">CAD ($)</SelectItem>
                            <SelectItem value="AUD">AUD ($)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="distance_unit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Distance Unit</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select Distance" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="km">Kilometers (km)</SelectItem>
                            <SelectItem value="mi">Miles (mi)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="volume_unit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Volume Unit</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value} 
                          disabled={isLoading || form.watch('fuel_type') === 'electric' || form.watch('fuel_type') === 'cng'}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select Volume" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="L">Liters (L)</SelectItem>
                            <SelectItem value="gal">Gallons (gal)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          {form.watch('fuel_type') === 'electric' && "Locked to kWh for electric vehicles"}
                          {form.watch('fuel_type') === 'cng' && "Locked to kg for CNG vehicles"}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}
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
                      Fuel tank capacity in {form.watch('distance_unit') === 'mi' && form.watch('volume_unit') === 'gal' ? 'gallons' : 'liters'}
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
