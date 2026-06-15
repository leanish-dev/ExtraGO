import { Router } from "express";
import { db, usersTable, walletsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { hashPassword, generateReferralCode } from "../lib/auth";

const router = Router();

/**
 * POST /api/setup/seed
 *
 * Idempotent bootstrap for the FIVE approved production accounts only.
 * This endpoint NEVER creates ecosystem/demo/seed users, jobs, transactions,
 * notifications, conversations, or any other synthetic data.
 *
 * Approved accounts:
 *   1. leonardoscheffel2000@gmail.com  — CEO / super_admin
 *   2. jeandick2000@gmail.com          — CMO / super_admin
 *   3. extrago.ceo@yahoo.com           — CEO master / super_admin
 *   4. teste.f@extrago.com             — authorized test freelancer
 *   5. teste.e@extrago.com             — authorized test company
 */
router.post("/setup/seed", async (_req, res) => {
  try {
    const results: string[] = [];

    const upsertUser = async (data: Record<string, any>): Promise<number> => {
      const [existing] = await db
        .select({ id: usersTable.id })
        .from(usersTable)
        .where(eq(usersTable.email, data.email))
        .limit(1);
      if (existing) {
        await db.update(usersTable).set(data).where(eq(usersTable.id, existing.id));
        return existing.id;
      }
      const [created] = await db
        .insert(usersTable)
        .values({ referralCode: generateReferralCode(), ...data } as any)
        .returning({ id: usersTable.id });
      return created.id;
    };

    const ensureWallet = async (
      userId: number,
      walletType: "freelancer" | "company" | "platform" | "representative"
    ): Promise<number> => {
      const [existing] = await db
        .select({ id: walletsTable.id })
        .from(walletsTable)
        .where(eq(walletsTable.userId, userId))
        .limit(1);
      if (existing) return existing.id;
      const [created] = await db
        .insert(walletsTable)
        .values({
          userId,
          walletType,
          balance: 0,
          reservedBalance: 0,
          pendingBalance: 0,
          totalEarned: 0,
          totalWithdrawn: 0,
          totalFeesPaid: 0,
          totalSpent: 0,
        })
        .returning({ id: walletsTable.id });
      return created.id;
    };

    // ─── 1. CEO — Leonardo Scheffel ──────────────────────────────────────
    const leonardoId = await upsertUser({
      email: "leonardoscheffel2000@gmail.com",
      passwordHash: hashPassword("Gremory26@"),
      name: "Leonardo Scheffel",
      role: "admin",
      adminRole: "super_admin",
      corporateRole: "ceo",
      bio: "CEO e co-fundador da plataforma extraGO.",
      isVerified: true,
      isBanned: false,
      profileCompletion: 100,
      level: "diamond",
      referralCode: "CEO2024LS",
      isDemo: false,
    });
    await ensureWallet(leonardoId, "platform");
    results.push(`CEO Leonardo: id=${leonardoId}`);

    // ─── 2. CMO — Jean Dick ───────────────────────────────────────────────
    const jeanDickId = await upsertUser({
      email: "jeandick2000@gmail.com",
      passwordHash: hashPassword("Extrago27@"),
      name: "Jean Dick",
      role: "admin",
      adminRole: "super_admin",
      corporateRole: "cmo",
      bio: "CMO e co-fundador da plataforma extraGO. Responsável pela estratégia de marketing e crescimento nacional.",
      isVerified: true,
      isBanned: false,
      profileCompletion: 100,
      level: "diamond",
      referralCode: "CMO2024JD",
      isDemo: false,
    });
    await ensureWallet(jeanDickId, "platform");
    results.push(`CMO Jean Dick: id=${jeanDickId}`);

    // ─── 3. CEO Master account — extrago.ceo@yahoo.com ───────────────────
    const ceoYahooId = await upsertUser({
      email: "extrago.ceo@yahoo.com",
      passwordHash: hashPassword("Gremory26@"),
      name: "CEO extraGO",
      role: "admin",
      adminRole: "super_admin",
      bio: "Conta master CEO da plataforma extraGO.",
      isVerified: true,
      isBanned: false,
      profileCompletion: 100,
      level: "elite",
      referralCode: "CEO2024EG",
      isDemo: false,
    });
    await ensureWallet(ceoYahooId, "platform");
    results.push(`CEO Yahoo: id=${ceoYahooId}`);

    // ─── 4. Authorized test freelancer ────────────────────────────────────
    const testeFId = await upsertUser({
      email: "teste.f@extrago.com",
      passwordHash: hashPassword("ext123@"),
      name: "Freelancer Teste",
      role: "freelancer",
      bio: "Conta de teste para freelancer na plataforma extraGO.",
      phone: "(11) 90000-0001",
      pixKey: "teste.f@extrago.com",
      categories: ["Garçom", "Bartender"],
      languages: ["Português"],
      serviceRegions: ["SP"],
      level: "bronze",
      reputationScore: 4.5,
      completedJobs: 5,
      responseRate: 0.90,
      isVerified: true,
      isBanned: false,
      profileCompletion: 80,
      referralCode: "TESTEF01",
      isDemo: false,
    });
    await ensureWallet(testeFId, "freelancer");
    results.push(`Test freelancer (teste.f): id=${testeFId}`);

    // ─── 5. Authorized test company ───────────────────────────────────────
    const testeEId = await upsertUser({
      email: "teste.e@extrago.com",
      passwordHash: hashPassword("ext123@"),
      name: "Empresa Teste",
      role: "company",
      companyName: "Empresa Teste extraGO",
      bio: "Conta de teste para empresa na plataforma extraGO.",
      phone: "(11) 90000-0002",
      pixKey: "teste.e@extrago.com",
      categories: [],
      languages: ["Português"],
      serviceRegions: ["SP"],
      isVerified: true,
      isBanned: false,
      profileCompletion: 80,
      referralCode: "TESTEE01",
      isDemo: false,
    });
    await ensureWallet(testeEId, "company");
    results.push(`Test company (teste.e): id=${testeEId}`);

    res.json({
      message: "Approved accounts provisioned — no demo/seed data created",
      accounts: {
        ceo: { email: "leonardoscheffel2000@gmail.com", id: leonardoId },
        cmo: { email: "jeandick2000@gmail.com", id: jeanDickId },
        ceoMaster: { email: "extrago.ceo@yahoo.com", id: ceoYahooId },
        testFreelancer: { email: "teste.f@extrago.com", id: testeFId },
        testCompany: { email: "teste.e@extrago.com", id: testeEId },
      },
      results,
    });
  } catch (err: any) {
    console.error("Seed error:", err);
    res.status(500).json({ error: "Setup failed", detail: err.message });
  }
});

export default router;
