import { pgTable, serial, text, integer, jsonb, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const categoryStatusEnum = pgEnum("category_status", ["active", "archived"]);

/**
 * Ecosystem categories — managed exclusively through Governance Center.
 * No hardcoded category lists anywhere in the codebase.
 * Rules jsonb supports future category-specific financial parameters.
 */
export const categoriesTable = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  icon: text("icon"),
  status: categoryStatusEnum("status").notNull().default("active"),
  displayOrder: integer("display_order").notNull().default(0),
  rules: jsonb("rules"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  createdBy: integer("created_by"),
});

export const insertCategorySchema = createInsertSchema(categoriesTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Category = typeof categoriesTable.$inferSelect;
