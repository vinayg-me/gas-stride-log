# Agent fuel-log endpoint

`agent-fuel-log` is a server-to-server Supabase Edge Function for recording a **final** fuel log only after the user has explicitly confirmed it in the agent conversation.

## Security boundary

- The function accepts only `POST` requests.
- Supabase gateway JWT validation stays enabled. The function permits only a validated `service_role` JWT, supplied by Composio when it invokes the function with `auth_mode: service_role`.
- `FUELTRACKR_AGENT_OWNER_ID` binds the endpoint to one Supabase user. The request cannot choose another user.
- The caller supplies a vehicle mention, not a database ID. The function resolves it only among that owner's model names and returns `409` rather than guessing when it is ambiguous.
- `confirmed: true` is mandatory. Hermes must send it only after the user has explicitly confirmed the full entry in Telegram.
- No service-role key is sent or retained by Hermes; Composio holds and supplies it for the invocation.

## Deployment

Set only the fixed owner binding as an Edge Function secret:

```bash
supabase secrets set FUELTRACKR_AGENT_OWNER_ID='your-auth-user-uuid'
supabase functions deploy agent-fuel-log
```

Invoke the function through the approved Composio Supabase connection using `auth_mode: service_role`. Do not create, copy, or retain a separate long-lived agent write token.

## Request contract

```json
{
  "confirmed": true,
  "vehicle": "Hycross",
  "filled_at": "2026-08-22",
  "odometer_km": 17398,
  "liters": 63.14,
  "price_per_l": 137.98,
  "station": "Shell Power",
  "is_partial": false
}
```

Send either `price_per_l` or `total_cost`; when both are provided, the function rejects inconsistent values rather than correcting them silently.

A successful response returns the saved fuel log and matched vehicle. `404` means no vehicle matched, and `409` means the mention matched more than one vehicle.
