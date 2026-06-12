-- Widen the fuel_type check constraint to support multiple vehicle types
ALTER TABLE public.cars_secure DROP CONSTRAINT IF EXISTS cars_fuel_type_check;
ALTER TABLE public.cars_secure ADD CONSTRAINT cars_fuel_type_check CHECK (fuel_type IN ('petrol', 'diesel', 'electric', 'hybrid', 'cng', 'lpg'));
