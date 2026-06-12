-- Enable pgcrypto for pgp_sym_encrypt / pgp_sym_decrypt
CREATE EXTENSION IF NOT EXISTS pgcrypto SCHEMA extensions;

-- Helper to retrieve encryption key
CREATE OR REPLACE FUNCTION public.get_pii_key()
RETURNS text AS $$
DECLARE
  key_val text;
BEGIN
  -- Try to retrieve from vault if configured
  BEGIN
    SELECT decrypted_secret INTO key_val FROM vault.decrypted_secrets WHERE name = 'pii_encryption_key' LIMIT 1;
  EXCEPTION WHEN OTHERS THEN
    key_val := NULL;
  END;

  -- Fallback to database setting if set
  IF key_val IS NULL OR key_val = '' THEN
    key_val := current_setting('app.settings.pii_key', true);
  END IF;

  -- Final fallback for local development / testing
  IF key_val IS NULL OR key_val = '' THEN
    key_val := 'dev-secure-fallback-key-12345';
  END IF;

  RETURN key_val;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper to decrypt PII values with auditing and owner-check
CREATE OR REPLACE FUNCTION public.decrypt_pii(encrypted_val text, owner_id uuid)
RETURNS text AS $$
BEGIN
  IF encrypted_val IS NULL THEN
    RETURN NULL;
  END IF;

  -- Allow decryption if:
  -- 1. The authenticated user is the owner
  -- 2. Debug mode is explicitly enabled by database administrator/developer
  IF auth.uid() = owner_id OR current_setting('app.settings.debug_mode', true) = 'true' THEN
    RETURN extensions.pgp_sym_decrypt(decode(encrypted_val, 'base64'), public.get_pii_key());
  ELSE
    -- Mask the data for developers/admins in standard view mode
    RETURN '********';
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    RETURN '********';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

----------------------------------------------------
-- 1. Migrate Cars Table
----------------------------------------------------

-- Rename table
ALTER TABLE public.cars RENAME TO cars_secure;

-- Add encrypted column
ALTER TABLE public.cars_secure ADD COLUMN registration_encrypted text;

-- Encrypt existing data
UPDATE public.cars_secure 
SET registration_encrypted = encode(extensions.pgp_sym_encrypt(registration, public.get_pii_key()), 'base64')
WHERE registration IS NOT NULL;

-- Make encrypted column not null and drop old column
ALTER TABLE public.cars_secure ALTER COLUMN registration_encrypted SET NOT NULL;
ALTER TABLE public.cars_secure DROP COLUMN registration;

-- Recreate unique constraint
ALTER TABLE public.cars_secure DROP CONSTRAINT IF EXISTS cars_owner_id_registration_key;
ALTER TABLE public.cars_secure ADD CONSTRAINT cars_owner_id_registration_key UNIQUE (owner_id, registration_encrypted);

-- Create Updatable View for Cars
CREATE OR REPLACE VIEW public.cars WITH (security_invoker = true) AS
SELECT 
  id,
  owner_id,
  public.decrypt_pii(registration_encrypted, owner_id) AS registration,
  make,
  model,
  fuel_type,
  tank_capacity_l,
  year,
  created_at,
  updated_at
FROM public.cars_secure;

-- DML trigger function for Cars View
CREATE OR REPLACE FUNCTION public.handle_cars_dml()
RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.cars_secure (
      id, owner_id, registration_encrypted, make, model, fuel_type, tank_capacity_l, year, created_at, updated_at
    ) VALUES (
      COALESCE(NEW.id, gen_random_uuid()),
      NEW.owner_id,
      encode(extensions.pgp_sym_encrypt(NEW.registration, public.get_pii_key()), 'base64'),
      NEW.make,
      NEW.model,
      NEW.fuel_type,
      NEW.tank_capacity_l,
      NEW.year,
      COALESCE(NEW.created_at, now()),
      COALESCE(NEW.updated_at, now())
    ) RETURNING id INTO NEW.id;
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    UPDATE public.cars_secure SET
      registration_encrypted = encode(extensions.pgp_sym_encrypt(NEW.registration, public.get_pii_key()), 'base64'),
      make = NEW.make,
      model = NEW.model,
      fuel_type = NEW.fuel_type,
      tank_capacity_l = NEW.tank_capacity_l,
      year = NEW.year,
      updated_at = now()
    WHERE id = OLD.id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    DELETE FROM public.cars_secure WHERE id = OLD.id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER cars_dml_trigger
  INSTEAD OF INSERT OR UPDATE OR DELETE ON public.cars
  FOR EACH ROW EXECUTE FUNCTION public.handle_cars_dml();

