import { db, usersTable, walletsTable, transactionsTable, notificationsTable, depositRequestsTable, stateRepresentativesTable, applicationsTable, ratingsTable } from "@workspace/db";
import { eq, sql, and } from "drizzle-orm";
import { loadSplitConfig, calculateReferralRate as calcRefRate, type SplitConfig } from "./split-engine";
import { createNotification } from "./notifications";

// Official 5-tier level system. Internal enum keys map to public labels:
// bronze=Iniciante, silver=Júnior, gold=Intermediário, elite=Sênior, diamond=Elite
export const LEVEL_FEE: Record<string, number> = {
  bronze: 0.20,
  silver: 0.18,
  gold: 0.15,
  elite: 0.12,
  diamond: 0.10,
};

export const LEVEL_LABELS: Record<string, string> = {
  bronze: "Iniciante",
  silver: "Júnior",
  gold: "Intermediário",
  elite: "Sênior",
  diamond: "Elite",
};

export const LEVEL_THRESHOLDS = {
  diamond: { jobs: 600, rep: 4.9 },
  elite: { jobs: 300, rep: 4.8 },
  gold: { jobs: 100, rep: 4.7 },
  silver: { jobs: 20, rep: 4.5 },
};

export type LevelKey = "bronze" | "silver" | "gold" | "elite" | "diamond";

export function calculateLevel(completedJobs: number, rep: number): LevelKey {
  if (completedJobs >= LEVEL_THRESHOLDS.diamond.jobs && rep >= LEVEL_THRESHOLDS.diamond.rep) return "diamond";
  if (completedJobs >= LEVEL_THRESHOLDS.elite.jobs && rep >= LEVEL_THRESHOLDS.elite.rep) return "elite";
  if (completedJobs >= LEVEL_THRESHOLDS.gold.jobs && rep >= LEVEL_THRESHOLDS.gold.rep) return "gold";
  if (completedJobs >= LEVEL_THRESHOLDS.silver.jobs && rep >= LEVEL_THRESHOLDS.silver.rep) return "silver";
  return "bronze";
}

// Official 3-tier referral commission system (Phase 12):
//   Indicador           2%  — active account (default)
//   Agente de Captação  3%  — 25 active referrals + 100 network extras
//   Embaixador Regional 5%  — 100 active referrals + 1000 network extras + platform approval
// activeReferrals = referred users with >=1 completed extra; networkExtras = sum of referred users' completed extras
export function referralRate(activeReferrals: number, networkExtras: number, approved: boolean): number {
  if (activeReferrals >= 100 && networkExtras >= 1000 && approved) return 0.05;
  if (activeReferrals >= 25 && networkExtras >= 100) return 0.03;
  return 0.02;
}

export function referralTierLabel(rate: number): string {
  if (rate >= 0.05) return "Embaixador Regional";
  if (rate >= 0.03) return "Agente de Captação";
  return "Indicador";
}

export function getLevelProgress(completedJobs: number, rep: number, currentLevel: string) {
  const nextLevelMap: Record<string, { label: string; jobs: number; rep: number } | null> = {
    bronze: { label: "Júnior", jobs: LEVEL_THRESHOLDS.silver.jobs, rep: LEVEL_THRESHOLDS.silver.rep },
    silver: { label: "Intermediário", jobs: LEVEL_THRESHOLDS.gold.jobs, rep: LEVEL_THRESHOLDS.gold.rep },
    gold: { label: "Sênior", jobs: LEVEL_THRESHOLDS.elite.jobs, rep: LEVEL_THRESHOLDS.elite.rep },
    elite: { label: "Elite", jobs: LEVEL_THRESHOLDS.diamond.jobs, rep: LEVEL_THRESHOLDS.diamond.rep },
    diamond: null,
  };

  const nextKeyMap: Record<string, string | null> = {
    bronze: "silver",
    silver: "gold",
    gold: "elite",
    elite: "diamond",
    diamond: null,
  };

  const prevJobsMap: Record<string, number> = {
    bronze: 0,
    silver: LEVEL_THRESHOLDS.silver.jobs,
    gold: LEVEL_THRESHOLDS.gold.jobs,
    elite: LEVEL_THRESHOLDS.elite.jobs,
    diamond: LEVEL_THRESHOLDS.diamond.jobs,
  };

  const next = nextLevelMap[currentLevel];
  if (!next) {
    return {
      nextLevel: null,
      nextLevelLabel: null,
      progressPercent: 100,
      jobsNeeded: 0,
      repNeeded: 0,
      jobsDone: completedJobs,
      repDone: rep,
    };
  }

  const prevJobs = prevJobsMap[currentLevel] ?? 0;
  const jobsRange = next.jobs - prevJobs;
  const jobsProgress = Math.min(completedJobs - prevJobs, jobsRange);
  const jobsPercent = jobsRange > 0 ? (jobsProgress / jobsRange) * 100 : 100;

  const repMin = currentLevel === "bronze" ? 0 : LEVEL_THRESHOLDS[currentLevel as keyof typeof LEVEL_THRESHOLDS]?.rep ?? 0;
  const repRange = next.rep - repMin;
  const repProgress = Math.min(Math.max(rep - repMin, 0), repRange);
  const repPercent = repRange > 0 ? (repProgress / repRange) * 100 : 100;

  const progressPercent = Math.round((jobsPercent + repPercent) / 2);

  return {
    nextLevel: nextKeyMap[currentLevel],
    nextLevelLabel: next.label,
    progressPercent: Math.min(progressPercent, 99),
    jobsNeeded: Math.max(next.jobs - completedJobs, 0),
    repNeeded: Math.max(+(next.rep - rep).toFixed(2), 0),
    jobsDone: completedJobs,
    repDone: +rep.toFixed(2),
    jobsRequired: next.jobs,
    repRequired: next.rep,
  };
}

