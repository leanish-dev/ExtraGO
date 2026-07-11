/**
 * Push Notification Routes
 *
 * GET  /push/vapid-key    — returns the VAPID public key (from env)
 * POST /push/subscribe    — stores a push subscription for the authenticated user
 * POST /push/unsubscribe  — removes a push subscription
 *
 * VAPID keys must be set as environment variables:
 *   VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT (e.g. "mailto:admin@extrago.com")
 *
 * To generate keys: `npx web-push generate-vapid-keys`
 */

import { Router } from "express";
import { db } from "@workspace/db";
import { requireAuth } from "../lib/auth";
import { sql } from "drizzle-orm";

export const router = Router();

// ── GET /push/vapid-key ──────────────────────────────────────────────────────
router.get("/push/vapid-key", (req, res) => {
  const publicKey = process.env.VAPID_PUBLIC_KEY;
  if (!publicKey) {
    res.status(503).json({ error: "Push notifications not configured on this server." });
    return;
  }
  res.json({ publicKey });
});

// ── POST /push/subscribe ─────────────────────────────────────────────────────
router.post("/push/subscribe", requireAuth, async (req, res) => {
  const user = (req as any).user;
  const subscription = req.body;

  if (!subscription?.endpoint) {
    res.status(400).json({ error: "Invalid push subscription payload." });
    return;
  }

  try {
    // Upsert subscription in a simple key-value table (platform config)
    // For a full implementation, use a dedicated push_subscriptions table.
    // This stores subscriptions keyed by user ID + endpoint hash.
    const key = `push_sub:${user.id}:${Buffer.from(subscription.endpoint).toString("base64").slice(0, 32)}`;
    await db.execute(sql`
      INSERT INTO platform_config (key, value)
      VALUES (${key}, ${JSON.stringify(subscription)})
      ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value
    `);
    res.json({ ok: true });
  } catch (e) {
    console.error("[push/subscribe] error:", e);
    res.status(500).json({ error: "Failed to save subscription." });
  }
});

// ── POST /push/unsubscribe ───────────────────────────────────────────────────
router.post("/push/unsubscribe", requireAuth, async (req, res) => {
  const user = (req as any).user;
  const subscription = req.body;

  if (!subscription?.endpoint) {
    res.status(400).json({ error: "Invalid payload." });
    return;
  }

  try {
    const key = `push_sub:${user.id}:${Buffer.from(subscription.endpoint).toString("base64").slice(0, 32)}`;
    await db.execute(sql`DELETE FROM platform_config WHERE key = ${key}`);
    res.json({ ok: true });
  } catch {
    res.json({ ok: true }); // best-effort
  }
});
