import { Router } from "express";
import { db, usersTable, ratingsTable, userFollowsTable } from "@workspace/db";
import { eq, like, and, or, sql, count } from "drizzle-orm";
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
  const currentUserId = (req as any).user?.id;
  const result = await Promise.all(users.map(async (u) => {
    const [followerRow] = await db.select({ c: count() }).from(userFollowsTable).where(eq(userFollowsTable.followingId, u.id));
    const [followingRow] = await db.select({ c: count() }).from(userFollowsTable).where(eq(userFollowsTable.followerId, u.id));
    let isFollowedByMe = false;
    if (currentUserId) {
      const [rel] = await db.select().from(userFollowsTable).where(and(eq(userFollowsTable.followerId, currentUserId), eq(userFollowsTable.followingId, u.id)));
      isFollowedByMe = !!rel;
    }
    return { ...formatUser(u), followersCount: Number(followerRow.c), followingCount: Number(followingRow.c), isFollowedByMe };
  }));
  res.json(result);
});

// GET /users/companies
router.get("/users/companies", requireAuth, async (req, res) => {
  const search = req.query.search as string | undefined;

  let query = db.select().from(usersTable)
    .where(eq(usersTable.role, "company"))
    .$dynamic();

  if (search) {
    query = query.where(
      or(
        like(usersTable.name, `%${search}%`),
        like(usersTable.companyName, `%${search}%`)
      )
    );
  }

  const users = await query.limit(50);
  const currentUserId = (req as any).user?.id;
  const result = await Promise.all(users.map(async (u) => {
    const [followerRow] = await db.select({ c: count() }).from(userFollowsTable).where(eq(userFollowsTable.followingId, u.id));
    const [followingRow] = await db.select({ c: count() }).from(userFollowsTable).where(eq(userFollowsTable.followerId, u.id));
    let isFollowedByMe = false;
    if (currentUserId) {
      const [rel] = await db.select().from(userFollowsTable).where(and(eq(userFollowsTable.followerId, currentUserId), eq(userFollowsTable.followingId, u.id)));
      isFollowedByMe = !!rel;
    }
    return { ...formatUser(u), followersCount: Number(followerRow.c), followingCount: Number(followingRow.c), isFollowedByMe };
  }));
  res.json(result);
});

// GET /users/:id
router.get("/users/:id", requireAuth, async (req, res) => {
  const id = parseInt(req.params.id as string);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, id));
  if (!user) { res.status(404).json({ error: "User not found" }); return; }

  const currentUserId = (req as any).user?.id;
  const [followerRow] = await db.select({ c: count() }).from(userFollowsTable).where(eq(userFollowsTable.followingId, id));
  const [followingRow] = await db.select({ c: count() }).from(userFollowsTable).where(eq(userFollowsTable.followerId, id));
  let isFollowedByMe = false;
  if (currentUserId && currentUserId !== id) {
    const [rel] = await db.select().from(userFollowsTable).where(and(eq(userFollowsTable.followerId, currentUserId), eq(userFollowsTable.followingId, id)));
    isFollowedByMe = !!rel;
  }

  res.json({
    ...formatUser(user),
    followersCount: Number(followerRow.c),
    followingCount: Number(followingRow.c),
    isFollowedByMe,
  });
});

// PATCH /users/:id
router.patch("/users/:id", requireAuth, async (req, res) => {
  const id = parseInt(req.params.id as string);
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
  const ratedId = parseInt(req.params.id as string);
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

// POST /users/:id/follow
router.post("/users/:id/follow", requireAuth, async (req, res) => {
  const followingId = parseInt(req.params.id as string);
  const followerId = (req as any).user.id;
  if (isNaN(followingId)) { res.status(400).json({ error: "Invalid ID" }); return; }
  if (followerId === followingId) { res.status(400).json({ error: "Cannot follow yourself" }); return; }

  const [target] = await db.select().from(usersTable).where(eq(usersTable.id, followingId));
  if (!target) { res.status(404).json({ error: "User not found" }); return; }

  try {
    await db.insert(userFollowsTable).values({ followerId, followingId });
  } catch {
    // Already following — ignore unique constraint error
  }

  res.json({ message: "Followed" });
});

// DELETE /users/:id/follow
router.delete("/users/:id/follow", requireAuth, async (req, res) => {
  const followingId = parseInt(req.params.id as string);
  const followerId = (req as any).user.id;
  if (isNaN(followingId)) { res.status(400).json({ error: "Invalid ID" }); return; }

  await db.delete(userFollowsTable).where(
    and(eq(userFollowsTable.followerId, followerId), eq(userFollowsTable.followingId, followingId))
  );

  res.json({ message: "Unfollowed" });
});

// GET /users/:id/followers
router.get("/users/:id/followers", requireAuth, async (req, res) => {
  const userId = parseInt(req.params.id as string);
  if (isNaN(userId)) { res.status(400).json({ error: "Invalid ID" }); return; }

  const follows = await db.select().from(userFollowsTable).where(eq(userFollowsTable.followingId, userId));
  const users = await Promise.all(
    follows.map(async (f) => {
      const [u] = await db.select().from(usersTable).where(eq(usersTable.id, f.followerId));
      return u ? formatUser(u) : null;
    })
  );
  res.json(users.filter(Boolean));
});

// GET /users/:id/following
router.get("/users/:id/following", requireAuth, async (req, res) => {
  const userId = parseInt(req.params.id as string);
  if (isNaN(userId)) { res.status(400).json({ error: "Invalid ID" }); return; }

  const follows = await db.select().from(userFollowsTable).where(eq(userFollowsTable.followerId, userId));
  const users = await Promise.all(
    follows.map(async (f) => {
      const [u] = await db.select().from(usersTable).where(eq(usersTable.id, f.followingId));
      return u ? formatUser(u) : null;
    })
  );
  res.json(users.filter(Boolean));
});

export default router;
