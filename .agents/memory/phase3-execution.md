---
name: Phase 3 Execution Engine
description: Extra operational flow — new DB tables, 9-state status machine, check-in/checkout codes, wallet reservation, daily shift type
---

## New DB Tables (lib/db/src/schema/)
- `job-events.ts` → `job_events` — immutable audit log (eventType enum, actorId, actorRole, ip, gps jsonb, metadata jsonb)
- `job-codes.ts` → `job_codes` — 6-digit PIN codes for check-in/checkout (codeType: checkin_company/checkin_freelancer/checkout_company/checkout_freelancer, expiresAt, usedAt, usedByUserId)
- Both exported from schema/index.ts

## Job Status Machine (9 states in jobStatusEnum)
open → scheduled → waiting_checkin → in_progress → on_break → waiting_checkout → completed
Also: checked_in, cancelled, disputed

## New API Routes (artifacts/api-server/src/routes/job-execution.ts)
- POST /jobs/:id/generate-checkin-codes (company only) → creates 2 codes, sets status=waiting_checkin
- GET  /jobs/:id/codes/active → filtered by role
- POST /jobs/:id/validate-checkin → validates OTHER party's code, starts job when validated
- POST /jobs/:id/generate-checkout-codes (company only) → creates 2 codes, sets status=waiting_checkout
- POST /jobs/:id/validate-checkout → validates code, sets status=completed, releases wallet reservation
- GET  /jobs/:id/events → audit log
- POST /jobs/:id/update-status → admin/company manual override

## Wallet Reservation (jobs.ts POST /jobs)
- Reservation = totalValue × 1.15 (includes 15% platform fee)
- Returns 402 with {error, required, available} if availableBalance < reservationAmount
- On cancel: releases reservation (reservedBalance -= amount), inserts "release" transaction
- On checkout: releases reservation via job-execution.ts

## Daily Shift Type
- `shiftType` field added to jobsTable (enum: "hourly" | "daily"), `dailyRate` optional field
- Daily = 440 min = 7h20min (CLT standard)
- post-job.tsx: toggle auto-fills endTime; dailyRate input replaces hourlyRate when daily selected
- job-detail.tsx shows "Diária" badge and "7h 20min" duration

## Face Scan Fix (facescan-capture.tsx)
- Added `autoPlay` attribute to <video> (required for iOS Safari getUserMedia display)
- Canvas mirror: translate(width,0) scale(-1,1) for front-camera selfie
- Better error labels for NotAllowedError/NotFoundError/NotReadableError
- `autoStart` prop for programmatic launch
- `starting` state prevents double-click spam

**Why:** iOS Safari requires autoPlay+playsInline+muted all present on video element; missing autoPlay silently fails to show stream even when getUserMedia succeeds.
