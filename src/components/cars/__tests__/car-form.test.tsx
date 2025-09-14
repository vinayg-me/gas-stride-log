import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { CarForm } from '../car-form';
import { AddCarForm } from '@/types';

const mockOnSubmit = vi.fn();
const mockOnCancel = vi.fn();

describe('CarForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render form fields correctly', () => {
    render(
      <CarForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByLabelText(/registration number/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/make/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/model/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/fuel type/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/year/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/tank capacity/i)).toBeInTheDocument();
  });

  it('should submit form with valid data', async () => {
    const user = userEvent.setup();
    
    render(
      <CarForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    await user.type(screen.getByLabelText(/registration number/i), 'ka-01-ab-1234');
    await user.type(screen.getByLabelText(/make/i), 'Honda');
    await user.type(screen.getByLabelText(/model/i), 'City');
    await user.type(screen.getByLabelText(/year/i), '2020');
    await user.type(screen.getByLabelText(/tank capacity/i), '40');

    await user.click(screen.getByRole('button', { name: /add car/i }));

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        registration: 'KA-01-AB-1234',
        make: 'Honda',
        model: 'City',
        fuel_type: 'petrol',
        year: 2020,
        tank_capacity_l: 40,
      });
    });
  });

  it('should show validation errors for invalid data', async () => {
    const user = userEvent.setup();
    
    render(
      <CarForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    await user.click(screen.getByRole('button', { name: /add car/i }));

    await waitFor(() => {
      expect(screen.getByText(/registration number is required/i)).toBeInTheDocument();
      expect(screen.getByText(/make is required/i)).toBeInTheDocument();
      expect(screen.getByText(/model is required/i)).toBeInTheDocument();
    });

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('should validate registration number format', async () => {
    const user = userEvent.setup();
    
    render(
      <CarForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    await user.type(screen.getByLabelText(/registration number/i), 'invalid');
    await user.click(screen.getByRole('button', { name: /add car/i }));

    await waitFor(() => {
      expect(screen.getByText(/please enter a valid indian registration number/i)).toBeInTheDocument();
    });

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('should populate form when editing existing car', () => {
    const existingCar = {
      id: '1',
      owner_id: 'user-1',
      registration: 'KA-01-AB-1234',
      make: 'Honda',
      model: 'City',
      fuel_type: 'petrol' as const,
      year: 2020,
      tank_capacity_l: 40,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    };

    render(
      <CarForm
        car={existingCar}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByDisplayValue('KA-01-AB-1234')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Honda')).toBeInTheDocument();
    expect(screen.getByDisplayValue('City')).toBeInTheDocument();
    expect(screen.getByDisplayValue('2020')).toBeInTheDocument();
    expect(screen.getByDisplayValue('40')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /update car/i })).toBeInTheDocument();
  });
});
