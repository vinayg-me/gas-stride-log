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
  "idempotency_key": "8a2cda77-aeaa-4aa9-b40a-8b3276e8bc85",
  "vehicle": "Hycross",
  "filled_at": "2026-08-22",
  "odometer_km": 17398,
  "liters": 63.14,
  "price_per_l": 137.98,
  "station": "Shell Power",
  "is_partial": false
}
```

Generate a UUID `idempotency_key` once when a pending entry is created, then preserve it for the final confirmed invocation and any transport retry. Do not reuse a key for another fuel entry.

Send either `price_per_l` or `total_cost`; when both are provided, the function rejects inconsistent values rather than correcting them silently.

## Idempotency and audit behavior

- A first accepted request returns `201` with `replayed: false`.
- A retry with the same key and exactly the same persisted fuel values returns the original entry with `200` and `replayed: true`; it does not create a second log.
- Reusing a key with a changed canonical fuel payload returns `409` and makes no mutation.
- Agent-created logs record `source: "agent"`. A private, service-role-only audit ledger stores the UUID request ID, server-side confirmation time, and SHA-256 canonical-payload fingerprint. The fingerprint is never exposed through the public view or endpoint response.
- `404` means no vehicle matched. A vehicle ambiguity or idempotency-payload conflict returns `409`.
