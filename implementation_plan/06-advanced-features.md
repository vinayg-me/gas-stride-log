# Phase 6: Advanced Features

## Business Context

Implement advanced features that enhance user experience and provide additional value, including data export/import functionality, settings management, receipt OCR, VAHAN integration, and user preferences. These features make FuelTrackr more comprehensive and user-friendly.

## Current State

- ✅ Basic settings UI structure
- ✅ CSV/XLSX dependencies available (papaparse, xlsx)
- ✅ File upload components
- ✅ React Dropzone integrated
- ❌ No export/import functionality
- ❌ No settings management
- ❌ No OCR implementation
- ❌ No VAHAN integration
- ❌ No user preferences system

## Implementation Tasks

### 1. Data Export/Import System

#### 1.1 Export Service
**File**: `src/services/export.ts`

```typescript
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { Car, FuelLog } from '@/types';
import { FuelLogService } from './fuel-logs';
import { CarService } from './cars';

export interface ExportData {
  cars: Car[];
  fuelLogs: FuelLog[];
  exportedAt: string;
  version: string;
}

export class ExportService {
  static async exportToJSON(): Promise<void> {
    try {
      const cars = await CarService.getCars();
      const fuelLogs = await FuelLogService.getFuelLogs();

      const exportData: ExportData = {
        cars,
        fuelLogs,
        exportedAt: new Date().toISOString(),
        version: '1.0',
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json',
      });

      const fileName = `fueltrackr-export-${new Date().toISOString().split('T')[0]}.json`;
      saveAs(blob, fileName);
    } catch (error) {
      console.error('Export to JSON failed:', error);
      throw new Error('Failed to export data to JSON');
    }
  }

  static async exportToCSV(): Promise<void> {
    try {
      const cars = await CarService.getCars();
      const fuelLogs = await FuelLogService.getFuelLogs();

      // Create CSV data with car information joined
      const csvData = fuelLogs.map(log => {
        const car = cars.find(c => c.id === log.car_id);
        return {
          'Car Make': car?.make || '',
          'Car Model': car?.model || '',
          'Registration': car?.registration || '',
          'Fill Date': log.filled_at,
          'Odometer (km)': log.odometer_km,
          'Fuel Amount (L)': log.liters,
          'Price per Liter (₹)': log.price_per_l || '',
          'Total Cost (₹)': log.total_cost || '',
          'Is Partial Fill': log.is_partial ? 'Yes' : 'No',
          'Station': log.station || '',
          'Notes': log.notes || '',
          'Created At': log.created_at,
        };
      });

      // Convert to CSV using Papa Parse
      const { unparse } = await import('papaparse');
      const csv = unparse(csvData);

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const fileName = `fueltrackr-export-${new Date().toISOString().split('T')[0]}.csv`;
      saveAs(blob, fileName);
    } catch (error) {
      console.error('Export to CSV failed:', error);
      throw new Error('Failed to export data to CSV');
    }
  }

  static async exportToExcel(): Promise<void> {
    try {
      const cars = await CarService.getCars();
      const fuelLogs = await FuelLogService.getFuelLogs();

      // Create workbook with multiple sheets
      const workbook = XLSX.utils.book_new();

      // Cars sheet
      const carsData = cars.map(car => ({
        'Registration': car.registration,
        'Make': car.make,
        'Model': car.model,
        'Fuel Type': car.fuel_type,
        'Year': car.year || '',
        'Tank Capacity (L)': car.tank_capacity_l || '',
        'Created At': car.created_at,
        'Updated At': car.updated_at,
      }));

      const carsSheet = XLSX.utils.json_to_sheet(carsData);
      XLSX.utils.book_append_sheet(workbook, carsSheet, 'Cars');

      // Fuel logs sheet with car information
      const logsData = fuelLogs.map(log => {
        const car = cars.find(c => c.id === log.car_id);
        return {
          'Car Make': car?.make || '',
          'Car Model': car?.model || '',
          'Registration': car?.registration || '',
          'Fill Date': log.filled_at,
          'Odometer (km)': log.odometer_km,
          'Fuel Amount (L)': log.liters,
          'Price per Liter (₹)': log.price_per_l || '',
          'Total Cost (₹)': log.total_cost || '',
          'Is Partial Fill': log.is_partial ? 'Yes' : 'No',
          'Station': log.station || '',
          'Notes': log.notes || '',
          'Created At': log.created_at,
          'Updated At': log.updated_at,
        };
      });

      const logsSheet = XLSX.utils.json_to_sheet(logsData);
      XLSX.utils.book_append_sheet(workbook, logsSheet, 'Fuel Logs');

      // Summary sheet
      const summary = await this.generateSummaryData(cars, fuelLogs);
      const summarySheet = XLSX.utils.json_to_sheet(summary);
      XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

      // Save file
      const fileName = `fueltrackr-export-${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(workbook, fileName);
    } catch (error) {
      console.error('Export to Excel failed:', error);
      throw new Error('Failed to export data to Excel');
    }
  }

  private static async generateSummaryData(cars: Car[], fuelLogs: FuelLog[]) {
    const summary = [];

    for (const car of cars) {
      const carLogs = fuelLogs.filter(log => log.car_id === car.id);
      const stats = await FuelLogService.getCarStatistics(car.id);

      summary.push({
        'Car': `${car.make} ${car.model} (${car.registration})`,
        'Total Logs': carLogs.length,
        'Total Distance (km)': stats.totalDistance,
        'Total Fuel (L)': stats.totalLiters,
        'Total Spend (₹)': stats.totalSpend,
        'Average Mileage (km/L)': stats.averageMileage.toFixed(2),
        'Cost per KM (₹)': stats.costPerKm.toFixed(2),
        'Last Fill Date': stats.lastFillDate || 'N/A',
      });
    }

    return summary;
  }

  static generateSampleCSV(): string {
    const sampleData = [
      {
        'Car Make': 'Honda',
        'Car Model': 'City',
        'Registration': 'KA-01-AB-1234',
        'Fill Date': '2024-01-15',
        'Odometer (km)': 45230,
        'Fuel Amount (L)': 35.5,
        'Price per Liter (₹)': 105.50,
        'Total Cost (₹)': 3745.25,
        'Is Partial Fill': 'No',
        'Station': 'Indian Oil Petrol Pump',
        'Notes': 'Full tank after long trip',
      },
      {
        'Car Make': 'Maruti',
        'Car Model': 'Swift',
        'Registration': 'KA-05-CD-5678',
        'Fill Date': '2024-01-12',
        'Odometer (km)': 28450,
        'Fuel Amount (L)': 25.0,
        'Price per Liter (₹)': 104.80,
        'Total Cost (₹)': 2620.00,
        'Is Partial Fill': 'Yes',
        'Station': 'HP Petrol Pump',
        'Notes': 'Partial fill',
      },
    ];

    const { unparse } = require('papaparse');
    return unparse(sampleData);
  }
}
```

#### 1.2 Import Service
**File**: `src/services/import.ts`

```typescript
import * as XLSX from 'xlsx';
import { parse } from 'papaparse';
import { Car, FuelLog, AddCarForm, AddFuelLogForm } from '@/types';
import { CarService } from './cars';
import { FuelLogService } from './fuel-logs';
import { v4 as uuidv4 } from 'uuid';

