-- Rollback script for 20260612000001_pii_encryption.sql
-- Restores original tables and decrypts sensitive columns back to plaintext.

BEGIN;

-- 1. Drop trigger on views
DROP TRIGGER IF EXISTS cars_dml_trigger ON public.cars;
DROP TRIGGER IF EXISTS fuel_logs_dml_trigger ON public.fuel_logs;

-- 2. Drop triggers DML helper functions
DROP FUNCTION IF EXISTS public.handle_cars_dml();
DROP FUNCTION IF EXISTS public.handle_fuel_logs_dml();

-- 3. Drop views
DROP VIEW IF EXISTS public.cars;
DROP VIEW IF EXISTS public.fuel_logs;

-- 4. Revert Fuel Logs Table
ALTER TABLE public.fuel_logs_secure RENAME TO fuel_logs;
ALTER TABLE public.fuel_logs ADD COLUMN station text;
ALTER TABLE public.fuel_logs ADD COLUMN notes text;

-- Decrypt and restore data using pgp_sym_decrypt
UPDATE public.fuel_logs SET 
  station = CASE WHEN station_encrypted IS NOT NULL THEN extensions.pgp_sym_decrypt(decode(station_encrypted, 'base64'), public.get_pii_key()) ELSE NULL END,
  notes = CASE WHEN notes_encrypted IS NOT NULL THEN extensions.pgp_sym_decrypt(decode(notes_encrypted, 'base64'), public.get_pii_key()) ELSE NULL END;

-- Drop encrypted columns
ALTER TABLE public.fuel_logs DROP COLUMN station_encrypted;
ALTER TABLE public.fuel_logs DROP COLUMN notes_encrypted;

-- 5. Revert Cars Table
ALTER TABLE public.cars_secure RENAME TO cars;
ALTER TABLE public.cars ADD COLUMN registration text;

-- Decrypt and restore data using pgp_sym_decrypt
UPDATE public.cars SET 
  registration = extensions.pgp_sym_decrypt(decode(registration_encrypted, 'base64'), public.get_pii_key())
WHERE registration_encrypted IS NOT NULL;

-- Enforce constraints and drop encrypted column
ALTER TABLE public.cars ALTER COLUMN registration SET NOT NULL;
ALTER TABLE public.cars DROP COLUMN registration_encrypted;

-- Recreate original unique constraint on cars
ALTER TABLE public.cars DROP CONSTRAINT IF EXISTS cars_owner_id_registration_key;
ALTER TABLE public.cars ADD CONSTRAINT cars_owner_id_registration_key UNIQUE (owner_id, registration);

-- 6. Clean up decrypt/key functions
DROP FUNCTION IF EXISTS public.decrypt_pii(text, uuid);
DROP FUNCTION IF EXISTS public.get_pii_key();

COMMIT;
