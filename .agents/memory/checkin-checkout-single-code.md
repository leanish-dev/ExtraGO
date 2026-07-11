---
name: Check-in/checkout single-code model
description: Company generates one code and never types one; only the freelancer validates it. Explains the "panel disappears immediately" symptom.
---

## Model
- `generate-checkin-codes` / `generate-checkout-codes` create exactly ONE code (`checkin_company` / `checkout_company`), owned by the company, shared out-of-band (copy/share) with the freelancer. There is no separate "freelancer code".
- `validate-checkin` / `validate-checkout` reject the request with 403 if `user.role === "company"` — only the freelancer (or admin) may submit a code. A single successful validation immediately advances the job status (no more two-sided "wait for both" logic).
- `GET /jobs/:id/codes/active` returns the active company code to whoever is allowed to see it (company owner or the job's approved freelancer) — used by the frontend to restore the code display after a remount/refresh.

**Why:** the two-sided design previously let the company also validate a code (violating "company never types a code") and, on the frontend, the code-generation panel's visibility condition excluded the "waiting_checkin"/"waiting_checkout" job status — so the instant the backend flipped the status after generating a code, the panel unmounted and the just-generated code vanished. This looked like "the page redirects immediately after generating a code." Fix: keep the generate-panel's visibility condition covering both the pre-generation status AND the waiting_* status, and have it fetch `/codes/active` on mount to restore state.
