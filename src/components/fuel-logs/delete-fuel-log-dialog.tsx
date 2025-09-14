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
import { FuelLog } from '@/types';
import { useDeleteFuelLog } from '@/hooks/use-fuel-logs';

interface DeleteFuelLogDialogProps {
  fuelLog: FuelLog;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function DeleteFuelLogDialog({ 
  fuelLog, 
  trigger, 
  open, 
  onOpenChange 
}: DeleteFuelLogDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const deleteFuelLogMutation = useDeleteFuelLog();

  const handleOpenChange = (newOpen: boolean) => {
    if (onOpenChange) {
      onOpenChange(newOpen);
    } else {
      setIsOpen(newOpen);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteFuelLogMutation.mutateAsync(fuelLog);
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
          <AlertDialogTitle>Delete Fuel Log</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this fuel log entry?
            <br />
            <br />
            <strong>Details:</strong>
            <br />
            Date: {new Date(fuelLog.filled_at).toLocaleDateString()}
            <br />
            Amount: {fuelLog.liters}L
            <br />
            {fuelLog.total_cost && `Cost: ₹${fuelLog.total_cost.toFixed(2)}`}
            <br />
            <br />
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteFuelLogMutation.isPending}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={deleteFuelLogMutation.isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {deleteFuelLogMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Delete Log
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