export async function ensureWallet(userId: number, walletType: "freelancer" | "company" | "representative" | "platform" = "freelancer") {
  let [wallet] = await db.select().from(walletsTable).where(eq(walletsTable.userId, userId));
  if (!wallet) {
    [wallet] = await db.insert(walletsTable).values({ userId, walletType }).returning();
  } else if (wallet.walletType !== walletType) {
    // Reconcile wallet type if it was created with the wrong default
    [wallet] = await db.update(walletsTable)
      .set({ walletType })
      .where(eq(walletsTable.id, wallet.id))
      .returning();
  }
  return wallet;
}

const PLATFORM_USER_ID = 0;

export async function getPlatformWallet() {
  let [wallet] = await db.select().from(walletsTable).where(eq(walletsTable.userId, PLATFORM_USER_ID));
  if (!wallet) {
    [wallet] = await db.insert(walletsTable).values({ userId: PLATFORM_USER_ID, walletType: "platform" }).returning();
  }
  return wallet;
}

export async function recalculateReputation(userId: number): Promise<number> {
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  if (!user) return 0;

  const ratings = await db.select().from(ratingsTable).where(eq(ratingsTable.ratedId, userId));
  const ratingAvg = ratings.length > 0
    ? ratings.reduce((s, r) => s + r.score, 0) / ratings.length
    : 0;

  const allApps = await db.select().from(applicationsTable).where(eq(applicationsTable.freelancerId, userId));
  const totalApps = allApps.length;
  const completedApps = allApps.filter(a => a.status === "completed").length;
  const cancelledApps = allApps.filter(a => a.status === "cancelled").length;

  const completionRate = totalApps > 0 ? completedApps / totalApps : 0;
  const cancellationRate = totalApps > 0 ? cancelledApps / totalApps : 0;
  const attendanceScore = Math.max(0, 1 - cancellationRate);

  const responseRate = Math.min((user.responseRate ?? 0) / 100, 1);

  const accountAgeDays = user.createdAt
    ? (Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24)
    : 0;
  const tenureScore = Math.min(accountAgeDays / 365, 1);

  const ratingNormalized = ratingAvg / 5;

  const weightedScore =
    ratingNormalized * 0.50 +
    completionRate * 0.20 +
    attendanceScore * 0.15 +
    responseRate * 0.10 +
    tenureScore * 0.05;

  const reputationScore = +(weightedScore * 5).toFixed(2);
  await db.update(usersTable).set({ reputationScore }).where(eq(usersTable.id, userId));
  return reputationScore;
}

/**
 * Adjust the company wallet reservation for a specific application when a counter-offer is accepted.
 * Application-scoped: looks up the reservation transaction keyed by referenceId=app:{applicationId}
 * to determine exactly how much was reserved for THIS application (0 if the app was never approved
 * prior to counter-offer). Returns the amount that was reserved for the app before the adjustment.
 */
