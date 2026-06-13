import { supabase } from '@/integrations/supabase/client';
import { Car, AddCarForm } from '@/types';
import { db } from '@/lib/db';
import { useAppStore } from '@/store';

export class CarService {
  static async getCars(): Promise<Car[]> {
    if (navigator.onLine) {
      try {
        const { data: remoteCars, error } = await supabase
          .from('cars')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;

        if (remoteCars) {
          // Bulk put remote cars into Dexie as synced: 1
          const formattedCars = remoteCars.map((c) => ({ ...c, synced: 1 }));
          
          // Clear older synced cars, keeping unsynced local creations
          const unsyncedCars = await db.cars.filter(c => c.synced === 0).toArray();
          await db.cars.clear();
          await db.cars.bulkPut([...formattedCars, ...unsyncedCars]);
          
          // Combine remote cars with unsynced local creations for UI
          const combined = [...remoteCars, ...unsyncedCars];
          
          // Sync stores
          useAppStore.getState().setCars(combined);
          return combined;
        }
      } catch (err) {
        console.warn('Failed to fetch from Supabase, falling back to local storage:', err);
      }
    }

    // Offline or request failed: return local Dexie cars
    const localCars = await db.cars.toArray();
    useAppStore.getState().setCars(localCars);
    return localCars;
  }

  static async getCarById(id: string): Promise<Car | null> {
    // Check local database first
    const localCar = await db.cars.get(id);
    if (localCar) return localCar;

    if (navigator.onLine) {
      try {
        const { data, error } = await supabase
          .from('cars')
          .select('*')
          .eq('id', id)
          .single();

        if (error) {
          if (error.code === 'PGRST116') return null;
          throw error;
        }

        if (data) {
          const car = { ...data, synced: 1 } as Car;
          await db.cars.put(car);
          return car;
        }
      } catch (err) {
        console.error('Failed to get car by ID from Supabase:', err);
      }
    }

    return null;
  }

  static async createCar(carData: AddCarForm): Promise<Car> {
    // Determine authenticated user ID
    let userId = '';
    try {
      const { data: { user } } = await supabase.auth.getUser();
      userId = user?.id || '';
    } catch {
      // Ignore auth fetch failure when offline
    }

    if (!userId) {
      // Fallback: check session cache
      try {
        const { data: { session } } = await supabase.auth.getSession();
        userId = session?.user?.id || '';
      } catch {}
    }

    if (!userId) {
      throw new Error('User must be authenticated to create a car');
    }

    const now = new Date().toISOString();
    const carId = crypto.randomUUID();
    const newCar: Car = {
      id: carId,
      owner_id: userId,
      registration: carData.registration.toUpperCase(),
      make: carData.make,
      model: carData.model,
      fuel_type: carData.fuel_type,
      tank_capacity_l: carData.tank_capacity_l,
      year: carData.year,
      country: carData.country || 'IN',
      currency: carData.currency || 'INR',
      distance_unit: carData.distance_unit || 'km',
      volume_unit: carData.volume_unit || 'L',
      created_at: now,
      updated_at: now,
    };

    if (navigator.onLine) {
      try {
        const { data, error } = await supabase
          .from('cars')
          .insert(newCar)
          .select()
          .single();

        if (error) {
          if (error.code === '23505' && error.message.includes('registration')) {
            throw new Error('A car with this registration number already exists');
          }
          throw error;
        }

        if (data) {
          const syncedCar = { ...data, synced: 1 } as Car;
          await db.cars.put(syncedCar);
          useAppStore.getState().addCar(syncedCar);
          return syncedCar;
        }
      } catch (err: any) {
        // Only fallback if it's a network error
        if (err.message && (err.message.includes('Fetch') || err.message.includes('Failed to fetch'))) {
          console.warn('Supabase offline during car creation, queuing sync...');
        } else {
          throw err;
        }
      }
    }

    // Verify uniqueness locally first
    const existing = await db.cars
      .filter(c => c.registration.toUpperCase() === newCar.registration)
      .first();
    if (existing) {
      throw new Error('A car with this registration number already exists');
    }

    // Create offline (synced: 0) and add to syncQueue
    await db.cars.put({ ...newCar, synced: 0 });
    await db.syncQueue.add({
      table: 'cars',
      action: 'insert',
      recordId: carId,
      payload: newCar,
      created_at: now,
    });

    useAppStore.getState().addCar(newCar);
    useAppStore.getState().setSyncStatus('pending');
    
    return newCar;
  }

