import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Plus, Edit } from 'lucide-react';
import { FuelLogForm } from './fuel-log-form';
import { FuelLog, AddFuelLogForm, Car } from '@/types';
import { useCreateFuelLog, useUpdateFuelLog } from '@/hooks/use-fuel-logs';

interface AddFuelLogDialogProps {
  cars: Car[];
  defaultCarId?: string;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function AddFuelLogDialog({ 
  cars, 
  defaultCarId, 
  trigger, 
  open, 
  onOpenChange 
}: AddFuelLogDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const createFuelLogMutation = useCreateFuelLog();

  const handleOpenChange = (newOpen: boolean) => {
    if (onOpenChange) {
      onOpenChange(newOpen);
    } else {
      setIsOpen(newOpen);
    }
  };

  const handleSubmit = async (data: AddFuelLogForm) => {
    try {
      await createFuelLogMutation.mutateAsync(data);
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
            Add Fuel Log
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Fuel Log</DialogTitle>
        </DialogHeader>
        <FuelLogForm
          cars={cars}
          defaultCarId={defaultCarId}
          onSubmit={handleSubmit}
          onCancel={() => handleOpenChange(false)}
          isLoading={createFuelLogMutation.isPending}
          className="border-0 shadow-none"
        />
      </DialogContent>
    </Dialog>
  );
}

interface EditFuelLogDialogProps {
  cars: Car[];
  fuelLog: FuelLog;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function EditFuelLogDialog({ 
  cars, 
  fuelLog, 
  trigger, 
  open, 
  onOpenChange 
}: EditFuelLogDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const updateFuelLogMutation = useUpdateFuelLog();

  const handleOpenChange = (newOpen: boolean) => {
    if (onOpenChange) {
      onOpenChange(newOpen);
    } else {
      setIsOpen(newOpen);
    }
  };

  const handleSubmit = async (data: AddFuelLogForm) => {
    try {
      await updateFuelLogMutation.mutateAsync({ id: fuelLog.id, updates: data });
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
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Fuel Log</DialogTitle>
        </DialogHeader>
        <FuelLogForm
          cars={cars}
          fuelLog={fuelLog}
          onSubmit={handleSubmit}
          onCancel={() => handleOpenChange(false)}
          isLoading={updateFuelLogMutation.isPending}
          className="border-0 shadow-none"
        />
      </DialogContent>
    </Dialog>
  );
}
