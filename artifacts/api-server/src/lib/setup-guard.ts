import crypto from "crypto";
import type { NextFunction, Request, Response } from "express";

/**
 * ═══════════════════════════════════════════════════════════
 * SETUP GUARD — protects one-off bootstrap endpoints
 * (POST /api/setup/seed, POST /api/setup/admin)
 *
 * These endpoints provision the approved production accounts.
 * They must NEVER be callable by an unauthenticated third party,
 * in any environment — including development, where a stray
 * request from a scanner or a forgotten curl script should not
 * be able to touch the database either.
 *
 * Behaviour:
 *  - SETUP_SECRET is read exclusively from the environment. It
 *    is never logged and never echoed back in a response.
 *  - If SETUP_SECRET is not configured, the endpoint is ALWAYS
 *    blocked (403) — regardless of NODE_ENV. This is the safe
 *    default: no secret configured means setup stays disabled
 *    until someone deliberately opts in.
 *  - If SETUP_SECRET is configured, the caller must send it in
 *    the `x-setup-secret` header. Comparison is constant-time
 *    (crypto.timingSafeEqual) to avoid timing side-channels.
 *  - Failure responses never include the secret, the reason for
 *    mismatch, or any other sensitive detail — just a generic 403.
 * ═══════════════════════════════════════════════════════════
 */
export function requireSetupSecret(req: Request, res: Response, next: NextFunction): void {
  const expected = process.env.SETUP_SECRET;

  if (!expected) {
    res.status(403).json({ error: "Setup endpoints are disabled" });
    return;
  }

  const provided = req.header("x-setup-secret") ?? "";

  const expectedBuf = Buffer.from(expected);
  const providedBuf = Buffer.from(provided);

  const isMatch =
    expectedBuf.length === providedBuf.length &&
    crypto.timingSafeEqual(expectedBuf, providedBuf);

  if (!isMatch) {
    res.status(403).json({ error: "Setup endpoints are disabled" });
    return;
  }

  next();
}
