import { Router } from "express";
import { db, categoriesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth } from "../lib/auth";

const router = Router();

/**
 * GET /categories
 * Returns all active categories from the governance-managed categories table.
 * Accessible to any authenticated user (freelancer, company, admin).
 * Falls back gracefully — returns empty array if table has no rows yet.
 */
router.get("/categories", requireAuth, async (_req, res) => {
  try {
    const rows = await db
      .select()
      .from(categoriesTable)
      .where(eq(categoriesTable.status, "active"))
      .orderBy(categoriesTable.displayOrder, categoriesTable.name);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to load categories" });
  }
});

export default router;