export interface ImportResult {
  success: boolean;
  carsImported: number;
  logsImported: number;
  errors: string[];
  warnings: string[];
}

export interface ImportPreview {
  cars: Array<AddCarForm & { _rowIndex: number; _errors: string[] }>;
  logs: Array<AddFuelLogForm & { _rowIndex: number; _errors: string[] }>;
  totalRows: number;
  validRows: number;
  errors: string[];
}

export class ImportService {
  static async importFromCSV(file: File): Promise<ImportResult> {
    return new Promise((resolve) => {
      parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: async (results) => {
          try {
            const importResult = await this.processImportData(results.data);
            resolve(importResult);
          } catch (error) {
            resolve({
              success: false,
              carsImported: 0,
              logsImported: 0,
              errors: [`Import failed: ${(error as Error).message}`],
              warnings: [],
            });
          }
        },
        error: (error) => {
          resolve({
            success: false,
            carsImported: 0,
            logsImported: 0,
            errors: [`CSV parsing failed: ${error.message}`],
            warnings: [],
          });
        },
      });
    });
  }

  static async importFromExcel(file: File): Promise<ImportResult> {
    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer);
      
      // Try to find fuel logs sheet
      const sheetNames = workbook.SheetNames;
      const logsSheetName = sheetNames.find(name => 
        name.toLowerCase().includes('log') || 
        name.toLowerCase().includes('fuel')
      ) || sheetNames[0];
      
      const worksheet = workbook.Sheets[logsSheetName];
      const data = XLSX.utils.sheet_to_json(worksheet);
      
      return await this.processImportData(data);
    } catch (error) {
      return {
        success: false,
        carsImported: 0,
        logsImported: 0,
        errors: [`Excel import failed: ${(error as Error).message}`],
        warnings: [],
      };
    }
  }

  static async importFromJSON(file: File): Promise<ImportResult> {
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      
      // Validate JSON structure
      if (!data.cars || !data.fuelLogs || !Array.isArray(data.cars) || !Array.isArray(data.fuelLogs)) {
        throw new Error('Invalid JSON format. Expected cars and fuelLogs arrays.');
      }
      
      let carsImported = 0;
      let logsImported = 0;
      const errors: string[] = [];
      const warnings: string[] = [];
      
      // Import cars
      for (const carData of data.cars) {
        try {
          const car: AddCarForm = {
            registration: carData.registration,
            make: carData.make,
            model: carData.model,
            fuel_type: carData.fuel_type,
            year: carData.year,
            tank_capacity_l: carData.tank_capacity_l,
          };
          
          await CarService.createCar(car);
          carsImported++;
        } catch (error) {
          errors.push(`Failed to import car ${carData.registration}: ${(error as Error).message}`);
        }
      }
      
      // Import fuel logs
      for (const logData of data.fuelLogs) {
        try {
          // Find car by registration
          const cars = await CarService.getCars();
          const car = cars.find(c => 
            data.cars.find((dc: any) => dc.id === logData.car_id)?.registration === c.registration
          );
          
          if (!car) {
            warnings.push(`Skipped fuel log: car not found for log from ${logData.filled_at}`);
            continue;
          }
          
          const log: AddFuelLogForm = {
            car_id: car.id,
            filled_at: logData.filled_at,
            odometer_km: logData.odometer_km,
            liters: logData.liters,
            price_per_l: logData.price_per_l,
            total_cost: logData.total_cost,
            is_partial: logData.is_partial,
            station: logData.station,
            notes: logData.notes,
          };
          
          await FuelLogService.createFuelLog(log);
          logsImported++;
        } catch (error) {
          errors.push(`Failed to import fuel log: ${(error as Error).message}`);
        }
      }
      
      return {
        success: errors.length === 0,
        carsImported,
        logsImported,
        errors,
        warnings,
      };
    } catch (error) {
      return {
        success: false,
        carsImported: 0,
        logsImported: 0,
        errors: [`JSON import failed: ${(error as Error).message}`],
        warnings: [],
      };
    }
  }

  static async previewImport(file: File): Promise<ImportPreview> {
    try {
      let data: any[] = [];
      
      if (file.name.endsWith('.csv')) {
        data = await this.parseCSVFile(file);
      } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        data = await this.parseExcelFile(file);
      } else {
        throw new Error('Unsupported file format');
      }
      
      return this.generatePreview(data);
    } catch (error) {
      return {
        cars: [],
        logs: [],
        totalRows: 0,
        validRows: 0,
        errors: [`Preview failed: ${(error as Error).message}`],
      };
    }
  }

  private static async parseCSVFile(file: File): Promise<any[]> {
    return new Promise((resolve, reject) => {
      parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => resolve(results.data),
        error: (error) => reject(error),
      });
    });
  }

  private static async parseExcelFile(file: File): Promise<any[]> {
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    return XLSX.utils.sheet_to_json(worksheet);
  }

  private static generatePreview(data: any[]): ImportPreview {
    const cars: Array<AddCarForm & { _rowIndex: number; _errors: string[] }> = [];
    const logs: Array<AddFuelLogForm & { _rowIndex: number; _errors: string[] }> = [];
    const seenCars = new Set<string>();
    const errors: string[] = [];
    let validRows = 0;

    data.forEach((row, index) => {
      const rowErrors: string[] = [];
      
      // Extract car information
      const registration = row['Registration'] || row['registration'];
      const make = row['Car Make'] || row['make'];
      const model = row['Car Model'] || row['model'];
      
      if (registration && make && model && !seenCars.has(registration)) {
        seenCars.add(registration);
        
        const car: AddCarForm & { _rowIndex: number; _errors: string[] } = {
          registration,
          make,
          model,
          fuel_type: 'petrol',
          year: row['Year'] ? parseInt(row['Year']) : undefined,
          tank_capacity_l: row['Tank Capacity (L)'] ? parseFloat(row['Tank Capacity (L)']) : undefined,
          _rowIndex: index,
          _errors: [],
        };
        
        // Validate car data
        if (!registration) car._errors.push('Registration is required');
        if (!make) car._errors.push('Make is required');
        if (!model) car._errors.push('Model is required');
        
        cars.push(car);
      }
      
      // Extract fuel log information
      const fillDate = row['Fill Date'] || row['filled_at'];
      const odometer = row['Odometer (km)'] || row['odometer_km'];
      const liters = row['Fuel Amount (L)'] || row['liters'];
      
      if (fillDate && odometer && liters) {
        const log: AddFuelLogForm & { _rowIndex: number; _errors: string[] } = {
          car_id: 'temp', // Will be resolved during import
          filled_at: fillDate,
          odometer_km: parseFloat(odometer),
          liters: parseFloat(liters),
          price_per_l: row['Price per Liter (₹)'] ? parseFloat(row['Price per Liter (₹)']) : undefined,
          total_cost: row['Total Cost (₹)'] ? parseFloat(row['Total Cost (₹)']) : undefined,
          is_partial: (row['Is Partial Fill'] || '').toLowerCase() === 'yes',
          station: row['Station'] || '',
          notes: row['Notes'] || '',
          _rowIndex: index,
          _errors: [],
        };
        
        // Validate fuel log data
        if (!fillDate) log._errors.push('Fill date is required');
        if (!odometer || isNaN(log.odometer_km)) log._errors.push('Valid odometer reading is required');
        if (!liters || isNaN(log.liters)) log._errors.push('Valid fuel amount is required');
        if (!log.price_per_l && !log.total_cost) log._errors.push('Either price per liter or total cost is required');
        if (!registration) log._errors.push('Car registration is required');
        
        logs.push(log);
        
        if (log._errors.length === 0) {
          validRows++;
        }
      } else {
        rowErrors.push('Missing required fields for fuel log');
      }
      
      if (rowErrors.length > 0) {
        errors.push(`Row ${index + 1}: ${rowErrors.join(', ')}`);
      }
    });

    return {
      cars,
      logs,
      totalRows: data.length,
      validRows,
      errors,
    };
  }

  private static async processImportData(data: any[]): Promise<ImportResult> {
    const carMap = new Map<string, string>(); // registration -> car_id
    let carsImported = 0;
    let logsImported = 0;
    const errors: string[] = [];
    const warnings: string[] = [];
    
    // First pass: import cars
    const seenCars = new Set<string>();
    
    for (const row of data) {
      const registration = row['Registration'] || row['registration'];
      const make = row['Car Make'] || row['make'];
      const model = row['Car Model'] || row['model'];
      
      if (registration && make && model && !seenCars.has(registration)) {
        seenCars.add(registration);
        
        try {
          const car: AddCarForm = {
            registration,
            make,
            model,
            fuel_type: 'petrol',
            year: row['Year'] ? parseInt(row['Year']) : undefined,
            tank_capacity_l: row['Tank Capacity (L)'] ? parseFloat(row['Tank Capacity (L)']) : undefined,
          };
          
          const createdCar = await CarService.createCar(car);
          carMap.set(registration, createdCar.id);
          carsImported++;
        } catch (error) {
          errors.push(`Failed to import car ${registration}: ${(error as Error).message}`);
        }
      }
    }
    
    // Second pass: import fuel logs
    for (const row of data) {
      const registration = row['Registration'] || row['registration'];
      const fillDate = row['Fill Date'] || row['filled_at'];
      const odometer = row['Odometer (km)'] || row['odometer_km'];
      const liters = row['Fuel Amount (L)'] || row['liters'];
      
      if (fillDate && odometer && liters && registration) {
        const carId = carMap.get(registration);
        
        if (!carId) {
          warnings.push(`Skipped fuel log: car ${registration} not found`);
          continue;
        }
        
        try {
          const log: AddFuelLogForm = {
            car_id: carId,
            filled_at: fillDate,
            odometer_km: parseFloat(odometer),
            liters: parseFloat(liters),
            price_per_l: row['Price per Liter (₹)'] ? parseFloat(row['Price per Liter (₹)']) : undefined,
            total_cost: row['Total Cost (₹)'] ? parseFloat(row['Total Cost (₹)']) : undefined,
            is_partial: (row['Is Partial Fill'] || '').toLowerCase() === 'yes',
            station: row['Station'] || '',
            notes: row['Notes'] || '',
          };
          
          await FuelLogService.createFuelLog(log);
          logsImported++;
        } catch (error) {
          errors.push(`Failed to import fuel log: ${(error as Error).message}`);
        }
      }
    }
    
    return {
      success: errors.length === 0,
      carsImported,
      logsImported,
      errors,
      warnings,
    };
  }
}
```

### 2. Settings Management System

#### 2.1 Settings Service
**File**: `src/services/settings.ts`

```typescript
import { supabase } from '@/integrations/supabase/client';

