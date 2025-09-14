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
