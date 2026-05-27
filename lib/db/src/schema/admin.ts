import { pgTable, serial, integer, text, timestamp, jsonb, real, uniqueIndex } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const auditLogsTable = pgTable("audit_logs", {
  id: serial("id").primaryKey(),
  adminId: integer("admin_id").notNull(),
  adminName: text("admin_name").notNull(),
  adminRole: text("admin_role").notNull().default("admin"),
  action: text("action").notNull(),
  targetType: text("target_type"),
  targetId: integer("target_id"),
  details: jsonb("details"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const platformSettingsTable = pgTable("platform_settings", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  value: text("value").notNull(),
  label: text("label").notNull(),
  description: text("description"),
  category: text("category").notNull().default("general"),
  updatedBy: integer("updated_by"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const representativesTable = pgTable("representatives", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().unique(),
  stateCode: text("state_code").notNull(),
  stateName: text("state_name").notNull(),
  commissionRate: real("commission_rate").notNull().default(0.20),
  totalEarned: real("total_earned").notNull().default(0),
  totalPaid: real("total_paid").notNull().default(0),
  isActive: integer("is_active").notNull().default(1),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertAuditLogSchema = createInsertSchema(auditLogsTable).omit({ id: true, createdAt: true });
export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;
export type AuditLog = typeof auditLogsTable.$inferSelect;

export const insertPlatformSettingSchema = createInsertSchema(platformSettingsTable).omit({ id: true, updatedAt: true });
export type InsertPlatformSetting = z.infer<typeof insertPlatformSettingSchema>;
export type PlatformSetting = typeof platformSettingsTable.$inferSelect;

export const insertRepresentativeSchema = createInsertSchema(representativesTable).omit({ id: true, createdAt: true });
export type InsertRepresentative = z.infer<typeof insertRepresentativeSchema>;
export type Representative = typeof representativesTable.$inferSelect;