export async function adjustCounterOfferReservation(
  companyId: number,
  applicationId: number,
  newProposedRate: number,
): Promise<number> {
  const companyWallet = await ensureWallet(companyId, "company");

  // Look up the specific reservation transaction for this application
  const [reservationTx] = await db
    .select()
    .from(transactionsTable)
    .where(
      and(
        eq(transactionsTable.walletId, companyWallet.id),
        eq(transactionsTable.type, "reservation"),
        eq(transactionsTable.referenceId, `app:${applicationId}`),
      ),
    );

  // Amount reserved for this specific application (0 if app went pending → counter_offered directly)
  const reservedForApp = reservationTx?.amount ?? 0;

  // Net delta: positive means we need more from balance; negative means we release back to balance
  const delta = newProposedRate - reservedForApp;

  if (delta > 0 && companyWallet.balance < delta) {
    throw new Error("Insufficient company balance to reserve counter-offer amount");
  }

  await db.update(walletsTable).set({
    reservedBalance: sql`${walletsTable.reservedBalance} - ${reservedForApp} + ${newProposedRate}`,
    balance: sql`${walletsTable.balance} + ${reservedForApp} - ${newProposedRate}`,
  }).where(eq(walletsTable.id, companyWallet.id));

  return reservedForApp;
}

