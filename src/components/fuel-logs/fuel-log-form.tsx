import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Fuel, Upload, X, AlertTriangle } from 'lucide-react';
import { FuelLog, AddFuelLogForm, Car } from '@/types';
import { useUploadReceipt } from '@/hooks/use-fuel-logs';
import { useAuth } from '@/contexts/auth-context';
import { toast } from '@/hooks/use-toast';

const fuelLogFormSchema = z.object({
  car_id: z.string().min(1, 'Please select a car'),
  filled_at: z.string().min(1, 'Fill date is required'),
  odometer_km: z
    .number({ required_error: 'Odometer reading must be positive' })
    .positive('Odometer reading must be positive')
    .max(9999999, 'Odometer reading seems too high'),
  liters: z
    .number({ required_error: 'Fuel amount must be positive' })
    .positive('Fuel amount must be positive')
    .max(500, 'Fuel amount seems too high'),
  price_per_l: z
    .number()
    .positive('Price per liter must be positive')
    .max(1000, 'Price per liter seems too high')
    .optional(),
  total_cost: z
    .number()
    .positive('Total cost must be positive')
    .max(100000, 'Total cost seems too high')
    .optional(),
  is_partial: z.boolean().default(false),
  station: z.string().max(100, 'Station name is too long').optional(),
  notes: z.string().max(500, 'Notes are too long').optional(),
}).refine(
  (data) => data.price_per_l !== undefined || data.total_cost !== undefined,
  {
    message: 'Either price per liter or total cost must be provided',
    path: ['price_per_l'],
  }
);

interface FuelLogFormProps {
  cars: Car[];
  fuelLog?: FuelLog;
  defaultCarId?: string;
  onSubmit: (data: AddFuelLogForm) => void;
  onCancel: () => void;
  isLoading?: boolean;
  className?: string;
}

