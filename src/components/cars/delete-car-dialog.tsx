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
