import { Router } from "express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { generateReferralCode } from "../lib/auth";

const router = Router();

const ADMIN_EMAIL = "leonardoscheffel2000@gmail.com";
const ADMIN_HASH = "55815ec3857918a0c7accc86eb5f8a645f4e35262b5a0a4ca56057142d0e502f";

/* ── POST /api/setup/admin ── idempotent admin bootstrap ── */
router.post("/setup/admin", async (req, res) => {
  try {
    const [existing] = await db.select().from(usersTable).where(eq(usersTable.email, ADMIN_EMAIL)).limit(1);

    if (existing) {
      if (existing.role !== "admin") {
        await db.update(usersTable).set({ role: "admin", isVerified: true }).where(eq(usersTable.id, existing.id));
        res.json({ message: "Existing user promoted to admin", id: existing.id });
      } else {
        res.json({ message: "Admin already exists", id: existing.id });
      }
      return;
    }

    const [admin] = await db.insert(usersTable).values({
      email: ADMIN_EMAIL,
      name: "Leonardo Scheffel da Rosa",
      passwordHash: ADMIN_HASH,
      role: "admin",
      isVerified: true,
      isBanned: false,
      referralCode: generateReferralCode(),
      level: "elite",
      profileCompletion: 100,
    }).returning({ id: usersTable.id, email: usersTable.email, role: usersTable.role });

    res.status(201).json({ message: "Admin account created successfully", id: admin.id });
  } catch (err: any) {
    console.error("Admin setup error:", err);
    res.status(500).json({ error: "Setup failed", detail: err.message });
  }
});

/* ── GET /api/setup/status ── check if admin exists ── */
router.get("/setup/status", async (_req, res) => {
  try {
    const [existing] = await db.select({ id: usersTable.id, role: usersTable.role })
      .from(usersTable).where(eq(usersTable.email, ADMIN_EMAIL)).limit(1);
    res.json({ adminExists: !!existing, isAdmin: existing?.role === "admin" });
  } catch {
    res.json({ adminExists: false });
  }
});

export default router;
