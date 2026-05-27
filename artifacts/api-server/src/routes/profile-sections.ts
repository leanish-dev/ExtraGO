import { Router } from "express";
import { db, userCategoriesTable, workExperiencesTable, userSkillsTable, usersTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { requireAuth } from "../lib/auth";
import { z } from "zod";

const router = Router();

const UpsertCategoriesBody = z.object({
  categories: z.array(
    z.object({
      category: z.string(),
      isPrimary: z.boolean().optional().default(false),
      subspecialties: z.array(z.string()).optional().default([]),
      yearsExperience: z.number().int().min(0).optional().default(0),
      certifications: z.array(z.string()).optional().default([]),
    })
  ),
});

const CreateExperienceBody = z.object({
  company: z.string().min(1),
  role: z.string().min(1),
  startDate: z.string().min(1),
  endDate: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  achievements: z.array(z.string()).optional().default([]),
  imageUrls: z.array(z.string()).optional().default([]),
});

const CreateSkillBody = z.object({
  skill: z.string().min(1).max(60),
});

// GET /profile/categories
router.get("/profile/categories", requireAuth, async (req, res) => {
  const userId = (req as any).user.id;
  const cats = await db.select().from(userCategoriesTable).where(eq(userCategoriesTable.userId, userId));
  res.json(cats);
});

// PUT /profile/categories
router.put("/profile/categories", requireAuth, async (req, res) => {
  const userId = (req as any).user.id;
  const parsed = UpsertCategoriesBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid input" }); return; }

  await db.delete(userCategoriesTable).where(eq(userCategoriesTable.userId, userId));

  if (parsed.data.categories.length > 0) {
    await db.insert(userCategoriesTable).values(
      parsed.data.categories.map(c => ({
        userId,
        category: c.category,
        isPrimary: c.isPrimary ?? false,
        subspecialties: c.subspecialties ?? [],
        yearsExperience: c.yearsExperience ?? 0,
        certifications: c.certifications ?? [],
      }))
    );
  }

  const result = await db.select().from(userCategoriesTable).where(eq(userCategoriesTable.userId, userId));
  res.json(result);
});

// GET /profile/experience
router.get("/profile/experience", requireAuth, async (req, res) => {
  const userId = (req as any).user.id;
  const exps = await db
    .select()
    .from(workExperiencesTable)
    .where(eq(workExperiencesTable.userId, userId));
  res.json(exps.map(e => ({ ...e, createdAt: e.createdAt?.toISOString() })));
});

// POST /profile/experience
router.post("/profile/experience", requireAuth, async (req, res) => {
  const userId = (req as any).user.id;
  const parsed = CreateExperienceBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid input" }); return; }

  const [exp] = await db
    .insert(workExperiencesTable)
    .values({
      userId,
      company: parsed.data.company,
      role: parsed.data.role,
      startDate: parsed.data.startDate,
      endDate: parsed.data.endDate ?? null,
      description: parsed.data.description ?? null,
      achievements: parsed.data.achievements ?? [],
      imageUrls: parsed.data.imageUrls ?? [],
    })
    .returning();
  res.status(201).json({ ...exp, createdAt: exp.createdAt?.toISOString() });
});

// PUT /profile/experience/:id
router.put("/profile/experience/:id", requireAuth, async (req, res) => {
  const userId = (req as any).user.id;
  const id = parseInt(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }

  const parsed = CreateExperienceBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid input" }); return; }

  const [exp] = await db
    .update(workExperiencesTable)
    .set({
      company: parsed.data.company,
      role: parsed.data.role,
      startDate: parsed.data.startDate,
      endDate: parsed.data.endDate ?? null,
      description: parsed.data.description ?? null,
      achievements: parsed.data.achievements ?? [],
      imageUrls: parsed.data.imageUrls ?? [],
    })
    .where(and(eq(workExperiencesTable.id, id), eq(workExperiencesTable.userId, userId)))
    .returning();

  if (!exp) { res.status(404).json({ error: "Not found" }); return; }
  res.json({ ...exp, createdAt: exp.createdAt?.toISOString() });
});

// DELETE /profile/experience/:id
router.delete("/profile/experience/:id", requireAuth, async (req, res) => {
  const userId = (req as any).user.id;
  const id = parseInt(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }

  await db.delete(workExperiencesTable).where(
    and(eq(workExperiencesTable.id, id), eq(workExperiencesTable.userId, userId))
  );
  res.json({ message: "Deleted" });
});

// GET /profile/skills
router.get("/profile/skills", requireAuth, async (req, res) => {
  const userId = (req as any).user.id;
  const skills = await db.select().from(userSkillsTable).where(eq(userSkillsTable.userId, userId));
  res.json(skills.map(s => ({ ...s, createdAt: s.createdAt?.toISOString() })));
});

// POST /profile/skills
router.post("/profile/skills", requireAuth, async (req, res) => {
  const userId = (req as any).user.id;
  const parsed = CreateSkillBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid input" }); return; }

  const [skill] = await db
    .insert(userSkillsTable)
    .values({ userId, skill: parsed.data.skill })
    .returning();
  res.status(201).json({ ...skill, createdAt: skill.createdAt?.toISOString() });
});

// DELETE /profile/skills/:id
router.delete("/profile/skills/:id", requireAuth, async (req, res) => {
  const userId = (req as any).user.id;
  const id = parseInt(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }

  await db.delete(userSkillsTable).where(
    and(eq(userSkillsTable.id, id), eq(userSkillsTable.userId, userId))
  );
  res.json({ message: "Deleted" });
});

// POST /profile/avatar
router.post("/profile/avatar", requireAuth, async (req, res) => {
  const userId = (req as any).user.id;
  const { dataUrl } = req.body;
  if (!dataUrl || typeof dataUrl !== "string") {
    res.status(400).json({ error: "dataUrl is required" });
    return;
  }
  const [updated] = await db.update(usersTable)
    .set({ avatarUrl: dataUrl })
    .where(eq(usersTable.id, userId))
    .returning();
  res.json({ avatarUrl: updated.avatarUrl });
});

// POST /profile/banner
router.post("/profile/banner", requireAuth, async (req, res) => {
  const userId = (req as any).user.id;
  const { dataUrl } = req.body;
  if (!dataUrl || typeof dataUrl !== "string") {
    res.status(400).json({ error: "dataUrl is required" });
    return;
  }
  const [updated] = await db.update(usersTable)
    .set({ bannerUrl: dataUrl })
    .where(eq(usersTable.id, userId))
    .returning();
  res.json({ bannerUrl: updated.bannerUrl });
});

// ---- Public read-only endpoints (by freelancer user ID) ----

// GET /api/users/:userId/experience  (public)
router.get("/users/:userId/experience", async (req, res) => {
  const userId = parseInt(req.params.userId);
  if (isNaN(userId)) { res.status(400).json({ error: "Invalid user ID" }); return; }
  const exps = await db
    .select()
    .from(workExperiencesTable)
    .where(eq(workExperiencesTable.userId, userId));
  res.json(exps.map(e => ({ ...e, createdAt: e.createdAt?.toISOString() })));
});

// GET /api/users/:userId/skills  (public)
router.get("/users/:userId/skills", async (req, res) => {
  const userId = parseInt(req.params.userId);
  if (isNaN(userId)) { res.status(400).json({ error: "Invalid user ID" }); return; }
  const skills = await db
    .select()
    .from(userSkillsTable)
    .where(eq(userSkillsTable.userId, userId));
  res.json(skills.map(s => ({ ...s, createdAt: s.createdAt?.toISOString() })));
});

// GET /api/users/:userId/categories  (public)
router.get("/users/:userId/categories", async (req, res) => {
  const userId = parseInt(req.params.userId);
  if (isNaN(userId)) { res.status(400).json({ error: "Invalid user ID" }); return; }
  const cats = await db
    .select()
    .from(userCategoriesTable)
    .where(eq(userCategoriesTable.userId, userId));
  res.json(cats.map(c => ({ ...c, createdAt: c.createdAt?.toISOString() })));
});

export default router;
