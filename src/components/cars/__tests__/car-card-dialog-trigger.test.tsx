import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CarCard } from '@/components/ui/car-card';
import { AddCarDialog } from '../car-dialog';

// Mock the hooks
vi.mock('@/hooks/use-cars', () => ({
  useCreateCar: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
  }),
}));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

function TestWrapper({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}

describe('CarCard as Dialog Trigger', () => {
  it('should open AddCarDialog when CarCard with asDialogTrigger is clicked', async () => {
    const user = userEvent.setup();

    render(
      <TestWrapper>
        <AddCarDialog trigger={
          <CarCard
            isAddCard
            asDialogTrigger={true}
          />
        } />
      </TestWrapper>
    );

    // The CarCard should be rendered
    expect(screen.getByTestId('add-car-button-card')).toBeInTheDocument();
    
    // Click the card
    await user.click(screen.getByTestId('add-car-button-card'));

    // The dialog should open and show the form
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByLabelText(/registration number/i)).toBeInTheDocument();
  });

  it('should not render button when asDialogTrigger is true', () => {
    render(
      <TestWrapper>
        <CarCard
          isAddCard
          asDialogTrigger={true}
        />
      </TestWrapper>
    );

    // Should not render the "Add Car" button when used as dialog trigger
    expect(screen.queryByRole('button', { name: /add car/i })).not.toBeInTheDocument();
    
    // But should still show the text
    expect(screen.getByText('Add New Car')).toBeInTheDocument();
  });
});
