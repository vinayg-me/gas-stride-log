import Dexie, { type Table } from 'dexie';
import { Car, FuelLog } from '@/types';

export interface SyncQueueItem {
  id?: number;
  table: 'cars' | 'fuel_logs';
  action: 'insert' | 'update' | 'delete';
  recordId: string;
  payload: any;
  created_at: string;
}

export class FuelTrackrDB extends Dexie {
  cars!: Table<Car & { synced?: number }, string>;
  fuelLogs!: Table<FuelLog & { synced?: number }, string>;
  syncQueue!: Table<SyncQueueItem, number>;

  constructor() {
    super('FuelTrackrDB');
    this.version(1).stores({
      cars: 'id, owner_id, synced',
      fuelLogs: 'id, car_id, synced',
      syncQueue: '++id, table, action, recordId',
    });
  }
}

export const db = new FuelTrackrDB();
