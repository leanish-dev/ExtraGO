---
name: Admin seed endpoint
description: Idempotent admin account bootstrap for extraGO
---

Admin bootstrap is available at `POST /api/setup/admin` (no auth required). It is idempotent — safe to call multiple times.

- Email: `leonardoscheffel2000@gmail.com`
- Password: `Gremory26@`
- Hash: `55815ec3857918a0c7accc86eb5f8a645f4e35262b5a0a4ca56057142d0e502f` (SHA-256 of `Gremory26@extragO_salt_2024`)
- Role: `admin`, `isVerified: true`

The endpoint either creates the user or promotes an existing one to admin. Check status via `GET /api/setup/status`.

**Why:** In-memory token store means auth tokens are lost on server restart. The seed endpoint lets the admin always log back in with known credentials without manual DB manipulation.
