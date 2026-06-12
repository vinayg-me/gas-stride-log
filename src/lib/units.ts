import { Car } from '@/types';

// Baseline conversion ratios
export const MILES_TO_KM = 1.609344;
export const KM_TO_MILES = 1 / MILES_TO_KM;
export const GALLONS_TO_LITERS = 3.785411784;
export const LITERS_TO_GALLONS = 1 / GALLONS_TO_LITERS;

// Static exchange rates mapped to INR (as base currency for dashboard aggregation)
export const STATIC_EXCHANGE_RATES: Record<string, number> = {
  INR: 1,
  USD: 83.0,
  EUR: 90.0,
  GBP: 105.0,
  CAD: 60.0,
  AUD: 55.0,
};

export interface CarUnits {
  currency: string;
  currencySymbol: string;
  distanceUnit: 'km' | 'mi';
  volumeUnit: string;
  efficiencyUnit: string;
}

/**
 * Returns currency, symbols, and unit labels formatted for a specific car's configuration
 */
export function getCarUnits(car?: Car | null): CarUnits {
  const currency = car?.currency || 'INR';
  const distanceUnit = car?.distance_unit || 'km';
  
  // Volume unit is determined by fuel type first, then custom preference
  let volumeUnit = car?.volume_unit || 'L';
  if (car?.fuel_type === 'electric') {
    volumeUnit = 'kWh';
  } else if (car?.fuel_type === 'cng') {
    volumeUnit = 'kg';
  }

  // Currency symbol mapping
  let currencySymbol = currency;
  if (currency === 'INR') currencySymbol = '₹';
  else if (currency === 'USD') currencySymbol = '$';
  else if (currency === 'EUR') currencySymbol = '€';
  else if (currency === 'GBP') currencySymbol = '£';

  // Efficiency label mapping
  let efficiencyUnit = `${distanceUnit}/${volumeUnit}`;
  if (car?.fuel_type !== 'electric' && car?.fuel_type !== 'cng') {
    if (distanceUnit === 'mi' && volumeUnit === 'gal') {
      efficiencyUnit = 'mpg';
    } else if (distanceUnit === 'km' && volumeUnit === 'L') {
      efficiencyUnit = 'km/L';
    }
  }

  return {
    currency,
    currencySymbol,
    distanceUnit,
    volumeUnit,
    efficiencyUnit,
  };
}

/**
 * Converts distance between km and mi
 */
export function convertDistance(val: number, from: 'km' | 'mi', to: 'km' | 'mi'): number {
  if (from === to) return val;
  if (from === 'mi' && to === 'km') return val * MILES_TO_KM;
  return val * KM_TO_MILES;
}

/**
 * Converts volume between liters (L) and gallons (gal)
 */
export function convertVolume(val: number, from: string, to: string): number {
  if (from === to) return val;
  if (from === 'gal' && to === 'L') return val * GALLONS_TO_LITERS;
  if (from === 'L' && to === 'gal') return val * LITERS_TO_GALLONS;
  return val;
}

/**
 * Converts currency using static baseline exchange rates
 */
export function convertCurrency(val: number, from: string, to: string): number {
  const normalizedFrom = from.toUpperCase();
  const normalizedTo = to.toUpperCase();
  if (normalizedFrom === normalizedTo) return val;

  const fromRate = STATIC_EXCHANGE_RATES[normalizedFrom] || 1;
  const toRate = STATIC_EXCHANGE_RATES[normalizedTo] || 1;

  // Convert from source currency to base (INR) then to target currency
  const valInInr = val * fromRate;
  return valInInr / toRate;
}
