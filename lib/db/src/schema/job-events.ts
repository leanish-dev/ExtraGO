import { pgTable, serial, integer, text, timestamp, pgEnum, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const jobEventTypeEnum = pgEnum("job_event_type", [
  "created",
  "edited",
  "accepted",
  "checkin_code_generated",
  "checkin_validated",
  "started",
  "paused",
  "resumed",
  "checkout_code_generated",
  "checkout_validated",
  "finished",
  "cancelled",
  "disputed",
  "payment_released",
  "wallet_reserved",
  "wallet_released",
  "face_scan_requested",
]);

export const jobEventsTable = pgTable("job_events", {
  id: serial("id").primaryKey(),
  jobId: integer("job_id").notNull(),
  eventType: jobEventTypeEnum("event_type").notNull(),
  actorId: integer("actor_id"),
  actorRole: text("actor_role"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  gps: jsonb("gps"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertJobEventSchema = createInsertSchema(jobEventsTable).omit({ id: true, createdAt: true });
export type InsertJobEvent = z.infer<typeof insertJobEventSchema>;
export type JobEvent = typeof jobEventsTable.$inferSelect;
