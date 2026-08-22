import { describe, expect, it } from 'vitest';
import {
  calculateFuelLogCosts,
  hasServiceRoleClaim,
  isValidIsoDate,
  resolveVehicleByMention,
  type AgentVehicle,
} from './agent-fuel-log';

const cars: AgentVehicle[] = [
  { id: 'hycross', make: 'Toyota', model: 'Innova Hycross', registration: 'KA-01-AA-1001' },
  { id: 'xuv300', make: 'Mahindra', model: 'XUV300', registration: 'KA-02-BB-2002' },
];

describe('resolveVehicleByMention', () => {
  it('matches a vehicle model regardless of case or punctuation', () => {
    expect(resolveVehicleByMention(cars, 'XUV 300')).toEqual({
      status: 'matched',
      car: cars[1],
    });
  });

  it('matches a partial distinctive model mention', () => {
    expect(resolveVehicleByMention(cars, 'hycross')).toEqual({
      status: 'matched',
      car: cars[0],
    });
  });

  it('refuses to guess when a model mention is ambiguous', () => {
    const result = resolveVehicleByMention(
      [
        ...cars,
        { id: 'hycross-2', make: 'Toyota', model: 'Innova Hycross', registration: 'KA-03-CC-3003' },
      ],
      'hycross',
    );

    expect(result).toEqual({ status: 'ambiguous', cars: [cars[0], expect.objectContaining({ id: 'hycross-2' })] });
  });

  it('reports no match for an unknown vehicle', () => {
    expect(resolveVehicleByMention(cars, 'City')).toEqual({ status: 'not_found' });
  });

  it('rejects short and partial mentions instead of guessing', () => {
    expect(resolveVehicleByMention(cars, '3')).toEqual({ status: 'not_found' });
    expect(resolveVehicleByMention(cars, 'toy')).toEqual({ status: 'not_found' });
  });
});

describe('isValidIsoDate', () => {
  it('accepts real calendar dates including leap days', () => {
    expect(isValidIsoDate('2024-02-29')).toBe(true);
  });

  it('rejects impossible calendar dates', () => {
    expect(isValidIsoDate('2026-02-31')).toBe(false);
    expect(isValidIsoDate('2026-13-01')).toBe(false);
    expect(isValidIsoDate('2025-02-29')).toBe(false);
  });
});

describe('hasServiceRoleClaim', () => {
  const jwtWithRole = (role: string) => `Bearer header.${btoa(JSON.stringify({ role })).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')}.signature`;

  it('accepts only a service-role JWT claim', () => {
    expect(hasServiceRoleClaim(jwtWithRole('service_role'))).toBe(true);
    expect(hasServiceRoleClaim(jwtWithRole('authenticated'))).toBe(false);
    expect(hasServiceRoleClaim('not-a-jwt')).toBe(false);
  });
});

describe('calculateFuelLogCosts', () => {
  it('calculates total cost from litres and unit price', () => {
    expect(calculateFuelLogCosts({ liters: 63.14, pricePerL: 137.98 })).toEqual({
      pricePerL: 137.98,
      totalCost: 8712.06,
    });
  });

  it('calculates unit price from litres and total cost', () => {
    expect(calculateFuelLogCosts({ liters: 40, totalCost: 4220 })).toEqual({
      pricePerL: 105.5,
      totalCost: 4220,
    });
  });

  it('rejects mismatched totals rather than silently overwriting the caller value', () => {
    expect(() => calculateFuelLogCosts({ liters: 40, pricePerL: 105.5, totalCost: 4000 })).toThrow(
      'Total cost does not match litres × price per litre',
    );
  });
});
