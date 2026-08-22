export interface AgentVehicle {
  id: string;
  make: string;
  model: string;
  registration?: string;
}

export type VehicleResolution =
  | { status: 'matched'; car: AgentVehicle }
  | { status: 'ambiguous'; cars: AgentVehicle[] }
  | { status: 'not_found' };

const normalize = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, '');
const words = (value: string) => value.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);

export function hasServiceRoleClaim(authorization: string | null) {
  if (!authorization?.startsWith('Bearer ')) return false;

  try {
    const encodedPayload = authorization.slice(7).split('.')[1];
    if (!encodedPayload) return false;
    const base64 = encodedPayload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
    return JSON.parse(atob(padded)).role === 'service_role';
  } catch {
    return false;
  }
}

export function isValidIsoDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

export function resolveVehicleByMention(cars: AgentVehicle[], mention: string): VehicleResolution {
  const normalizedMention = normalize(mention);
  if (normalizedMention.length < 3) return { status: 'not_found' };

  const mentionWords = words(mention);
  const matches = cars.filter((car) => {
    const normalizedModel = normalize(car.model);
    const normalizedMakeAndModel = normalize(`${car.make} ${car.model}`);

    if (normalizedMention === normalizedModel || normalizedMention === normalizedMakeAndModel) {
      return true;
    }

    // A single distinctive model word such as “Hycross” is accepted, but neither
    // a partial word nor a make-only mention can select a vehicle.
    return mentionWords.length === 1
      && mentionWords[0].length >= 3
      && words(car.model).includes(mentionWords[0]);
  });

  if (matches.length === 1) return { status: 'matched', car: matches[0] };
  if (matches.length > 1) return { status: 'ambiguous', cars: matches };
  return { status: 'not_found' };
}

interface CostInput {
  liters: number;
  pricePerL?: number;
  totalCost?: number;
}

interface FuelLogCosts {
  pricePerL: number;
  totalCost: number;
}

const roundCurrency = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100;

export function calculateFuelLogCosts({ liters, pricePerL, totalCost }: CostInput): FuelLogCosts {
  if (!Number.isFinite(liters) || liters <= 0) {
    throw new Error('Litres must be a positive number');
  }
  if (pricePerL === undefined && totalCost === undefined) {
    throw new Error('Price per litre or total cost is required');
  }
  if (pricePerL !== undefined && (!Number.isFinite(pricePerL) || pricePerL <= 0)) {
    throw new Error('Price per litre must be a positive number');
  }
  if (totalCost !== undefined && (!Number.isFinite(totalCost) || totalCost <= 0)) {
    throw new Error('Total cost must be a positive number');
  }

  if (pricePerL !== undefined && totalCost !== undefined) {
    const calculatedTotal = roundCurrency(liters * pricePerL);
    if (calculatedTotal !== roundCurrency(totalCost)) {
      throw new Error('Total cost does not match litres × price per litre');
    }
    return { pricePerL: roundCurrency(pricePerL), totalCost: roundCurrency(totalCost) };
  }

  if (pricePerL !== undefined) {
    return { pricePerL: roundCurrency(pricePerL), totalCost: roundCurrency(liters * pricePerL) };
  }

  return { pricePerL: roundCurrency(totalCost! / liters), totalCost: roundCurrency(totalCost!) };
}
