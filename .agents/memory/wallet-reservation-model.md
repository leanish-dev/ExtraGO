---
name: Wallet reservation model (job-level, single reservation)
description: How Extra (job) wallet reservations work — one reservation per job, cents convention, and a known deferred payout gap.
---

## Model
- Wallet `balance`/`reservedBalance`/`transactions.amount` are in **integer cents**. Job fields (`hourlyRate`, `dailyRate`, `totalValue`) are **BRL floats**. Any code that feeds a job BRL amount into a wallet field must multiply by 100 first.
- Exactly ONE reservation is created per Extra (job), at creation time, for `totalValue * 1.15` (the 1.15 buffer is described in code as covering the platform fee). It is created inside a single `db.transaction()` together with the job insert — if either step fails, nothing is left reserved.
- Approving/rejecting individual applications must NOT create or release wallet reservations — the reservation is shared across all `workersNeeded` slots of the job, not per-application. Only cancelling/completing the whole job releases it.

**Why:** a previous implementation reserved funds again per-approved-application (`reserveCompanyFunds`) on top of the job-level reservation, over-reserving up to ~6x for multi-worker jobs, and also had a `ReferenceError` (undefined variable) in the job-creation logging call that crashed *after* the reservation/job were already committed — causing 500s that led to retried/duplicate reservations.

## Known deferred gap (not fixed — needs a product decision)
`POST /applications/:id/complete` runs the real payout cascade (`completeJobCascade` in `lib/ecosystem.ts`) but **no live checkout flow calls it** — `validate-checkout` in `job-execution.ts` only releases the company's reservation, it never pays the freelancer. Additionally `completeJobCascade` treats its `jobValue` argument as cents but callers pass `job.totalValue` (BRL) unconverted — a 100x underpayment bug if wired up naively. Wiring checkout → payout correctly requires deciding how to split `totalValue` across multiple approved workers and how the 15% company-side buffer should be captured (as platform revenue vs refunded) — left unresolved as it's a design decision beyond a stabilization fix.
