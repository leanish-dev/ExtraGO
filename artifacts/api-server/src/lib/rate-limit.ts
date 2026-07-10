import { Request, Response, NextFunction } from "express";
import { getClientIp } from "./verification";

/**
 * Minimal in-memory rate limiter for sensitive auth endpoints (login,
 * register, password reset, OTP requests). Not a substitute for an
 * edge/WAF-level limiter in production, but stops naive brute-force and
 * OTP-spam within a single process. Keyed by IP + route.
 */
const buckets = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(options: { windowMs: number; max: number; keyPrefix: string }) {
  const { windowMs, max, keyPrefix } = options;
  return (req: Request, res: Response, next: NextFunction) => {
    const key = `${keyPrefix}:${getClientIp(req)}`;
    const now = Date.now();
    const bucket = buckets.get(key);

    if (!bucket || bucket.resetAt < now) {
      buckets.set(key, { count: 1, resetAt: now + windowMs });
      next();
      return;
    }

    if (bucket.count >= max) {
      res.status(429).json({ error: "Too many requests, please try again later" });
      return;
    }

    bucket.count += 1;
    next();
  };
}
