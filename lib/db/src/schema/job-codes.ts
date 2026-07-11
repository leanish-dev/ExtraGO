import { pgTable, serial, integer, text, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const jobCodeTypeEnum = pgEnum("job_code_type", [
  "checkin_company",
  "checkin_freelancer",
  "checkout_company",
  "checkout_freelancer",
]);

/**
 * Stores the 6-digit validation codes for Extra check-in and check-out.
 * Each Extra generates 2 codes at check-in (one for company, one for freelancer)
 * and 2 codes at check-out.
 */
export const jobCodesTable = pgTable("job_codes", {
  id: serial("id").primaryKey(),
  jobId: integer("job_id").notNull(),
  applicationId: integer("application_id"),
  codeType: jobCodeTypeEnum("code_type").notNull(),
  code: text("code").notNull(),          // 6-digit numeric string
  expiresAt: timestamp("expires_at").notNull(),
  usedAt: timestamp("used_at"),
  usedByUserId: integer("used_by_user_id"),
  ipAddress: text("ip_address"),
  gps: text("gps"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertJobCodeSchema = createInsertSchema(jobCodesTable).omit({ id: true, createdAt: true });
export type InsertJobCode = z.infer<typeof insertJobCodeSchema>;
export type JobCode = typeof jobCodesTable.$inferSelect;
