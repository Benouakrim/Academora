# Deprecated: ngrok Quick Start

This document is deprecated. We’ve removed webhook-based user synchronization and ngrok tunnels.

Use the new approach:
- Dual-Write: client triggers `POST /api/users/sync` after signup/profile updates (non-blocking).
- Self-Healing: backend ensures the Neon user exists on authenticated requests.

See README for the full Dual-Write + Self-Healing specs and how to test locally.

