import { Router } from "express";
import { db, usersTable, walletsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { RegisterBody, LoginBody } from "@workspace/api-zod";
import {
  hashPassword,
  generateToken,
  generateReferralCode,
  storeToken,
  getUserIdFromToken,
  removeToken,
  requireAuth,
  formatUser,
} from "../lib/auth";

const router = Router();

// POST /auth/register
router.post("/auth/register", async (req, res) => {
  const parsed = RegisterBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }
  const { email, password, name, role, referralCode, companyName } = parsed.data;

  const [existing] = await db.select().from(usersTable).where(eq(usersTable.email, email));
  if (existing) {
    res.status(400).json({ error: "Email already in use" });
    return;
  }

  let referredById: number | undefined;
  if (referralCode) {
    const [referrer] = await db.select().from(usersTable).where(eq(usersTable.referralCode, referralCode));
    if (referrer) referredById = referrer.id;
  }

  const passwordHash = hashPassword(password);
  const newReferralCode = generateReferralCode();

  const [user] = await db.insert(usersTable).values({
    email,
    passwordHash,
    name,
    role: role as "company" | "freelancer",
    companyName: companyName ?? null,
    referralCode: newReferralCode,
    referredById: referredById ?? null,
    categories: [],
  }).returning();

  // Create wallet
  await db.insert(walletsTable).values({ userId: user.id }).catch(() => {});

  const token = generateToken(user.id);
  storeToken(token, user.id);

  res.status(201).json({ user: formatUser(user), token });
});

// POST /auth/login
router.post("/auth/login", async (req, res) => {
  const parsed = LoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }
  const { email, password } = parsed.data;

  const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email));
  if (!user) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }
  if (user.passwordHash !== hashPassword(password)) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }
  if (user.isBanned) {
    res.status(403).json({ error: "Account is banned" });
    return;
  }

  const token = generateToken(user.id);
  storeToken(token, user.id);

  res.json({ user: formatUser(user), token });
});

// GET /auth/me
router.get("/auth/me", requireAuth, async (req, res) => {
  res.json(formatUser((req as any).user));
});

// POST /auth/logout
router.post("/auth/logout", requireAuth, async (req, res) => {
  const authHeader = req.headers["authorization"];
  if (authHeader?.startsWith("Bearer ")) {
    removeToken(authHeader.slice(7));
  }
  res.json({ message: "Logged out" });
});

export default router;
