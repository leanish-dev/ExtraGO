import { Request, Response, NextFunction } from "express";
import { db, usersTable } from "@workspace/db";
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

// Simple token store (in-memory for demo; production would use Redis/DB)
const tokenStore = new Map<string, number>();

export function storeToken(token: string, userId: number): void {
  tokenStore.set(token, userId);
}

export function getUserIdFromToken(token: string): number | null {
  return tokenStore.get(token) ?? null;
}

export function removeToken(token: string): void {
  tokenStore.delete(token);
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers["authorization"];
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const token = authHeader.slice(7);
  const userId = getUserIdFromToken(token);
  if (!userId) {
    res.status(401).json({ error: "Invalid token" });
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
    if (user.role !== "admin") {
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
