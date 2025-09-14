import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Plus, Edit } from 'lucide-react';
import { CarForm } from './car-form';
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
