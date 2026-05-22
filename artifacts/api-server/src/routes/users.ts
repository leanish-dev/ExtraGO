import { Router } from "express";
import { db, usersTable, ratingsTable } from "@workspace/db";
import { eq, like, and, or, sql } from "drizzle-orm";
import { requireAuth, formatUser } from "../lib/auth";
import { UpdateUserBody, RateUserBody, ListFreelancersQueryParams } from "@workspace/api-zod";

const router = Router();

// GET /users/freelancers
router.get("/users/freelancers", requireAuth, async (req, res) => {
  const parsed = ListFreelancersQueryParams.safeParse(req.query);
  const { category, search } = parsed.data ?? {};

  let query = db.select().from(usersTable)
    .where(eq(usersTable.role, "freelancer"))
    .$dynamic();

  if (category) {
    query = query.where(sql`${category} = ANY(${usersTable.categories})`);
  }
  if (search) {
    query = query.where(
      or(
        like(usersTable.name, `%${search}%`),
        like(usersTable.bio, `%${search}%`)
      )
    );
  }

  const users = await query.limit(50);
  res.json(users.map(formatUser));
});

// GET /users/:id
router.get("/users/:id", requireAuth, async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, id));
  if (!user) { res.status(404).json({ error: "User not found" }); return; }

  res.json(formatUser(user));
});

// PATCH /users/:id
router.patch("/users/:id", requireAuth, async (req, res) => {
  const id = parseInt(req.params.id);
  const currentUser = (req as any).user;

  if (currentUser.id !== id && currentUser.role !== "admin") {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  const parsed = UpdateUserBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }

  const updateData: Record<string, any> = {};
  const d = parsed.data;
  if (d.name !== undefined) updateData.name = d.name;
  if (d.bio !== undefined) updateData.bio = d.bio;
  if (d.phone !== undefined) updateData.phone = d.phone;
  if (d.companyName !== undefined) updateData.companyName = d.companyName;
  if (d.pixKey !== undefined) updateData.pixKey = d.pixKey;
  if (d.categories !== undefined) updateData.categories = d.categories;
  if (d.avatarUrl !== undefined) updateData.avatarUrl = d.avatarUrl;

  // Recalculate profile completion
  const [existing] = await db.select().from(usersTable).where(eq(usersTable.id, id));
  if (!existing) { res.status(404).json({ error: "Not found" }); return; }

  const merged = { ...existing, ...updateData };
  let completion = 20; // base: email exists
  if (merged.name) completion += 15;
  if (merged.bio) completion += 15;
  if (merged.phone) completion += 10;
  if (merged.avatarUrl) completion += 15;
  if (merged.categories?.length > 0) completion += 15;
  if (merged.pixKey) completion += 10;
  updateData.profileCompletion = Math.min(completion, 100);

  const [updated] = await db.update(usersTable)
    .set(updateData)
    .where(eq(usersTable.id, id))
    .returning();

  res.json(formatUser(updated));
});

// POST /users/:id/rating
router.post("/users/:id/rating", requireAuth, async (req, res) => {
  const ratedId = parseInt(req.params.id);
  const raterId = (req as any).user.id;
  if (isNaN(ratedId)) { res.status(400).json({ error: "Invalid ID" }); return; }

  const parsed = RateUserBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid input" }); return; }

  await db.insert(ratingsTable).values({
    jobId: parsed.data.jobId,
    raterId,
    ratedId,
    score: parsed.data.score,
    comment: parsed.data.comment ?? null,
  });

  // Update average rating
  const ratings = await db.select().from(ratingsTable).where(eq(ratingsTable.ratedId, ratedId));
  const avg = ratings.reduce((sum, r) => sum + r.score, 0) / ratings.length;
  await db.update(usersTable).set({ reputationScore: avg }).where(eq(usersTable.id, ratedId));

  res.status(201).json({ message: "Rating submitted" });
});

export default router;
