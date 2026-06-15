import { pgTable, serial, text, jsonb, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

/**
 * Platform configuration table — CEO Governance Center.
 * Stores key-value config for level fees, commission rates, badge grants, etc.
 * Changes here take effect on next server read (fees) or immediately (badges).
 */
export const platformConfigTable = pgTable("platform_config", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  value: jsonb("value").notNull(),
  description: text("description"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  updatedBy: integer("updated_by"),
});

export const insertPlatformConfigSchema = createInsertSchema(platformConfigTable).omit({ id: true, updatedAt: true });
export type InsertPlatformConfig = z.infer<typeof insertPlatformConfigSchema>;
export type PlatformConfig = typeof platformConfigTable.$inferSelect;
