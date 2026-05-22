import { pgTable, serial, text, integer, boolean, real, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const roleEnum = pgEnum("role", ["company", "freelancer", "admin"]);
export const levelEnum = pgEnum("level", ["bronze", "silver", "gold", "elite"]);

export const usersTable = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: text("name").notNull(),
  role: roleEnum("role").notNull().default("freelancer"),
  avatarUrl: text("avatar_url"),
  bio: text("bio"),
  phone: text("phone"),
  companyName: text("company_name"),
  pixKey: text("pix_key"),
  categories: text("categories").array().notNull().default([]),
  level: levelEnum("level").notNull().default("bronze"),
  reputationScore: real("reputation_score").notNull().default(0),
  completedJobs: integer("completed_jobs").notNull().default(0),
  isVerified: boolean("is_verified").notNull().default(false),
  isBanned: boolean("is_banned").notNull().default(false),
  profileCompletion: integer("profile_completion").notNull().default(0),
  referralCode: text("referral_code").notNull().unique(),
  referredById: integer("referred_by_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(usersTable).omit({ id: true, createdAt: true });
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof usersTable.$inferSelect;
