-- Alter cars_secure table to add localization columns
ALTER TABLE public.cars_secure ADD COLUMN IF NOT EXISTS currency text NOT null DEFAULT 'INR' CONSTRAINT cars_currency_check CHECK (currency IN ('INR', 'USD', 'EUR', 'GBP', 'CAD', 'AUD'));
ALTER TABLE public.cars_secure ADD COLUMN IF NOT EXISTS distance_unit text NOT null DEFAULT 'km' CONSTRAINT cars_distance_unit_check CHECK (distance_unit IN ('km', 'mi'));
ALTER TABLE public.cars_secure ADD COLUMN IF NOT EXISTS volume_unit text NOT null DEFAULT 'L' CONSTRAINT cars_volume_unit_check CHECK (volume_unit IN ('L', 'gal'));

-- Drop existing view to rebuild with new columns
DROP VIEW IF EXISTS public.cars CASCADE;

-- Recreate view including the localization columns
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
  currency,
  distance_unit,
  volume_unit,
  created_at,
  updated_at
FROM public.cars_secure;

-- Recreate the DML trigger function to handle the new columns
CREATE OR REPLACE FUNCTION public.handle_cars_dml()
RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.cars_secure (
      id, owner_id, registration_encrypted, make, model, fuel_type, tank_capacity_l, year, currency, distance_unit, volume_unit, created_at, updated_at
    ) VALUES (
      COALESCE(NEW.id, gen_random_uuid()),
      NEW.owner_id,
      encode(extensions.pgp_sym_encrypt(NEW.registration, public.get_pii_key()), 'base64'),
      NEW.make,
      NEW.model,
      NEW.fuel_type,
      NEW.tank_capacity_l,
      NEW.year,
      COALESCE(NEW.currency, 'INR'),
      COALESCE(NEW.distance_unit, 'km'),
      COALESCE(NEW.volume_unit, 'L'),
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
      currency = COALESCE(NEW.currency, 'INR'),
      distance_unit = COALESCE(NEW.distance_unit, 'km'),
      volume_unit = COALESCE(NEW.volume_unit, 'L'),
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

-- Re-create the INSTEAD OF trigger on the view
CREATE TRIGGER cars_dml_trigger
  INSTEAD OF INSERT OR UPDATE OR DELETE ON public.cars
  FOR EACH ROW EXECUTE FUNCTION public.handle_cars_dml();
