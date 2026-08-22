-- Supabase default privileges may grant EXECUTE to anon/authenticated explicitly.
-- The agent write RPC is only callable by the Edge Function's service-role client.
REVOKE ALL ON FUNCTION public.create_agent_fuel_log(
  uuid, uuid, text, uuid, date, numeric, numeric, numeric, numeric, boolean, text, text
) FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.create_agent_fuel_log(
  uuid, uuid, text, uuid, date, numeric, numeric, numeric, numeric, boolean, text, text
) TO service_role;