export function FuelLogForm({
  cars,
  fuelLog,
  defaultCarId,
  onSubmit,
  onCancel,
  isLoading = false,
  className
}: FuelLogFormProps) {
  const { user } = useAuth();
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(
    fuelLog?.receipt_url || null
  );
  const uploadReceiptMutation = useUploadReceipt();

  const form = useForm<AddFuelLogForm>({
    resolver: zodResolver(fuelLogFormSchema),
    defaultValues: {
      car_id: fuelLog?.car_id || defaultCarId || '',
      filled_at: fuelLog?.filled_at || new Date().toISOString().split('T')[0],
      odometer_km: fuelLog?.odometer_km || undefined,
      liters: fuelLog?.liters || undefined,
      price_per_l: fuelLog?.price_per_l || undefined,
      total_cost: fuelLog?.total_cost || undefined,
      is_partial: fuelLog?.is_partial || false,
      station: fuelLog?.station || '',
      notes: fuelLog?.notes || '',
    },
  });

  const watchedValues = form.watch(['liters', 'price_per_l', 'total_cost', 'is_partial']);

  // Auto-calculate missing price or total cost
  useEffect(() => {
    const [liters, pricePerL, totalCost] = watchedValues;
    if (liters && pricePerL) {
      form.setValue('total_cost', Number((liters * pricePerL).toFixed(2)), { shouldDirty: true });
    } else if (liters && totalCost) {
      form.setValue('price_per_l', Number((totalCost / liters)), { shouldDirty: true });
    }
  }, [watchedValues, form]);

  const handleReceiptUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Invalid File Type",
          description: "Please upload a JPEG, PNG, WebP, or PDF file.",
          variant: "destructive",
        });
        return;
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "Please upload a file smaller than 5MB.",
          variant: "destructive",
        });
        return;
      }

      setReceiptFile(file);
      
      // Create preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => setReceiptPreview(e.target?.result as string);
        reader.readAsDataURL(file);
      } else {
        setReceiptPreview(null);
      }
    }
  };

  const removeReceipt = () => {
    setReceiptFile(null);
    setReceiptPreview(null);
  };

  const handleSubmit = async (data: AddFuelLogForm) => {
    let receiptUrl = fuelLog?.receipt_url;

    // Upload receipt if new file selected
    if (receiptFile && user) {
      try {
        const tempLogId = fuelLog?.id || `temp-${Date.now()}`;
        receiptUrl = await uploadReceiptMutation.mutateAsync({
          file: receiptFile,
          userId: user.id,
          logId: tempLogId,
        });
      } catch (error) {
        // Receipt upload failed, but don't prevent form submission
        console.error('Receipt upload failed:', error);
      }
    }

    // Ensure price/total are consistent at submit time
    const submitData: AddFuelLogForm = { ...data };
    if (submitData.liters && submitData.price_per_l !== undefined) {
      submitData.total_cost = Number((submitData.liters * submitData.price_per_l).toFixed(2));
    } else if (submitData.liters && submitData.total_cost !== undefined) {
      submitData.price_per_l = Number((submitData.total_cost / submitData.liters).toFixed(2));
    }
    submitData.receipt_url = receiptUrl;

    onSubmit(submitData);
  };

  const selectedCar = cars.find(car => car.id === form.watch('car_id'));

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Fuel className="h-5 w-5" />
          {fuelLog ? 'Edit Fuel Log' : 'Add Fuel Log'}
        </CardTitle>
        <CardDescription>
          {fuelLog 
            ? 'Update your fuel consumption record'
            : 'Record your fuel consumption details for accurate tracking'
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Car Selection */}
            <FormField
              control={form.control}
              name="car_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Car</FormLabel>
                  <FormControl>
                    <select
                      {...field}
                      disabled={isLoading || !!defaultCarId}
                      className="w-full px-3 py-2 border border-input bg-background rounded-md"
                    >
                      <option value="">Select a car</option>
                      {cars.map((car) => (
                        <option key={car.id} value={car.id}>
                          {car.make} {car.model} ({car.registration})
                        </option>
                      ))}
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Date and Odometer */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="filled_at"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fill Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} disabled={isLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="odometer_km"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Odometer Reading (km)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="1"
                        placeholder="45230"
                        {...field}
                        disabled={isLoading}
                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormDescription>
                      Current odometer reading in kilometers
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Fuel Amount and Partial Fill */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="liters"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fuel Amount (L)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="35.50"
                        {...field}
                        disabled={isLoading}
                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormDescription>
                      Amount of fuel added in liters
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="is_partial"
                render={({ field }) => (
                  <FormItem className="flex flex-col justify-center">
                    <div className="flex items-center space-x-2">
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormLabel className="text-sm font-medium">
                        Partial Fill
                      </FormLabel>
                    </div>
                    <FormDescription>
                      Toggle if this was not a full tank fill
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Partial Fill Warning */}
            {form.watch('is_partial') && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Partial fills are included in totals but not used for mileage calculations. 
                  Only full-to-full fills provide accurate km/L measurements.
                </AlertDescription>
              </Alert>
            )}

            {/* Price Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="price_per_l"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price per Liter (₹)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="105.50"
                        {...field}
                        disabled={isLoading}
                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormDescription>
                      Price per liter in rupees
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="total_cost"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Total Cost (₹)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="3742.50"
                        {...field}
                        disabled
                      />
                    </FormControl>
                    <FormDescription>
                      Total amount paid in rupees
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Station */}
            <FormField
              control={form.control}
              name="station"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fuel Station (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Indian Oil Petrol Pump"
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormDescription>
                    Name or location of the fuel station
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Receipt Upload */}
            <div className="space-y-2">
              <Label>Receipt (Optional)</Label>
              <div className="flex items-center space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('receipt-upload')?.click()}
                  disabled={isLoading}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Receipt
                </Button>
                <input
                  id="receipt-upload"
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={handleReceiptUpload}
                  aria-label="Upload Receipt"
                  className="hidden"
                />
                {(receiptFile || receiptPreview) && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={removeReceipt}
                    disabled={isLoading}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Remove
                  </Button>
                )}
              </div>
              {receiptPreview && receiptPreview.startsWith('data:image') && (
                <div className="mt-2">
                  <img
                    src={receiptPreview}
                    alt="Receipt preview"
                    className="max-w-xs max-h-32 object-contain rounded-md border"
                  />
                </div>
              )}
              {receiptFile && (
                <p className="text-sm text-muted-foreground">
                  <span>{receiptFile.name}</span>
                  <span> ({(receiptFile.size / 1024 / 1024).toFixed(2)} MB)</span>
                </p>
              )}
            </div>

            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Any additional notes about this fill-up..."
                      className="resize-none"
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormDescription>
                    Optional notes about this fuel log entry
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Form Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button type="submit" disabled={isLoading} className="flex-1">
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {fuelLog ? 'Update Log' : 'Save Log'}
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
