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
import { rateLimit } from "../lib/rate-limit";
import {
  isDisposableEmail,
  findDuplicateCpf,
  findDuplicateCnpj,
  findDuplicatePhone,
  recordFraudLog,
  recordLoginAttempt,
  recordAuditLog,
  isAccountLocked,
  registerFailedLogin,
  resetFailedLogin,
  createEmailVerification,
  sendEmail,
} from "../lib/verification";

const router = Router();

const authLimiter = rateLimit({ windowMs: 60_000, max: 10, keyPrefix: "auth-core" });

// POST /auth/register
router.post("/auth/register", authLimiter, async (req, res) => {
  const parsed = RegisterBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }
  const { email, password, name, role, referralCode, companyName } = parsed.data;
  // Optional fields not (yet) part of the generated register contract —
  // accepted opportunistically so existing registration UX is unaffected.
  const cpf = typeof req.body.cpf === "string" ? req.body.cpf.trim() : undefined;
  const cnpj = typeof req.body.cnpj === "string" ? req.body.cnpj.trim() : undefined;
  const phone = typeof req.body.phone === "string" ? req.body.phone.trim() : undefined;

  const [existing] = await db.select().from(usersTable).where(eq(usersTable.email, email));
  if (existing) {
    res.status(400).json({ error: "Email already in use" });
    return;
  }

  if (isDisposableEmail(email)) {
    await recordFraudLog({ type: "disposable_email", details: { email }, req });
    res.status(400).json({ error: "Disposable email addresses are not allowed" });
    return;
  }
  if (cpf) {
    const dup = await findDuplicateCpf(cpf);
    if (dup) {
      await recordFraudLog({ userId: dup.id, type: "duplicate_cpf", details: { cpf }, req });
      res.status(400).json({ error: "CPF already registered" });
      return;
    }
  }
  if (cnpj) {
    const dup = await findDuplicateCnpj(cnpj);
    if (dup) {
      await recordFraudLog({ userId: dup.id, type: "duplicate_cnpj", details: { cnpj }, req });
      res.status(400).json({ error: "CNPJ already registered" });
      return;
    }
  }
  if (phone) {
    const dup = await findDuplicatePhone(phone);
    if (dup) {
      await recordFraudLog({ userId: dup.id, type: "duplicate_phone", details: { phone }, req });
      res.status(400).json({ error: "Phone already registered" });
      return;
    }
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
    cpf: cpf || null,
    cnpj: cnpj || null,
    phone: phone || null,
    referralCode: newReferralCode,
    referredById: referredById ?? null,
    categories: [],
    accountStatus: "pending_email",
  }).returning();

  // Create wallet
  await db.insert(walletsTable).values({ userId: user.id }).catch(() => {});

  // Kick off the email-verification flow automatically.
  const verification = await createEmailVerification({ userId: user.id, email: user.email, purpose: "verify_email" });
  if (!verification.throttled) {
    await sendEmail(user.email, "Confirme seu e-mail", `Seu código de verificação é ${verification.record.otpCode}`);
  }
  await recordAuditLog({ userId: user.id, action: "user_registered", req });

  const token = generateToken(user.id);
  await storeToken(token, user.id);

  res.status(201).json({ user: formatUser(user), token });
});

// POST /auth/login
router.post("/auth/login", authLimiter, async (req, res) => {
  const parsed = LoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }
  const { email, password } = parsed.data;

  const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email));
  if (!user) {
    await recordLoginAttempt({ email, success: false, reason: "no_such_user", req });
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  if (isAccountLocked(user)) {
    await recordLoginAttempt({ email, success: false, reason: "account_locked", req });
    await recordFraudLog({ userId: user.id, type: "account_locked", req });
    res.status(423).json({ error: "Account temporarily locked due to repeated failed attempts", lockedUntil: user.lockedUntil });
    return;
  }

  if (user.passwordHash !== hashPassword(password)) {
    await recordLoginAttempt({ email, success: false, reason: "wrong_password", req });
    await registerFailedLogin(user.id, user.failedLoginAttempts);
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }
  if (user.isBanned || user.accountStatus === "blocked") {
    await recordLoginAttempt({ email, success: false, reason: "banned", req });
    res.status(403).json({ error: "Account is banned" });
    return;
  }
  if (user.accountStatus === "rejected") {
    await recordLoginAttempt({ email, success: false, reason: "rejected", req });
    res.status(403).json({ error: "Account verification was rejected", accountStatus: user.accountStatus });
    return;
  }

  await recordLoginAttempt({ email, success: true, req });
  await resetFailedLogin(user.id);

  const token = generateToken(user.id);
  await storeToken(token, user.id);

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
    await removeToken(authHeader.slice(7));
  }
  res.json({ message: "Logged out" });
});

export default router;
