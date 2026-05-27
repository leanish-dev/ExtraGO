import { Router } from "express";
import { db, postsTable, postCommentsTable, postLikesTable, postSavesTable, usersTable } from "@workspace/db";
import { eq, desc, and, sql } from "drizzle-orm";
import { requireAuth } from "../lib/auth";
import { z } from "zod";

const router = Router();

const CreatePostBody = z.object({
  content: z.string().min(1).max(2000),
  imageUrls: z.array(z.string()).optional().default([]),
  postType: z.enum(["general", "job_completion", "availability"]).optional().default("general"),
});

const CreateCommentBody = z.object({
  content: z.string().min(1).max(500),
});

// GET /feed
router.get("/feed", requireAuth, async (req, res) => {
  const userId = (req as any).user.id;
  const page = parseInt((req.query.page as string) ?? "1") || 1;
  const limit = 20;
  const offset = (page - 1) * limit;
  const postType = req.query.postType as string | undefined;

  let query = db
    .select({
      post: postsTable,
      user: {
        id: usersTable.id,
        name: usersTable.name,
        avatarUrl: usersTable.avatarUrl,
        categories: usersTable.categories,
        isVerified: usersTable.isVerified,
        level: usersTable.level,
      },
    })
    .from(postsTable)
    .leftJoin(usersTable, eq(postsTable.userId, usersTable.id))
    .orderBy(desc(postsTable.createdAt))
    .limit(limit)
    .offset(offset)
    .$dynamic();

  if (postType && postType !== "all") {
    query = query.where(eq(postsTable.postType, postType as any));
  }

  const rows = await query;

  // Check which posts the current user liked/saved
  const postIds = rows.map(r => r.post.id);
  const userLikes = postIds.length
    ? await db
        .select({ postId: postLikesTable.postId })
        .from(postLikesTable)
        .where(eq(postLikesTable.userId, userId))
    : [];
  const userSaves = postIds.length
    ? await db
        .select({ postId: postSavesTable.postId })
        .from(postSavesTable)
        .where(eq(postSavesTable.userId, userId))
    : [];

  const likedSet = new Set(userLikes.map(l => l.postId));
  const savedSet = new Set(userSaves.map(s => s.postId));

  res.json(
    rows.map(r => ({
      ...r.post,
      createdAt: r.post.createdAt?.toISOString(),
      author: r.user,
      isLiked: likedSet.has(r.post.id),
      isSaved: savedSet.has(r.post.id),
    }))
  );
});

// POST /posts
router.post("/posts", requireAuth, async (req, res) => {
  const userId = (req as any).user.id;
  const parsed = CreatePostBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }
  const [post] = await db
    .insert(postsTable)
    .values({
      userId,
      content: parsed.data.content,
      imageUrls: parsed.data.imageUrls,
      postType: parsed.data.postType,
    })
    .returning();
  res.status(201).json({ ...post, createdAt: post.createdAt?.toISOString() });
});

// DELETE /posts/:id
router.delete("/posts/:id", requireAuth, async (req, res) => {
  const userId = (req as any).user.id;
  const postId = parseInt(req.params.id);
  if (isNaN(postId)) { res.status(400).json({ error: "Invalid ID" }); return; }

  const [post] = await db.select().from(postsTable).where(eq(postsTable.id, postId));
  if (!post) { res.status(404).json({ error: "Post not found" }); return; }
  if (post.userId !== userId && (req as any).user.role !== "admin") {
    res.status(403).json({ error: "Forbidden" }); return;
  }

  await db.delete(postsTable).where(eq(postsTable.id, postId));
  res.json({ message: "Deleted" });
});

// POST /posts/:id/like
router.post("/posts/:id/like", requireAuth, async (req, res) => {
  const userId = (req as any).user.id;
  const postId = parseInt(req.params.id);
  if (isNaN(postId)) { res.status(400).json({ error: "Invalid ID" }); return; }

  const [existing] = await db
    .select()
    .from(postLikesTable)
    .where(and(eq(postLikesTable.postId, postId), eq(postLikesTable.userId, userId)));

  if (existing) {
    await db.delete(postLikesTable).where(eq(postLikesTable.id, existing.id));
    await db.update(postsTable).set({ likes: sql`${postsTable.likes} - 1` }).where(eq(postsTable.id, postId));
    res.json({ liked: false });
  } else {
    await db.insert(postLikesTable).values({ postId, userId });
    await db.update(postsTable).set({ likes: sql`${postsTable.likes} + 1` }).where(eq(postsTable.id, postId));
    res.json({ liked: true });
  }
});

