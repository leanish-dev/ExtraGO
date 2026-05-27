import { Request, Response, NextFunction } from "express";
import { db, usersTable, auditLogsTable } from "@workspace/db";
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

const tokenStore = new Map<string, { userId: number; createdAt: number }>();
const TOKEN_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

export function storeToken(token: string, userId: number): void {
  tokenStore.set(token, { userId, createdAt: Date.now() });
}

export function getUserIdFromToken(token: string): number | null {
  const entry = tokenStore.get(token);
  if (!entry) return null;
  if (Date.now() - entry.createdAt > TOKEN_TTL_MS) {
    tokenStore.delete(token);
    return null;
  }
  return entry.userId;
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
    if (user.role !== "admin") {
      res.status(403).json({ error: "Forbidden" });
      return;
    }
    next();
  });
}

export function requireAdminRole(allowedRoles: string[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    await requireAdmin(req, res, async () => {
      const user = (req as any).user;
      const adminRole = user.adminRole ?? "super_admin";
      if (adminRole === "super_admin") {
        next();
        return;
      }
      if (!allowedRoles.includes(adminRole)) {
        res.status(403).json({ error: "Insufficient permissions for this action" });
        return;
      }
      next();
    });
  };
}

export async function logAuditAction(params: {
  adminId: number;
  adminName: string;
  adminRole?: string;
  action: string;
  targetType?: string;
  targetId?: number;
  details?: object;
}) {
  try {
    await db.insert(auditLogsTable).values({
      adminId: params.adminId,
      adminName: params.adminName,
      adminRole: params.adminRole ?? "super_admin",
      action: params.action,
      targetType: params.targetType ?? null,
      targetId: params.targetId ?? null,
      details: params.details ?? null,
    });
  } catch (e) {
    // Audit log failures should not crash the main operation
  }
}

export function formatUser(user: any) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    adminRole: user.adminRole ?? null,
    stateCode: user.stateCode ?? null,
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
