---
name: Stabilization Phases 1-11
description: Key decisions and fixes from the 11-phase stabilization run. Covers wallet units, verification gate, check-in UX, notifications, push, CEO protection.
---

## Wallet Unit Convention (Phase 4 fix)
- Wallet (balance, reservedBalance, pendingBalance) stored as **INTEGER CENTS** in DB.
- Deposits and withdrawals are sent from frontend as cents (`Math.round(float * 100)`).
- Job rates (hourlyRate, dailyRate, totalValue) are stored as **FLOAT BRL**.
- **Bug fixed**: jobs.ts was adding BRL `reservationAmount` directly to cent-denominated wallet fields.
- **Fix**: convert `reservationAmount * 100` to cents before all wallet DB writes/reads.
- **Pattern**: always multiply job BRL values by 100 before wallet operations; always divide wallet values by 100 before displaying in BRL.

**Why**: Mixed units caused `balance / 100` display code to show wrong values (reservation showed R$4.60 instead of R$460).

## Verification Gate (Phase 8)
- `ProtectedRoute` in `App.tsx` now accepts `requireVerified` prop (default: `true`).
- Unverified non-admin users are redirected to `/verification-center`.
- Exempt routes (use `requireVerified={false}`): `/app/profile`, `/app/settings`, `/app/notifications`, `/verification-center`, `/onboarding`.
- Admin role always bypasses the verification check.

**Why**: Users were accessing the full ecosystem without completing KYC.

## CEO / super_admin Protection (Phase 1)
- `POST /admin/kyc/users/:id/suspend` and `POST /admin/kyc/users/:id/reject` now return 403 for any user with `adminRole='super_admin'` or `corporateRole='ceo'`.
- The `PATCH /users/:id` route already only allows profile fields (no role/adminRole changes) — no change needed there.
- CEO permissions restored by running `POST /api/setup/seed` after every server reset (idempotent).

**Why**: Guards against accidental suspension of governance accounts through admin UI.

## Onboarding Redirect Fix (Phase 6)
- `useEffect` in `onboarding.tsx` that redirects to `/verification-center` now has `if (step >= 7) return` guard.
- Prevents premature redirect during document upload (step 7) if user object gets refetched mid-upload.

## Check-in/Checkout Code UX (Phase 3)
- `CodeValidationPanel`: 6 individual OTP-style digit inputs with auto-advance, paste support, and backspace-to-previous.
- `GenerateCodesPanel`: before generating = simple CTA; after = hero 6-digit code at `text-6xl`, countdown timer, copy + share buttons (Web Share API with clipboard fallback).
- Share button sends the freelancer code; company code shown secondary.

## Notifications Wiring (Phase 9)
- Added types to `TYPE_CLASSIFICATION`: `checkin_completed`, `checkout_completed`, `job_started`, `application_accepted`, `documents_uploaded`, `wallet_reserved`.
- `job-execution.ts` now calls `createNotification` after checkin and checkout validation for company and all approved applicants.
- `applicationsTable` is properly imported from `@workspace/db` (confirmed export).

## Push Notification Architecture (Phase 10)
- Service worker at `artifacts/extrag0/public/sw.js` handles push events and notification clicks.
- Registration hook at `artifacts/extrag0/src/hooks/use-push-notifications.ts` — registers SW, requests permission, subscribes, sends subscription to API.
- Backend routes in `artifacts/api-server/src/routes/push.ts`: GET /push/vapid-key, POST /push/subscribe, POST /push/unsubscribe.
- Subscriptions stored in `platform_config` table as `push_sub:{userId}:{endpointHash}` keys (no new DB table needed).
- Requires `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT` env vars to activate. Without them, subscribe returns 503.

## Post-Job Form Defaults (Phase 2)
- Default shiftType changed to `"daily"`.
- Default endTime changed to `"15:20"` (7h20 workday: 08:00 → 15:20).
- Daily rate minimum raised to R$180 in both Zod schema and HTML `min` attribute.
- Shift type toggle now shows "Diária" first, then "Por Hora".

## Face Scan Camera Toggle (Phase 5)
- Added `facingMode` state to `FaceScanCapture` and `hasDualCamera` detection via `enumerateDevices`.
- Camera flip button (FlipHorizontal icon) appears when `hasDualCamera` is true.
- Mirror effect (`scaleX(-1)`) now only applied when `facingMode === "user"`.
- `startCamera` accepts `overrideFacingMode` parameter for toggle use.
