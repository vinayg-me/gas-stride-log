import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { FuelLogForm } from '../fuel-log-form';
import { AddFuelLogForm, Car } from '@/types';
import { useAuth } from '@/contexts/auth-context';

// Mock auth context
vi.mock('@/contexts/auth-context', () => ({
  useAuth: vi.fn(),
}));

// Mock upload hook
vi.mock('@/hooks/use-fuel-logs', () => ({
  useUploadReceipt: () => ({
    mutateAsync: vi.fn().mockResolvedValue('https://example.com/receipt.jpg'),
    isPending: false,
  }),
}));

// Mock toast
vi.mock('@/hooks/use-toast', () => ({
  toast: vi.fn(),
}));

const mockCars: Car[] = [
  {
    id: '1',
    owner_id: 'user-1',
    registration: 'KA-01-AB-1234',
    make: 'Honda',
    model: 'City',
    fuel_type: 'petrol',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
];

const mockOnSubmit = vi.fn();
const mockOnCancel = vi.fn();

describe('FuelLogForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useAuth as any).mockReturnValue({
      user: { id: 'user-1' },
    });
  });

  it('should render form fields correctly', () => {
    render(
      <FuelLogForm
        cars={mockCars}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByLabelText(/car/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/fill date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/odometer reading/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/fuel amount/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/partial fill/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/price per liter/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/total cost/i)).toBeInTheDocument();
  });

  it('should auto-calculate total cost from price per liter', async () => {
    const user = userEvent.setup();
    
    render(
      <FuelLogForm
        cars={mockCars}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    await user.type(screen.getByLabelText(/fuel amount/i), '40');
    await user.type(screen.getByLabelText(/price per liter/i), '105.50');

    await waitFor(() => {
      expect(screen.getByDisplayValue('4220')).toBeInTheDocument();
    });
  });

  it('should auto-calculate price per liter from total cost', async () => {
    const user = userEvent.setup();
    
    render(
      <FuelLogForm
        cars={mockCars}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    await user.type(screen.getByLabelText(/fuel amount/i), '40');
    await user.type(screen.getByLabelText(/total cost/i), '4220');

    await waitFor(() => {
      expect(screen.getByDisplayValue('105.50')).toBeInTheDocument();
    });
  });

  it('should show partial fill warning when partial fill is enabled', async () => {
    const user = userEvent.setup();
    
    render(
      <FuelLogForm
        cars={mockCars}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    await user.click(screen.getByLabelText(/partial fill/i));

    await waitFor(() => {
      expect(screen.getByText(/partial fills are included in totals but not used for mileage calculations/i)).toBeInTheDocument();
    });
  });

  it('should submit form with valid data', async () => {
    const user = userEvent.setup();
    
    render(
      <FuelLogForm
        cars={mockCars}
        defaultCarId="1"
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    await user.type(screen.getByLabelText(/odometer reading/i), '45230');
    await user.type(screen.getByLabelText(/fuel amount/i), '40');
    await user.type(screen.getByLabelText(/price per liter/i), '105.50');
    await user.type(screen.getByLabelText(/fuel station/i), 'Indian Oil');

    await user.click(screen.getByRole('button', { name: /save log/i }));

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          car_id: '1',
          odometer_km: 45230,
          liters: 40,
          price_per_l: 105.50,
          total_cost: 4220,
          is_partial: false,
          station: 'Indian Oil',
        })
      );
    });
  });

  it('should show validation errors for invalid data', async () => {
    const user = userEvent.setup();
    
    render(
      <FuelLogForm
        cars={mockCars}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    await user.click(screen.getByRole('button', { name: /save log/i }));

    await waitFor(() => {
      expect(screen.getByText(/please select a car/i)).toBeInTheDocument();
      expect(screen.getByText(/odometer reading must be positive/i)).toBeInTheDocument();
      expect(screen.getByText(/fuel amount must be positive/i)).toBeInTheDocument();
    });

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('should require either price per liter or total cost', async () => {
    const user = userEvent.setup();
    
    render(
      <FuelLogForm
        cars={mockCars}
        defaultCarId="1"
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    await user.type(screen.getByLabelText(/odometer reading/i), '45230');
    await user.type(screen.getByLabelText(/fuel amount/i), '40');

    await user.click(screen.getByRole('button', { name: /save log/i }));

    await waitFor(() => {
      expect(screen.getByText(/either price per liter or total cost must be provided/i)).toBeInTheDocument();
    });

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('should populate form fields when editing existing fuel log', () => {
    const existingLog = {
      id: '1',
      car_id: '1',
      filled_at: '2024-01-15',
      odometer_km: 45230,
      liters: 40,
      price_per_l: 105.50,
      total_cost: 4220,
      is_partial: false,
      station: 'Indian Oil',
      notes: 'Full tank',
      created_at: '2024-01-15T10:30:00Z',
      updated_at: '2024-01-15T10:30:00Z',
    };

    render(
      <FuelLogForm
        cars={mockCars}
        fuelLog={existingLog}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByDisplayValue('45230')).toBeInTheDocument();
    expect(screen.getByDisplayValue('40')).toBeInTheDocument();
    expect(screen.getByDisplayValue('105.5')).toBeInTheDocument();
    expect(screen.getByDisplayValue('4220')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Indian Oil')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Full tank')).toBeInTheDocument();
  });

  it('should handle receipt file upload', async () => {
    const user = userEvent.setup();
    
    render(
      <FuelLogForm
        cars={mockCars}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    const file = new File(['test'], 'receipt.jpg', { type: 'image/jpeg' });
    const fileInput = screen.getByLabelText(/upload receipt/i);

    await user.upload(fileInput, file);

    await waitFor(() => {
      expect(screen.getByText('receipt.jpg')).toBeInTheDocument();
    });
  });

  it('should call onCancel when cancel button is clicked', async () => {
    const user = userEvent.setup();
    
    render(
      <FuelLogForm
        cars={mockCars}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    await user.click(screen.getByRole('button', { name: /cancel/i }));

    expect(mockOnCancel).toHaveBeenCalled();
  });
});