export async function completeJobCascade(
  applicationId: number,
  jobId: number,
  freelancerId: number,
  companyId: number,
  jobTitle: string,
  jobValue: number,
  jobLocation?: string,
) {
  // Load governance split config BEFORE the transaction — must not run inside tx
  const splitCfg: SplitConfig = await loadSplitConfig();

  const result = await db.transaction(async (tx) => {
    // --- 1. Strict company funds check before any mutations ---
    const [companyWalletCheck] = await tx.select().from(walletsTable).where(eq(walletsTable.userId, companyId));
    const totalAvailable = (companyWalletCheck?.reservedBalance ?? 0) + (companyWalletCheck?.balance ?? 0);
    if (totalAvailable < jobValue) {
      throw new Error(`Insufficient company funds: need ${jobValue}, have ${totalAvailable}`);
    }

    // --- 2. Mark application as completed atomically ---
    const [completedApp] = await tx.update(applicationsTable)
      .set({ status: "completed" })
      .where(eq(applicationsTable.id, applicationId))
      .returning();
    if (!completedApp) throw new Error("Application not found");

    const [freelancer] = await tx.update(usersTable)
      .set({ completedJobs: sql`${usersTable.completedJobs} + 1` })
      .where(eq(usersTable.id, freelancerId))
      .returning();

    if (!freelancer) throw new Error("Freelancer not found");

    const feeRate = splitCfg.platformFeeByLevel[freelancer.level as string] ?? LEVEL_FEE[freelancer.level as string] ?? 0.20;
    const platformFee = Math.round(jobValue * feeRate);
    const freelancerEarnings = Math.round(jobValue - platformFee);

    let [freelancerWallet] = await tx.select().from(walletsTable).where(eq(walletsTable.userId, freelancerId));
    if (!freelancerWallet) {
      [freelancerWallet] = await tx.insert(walletsTable).values({ userId: freelancerId, walletType: "freelancer" }).returning();
    }

    await tx.update(walletsTable).set({
      balance: sql`${walletsTable.balance} + ${freelancerEarnings}`,
      totalEarned: sql`${walletsTable.totalEarned} + ${freelancerEarnings}`,
      totalFeesPaid: sql`${walletsTable.totalFeesPaid} + ${platformFee}`,
    }).where(eq(walletsTable.id, freelancerWallet.id));

    await tx.insert(transactionsTable).values({
      walletId: freelancerWallet.id,
      type: "credit",
      amount: freelancerEarnings,
      description: `Pagamento: ${jobTitle}`,
      status: "completed",
      referenceId: `app:${applicationId}`,
    });

    await tx.insert(transactionsTable).values({
      walletId: freelancerWallet.id,
      type: "platform_fee",
      amount: platformFee,
      description: `Taxa da plataforma (${(feeRate * 100).toFixed(0)}%): ${jobTitle}`,
      status: "completed",
      referenceId: `app:${applicationId}`,
    });

    // Credit platform wallet with fees
    let [platformWallet] = await tx.select().from(walletsTable).where(eq(walletsTable.userId, PLATFORM_USER_ID));
    if (!platformWallet) {
      [platformWallet] = await tx.insert(walletsTable).values({ userId: PLATFORM_USER_ID, walletType: "platform" }).returning();
    }
    await tx.update(walletsTable).set({
      balance: sql`${walletsTable.balance} + ${platformFee}`,
      totalEarned: sql`${walletsTable.totalEarned} + ${platformFee}`,
    }).where(eq(walletsTable.id, platformWallet.id));

    await tx.insert(transactionsTable).values({
      walletId: platformWallet.id,
      type: "credit",
      amount: platformFee,
      description: `Taxa de plataforma: ${jobTitle}`,
      status: "completed",
      referenceId: `app:${applicationId}`,
    });

    // Release reserved balance from company wallet, debit total spent (strict split ledger)
    const [companyWallet] = await tx.select().from(walletsTable).where(eq(walletsTable.userId, companyId));
    if (companyWallet) {
      const fromReserved = Math.min(companyWallet.reservedBalance, jobValue);
      const fromBalance = jobValue - fromReserved;
      await tx.update(walletsTable).set({
        reservedBalance: sql`${walletsTable.reservedBalance} - ${fromReserved}`,
        balance: sql`${walletsTable.balance} - ${fromBalance}`,
        totalSpent: sql`${walletsTable.totalSpent} + ${jobValue}`,
      }).where(eq(walletsTable.id, companyWallet.id));

      await tx.insert(transactionsTable).values({
        walletId: companyWallet.id,
        type: "debit",
        amount: jobValue,
        description: `Pagamento por Extra: ${jobTitle}`,
        status: "completed",
        referenceId: `app:${applicationId}`,
      });
    }

    // Referral commission — tiered rate (Indicador 2% / Agente de Captação 3% / Embaixador Regional 5%)
    let referralCommission = 0;
    if (freelancer.referredById) {
      const referred = await tx.select({ cj: usersTable.completedJobs }).from(usersTable).where(eq(usersTable.referredById, freelancer.referredById));
      const activeReferrals = referred.filter(r => (r.cj ?? 0) >= 1).length;
      const networkExtras = referred.reduce((s, r) => s + (r.cj ?? 0), 0);
      const [refUser] = await tx.select().from(usersTable).where(eq(usersTable.id, freelancer.referredById));
      const refRate = calcRefRate(splitCfg, activeReferrals, networkExtras, refUser?.ambassadorApproved ?? false);
      referralCommission = Math.round(freelancerEarnings * refRate);
      if (referralCommission > 0) {
        let [refWallet] = await tx.select().from(walletsTable).where(eq(walletsTable.userId, freelancer.referredById));
        if (!refWallet) {
          [refWallet] = await tx.insert(walletsTable).values({ userId: freelancer.referredById, walletType: "freelancer" }).returning();
        }
        await tx.update(walletsTable).set({
          balance: sql`${walletsTable.balance} + ${referralCommission}`,
          totalEarned: sql`${walletsTable.totalEarned} + ${referralCommission}`,
        }).where(eq(walletsTable.id, refWallet.id));
        await tx.insert(transactionsTable).values({
          walletId: refWallet.id,
          type: "commission",
          amount: referralCommission,
          description: `Comissão de indicação (${(refRate * 100).toFixed(0)}%): ${freelancer.name}`,
          status: "completed",
          referenceId: `app:${applicationId}`,
        });
      }
    }

    // State representative commission (from platform fee — keyed by job location state)
    const representatives = await tx.select().from(stateRepresentativesTable);
    const jobStateCode = (jobLocation ?? "").toUpperCase().replace(/[^A-Z]/g, "").slice(0, 2);
    for (const rep of representatives) {
      if (jobStateCode && rep.stateCode === jobStateCode) {
        const repCommission = Math.round(platformFee * rep.commissionRate);
        if (repCommission > 0) {
          // Ensure representative wallet exists in transaction
          let [repWallet] = await tx.select().from(walletsTable).where(eq(walletsTable.userId, rep.userId));
          if (!repWallet) {
            [repWallet] = await tx.insert(walletsTable).values({ userId: rep.userId, walletType: "representative" }).returning();
          }
          await tx.update(walletsTable).set({
            balance: sql`${walletsTable.balance} + ${repCommission}`,
            totalEarned: sql`${walletsTable.totalEarned} + ${repCommission}`,
          }).where(eq(walletsTable.id, repWallet.id));
          await tx.insert(transactionsTable).values({
            walletId: repWallet.id,
            type: "commission",
            amount: repCommission,
            description: `Comissão regional: ${jobTitle}`,
            status: "completed",
            referenceId: `app:${applicationId}`,
          });
        }
        break;
      }
    }

    // Reputation recalculation — atomically inside the transaction so it either fully
    // succeeds with all financial mutations or rolls back together (no orphaned state).
    // PostgreSQL READ COMMITTED: our own writes in this tx (status="completed", completedJobs++)
    // are immediately visible to our own reads, so freshApps includes the completed one.
    const freshRatings = await tx.select().from(ratingsTable).where(eq(ratingsTable.ratedId, freelancerId));
    const ratingAvg = freshRatings.length > 0
      ? freshRatings.reduce((s: number, r: any) => s + (r.score ?? 0), 0) / freshRatings.length
      : 0;
    const freshApps = await tx.select().from(applicationsTable).where(eq(applicationsTable.freelancerId, freelancerId));
    const completedCount = freshApps.filter((a: any) => a.status === "completed").length;
    const cancelledCount = freshApps.filter((a: any) => a.status === "cancelled").length;
    const totalAppsCount = freshApps.length;
    const completionRate = totalAppsCount > 0 ? completedCount / totalAppsCount : 0;
    const attendanceScore = Math.max(0, 1 - (totalAppsCount > 0 ? cancelledCount / totalAppsCount : 0));
    const responseRate = Math.min((freelancer.responseRate ?? 0) / 100, 1);
    const accountAgeDays = freelancer.createdAt
      ? (Date.now() - new Date(String(freelancer.createdAt)).getTime()) / (1000 * 60 * 60 * 24)
      : 0;
    const tenureScore = Math.min(accountAgeDays / 365, 1);
    const weightedScore =
      (ratingAvg / 5) * 0.50 +
      completionRate * 0.20 +
      attendanceScore * 0.15 +
      responseRate * 0.10 +
      tenureScore * 0.05;
    const newReputationScore = +(weightedScore * 5).toFixed(2);
    await tx.update(usersTable).set({ reputationScore: newReputationScore }).where(eq(usersTable.id, freelancerId));

    // Level progression — re-evaluate with the freshly computed reputation score
    const newLevel = calculateLevel(freelancer.completedJobs, newReputationScore);
    const levelChanged = newLevel !== (freelancer.level as string);
    if (levelChanged) {
      await tx.update(usersTable).set({ level: newLevel }).where(eq(usersTable.id, freelancerId));
    }

    // Notifications inside the transaction so they are atomic with all financial/stat mutations.
    // If the transaction rolls back (e.g. insufficient funds), no notifications are sent.
    await createNotification({
      userId: freelancerId,
      type: "job_completed",
      title: "✅ Extra concluído!",
      message: `Seu trabalho em "${jobTitle}" foi concluído. R${(freelancerEarnings / 100).toFixed(2)} disponível na carteira.`,
    }, tx);

    await createNotification({
      userId: companyId,
      type: "job_completed",
      title: "✅ Extra finalizado",
      message: `O Extra "${jobTitle}" foi concluído com sucesso.`,
    }, tx);

    if (levelChanged) {
      await createNotification({
        userId: freelancerId,
        type: "level_up",
        title: "🎉 Você subiu de nível!",
        message: `Parabéns! Você agora é ${LEVEL_LABELS[newLevel]}. Taxa reduzida para ${(LEVEL_FEE[newLevel] * 100).toFixed(0)}%.`,
      }, tx);
    }

    if (freelancer.referredById && referralCommission > 0) {
      await createNotification({
        userId: freelancer.referredById,
        type: "commission_received",
        title: "💰 Comissão de indicação!",
        message: `+R${(referralCommission / 100).toFixed(2)} pelo Extra concluído por ${freelancer.name}`,
      }, tx);
    }

    return { completedApp, freelancer, freelancerEarnings, platformFee, feeRate, newLevel, levelChanged, newReputationScore };
  });

  return { completedApp: result.completedApp, freelancerEarnings: result.freelancerEarnings, platformFee: result.platformFee, newLevel: result.newLevel, levelChanged: result.levelChanged, newReputation: result.newReputationScore };
}

export async function reserveCompanyFunds(companyId: number, amount: number, jobTitle: string, applicationId: number) {
  const companyWallet = await ensureWallet(companyId, "company");
  if (companyWallet.balance < amount) {
    throw new Error("Insufficient company balance to reserve funds");
  }
  await db.update(walletsTable).set({
    balance: sql`${walletsTable.balance} - ${amount}`,
    reservedBalance: sql`${walletsTable.reservedBalance} + ${amount}`,
  }).where(eq(walletsTable.id, companyWallet.id));

  await db.insert(transactionsTable).values({
    walletId: companyWallet.id,
    type: "reservation",
    amount,
    description: `Reserva para Extra: ${jobTitle}`,
    status: "pending",
    referenceId: `app:${applicationId}`,
  });

  return companyWallet;
}
