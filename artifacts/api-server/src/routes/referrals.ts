import { Router } from "express";
import { db, usersTable, applicationsTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import { requireAuth, formatUser } from "../lib/auth";
import { ValidateReferralCodeBody } from "@workspace/api-zod";

const router = Router();

// GET /referrals/me
router.get("/referrals/me", requireAuth, async (req, res) => {
  const user = (req as any).user;
  const code = user.referralCode;
  const origin = (req.headers.origin as string) || `${req.protocol}://${req.headers.host}`;
  const link = `${origin}/register?ref=${code}`;

  // Get all users referred by this user
  const invitees = await db.select().from(usersTable).where(eq(usersTable.referredById, user.id));

  const inviteeData = await Promise.all(invitees.map(async (inv) => {
    const apps = await db.select().from(applicationsTable)
      .where(eq(applicationsTable.freelancerId, inv.id));
    const completedCount = apps.filter(a => a.status === "completed").length;
    const converted = completedCount >= 5 && inv.isVerified;

    return {
      id: inv.id,
      name: inv.name,
      avatarUrl: inv.avatarUrl ?? null,
      joinedAt: inv.createdAt?.toISOString(),
      completedJobs: completedCount,
      status: converted ? "converted" : "pending",
    };
  }));

  const totalConverted = inviteeData.filter(i => i.status === "converted").length;
  const totalRewardEarned = totalConverted * 50; // R$50 per converted referral

  res.json({
    code,
    link,
    totalInvited: invitees.length,
    totalConverted,
    totalRewardEarned,
    invitees: inviteeData,
  });
});

// POST /referrals/validate
router.post("/referrals/validate", requireAuth, async (req, res) => {
  const parsed = ValidateReferralCodeBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid input" }); return; }

  const [referrer] = await db.select().from(usersTable).where(eq(usersTable.referralCode, parsed.data.code));
  if (!referrer) {
    res.status(404).json({ message: "Código inválido" });
    return;
  }
  res.json({ message: `Código válido! Indicado por ${referrer.name}` });
});

// GET /referrals/leaderboard
router.get("/referrals/leaderboard", requireAuth, async (req, res) => {
  const freelancers = await db.select().from(usersTable)
    .where(eq(usersTable.role, "freelancer"))
    .orderBy(sql`${usersTable.completedJobs} DESC`)
    .limit(20);

  if (freelancers.length === 0) { res.json([]); return; }

  const freelancerIds = freelancers.map(f => f.id);

  // Batch fetch all invitees for all top freelancers in one query
  const allInvitees = await db.select().from(usersTable)
    .where(sql`${usersTable.referredById} = ANY(ARRAY[${sql.join(freelancerIds.map(id => sql`${id}`), sql`, `)}]::int[])`);

  const completedAppsByInvitee = new Map<number, number>();

  if (allInvitees.length > 0) {
    const inviteeIds = allInvitees.map(i => i.id);
    // Batch fetch all relevant applications in one query
    const allApps = await db.select().from(applicationsTable)
      .where(sql`${applicationsTable.freelancerId} = ANY(ARRAY[${sql.join(inviteeIds.map(id => sql`${id}`), sql`, `)}]::int[])
        AND ${applicationsTable.status} = 'completed'`);
    allApps.forEach(app => {
      completedAppsByInvitee.set(app.freelancerId, (completedAppsByInvitee.get(app.freelancerId) ?? 0) + 1);
    });
  }

  // Group invitees by referrer
  const inviteesByReferrer = new Map<number, typeof allInvitees>();
  allInvitees.forEach(inv => {
    if (!inv.referredById) return;
    const list = inviteesByReferrer.get(inv.referredById) ?? [];
    list.push(inv);
    inviteesByReferrer.set(inv.referredById, list);
  });

  const leaderboard = freelancers.map((user, index) => {
    const invitees = inviteesByReferrer.get(user.id) ?? [];
    const totalConverted = invitees.filter(inv =>
      (completedAppsByInvitee.get(inv.id) ?? 0) >= 5 && inv.isVerified
    ).length;
    return {
      rank: index + 1,
      userId: user.id,
      name: user.name,
      avatarUrl: user.avatarUrl ?? null,
      level: user.level,
      totalConverted,
      reputationScore: user.reputationScore,
    };
  });

  res.json(leaderboard
    .sort((a, b) => b.totalConverted - a.totalConverted || b.reputationScore - a.reputationScore)
    .map((e, i) => ({ ...e, rank: i + 1 })));
});

export default router;
