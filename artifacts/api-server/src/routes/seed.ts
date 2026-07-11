import fs from "node:fs";
import path from "node:path";
import { Router } from "express";
import { db, usersTable, walletsTable, legalDocumentsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { hashPassword, generateReferralCode } from "../lib/auth";
import { SERVER_BUILD_TIME, SERVER_BUILD_ISO } from "../lib/build-info";
import { LEGAL_DOCUMENTS, hashDocumentContent } from "../lib/legal-documents-seed";

const router = Router();

/**
 * POST /api/setup/seed
 *
 * Idempotent bootstrap for the SIX approved production accounts only.
 * This endpoint NEVER creates ecosystem/demo/seed users, jobs, transactions,
 * notifications, conversations, or any other synthetic data.
 *
 * Approved accounts:
 *   1. leonardoscheffel2000@gmail.com  — CEO / super_admin
 *   2. jeandick2000@gmail.com          — CMO / super_admin
 *   3. qaialla.exclusive@gmail.com     — CCO / super_admin
 *   4. extrago.ceo@yahoo.com           — CEO master / super_admin
 *   5. teste.f@extrago.com             — authorized test freelancer
 *   6. teste.e@extrago.com             — authorized test company
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
      bio: "CEO e fundador da plataforma extraGO. Responsável pela visão estratégica, produto, operações e expansão nacional.",
      isVerified: true,
      isBanned: false,
      profileCompletion: 100,
      level: "diamond",
      referralCode: "CEO2024LS",
      avatarUrl: "/team-leonardo.jpg",
      isDemo: false,
      accountStatus: "verified",
      emailVerifiedAt: new Date(),
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
      avatarUrl: "/team-jean.jpg",
      isDemo: false,
      accountStatus: "verified",
      emailVerifiedAt: new Date(),
    });
    await ensureWallet(jeanDickId, "platform");
    results.push(`CMO Jean Dick: id=${jeanDickId}`);

    // ─── 3. CCO — Qaialla Pereira ─────────────────────────────────────────
    const qaiallaid = await upsertUser({
      email: "qaialla.exclusive@gmail.com",
      passwordHash: hashPassword("Qaialla27@"),
      name: "Qaialla Pereira",
      role: "admin",
      adminRole: "super_admin",
      corporateRole: "cco",
      bio: "CCO e co-fundadora da plataforma extraGO. Responsável pela expansão comercial, parcerias estratégicas, relacionamento corporativo e desenvolvimento de mercado.",
      isVerified: true,
      isBanned: false,
      profileCompletion: 100,
      level: "diamond",
      referralCode: "CCO2024QP",
      avatarUrl: "/team-qaialla.jpg",
      isDemo: false,
      accountStatus: "verified",
      emailVerifiedAt: new Date(),
    });
    await ensureWallet(qaiallaid, "platform");
    results.push(`CCO Qaialla: id=${qaiallaid}`);

    // ─── 4. CEO Master account — extrago.ceo@yahoo.com ───────────────────
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
      accountStatus: "verified",
      emailVerifiedAt: new Date(),
    });
    await ensureWallet(ceoYahooId, "platform");
    results.push(`CEO Yahoo: id=${ceoYahooId}`);

    // ─── 5. Authorized test freelancer ────────────────────────────────────
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

    // ─── 6. Authorized test company ───────────────────────────────────────
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

    // ── Legal documents — upsert all 9 documents ──────────────────────────────
    const legalResults: string[] = [];
    for (const doc of LEGAL_DOCUMENTS) {
      const contentHash = hashDocumentContent(doc.content);
      const [existing] = await db.select().from(legalDocumentsTable)
        .where(eq(legalDocumentsTable.type, doc.type as any))
        .limit(1);

      if (existing) {
        // Only update if content actually changed (hash mismatch)
        if (existing.contentHash !== contentHash) {
          await db.update(legalDocumentsTable).set({
            version: doc.version,
            title: doc.title,
            content: doc.content,
            contentHash,
            status: "published",
            publicationDate: new Date(),
            effectiveDate: new Date(),
          }).where(eq(legalDocumentsTable.id, existing.id));
          legalResults.push(`updated: ${doc.type} v${doc.version}`);
        } else {
          legalResults.push(`unchanged: ${doc.type} v${doc.version}`);
        }
      } else {
        await db.insert(legalDocumentsTable).values({
          type: doc.type as any,
          version: doc.version,
          title: doc.title,
          content: doc.content,
          contentHash,
          status: "published",
          publicationDate: new Date(),
          effectiveDate: new Date(),
          createdBy: leonardoId,
        } as any);
        legalResults.push(`created: ${doc.type} v${doc.version}`);
      }
    }
    results.push(`Legal documents: ${legalResults.join(", ")}`);

    // ── Stale-build detection ──────────────────────────────────────────────────
    // If seed.ts source file is newer than the compiled bundle, the UPDATE above
    // ran with OLD code. Warn explicitly so the operator knows to restart+reseed.
    let staleBuildWarning: string | null = null;
    try {
      const seedSrc = path.resolve(process.cwd(), "src/routes/seed.ts");
      if (fs.existsSync(seedSrc)) {
        const srcMtime = fs.statSync(seedSrc).mtimeMs;
        if (srcMtime > SERVER_BUILD_TIME) {
          staleBuildWarning =
            `⚠️  STALE BUILD DETECTED: seed.ts was modified after the server was compiled (built at ${SERVER_BUILD_ISO}). ` +
            `Passwords and data written by this seed call used OLD compiled code. ` +
            `Restart the API Server workflow and re-run POST /api/setup/seed.`;
        }
      }
    } catch {
      // non-critical
    }

    res.json({
      message: "Approved accounts provisioned — no demo/seed data created",
      builtAt: SERVER_BUILD_ISO,
      ...(staleBuildWarning ? { warning: staleBuildWarning } : {}),
      accounts: {
        ceo: { email: "leonardoscheffel2000@gmail.com", id: leonardoId },
        cmo: { email: "jeandick2000@gmail.com", id: jeanDickId },
        cco: { email: "qaialla.exclusive@gmail.com", id: qaiallaid },
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
