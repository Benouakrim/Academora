# Deprecated: ngrok + Webhooks

This guide is deprecated. AcademOra now uses a Dual-Write + Self-Healing authentication architecture with Clerk and Neon.

What changed:
- Dual-Write: after successful signup/profile changes, the client calls `POST /api/users/sync` to upsert the user into Neon in the background.
- Self-Healing (JIT): whenever an authenticated user hits the app, the backend ensures their Neon record exists via an idempotent upsert.

Implications:
- No ngrok tunnels or external webhooks are required for user sync in development or production.
- The previous Clerk webhook and ngrok setup are no longer needed.

See README “Authentication: Dual-Write + Self-Healing” for details.