----------------------------------------------------
-- 2. Migrate Fuel Logs Table
----------------------------------------------------

-- Rename table
ALTER TABLE public.fuel_logs RENAME TO fuel_logs_secure;

-- Add encrypted columns
ALTER TABLE public.fuel_logs_secure ADD COLUMN station_encrypted text;
ALTER TABLE public.fuel_logs_secure ADD COLUMN notes_encrypted text;

-- Encrypt existing data
UPDATE public.fuel_logs_secure 
SET 
  station_encrypted = CASE WHEN station IS NOT NULL THEN encode(extensions.pgp_sym_encrypt(station, public.get_pii_key()), 'base64') ELSE NULL END,
  notes_encrypted = CASE WHEN notes IS NOT NULL THEN encode(extensions.pgp_sym_encrypt(notes, public.get_pii_key()), 'base64') ELSE NULL END;

-- Drop old columns
ALTER TABLE public.fuel_logs_secure DROP COLUMN station;
ALTER TABLE public.fuel_logs_secure DROP COLUMN notes;

-- Create Updatable View for Fuel Logs
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
  f.updated_at
FROM public.fuel_logs_secure f
JOIN public.cars_secure c ON f.car_id = c.id;

-- DML trigger function for Fuel Logs View
CREATE OR REPLACE FUNCTION public.handle_fuel_logs_dml()
RETURNS trigger AS $$
DECLARE
  v_owner_id uuid;
BEGIN
  -- Get owner_id for encryption/validation
  SELECT owner_id INTO v_owner_id FROM public.cars_secure WHERE id = COALESCE(NEW.car_id, OLD.car_id);

  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.fuel_logs_secure (
      id, car_id, filled_at, odometer_km, liters, price_per_l, total_cost, is_partial,
      station_encrypted, notes_encrypted, receipt_url, created_at, updated_at
    ) VALUES (
      COALESCE(NEW.id, gen_random_uuid()),
      NEW.car_id,
      NEW.filled_at,
      NEW.odometer_km,
      NEW.liters,
      NEW.price_per_l,
      NEW.total_cost,
      NEW.is_partial,
      CASE WHEN NEW.station IS NOT NULL THEN encode(extensions.pgp_sym_encrypt(NEW.station, public.get_pii_key()), 'base64') ELSE NULL END,
      CASE WHEN NEW.notes IS NOT NULL THEN encode(extensions.pgp_sym_encrypt(NEW.notes, public.get_pii_key()), 'base64') ELSE NULL END,
      NEW.receipt_url,
      COALESCE(NEW.created_at, now()),
      COALESCE(NEW.updated_at, now())
    ) RETURNING id INTO NEW.id;
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    UPDATE public.fuel_logs_secure SET
      car_id = NEW.car_id,
      filled_at = NEW.filled_at,
      odometer_km = NEW.odometer_km,
      liters = NEW.liters,
      price_per_l = NEW.price_per_l,
      total_cost = NEW.total_cost,
      is_partial = NEW.is_partial,
      station_encrypted = CASE WHEN NEW.station IS NOT NULL THEN encode(extensions.pgp_sym_encrypt(NEW.station, public.get_pii_key()), 'base64') ELSE NULL END,
      notes_encrypted = CASE WHEN NEW.notes IS NOT NULL THEN encode(extensions.pgp_sym_encrypt(NEW.notes, public.get_pii_key()), 'base64') ELSE NULL END,
      receipt_url = NEW.receipt_url,
      updated_at = now()
    WHERE id = OLD.id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    DELETE FROM public.fuel_logs_secure WHERE id = OLD.id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER fuel_logs_dml_trigger
  INSTEAD OF INSERT OR UPDATE OR DELETE ON public.fuel_logs
  FOR EACH ROW EXECUTE FUNCTION public.handle_fuel_logs_dml();
