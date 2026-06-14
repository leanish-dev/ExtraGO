import { Request, Response, NextFunction } from "express";
import { db, usersTable, sessionsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import crypto from "crypto";

export function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password + "extragO_salt_2024").digest("hex");
}

export function generateToken(userId: number): string {
  return Buffer.from(`${userId}:${Date.now()}:${crypto.randomBytes(16).toString("hex")}`).toString("base64");
}

export function generateReferralCode(): string {
  return crypto.randomBytes(4).toString("hex").toUpperCase();
}

export async function storeToken(token: string, userId: number): Promise<void> {
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  await db.insert(sessionsTable).values({ token, userId, expiresAt }).catch(() => {});
}

export async function getUserIdFromToken(token: string): Promise<number | null> {
  const [session] = await db.select().from(sessionsTable).where(eq(sessionsTable.token, token)).limit(1);
  if (!session) return null;
  if (session.expiresAt && session.expiresAt < new Date()) {
    await db.delete(sessionsTable).where(eq(sessionsTable.token, token)).catch(() => {});
    return null;
  }
  return session.userId;
}

export async function removeToken(token: string): Promise<void> {
  await db.delete(sessionsTable).where(eq(sessionsTable.token, token)).catch(() => {});
}

export function isAdminRole(role: string): boolean {
  return role === "admin";
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers["authorization"];
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const token = authHeader.slice(7);
  const userId = await getUserIdFromToken(token);
  if (!userId) {
    res.status(401).json({ error: "Invalid or expired token" });
    return;
  }
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  if (!user || user.isBanned) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  (req as any).user = user;
  next();
}

export async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  await requireAuth(req, res, async () => {
    const user = (req as any).user;
    if (!isAdminRole(user.role)) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }
    next();
  });
}

export function formatUser(user: any) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    adminRole: user.adminRole ?? null,
    corporateRole: user.corporateRole ?? null,
    avatarUrl: user.avatarUrl ?? null,
    bio: user.bio ?? null,
    phone: user.phone ?? null,
    companyName: user.companyName ?? null,
    pixKey: user.pixKey ?? null,
    categories: user.categories ?? [],
    level: user.level,
    reputationScore: user.reputationScore,
    completedJobs: user.completedJobs,
    isVerified: user.isVerified,
    isBanned: user.isBanned,
    profileCompletion: user.profileCompletion,
    referralCode: user.referralCode,
    createdAt: user.createdAt?.toISOString(),
  };
}
