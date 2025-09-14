import { supabase } from '@/integrations/supabase/client';
import { Car, AddCarForm } from '@/types';
import { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

type CarRow = Tables<'cars'>;
type CarInsert = TablesInsert<'cars'>;
type CarUpdate = TablesUpdate<'cars'>;

export class CarService {
  static async getCars(): Promise<Car[]> {
    const { data, error } = await supabase
      .from('cars')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching cars:', error);
      throw new Error(`Failed to fetch cars: ${error.message}`);
    }

    return data as Car[];
  }

  static async getCarById(id: string): Promise<Car | null> {
    const { data, error } = await supabase
      .from('cars')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Car not found
      }
      console.error('Error fetching car:', error);
      throw new Error(`Failed to fetch car: ${error.message}`);
    }

    return data as Car;
  }

  static async createCar(carData: AddCarForm): Promise<Car> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User must be authenticated to create a car');
    }

    const carInsert: CarInsert = {
      ...carData,
      owner_id: user.id,
    };

    const { data, error } = await supabase
      .from('cars')
      .insert(carInsert)
      .select()
      .single();

    if (error) {
      console.error('Error creating car:', error);
      
      // Handle specific errors
      if (error.code === '23505' && error.message.includes('registration')) {
        throw new Error('A car with this registration number already exists');
      }
      
      throw new Error(`Failed to create car: ${error.message}`);
    }

    return data as Car;
  }

  static async updateCar(id: string, updates: Partial<AddCarForm>): Promise<Car> {
    const { data, error } = await supabase
      .from('cars')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating car:', error);
      
      if (error.code === '23505' && error.message.includes('registration')) {
        throw new Error('A car with this registration number already exists');
      }
      
      throw new Error(`Failed to update car: ${error.message}`);
    }

    return data as Car;
  }

  static async deleteCar(id: string): Promise<void> {
    const { error } = await supabase
      .from('cars')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting car:', error);
      throw new Error(`Failed to delete car: ${error.message}`);
    }
  }

  static async getCarCount(): Promise<number> {
    const { count, error } = await supabase
      .from('cars')
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.error('Error counting cars:', error);
      throw new Error(`Failed to count cars: ${error.message}`);
    }

    return count || 0;
  }
}
