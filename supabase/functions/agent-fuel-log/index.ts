import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1';
import {
  calculateFuelLogCosts,
  hasServiceRoleClaim,
  isValidIsoDate,
  resolveVehicleByMention,
  type AgentVehicle,
} from '../_shared/agent-fuel-log.ts';

const json = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

const isString = (value: unknown, maxLength: number): value is string =>
  typeof value === 'string' && value.trim().length > 0 && value.trim().length <= maxLength;

Deno.serve(async (request) => {
  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  const ownerId = Deno.env.get('FUELTRACKR_AGENT_OWNER_ID');
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  // Supabase validates this JWT before the function is invoked (verify_jwt = true).
  // The extra role check ensures that normal user JWTs cannot write to the fixed owner.
  if (!hasServiceRoleClaim(request.headers.get('Authorization'))) {
    return json({ error: 'Service-role authorization is required' }, 401);
  }
  if (!ownerId || !supabaseUrl || !serviceRoleKey) {
    return json({ error: 'Agent intake is not configured' }, 503);
  }

  let payload: Record<string, unknown>;
  try {
    payload = await request.json();
  } catch {
    return json({ error: 'Request body must be valid JSON' }, 400);
  }

  const vehicle = payload.vehicle;
  const filledAt = payload.filled_at;
  const odometerKm = payload.odometer_km;
  const liters = payload.liters;
  const pricePerL = payload.price_per_l;
  const totalCost = payload.total_cost;
  const station = payload.station;
  const notes = payload.notes;
  const isPartial = payload.is_partial ?? false;

  if (payload.confirmed !== true) {
    return json({ error: 'A confirmed request is required before saving a final fuel log' }, 400);
  }
  if (!isString(vehicle, 100) || !isString(filledAt, 10) || !isValidIsoDate(filledAt)) {
    return json({ error: 'vehicle and a valid filled_at date (YYYY-MM-DD) are required' }, 400);
  }
  if (!Number.isFinite(odometerKm) || (odometerKm as number) <= 0 || (odometerKm as number) > 9_999_999) {
    return json({ error: 'odometer_km must be a positive number up to 9999999' }, 400);
  }
  if (!Number.isFinite(liters) || (liters as number) <= 0 || (liters as number) > 500) {
    return json({ error: 'liters must be a positive number up to 500' }, 400);
  }
  if (station !== undefined && station !== '' && !isString(station, 100)) {
    return json({ error: 'station must be at most 100 characters' }, 400);
  }
  if (notes !== undefined && notes !== '' && !isString(notes, 500)) {
    return json({ error: 'notes must be at most 500 characters' }, 400);
  }
  if (typeof isPartial !== 'boolean') return json({ error: 'is_partial must be a boolean' }, 400);

  let costs: { pricePerL: number; totalCost: number };
  try {
    costs = calculateFuelLogCosts({
      liters: liters as number,
      pricePerL: pricePerL as number | undefined,
      totalCost: totalCost as number | undefined,
    });
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : 'Invalid cost values' }, 400);
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });
  const { data: cars, error: carsError } = await supabase
    .from('cars')
    .select('id, make, model')
    .eq('owner_id', ownerId);

  if (carsError) {
    console.error('Unable to load owner cars', carsError);
    return json({ error: 'Unable to resolve vehicle' }, 500);
  }

  const resolution = resolveVehicleByMention((cars ?? []) as AgentVehicle[], vehicle.trim());
  if (resolution.status === 'not_found') {
    return json({ error: `No vehicle matches "${vehicle.trim()}"` }, 404);
  }
  if (resolution.status === 'ambiguous') {
    return json({
      error: `Vehicle mention "${vehicle.trim()}" matches more than one vehicle`,
      matches: resolution.cars.map(({ id, make, model }) => ({ id, make, model })),
    }, 409);
  }

  const { data: fuelLog, error: insertError } = await supabase
    .from('fuel_logs')
    .insert({
      car_id: resolution.car.id,
      filled_at: filledAt,
      odometer_km: odometerKm,
      liters,
      price_per_l: costs.pricePerL,
      total_cost: costs.totalCost,
      is_partial: isPartial,
      station: typeof station === 'string' ? station.trim() || null : null,
      notes: typeof notes === 'string' ? notes.trim() || null : null,
    })
    .select('id, car_id, filled_at, odometer_km, liters, price_per_l, total_cost, is_partial, station, notes')
    .single();

  if (insertError) {
    console.error('Unable to save agent fuel log', insertError);
    return json({ error: 'Unable to save fuel log' }, 500);
  }

  return json({ fuel_log: fuelLog, vehicle: resolution.car });
});
