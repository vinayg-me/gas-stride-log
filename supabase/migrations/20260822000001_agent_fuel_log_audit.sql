-- Agent retry/audit metadata is private: browser clients continue to use public.fuel_logs
-- while the service-role Edge Function uses the RPC below for atomic writes and replays.
ALTER TABLE public.fuel_logs_secure
  ADD COLUMN source text NOT NULL DEFAULT 'manual',
  ADD CONSTRAINT fuel_logs_secure_source_check CHECK (source IN ('manual', 'agent'));

CREATE TABLE public.agent_fuel_log_requests (
  idempotency_key uuid PRIMARY KEY,
  fuel_log_id uuid NOT NULL UNIQUE REFERENCES public.fuel_logs_secure(id) ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED,
  owner_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  payload_hash text NOT NULL,
  confirmed_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.agent_fuel_log_requests ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.agent_fuel_log_requests FROM anon, authenticated;

-- Preserve the original view columns/order and append only non-sensitive provenance.
CREATE OR REPLACE VIEW public.fuel_logs WITH (security_invoker = true) AS
SELECT
  f.id,
  f.car_id,
  f.filled_at,
  f.odometer_km,
  f.liters,
  f.price_per_l,
  f.total_cost,
  f.is_partial,
  public.decrypt_pii(f.station_encrypted, c.owner_id) AS station,
  public.decrypt_pii(f.notes_encrypted, c.owner_id) AS notes,
  f.receipt_url,
  f.created_at,
  f.updated_at,
  f.source
FROM public.fuel_logs_secure f
JOIN public.cars_secure c ON f.car_id = c.id;

CREATE OR REPLACE FUNCTION public.create_agent_fuel_log(
  p_owner_id uuid,
  p_idempotency_key uuid,
  p_payload_hash text,
  p_car_id uuid,
  p_filled_at date,
  p_odometer_km numeric,
  p_liters numeric,
  p_price_per_l numeric,
  p_total_cost numeric,
  p_is_partial boolean,
  p_station text,
  p_notes text
)
RETURNS TABLE (
  id uuid,
  car_id uuid,
  filled_at date,
  odometer_km numeric,
  liters numeric,
  price_per_l numeric,
  total_cost numeric,
  is_partial boolean,
  station text,
  notes text,
  receipt_url text,
  source text,
  agent_request_id uuid,
  agent_confirmed_at timestamptz,
  created_at timestamptz,
  updated_at timestamptz,
  replayed boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  v_fuel_log_id uuid := gen_random_uuid();
  v_existing public.agent_fuel_log_requests%ROWTYPE;
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM public.cars_secure
    WHERE id = p_car_id AND owner_id = p_owner_id
  ) THEN
    RAISE EXCEPTION 'Vehicle does not belong to the configured owner' USING ERRCODE = 'P0002';
  END IF;

  INSERT INTO public.agent_fuel_log_requests (
    idempotency_key, fuel_log_id, owner_id, payload_hash, confirmed_at
  ) VALUES (
    p_idempotency_key, v_fuel_log_id, p_owner_id, p_payload_hash, now()
  ) ON CONFLICT (idempotency_key) DO NOTHING;

  IF NOT FOUND THEN
    SELECT * INTO v_existing
    FROM public.agent_fuel_log_requests
    WHERE idempotency_key = p_idempotency_key;

    IF v_existing.payload_hash <> p_payload_hash THEN
      RAISE EXCEPTION 'Idempotency key was already used with a different fuel-log payload' USING ERRCODE = 'P0001';
    END IF;

    RETURN QUERY
    SELECT
      f.id, f.car_id, f.filled_at, f.odometer_km, f.liters, f.price_per_l,
      f.total_cost, f.is_partial, p_station, p_notes, f.receipt_url, f.source,
      v_existing.idempotency_key, v_existing.confirmed_at, f.created_at, f.updated_at, true
    FROM public.fuel_logs_secure f
    WHERE f.id = v_existing.fuel_log_id;
    RETURN;
  END IF;

  INSERT INTO public.fuel_logs_secure (
    id, car_id, filled_at, odometer_km, liters, price_per_l, total_cost, is_partial,
    station_encrypted, notes_encrypted, source
  ) VALUES (
    v_fuel_log_id, p_car_id, p_filled_at, p_odometer_km, p_liters, p_price_per_l, p_total_cost, p_is_partial,
    CASE WHEN p_station IS NOT NULL THEN encode(extensions.pgp_sym_encrypt(p_station, public.get_pii_key()), 'base64') ELSE NULL END,
    CASE WHEN p_notes IS NOT NULL THEN encode(extensions.pgp_sym_encrypt(p_notes, public.get_pii_key()), 'base64') ELSE NULL END,
    'agent'
  );

  RETURN QUERY
  SELECT
    f.id, f.car_id, f.filled_at, f.odometer_km, f.liters, f.price_per_l,
    f.total_cost, f.is_partial, p_station, p_notes, f.receipt_url, f.source,
    p_idempotency_key, r.confirmed_at, f.created_at, f.updated_at, false
  FROM public.fuel_logs_secure f
  JOIN public.agent_fuel_log_requests r ON r.fuel_log_id = f.id
  WHERE f.id = v_fuel_log_id;
END;
$$;

REVOKE ALL ON FUNCTION public.create_agent_fuel_log(
  uuid, uuid, text, uuid, date, numeric, numeric, numeric, numeric, boolean, text, text
) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_agent_fuel_log(
  uuid, uuid, text, uuid, date, numeric, numeric, numeric, numeric, boolean, text, text
) TO service_role;
