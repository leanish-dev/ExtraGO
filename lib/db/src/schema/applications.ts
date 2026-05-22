import { pgTable, serial, integer, text, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const applicationStatusEnum = pgEnum("application_status", ["pending", "approved", "rejected", "completed"]);

export const applicationsTable = pgTable("applications", {
  id: serial("id").primaryKey(),
  jobId: integer("job_id").notNull(),
  freelancerId: integer("freelancer_id").notNull(),
  status: applicationStatusEnum("status").notNull().default("pending"),
  message: text("message"),
  appliedAt: timestamp("applied_at").notNull().defaultNow(),
});

export const insertApplicationSchema = createInsertSchema(applicationsTable).omit({ id: true, appliedAt: true });
export type InsertApplication = z.infer<typeof insertApplicationSchema>;
export type Application = typeof applicationsTable.$inferSelect;
