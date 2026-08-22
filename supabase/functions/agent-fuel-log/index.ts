import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1';
import {
  calculateFuelLogCosts,
  canonicalizeAgentFuelLogRequest,
  hasServiceRoleClaim,
  isUuid,
  isValidIsoDate,
  resolveVehicleByMention,
  sha256Hex,
  type AgentVehicle,
} from '../_shared/agent-fuel-log.ts';

const json = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

const isString = (value: unknown, maxLength: number): value is string =>
  typeof value === 'string' && value.trim().length > 0 && value.trim().length <= maxLength;

interface AgentFuelLogResult extends Record<string, unknown> {
  replayed: boolean;
}

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
  const idempotencyKey = payload.idempotency_key;

  if (payload.confirmed !== true) {
    return json({ error: 'A confirmed request is required before saving a final fuel log' }, 400);
  }
  if (!isUuid(idempotencyKey)) {
    return json({ error: 'idempotency_key must be a UUID' }, 400);
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

  const canonicalRequest = canonicalizeAgentFuelLogRequest({
    carId: resolution.car.id,
    filledAt,
    odometerKm: odometerKm as number,
    liters: liters as number,
    pricePerL: costs.pricePerL,
    totalCost: costs.totalCost,
    isPartial,
    station: typeof station === 'string' ? station : null,
    notes: typeof notes === 'string' ? notes : null,
  });
  const payloadHash = await sha256Hex(canonicalRequest);

  const { data: fuelLog, error: saveError } = await supabase
    .rpc('create_agent_fuel_log', {
      p_owner_id: ownerId,
      p_idempotency_key: idempotencyKey,
      p_payload_hash: payloadHash,
      p_car_id: resolution.car.id,
      p_filled_at: filledAt,
      p_odometer_km: odometerKm,
      p_liters: liters,
      p_price_per_l: costs.pricePerL,
      p_total_cost: costs.totalCost,
      p_is_partial: isPartial,
      p_station: typeof station === 'string' ? station.trim() || null : null,
      p_notes: typeof notes === 'string' ? notes.trim() || null : null,
    })
    .single();

  if (saveError) {
    if (saveError.code === 'P0001') {
      return json({ error: 'idempotency_key was already used with a different fuel-log payload' }, 409);
    }
    if (saveError.code === 'P0002') {
      return json({ error: `No vehicle matches "${vehicle.trim()}"` }, 404);
    }
    console.error('Unable to save agent fuel log', saveError);
    return json({ error: 'Unable to save fuel log' }, 500);
  }

  const savedFuelLog = fuelLog as AgentFuelLogResult;
  return json(
    { fuel_log: savedFuelLog, vehicle: resolution.car, replayed: savedFuelLog.replayed },
    savedFuelLog.replayed ? 200 : 201,
  );
});
