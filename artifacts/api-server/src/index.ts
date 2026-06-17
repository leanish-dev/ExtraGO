import fs from "node:fs";
import path from "node:path";
import app from "./app";
import { logger } from "./lib/logger";
import { SERVER_BUILD_ISO } from "./lib/build-info";
import { pool, db, usersTable, sessionsTable } from "@workspace/db";
import { eq, lt } from "drizzle-orm";
import { hashPassword, generateReferralCode, storeToken, generateToken } from "./lib/auth";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

const MASTER_ADMIN_EMAIL = "leonardoscheffel2000@gmail.com";
const MASTER_ADMIN_HASH = "55815ec3857918a0c7accc86eb5f8a645f4e35262b5a0a4ca56057142d0e502f";

async function waitForDatabase(retries = 10, delayMs = 1500): Promise<void> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const client = await pool.connect();
      await client.query("SELECT 1");
      client.release();
      logger.info("Database connection established");
      return;
    } catch (err: any) {
      logger.warn({ attempt, retries, err: err.message }, "Database not ready, retrying...");
      if (attempt === retries) {
        throw new Error(`Database unreachable after ${retries} attempts: ${err.message}`);
      }
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
}

async function seedMasterAdmin() {
  try {
    const [existing] = await db.select().from(usersTable).where(eq(usersTable.email, MASTER_ADMIN_EMAIL)).limit(1);
    if (existing) {
      const updates: Record<string, any> = {};
      if (existing.role !== "admin") updates.role = "admin";
      if (!existing.adminRole || existing.adminRole !== "super_admin") updates.adminRole = "super_admin";
      if (!existing.isVerified) updates.isVerified = true;
      if (Object.keys(updates).length > 0) {
        await db.update(usersTable).set(updates).where(eq(usersTable.id, existing.id));
        logger.info({ id: existing.id }, "Master admin updated");
      } else {
        logger.info({ id: existing.id }, "Master admin already configured");
      }
      return;
    }

    const [admin] = await db.insert(usersTable).values({
      email: MASTER_ADMIN_EMAIL,
      name: "Leonardo Scheffel da Rosa",
      passwordHash: MASTER_ADMIN_HASH,
      role: "admin",
      adminRole: "super_admin",
      isVerified: true,
      isBanned: false,
      referralCode: generateReferralCode(),
      level: "elite",
      profileCompletion: 100,
    }).returning({ id: usersTable.id });

    logger.info({ id: admin.id }, "Master admin account created");
  } catch (err: any) {
    logger.error({ err: err.message }, "Failed to seed master admin");
  }
}

async function cleanExpiredSessions() {
  try {
    await db.delete(sessionsTable).where(lt(sessionsTable.expiresAt, new Date())).catch(() => {});
  } catch {
    // non-critical
  }
}

// ─── Dev-mode: watch critical source files and warn when they change ──────────
if (process.env.NODE_ENV === "development") {
  const watchTargets = [
    path.resolve(process.cwd(), "src/routes/seed.ts"),
    path.resolve(process.cwd(), "src/lib/auth.ts"),
  ];
  for (const target of watchTargets) {
    if (fs.existsSync(target)) {
      fs.watch(target, () => {
        const rel = path.relative(process.cwd(), target);
        logger.warn(
          `⚠️  SOURCE CHANGED: ${rel}\n` +
          `   The running server was compiled BEFORE this edit.\n` +
          `   → Restart the "API Server" workflow to recompile.\n` +
          `   → Then re-run: POST /api/setup/seed`
        );
      });
    }
  }
}

app.listen(port, async (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port, builtAt: SERVER_BUILD_ISO }, "Server listening");

  try {
    await waitForDatabase();
  } catch (err: any) {
    logger.error({ err: err.message }, "Could not connect to database at startup — continuing anyway");
  }

  await seedMasterAdmin();
  await cleanExpiredSessions();
});