  static async updateCar(id: string, updates: Partial<AddCarForm>): Promise<Car> {
    const localCar = await db.cars.get(id);
    if (!localCar) throw new Error('Car not found');

    const now = new Date().toISOString();
    const updatedCar: Car = {
      ...localCar,
      ...updates,
      updated_at: now,
    };

    if (navigator.onLine) {
      try {
        const { data, error } = await supabase
          .from('cars')
          .update(updates)
          .eq('id', id)
          .select()
          .single();

        if (error) {
          if (error.code === '23505' && error.message.includes('registration')) {
            throw new Error('A car with this registration number already exists');
          }
          throw error;
        }

        if (data) {
          const syncedCar = { ...data, synced: 1 } as Car;
          await db.cars.put(syncedCar);
          useAppStore.getState().updateCar(id, syncedCar);
          return syncedCar;
        }
      } catch (err: any) {
        if (err.message && (err.message.includes('Fetch') || err.message.includes('Failed to fetch'))) {
          console.warn('Supabase offline during car update, queuing sync...');
        } else {
          throw err;
        }
      }
    }

    // Save locally
    await db.cars.put({ ...updatedCar, synced: 0 });

    // Optimize queue: check if an insert task already exists for this car
    const pendingInsert = await db.syncQueue
      .where({ table: 'cars', action: 'insert', recordId: id })
      .first();

    if (pendingInsert) {
      // Modify original insert payload instead of appending a new update transaction
      pendingInsert.payload = { ...pendingInsert.payload, ...updates, updated_at: now };
      await db.syncQueue.put(pendingInsert);
    } else {
      // Check if update task exists, if so modify it, otherwise add new
      const pendingUpdate = await db.syncQueue
        .where({ table: 'cars', action: 'update', recordId: id })
        .first();

      if (pendingUpdate) {
        pendingUpdate.payload = { ...pendingUpdate.payload, ...updates };
        await db.syncQueue.put(pendingUpdate);
      } else {
        await db.syncQueue.add({
          table: 'cars',
          action: 'update',
          recordId: id,
          payload: updates,
          created_at: now,
        });
      }
    }

    useAppStore.getState().updateCar(id, updatedCar);
    useAppStore.getState().setSyncStatus('pending');
    
    return updatedCar;
  }

  static async deleteCar(id: string): Promise<void> {
    if (navigator.onLine) {
      try {
        const { error } = await supabase
          .from('cars')
          .delete()
          .eq('id', id);

        if (error) throw error;
        
        await db.cars.delete(id);
        // Cascade delete logs
        await db.fuelLogs.where('car_id').equals(id).delete();
        useAppStore.getState().deleteCar(id);
        return;
      } catch (err) {
        console.warn('Supabase offline during car delete, queuing sync:', err);
      }
    }

    // Perform offline deletes
    await db.cars.delete(id);
    await db.fuelLogs.where('car_id').equals(id).delete();

    // Optimize queue: if there's a pending insert for this car, cancel it out
    const pendingInsert = await db.syncQueue
      .where({ table: 'cars', action: 'insert', recordId: id })
      .first();

    if (pendingInsert) {
      if (pendingInsert.id !== undefined) {
        await db.syncQueue.delete(pendingInsert.id);
      }
    } else {
      // Remove any pending updates and add delete task
      const pendingUpdates = await db.syncQueue
        .filter(q => q.table === 'cars' && q.recordId === id && q.action === 'update')
        .toArray();

      for (const updateTask of pendingUpdates) {
        if (updateTask.id !== undefined) {
          await db.syncQueue.delete(updateTask.id);
        }
      }

      await db.syncQueue.add({
        table: 'cars',
        action: 'delete',
        recordId: id,
        payload: null,
        created_at: new Date().toISOString(),
      });
    }

    useAppStore.getState().deleteCar(id);
    useAppStore.getState().setSyncStatus('pending');
  }

  static async getCarCount(): Promise<number> {
    // Simply fetch total count locally
    return await db.cars.count();
  }
}