export interface UserSettings {
  id: string;
  user_id: string;
  units: 'metric' | 'imperial';
  currency: 'INR' | 'USD' | 'EUR' | 'GBP';
  language: 'en' | 'hi' | 'te' | 'ta' | 'kn';
  theme: 'dark' | 'light' | 'system';
  notifications: {
    email: boolean;
    push: boolean;
    reminders: boolean;
  };
  privacy: {
    analytics: boolean;
    crashReports: boolean;
  };
  created_at: string;
  updated_at: string;
}

const DEFAULT_SETTINGS: Omit<UserSettings, 'id' | 'user_id' | 'created_at' | 'updated_at'> = {
  units: 'metric',
  currency: 'INR',
  language: 'en',
  theme: 'dark',
  notifications: {
    email: true,
    push: true,
    reminders: true,
  },
  privacy: {
    analytics: true,
    crashReports: true,
  },
};

export class SettingsService {
  static async getUserSettings(): Promise<UserSettings> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to fetch settings: ${error.message}`);
    }

    if (!data) {
      // Create default settings
      return await this.createDefaultSettings(user.id);
    }

    return data as UserSettings;
  }

  static async updateUserSettings(updates: Partial<UserSettings>): Promise<UserSettings> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('user_settings')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update settings: ${error.message}`);
    }

    return data as UserSettings;
  }

  private static async createDefaultSettings(userId: string): Promise<UserSettings> {
    const { data, error } = await supabase
      .from('user_settings')
      .insert({
        user_id: userId,
        ...DEFAULT_SETTINGS,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create default settings: ${error.message}`);
    }

    return data as UserSettings;
  }

  static async deleteUserSettings(): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('user_settings')
      .delete()
      .eq('user_id', user.id);

    if (error) {
      throw new Error(`Failed to delete settings: ${error.message}`);
    }
  }

  // Local storage methods for offline support
  static getLocalSettings(): Partial<UserSettings> {
    try {
      const stored = localStorage.getItem('fueltrackr-settings');
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  }

  static setLocalSettings(settings: Partial<UserSettings>): void {
    try {
      localStorage.setItem('fueltrackr-settings', JSON.stringify(settings));
    } catch (error) {
      console.error('Failed to save settings locally:', error);
    }
  }
}
```

### 3. Receipt OCR Integration

#### 3.1 OCR Service
**File**: `src/services/ocr.ts`

```typescript
import Tesseract from 'tesseract.js';

export interface OCRResult {
  success: boolean;
  data?: {
    amount?: number;
    liters?: number;
    pricePerLiter?: number;
    station?: string;
    date?: string;
  };
  confidence: number;
  error?: string;
}

export class OCRService {
  static async extractReceiptData(imageFile: File): Promise<OCRResult> {
    try {
      // Preprocess image for better OCR results
      const processedImage = await this.preprocessImage(imageFile);
      
      const { data: { text, confidence } } = await Tesseract.recognize(
        processedImage,
        'eng',
        {
          logger: (m) => console.log(m), // Optional: log progress
        }
      );

      const extractedData = this.parseReceiptText(text);
      
      return {
        success: true,
        data: extractedData,
        confidence,
      };
    } catch (error) {
      return {
        success: false,
        confidence: 0,
        error: (error as Error).message,
      };
    }
  }

  private static async preprocessImage(file: File): Promise<string> {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      const img = new Image();

      img.onload = () => {
        // Set canvas size
        canvas.width = img.width;
        canvas.height = img.height;

        // Draw image
        ctx.drawImage(img, 0, 0);

        // Apply preprocessing filters
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        // Convert to grayscale and increase contrast
        for (let i = 0; i < data.length; i += 4) {
          const gray = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
          
          // Increase contrast
          const contrast = 1.5;
          const adjusted = Math.min(255, Math.max(0, contrast * (gray - 128) + 128));
          
          data[i] = adjusted;     // Red
          data[i + 1] = adjusted; // Green
          data[i + 2] = adjusted; // Blue
        }

        ctx.putImageData(imageData, 0, 0);
        resolve(canvas.toDataURL());
      };

      img.src = URL.createObjectURL(file);
    });
  }

  private static parseReceiptText(text: string): OCRResult['data'] {
    const lines = text.split('\n').map(line => line.trim().toLowerCase());
    const result: OCRResult['data'] = {};

    // Patterns for different data extraction
    const amountPatterns = [
      /(?:total|amount|₹|rs\.?)\s*:?\s*(\d+(?:\.\d{2})?)/i,
      /(\d+\.\d{2})\s*(?:total|amount)/i,
    ];

    const litersPatterns = [
      /(\d+(?:\.\d{1,3})?)\s*(?:l|ltr|litre|litres)/i,
      /(?:qty|quantity|vol|volume)\s*:?\s*(\d+(?:\.\d{1,3})?)/i,
    ];

    const pricePerLiterPatterns = [
      /(?:rate|price|₹\/l|rs\/l)\s*:?\s*(\d+(?:\.\d{2})?)/i,
      /(\d+\.\d{2})\s*(?:per|\/)\s*(?:l|ltr|litre)/i,
    ];

    const stationPatterns = [
      /(?:indian oil|ioc|bharat petroleum|bpcl|hindustan petroleum|hpcl|hp|reliance|shell|essar)/i,
    ];

    const datePatterns = [
      /(\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4})/,
      /(\d{2,4}[-\/]\d{1,2}[-\/]\d{1,2})/,
    ];

    // Extract data using patterns
    for (const line of lines) {
      // Extract amount
      if (!result.amount) {
        for (const pattern of amountPatterns) {
          const match = line.match(pattern);
          if (match) {
            result.amount = parseFloat(match[1]);
            break;
          }
        }
      }

      // Extract liters
      if (!result.liters) {
        for (const pattern of litersPatterns) {
          const match = line.match(pattern);
          if (match) {
            result.liters = parseFloat(match[1]);
            break;
          }
        }
      }

      // Extract price per liter
      if (!result.pricePerLiter) {
        for (const pattern of pricePerLiterPatterns) {
          const match = line.match(pattern);
          if (match) {
            result.pricePerLiter = parseFloat(match[1]);
            break;
          }
        }
      }

      // Extract station
      if (!result.station) {
        const stationMatch = line.match(stationPatterns[0]);
        if (stationMatch) {
          result.station = stationMatch[0];
        }
      }

      // Extract date
      if (!result.date) {
        for (const pattern of datePatterns) {
          const match = line.match(pattern);
          if (match) {
            // Try to parse and format date
            try {
              const date = new Date(match[1]);
              if (!isNaN(date.getTime())) {
                result.date = date.toISOString().split('T')[0];
              }
            } catch {
              // Keep original format if parsing fails
              result.date = match[1];
            }
            break;
          }
        }
      }
    }

    // Calculate missing values
    if (result.amount && result.liters && !result.pricePerLiter) {
      result.pricePerLiter = result.amount / result.liters;
    } else if (result.pricePerLiter && result.liters && !result.amount) {
      result.amount = result.pricePerLiter * result.liters;
    }

    return result;
  }
}
```

### 4. VAHAN Integration Service

#### 4.1 VAHAN Lookup Service
**File**: `src/services/vahan.ts`

```typescript
import { supabase } from '@/integrations/supabase/client';

export interface VehicleInfo {
  registrationNumber: string;
  ownerName: string;
  vehicleClass: string;
  fuelType: string;
  make: string;
  model: string;
  manufacturingYear: number;
  engineNumber: string;
  chassisNumber: string;
  registrationDate: string;
  fitnessUpto: string;
  insuranceUpto: string;
  puccUpto: string;
}

export interface VahanLookupResult {
  success: boolean;
  data?: VehicleInfo;
  error?: string;
  source: 'vahan' | 'mock';
}

export class VahanService {
  private static readonly MOCK_DATA: Record<string, VehicleInfo> = {
    'KA01AB1234': {
      registrationNumber: 'KA-01-AB-1234',
      ownerName: 'John Doe',
      vehicleClass: 'Motor Car',
      fuelType: 'PETROL',
      make: 'HONDA',
      model: 'CITY',
      manufacturingYear: 2020,
      engineNumber: 'HC20E1234567',
      chassisNumber: 'MAH123456789',
      registrationDate: '2020-03-15',
      fitnessUpto: '2035-03-14',
      insuranceUpto: '2024-03-14',
      puccUpto: '2024-09-14',
    },
    'KA05CD5678': {
      registrationNumber: 'KA-05-CD-5678',
      ownerName: 'Jane Smith',
      vehicleClass: 'Motor Car',
      fuelType: 'PETROL',
      make: 'MARUTI SUZUKI',
      model: 'SWIFT',
      manufacturingYear: 2021,
      engineNumber: 'MS21S1234567',
      chassisNumber: 'MAS123456789',
      registrationDate: '2021-06-20',
      fitnessUpto: '2036-06-19',
      insuranceUpto: '2024-06-19',
      puccUpto: '2024-12-19',
    },
  };

  static async lookupVehicle(registrationNumber: string): Promise<VahanLookupResult> {
    const normalizedRegNo = registrationNumber.replace(/[-\s]/g, '').toUpperCase();

    try {
      // First try VAHAN API through Supabase Edge Function
      if (this.isVahanApiEnabled()) {
        const result = await this.callVahanAPI(normalizedRegNo);
        if (result.success) {
          return result;
        }
      }

      // Fallback to mock data
      return this.getMockData(normalizedRegNo);
    } catch (error) {
      console.error('VAHAN lookup failed:', error);
      return {
        success: false,
        error: (error as Error).message,
        source: 'mock',
      };
    }
  }

  private static isVahanApiEnabled(): boolean {
    return process.env.NODE_ENV === 'production' && 
           !!process.env.VITE_VAHAN_API_ENABLED;
  }

  private static async callVahanAPI(registrationNumber: string): Promise<VahanLookupResult> {
    try {
      const { data, error } = await supabase.functions.invoke('vahan-lookup', {
        body: { registrationNumber },
      });

      if (error) {
        throw new Error(error.message);
      }

      return {
        success: true,
        data: data.vehicle,
        source: 'vahan',
      };
    } catch (error) {
      console.error('VAHAN API call failed:', error);
      throw error;
    }
  }

  private static getMockData(registrationNumber: string): VahanLookupResult {
    const vehicleData = this.MOCK_DATA[registrationNumber];

    if (vehicleData) {
      return {
        success: true,
        data: vehicleData,
        source: 'mock',
      };
    }

    return {
      success: false,
      error: 'Vehicle not found in database',
      source: 'mock',
    };
  }

  static formatRegistrationNumber(regNo: string): string {
    // Format: KA-01-AB-1234
    const cleaned = regNo.replace(/[-\s]/g, '').toUpperCase();
    
    if (cleaned.length === 10) {
      return `${cleaned.slice(0, 2)}-${cleaned.slice(2, 4)}-${cleaned.slice(4, 6)}-${cleaned.slice(6)}`;
    }
    
    return regNo; // Return original if format doesn't match
  }

  static validateRegistrationNumber(regNo: string): boolean {
    const pattern = /^[A-Z]{2}[-\s]?\d{2}[-\s]?[A-Z]{1,2}[-\s]?\d{4}$/i;
    return pattern.test(regNo);
  }
}
```

### 5. Advanced UI Components

#### 5.1 Export/Import Dialog
**File**: `src/components/settings/export-import-dialog.tsx`

```typescript
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Download, Upload, FileText, FileSpreadsheet, Database, CheckCircle, AlertCircle } from 'lucide-react';
import { ExportService, ImportService, ImportResult, ImportPreview } from '@/services';
import { toast } from '@/hooks/use-toast';

interface ExportImportDialogProps {
  trigger?: React.ReactNode;
}

export function ExportImportDialog({ trigger }: ExportImportDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importPreview, setImportPreview] = useState<ImportPreview | null>(null);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleExport = async (format: 'json' | 'csv' | 'excel') => {
    setIsExporting(true);
    try {
      switch (format) {
        case 'json':
          await ExportService.exportToJSON();
          break;
        case 'csv':
          await ExportService.exportToCSV();
          break;
        case 'excel':
          await ExportService.exportToExcel();
          break;
      }
      toast({
        title: "Export Successful",
        description: `Your data has been exported to ${format.toUpperCase()}.`,
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: (error as Error).message,
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setImportPreview(null);
    setImportResult(null);

    try {
      const preview = await ImportService.previewImport(file);
      setImportPreview(preview);
    } catch (error) {
      toast({
        title: "Preview Failed",
        description: (error as Error).message,
        variant: "destructive",
      });
    }
  };

  const handleImport = async () => {
    if (!selectedFile) return;

    setIsImporting(true);
    try {
      let result: ImportResult;

      if (selectedFile.name.endsWith('.json')) {
        result = await ImportService.importFromJSON(selectedFile);
      } else if (selectedFile.name.endsWith('.csv')) {
        result = await ImportService.importFromCSV(selectedFile);
      } else {
        result = await ImportService.importFromExcel(selectedFile);
      }

      setImportResult(result);

      if (result.success) {
        toast({
          title: "Import Successful",
          description: `Imported ${result.carsImported} cars and ${result.logsImported} fuel logs.`,
        });
      } else {
        toast({
          title: "Import Completed with Errors",
          description: `${result.errors.length} errors occurred during import.`,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Import Failed",
        description: (error as Error).message,
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
    }
  };

  const downloadSampleCSV = () => {
    const csv = ExportService.generateSampleCSV();
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'fueltrackr-sample.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline">
            <Database className="h-4 w-4 mr-2" />
            Export/Import
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Export/Import Data</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="export" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="export">Export Data</TabsTrigger>
            <TabsTrigger value="import">Import Data</TabsTrigger>
          </TabsList>

          <TabsContent value="export" className="space-y-4">
            <div className="text-sm text-muted-foreground mb-4">
              Export your fuel tracking data in various formats for backup or analysis.
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                variant="outline"
                onClick={() => handleExport('json')}
                disabled={isExporting}
                className="h-20 flex-col"
              >
                <FileText className="h-6 w-6 mb-2" />
                <span>JSON</span>
                <span className="text-xs text-muted-foreground">Complete backup</span>
              </Button>

              <Button
                variant="outline"
                onClick={() => handleExport('csv')}
                disabled={isExporting}
                className="h-20 flex-col"
              >
                <FileSpreadsheet className="h-6 w-6 mb-2" />
                <span>CSV</span>
                <span className="text-xs text-muted-foreground">Spreadsheet format</span>
              </Button>

              <Button
                variant="outline"
                onClick={() => handleExport('excel')}
                disabled={isExporting}
                className="h-20 flex-col"
              >
                <FileSpreadsheet className="h-6 w-6 mb-2" />
                <span>Excel</span>
                <span className="text-xs text-muted-foreground">Multiple sheets</span>
              </Button>
            </div>

            {isExporting && (
              <div className="space-y-2">
                <Progress value={50} className="w-full" />
                <p className="text-sm text-muted-foreground text-center">Exporting data...</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="import" className="space-y-4">
            <div className="text-sm text-muted-foreground mb-4">
              Import fuel tracking data from CSV, Excel, or JSON files.
            </div>

            <div className="space-y-4">
              <div>
                <input
                  type="file"
                  accept=".csv,.xlsx,.xls,.json"
                  onChange={handleFileSelect}
                  className="w-full px-3 py-2 border border-input bg-background rounded-md"
                />
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs text-muted-foreground">
                    Supported formats: CSV, Excel (.xlsx, .xls), JSON
                  </span>
                  <Button
                    variant="link"
                    size="sm"
                    onClick={downloadSampleCSV}
                    className="p-0 h-auto text-xs"
                  >
                    Download Sample CSV
                  </Button>
                </div>
              </div>

              {importPreview && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 rounded-lg bg-background/50">
                      <div className="text-lg font-bold">{importPreview.totalRows}</div>
                      <div className="text-xs text-muted-foreground">Total Rows</div>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-background/50">
                      <div className="text-lg font-bold text-green-500">{importPreview.validRows}</div>
                      <div className="text-xs text-muted-foreground">Valid Rows</div>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-background/50">
                      <div className="text-lg font-bold text-blue-500">{importPreview.cars.length}</div>
                      <div className="text-xs text-muted-foreground">Cars</div>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-background/50">
                      <div className="text-lg font-bold text-purple-500">{importPreview.logs.length}</div>
                      <div className="text-xs text-muted-foreground">Fuel Logs</div>
                    </div>
                  </div>

                  {importPreview.errors.length > 0 && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        <div className="space-y-1">
                          <p className="font-medium">{importPreview.errors.length} errors found:</p>
                          <ul className="text-sm list-disc list-inside">
                            {importPreview.errors.slice(0, 5).map((error, index) => (
                              <li key={index}>{error}</li>
                            ))}
                            {importPreview.errors.length > 5 && (
                              <li>...and {importPreview.errors.length - 5} more</li>
                            )}
                          </ul>
                        </div>
                      </AlertDescription>
                    </Alert>
                  )}

                  <Button
                    onClick={handleImport}
                    disabled={isImporting || importPreview.validRows === 0}
                    className="w-full"
                  >
                    {isImporting ? 'Importing...' : `Import ${importPreview.validRows} Records`}
                  </Button>
                </div>
              )}

              {importResult && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    {importResult.success ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-red-500" />
                    )}
                    <span className="font-medium">
                      {importResult.success ? 'Import Successful' : 'Import Completed with Errors'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 rounded-lg bg-background/50">
                      <div className="text-lg font-bold text-blue-500">{importResult.carsImported}</div>
                      <div className="text-xs text-muted-foreground">Cars Imported</div>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-background/50">
                      <div className="text-lg font-bold text-purple-500">{importResult.logsImported}</div>
                      <div className="text-xs text-muted-foreground">Logs Imported</div>
                    </div>
                  </div>

                  {importResult.errors.length > 0 && (
                    <Alert variant="destructive">
                      <AlertDescription>
                        <div className="space-y-1">
                          <p className="font-medium">{importResult.errors.length} errors:</p>
                          <ul className="text-sm list-disc list-inside max-h-32 overflow-y-auto">
                            {importResult.errors.map((error, index) => (
                              <li key={index}>{error}</li>
                            ))}
                          </ul>
                        </div>
                      </AlertDescription>
                    </Alert>
                  )}

                  {importResult.warnings.length > 0 && (
                    <Alert>
                      <AlertDescription>
                        <div className="space-y-1">
                          <p className="font-medium">{importResult.warnings.length} warnings:</p>
                          <ul className="text-sm list-disc list-inside">
                            {importResult.warnings.map((warning, index) => (
                              <li key={index}>{warning}</li>
                            ))}
                          </ul>
                        </div>
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
```

## Testing Implementation

### Unit Tests

#### 6.1 Export Service Tests
**File**: `src/services/__tests__/export.test.ts`

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ExportService } from '../export';
import { CarService } from '../cars';
import { FuelLogService } from '../fuel-logs';

// Mock dependencies
vi.mock('../cars');
vi.mock('../fuel-logs');
vi.mock('file-saver', () => ({
  saveAs: vi.fn(),
}));

const mockCars = [
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

const mockFuelLogs = [
  {
    id: '1',
    car_id: '1',
    filled_at: '2024-01-15',
    odometer_km: 45230,
    liters: 40,
    price_per_l: 105.50,
    total_cost: 4220,
    is_partial: false,
    station: 'Indian Oil',
    created_at: '2024-01-15T00:00:00Z',
    updated_at: '2024-01-15T00:00:00Z',
  },
];

describe('ExportService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (CarService.getCars as any).mockResolvedValue(mockCars);
    (FuelLogService.getFuelLogs as any).mockResolvedValue(mockFuelLogs);
  });

  describe('exportToJSON', () => {
    it('should export data to JSON format', async () => {
      const { saveAs } = await import('file-saver');
      
      await ExportService.exportToJSON();

      expect(CarService.getCars).toHaveBeenCalled();
      expect(FuelLogService.getFuelLogs).toHaveBeenCalled();
      expect(saveAs).toHaveBeenCalledWith(
        expect.any(Blob),
        expect.stringMatching(/fueltrackr-export-\d{4}-\d{2}-\d{2}\.json/)
      );
    });
  });

  describe('generateSampleCSV', () => {
    it('should generate sample CSV data', () => {
      const csv = ExportService.generateSampleCSV();
      
      expect(csv).toContain('Car Make,Car Model,Registration');
      expect(csv).toContain('Honda,City,KA-01-AB-1234');
      expect(csv).toContain('Maruti,Swift,KA-05-CD-5678');
    });
  });
});
```

## How to Test

### Manual Testing Checklist

#### Export/Import Functionality
- [ ] Export to JSON works and contains all data
- [ ] Export to CSV creates properly formatted file
- [ ] Export to Excel creates multi-sheet workbook
- [ ] Import from CSV processes data correctly
- [ ] Import from Excel handles multiple sheets
- [ ] Import from JSON restores complete backup
- [ ] Import preview shows accurate data summary
- [ ] Import validation catches errors
- [ ] Sample CSV download works

#### Settings Management
- [ ] Settings load correctly for new users
- [ ] Settings update and persist
- [ ] Theme changes apply immediately
- [ ] Language changes work (if implemented)
- [ ] Currency formatting updates
- [ ] Privacy settings are respected

#### OCR Functionality
- [ ] Receipt image upload works
- [ ] OCR extracts basic information
- [ ] Extracted data pre-fills form
- [ ] OCR handles various receipt formats
- [ ] Error handling for poor quality images

#### VAHAN Integration
- [ ] Vehicle lookup returns mock data
- [ ] Registration number validation works
- [ ] Vehicle data pre-fills car form
- [ ] Error handling for invalid registrations

### Automated Testing

```bash
# Run advanced features tests
npm run test src/services/export.test.ts
npm run test src/services/import.test.ts
npm run test src/services/settings.test.ts
npm run test src/services/ocr.test.ts

# Run all advanced feature tests
npm run test -- --testNamePattern="advanced"

# Run tests with coverage
npm run test:coverage
```

## Definition of Done

- [ ] **Export/Import**: All formats (JSON, CSV, Excel) working
- [ ] **Settings Management**: User preferences system implemented
- [ ] **OCR Integration**: Receipt scanning with data extraction
- [ ] **VAHAN Integration**: Vehicle lookup service (mock + real)
- [ ] **UI Components**: Advanced dialogs and forms
- [ ] **Data Validation**: Import validation and error handling
- [ ] **Error Handling**: Comprehensive error states
- [ ] **Unit Tests**: >80% coverage for advanced features
- [ ] **Integration Tests**: End-to-end feature testing
- [ ] **Manual Testing**: All advanced scenarios verified
- [ ] **Documentation**: Usage guides for advanced features
- [ ] **Code Review**: Code reviewed and approved

## Notes

- **OCR Accuracy**: Tesseract.js provides basic OCR, accuracy varies by image quality
- **VAHAN API**: Real integration requires proper API credentials and legal compliance
- **File Formats**: Supports industry-standard formats for maximum compatibility
- **Settings**: Designed for future extensibility with more preferences
- **Performance**: Large file imports are handled efficiently with progress indicators
