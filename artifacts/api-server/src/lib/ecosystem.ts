import { db, usersTable, walletsTable, transactionsTable, notificationsTable, depositRequestsTable, stateRepresentativesTable, applicationsTable, ratingsTable } from "@workspace/db";
import { eq, sql, and } from "drizzle-orm";

export const LEVEL_FEE: Record<string, number> = {
  bronze: 0.18,
  silver: 0.16,
  gold: 0.14,
  elite: 0.10,
};

export const LEVEL_LABELS: Record<string, string> = {
  bronze: "Iniciante",
  silver: "Júnior",
  gold: "Intermediário",
  elite: "Sênior",
};

export const LEVEL_THRESHOLDS = {
  elite: { jobs: 300, rep: 4.8 },
  gold: { jobs: 100, rep: 4.7 },
  silver: { jobs: 20, rep: 4.5 },
};

export function calculateLevel(completedJobs: number, rep: number): "bronze" | "silver" | "gold" | "elite" {
  if (completedJobs >= LEVEL_THRESHOLDS.elite.jobs && rep >= LEVEL_THRESHOLDS.elite.rep) return "elite";
  if (completedJobs >= LEVEL_THRESHOLDS.gold.jobs && rep >= LEVEL_THRESHOLDS.gold.rep) return "gold";
  if (completedJobs >= LEVEL_THRESHOLDS.silver.jobs && rep >= LEVEL_THRESHOLDS.silver.rep) return "silver";
  return "bronze";
}

export function getLevelProgress(completedJobs: number, rep: number, currentLevel: string) {
  const nextLevelMap: Record<string, { label: string; jobs: number; rep: number } | null> = {
    bronze: { label: "Júnior", jobs: LEVEL_THRESHOLDS.silver.jobs, rep: LEVEL_THRESHOLDS.silver.rep },
    silver: { label: "Intermediário", jobs: LEVEL_THRESHOLDS.gold.jobs, rep: LEVEL_THRESHOLDS.gold.rep },
    gold: { label: "Sênior", jobs: LEVEL_THRESHOLDS.elite.jobs, rep: LEVEL_THRESHOLDS.elite.rep },
    elite: null,
  };

  const prevJobsMap: Record<string, number> = {
    bronze: 0,
    silver: LEVEL_THRESHOLDS.silver.jobs,
    gold: LEVEL_THRESHOLDS.gold.jobs,
    elite: LEVEL_THRESHOLDS.elite.jobs,
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
    nextLevel: Object.keys(LEVEL_THRESHOLDS).find(k => LEVEL_LABELS[k === "elite" ? "elite" : k] === next.label) ??
      (currentLevel === "bronze" ? "silver" : currentLevel === "silver" ? "gold" : "elite"),
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

export async function adjustCounterOfferReservation(
  companyId: number,
  originalJobValue: number,
  newProposedRate: number,
) {
  const companyWallet = await ensureWallet(companyId, "company");
  const currentReserved = companyWallet.reservedBalance;
  // Release whatever was previously reserved for this job (capped to current reserved)
  const toRelease = Math.min(currentReserved, originalJobValue);
  // Net additional funds needed from balance
  const netNew = newProposedRate - toRelease;
  if (netNew > 0 && companyWallet.balance < netNew) {
    throw new Error("Insufficient company balance to reserve counter-offer amount");
  }
  await db.update(walletsTable).set({
    reservedBalance: sql`GREATEST(${walletsTable.reservedBalance} - ${toRelease}, 0) + ${newProposedRate}`,
    balance: sql`${walletsTable.balance} + ${toRelease} - ${newProposedRate}`,
  }).where(eq(walletsTable.id, companyWallet.id));
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

    const feeRate = LEVEL_FEE[freelancer.level as string] ?? 0.18;
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

    // Referral commission (3% of freelancer earnings) — ensure wallet exists in transaction
    if (freelancer.referredById) {
      const commission = Math.round(freelancerEarnings * 0.03);
      if (commission > 0) {
        let [refWallet] = await tx.select().from(walletsTable).where(eq(walletsTable.userId, freelancer.referredById));
        if (!refWallet) {
          [refWallet] = await tx.insert(walletsTable).values({ userId: freelancer.referredById, walletType: "freelancer" }).returning();
        }
        await tx.update(walletsTable).set({
          balance: sql`${walletsTable.balance} + ${commission}`,
          totalEarned: sql`${walletsTable.totalEarned} + ${commission}`,
        }).where(eq(walletsTable.id, refWallet.id));
        await tx.insert(transactionsTable).values({
          walletId: refWallet.id,
          type: "commission",
          amount: commission,
          description: `Comissão de indicação: ${freelancer.name}`,
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

    return { completedApp, freelancer, freelancerEarnings, platformFee, feeRate, newLevel, levelChanged, newReputationScore };
  });

  // Fire-and-forget notifications (non-critical, outside transaction)
  if (result.levelChanged) {
    db.insert(notificationsTable).values({
      userId: freelancerId,
      type: "level_up",
      title: "🎉 Você subiu de nível!",
      message: `Parabéns! Você agora é ${LEVEL_LABELS[result.newLevel]}. Taxa reduzida para ${(LEVEL_FEE[result.newLevel] * 100).toFixed(0)}%.`,
      isRead: false,
    }).catch(() => {});
  }

  if (result.freelancer.referredById) {
    const commission = Math.round(result.freelancerEarnings * 0.03);
    if (commission > 0) {
      db.insert(notificationsTable).values({
        userId: result.freelancer.referredById,
        type: "commission_received",
        title: "💰 Comissão de indicação!",
        message: `+R$${(commission / 100).toFixed(2)} pelo Extra concluído por ${result.freelancer.name}`,
        isRead: false,
      }).catch(() => {});
    }
  }

  db.insert(notificationsTable).values({
    userId: freelancerId,
    type: "job_completed",
    title: "✅ Extra concluído!",
    message: `Seu trabalho em "${jobTitle}" foi concluído. R$${(result.freelancerEarnings / 100).toFixed(2)} disponível na carteira.`,
    isRead: false,
  }).catch(() => {});

  db.insert(notificationsTable).values({
    userId: companyId,
    type: "job_completed",
    title: "✅ Extra finalizado",
    message: `O Extra "${jobTitle}" foi concluído com sucesso.`,
    isRead: false,
  }).catch(() => {});

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
