import { pgTable, serial, text, integer, real, timestamp, pgEnum, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const jobStatusEnum = pgEnum("job_status", [
  "open",
  "scheduled",
  "waiting_checkin",
  "checked_in",
  "in_progress",
  "on_break",
  "waiting_checkout",
  "completed",
  "cancelled",
  "disputed",
]);

export const shiftTypeEnum = pgEnum("shift_type", ["hourly", "daily"]);

export const jobsTable = pgTable("jobs", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  location: text("location").notNull(),
  date: text("date").notNull(),
  startTime: text("start_time").notNull(),
  endTime: text("end_time").notNull(),
  workersNeeded: integer("workers_needed").notNull().default(1),
  workersApproved: integer("workers_approved").notNull().default(0),
  hourlyRate: real("hourly_rate").notNull(),
  dailyRate: real("daily_rate"),
  shiftType: shiftTypeEnum("shift_type").notNull().default("hourly"),
  totalValue: real("total_value").notNull().default(0),
  status: jobStatusEnum("status").notNull().default("open"),
  companyId: integer("company_id").notNull(),
  walletReservationId: text("wallet_reservation_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertJobSchema = createInsertSchema(jobsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertJob = z.infer<typeof insertJobSchema>;
export type Job = typeof jobsTable.$inferSelect;