// POST /posts/:id/save
router.post("/posts/:id/save", requireAuth, async (req, res) => {
  const userId = (req as any).user.id;
  const postId = parseInt(req.params.id);
  if (isNaN(postId)) { res.status(400).json({ error: "Invalid ID" }); return; }

  const [existing] = await db
    .select()
    .from(postSavesTable)
    .where(and(eq(postSavesTable.postId, postId), eq(postSavesTable.userId, userId)));

  if (existing) {
    await db.delete(postSavesTable).where(eq(postSavesTable.id, existing.id));
    await db.update(postsTable).set({ saves: sql`${postsTable.saves} - 1` }).where(eq(postsTable.id, postId));
    res.json({ saved: false });
  } else {
    await db.insert(postSavesTable).values({ postId, userId });
    await db.update(postsTable).set({ saves: sql`${postsTable.saves} + 1` }).where(eq(postsTable.id, postId));
    res.json({ saved: true });
  }
});

// POST /posts/:id/repost
router.post("/posts/:id/repost", requireAuth, async (req, res) => {
  const postId = parseInt(req.params.id);
  if (isNaN(postId)) { res.status(400).json({ error: "Invalid ID" }); return; }
  const [post] = await db.select().from(postsTable).where(eq(postsTable.id, postId));
  if (!post) { res.status(404).json({ error: "Post not found" }); return; }
  await db.update(postsTable).set({ reposts: sql`${postsTable.reposts} + 1` }).where(eq(postsTable.id, postId));
  res.json({ message: "Reposted" });
});

// GET /posts/:id/comments
router.get("/posts/:id/comments", requireAuth, async (req, res) => {
  const postId = parseInt(req.params.id);
  if (isNaN(postId)) { res.status(400).json({ error: "Invalid ID" }); return; }

  const comments = await db
    .select({
      comment: postCommentsTable,
      user: {
        id: usersTable.id,
        name: usersTable.name,
        avatarUrl: usersTable.avatarUrl,
      },
    })
    .from(postCommentsTable)
    .leftJoin(usersTable, eq(postCommentsTable.userId, usersTable.id))
    .where(eq(postCommentsTable.postId, postId))
    .orderBy(desc(postCommentsTable.createdAt));

  res.json(comments.map(r => ({ ...r.comment, createdAt: r.comment.createdAt?.toISOString(), author: r.user })));
});

// POST /posts/:id/comments
router.post("/posts/:id/comments", requireAuth, async (req, res) => {
  const userId = (req as any).user.id;
  const postId = parseInt(req.params.id);
  if (isNaN(postId)) { res.status(400).json({ error: "Invalid ID" }); return; }

  const parsed = CreateCommentBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid input" }); return; }

  const [comment] = await db
    .insert(postCommentsTable)
    .values({ postId, userId, content: parsed.data.content })
    .returning();
  res.status(201).json({ ...comment, createdAt: comment.createdAt?.toISOString() });
});

// DELETE /posts/:postId/comments/:commentId
router.delete("/posts/:postId/comments/:commentId", requireAuth, async (req, res) => {
  const userId = (req as any).user.id;
  const commentId = parseInt(req.params.commentId);
  if (isNaN(commentId)) { res.status(400).json({ error: "Invalid ID" }); return; }

  const [comment] = await db.select().from(postCommentsTable).where(eq(postCommentsTable.id, commentId));
  if (!comment) { res.status(404).json({ error: "Not found" }); return; }
  if (comment.userId !== userId && (req as any).user.role !== "admin") {
    res.status(403).json({ error: "Forbidden" }); return;
  }

  await db.delete(postCommentsTable).where(eq(postCommentsTable.id, commentId));
  res.json({ message: "Deleted" });
});

export default router;
