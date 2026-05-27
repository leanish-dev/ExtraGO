import { pgTable, serial, text, integer, boolean, real, timestamp, pgEnum, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const roleEnum = pgEnum("role", ["company", "freelancer", "admin"]);
export const levelEnum = pgEnum("level", ["bronze", "silver", "gold", "elite"]);
export const postTypeEnum = pgEnum("post_type", ["general", "job_completion", "availability"]);

export const usersTable = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: text("name").notNull(),
  role: roleEnum("role").notNull().default("freelancer"),
  avatarUrl: text("avatar_url"),
  bannerUrl: text("banner_url"),
  bio: text("bio"),
  professionalSummary: text("professional_summary"),
  phone: text("phone"),
  companyName: text("company_name"),
  pixKey: text("pix_key"),
  categories: text("categories").array().notNull().default([]),
  languages: text("languages").array().notNull().default([]),
  serviceRegions: text("service_regions").array().notNull().default([]),
  availability: jsonb("availability"),
  level: levelEnum("level").notNull().default("bronze"),
  reputationScore: real("reputation_score").notNull().default(0),
  completedJobs: integer("completed_jobs").notNull().default(0),
  responseRate: real("response_rate").notNull().default(0),
  isVerified: boolean("is_verified").notNull().default(false),
  isBanned: boolean("is_banned").notNull().default(false),
  profileCompletion: integer("profile_completion").notNull().default(0),
  referralCode: text("referral_code").notNull().unique(),
  referredById: integer("referred_by_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const userCategoriesTable = pgTable("user_categories", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  category: text("category").notNull(),
  isPrimary: boolean("is_primary").notNull().default(false),
  subspecialties: text("subspecialties").array().notNull().default([]),
  yearsExperience: integer("years_experience").notNull().default(0),
  certifications: text("certifications").array().notNull().default([]),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const workExperiencesTable = pgTable("work_experiences", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  company: text("company").notNull(),
  role: text("role").notNull(),
  startDate: text("start_date").notNull(),
  endDate: text("end_date"),
  description: text("description"),
  achievements: text("achievements").array().notNull().default([]),
  imageUrls: text("image_urls").array().notNull().default([]),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const userSkillsTable = pgTable("user_skills", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  skill: text("skill").notNull(),
  endorsements: integer("endorsements").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const postsTable = pgTable("posts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  content: text("content").notNull(),
  imageUrls: text("image_urls").array().notNull().default([]),
  postType: postTypeEnum("post_type").notNull().default("general"),
  likes: integer("likes").notNull().default(0),
  saves: integer("saves").notNull().default(0),
  reposts: integer("reposts").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const postCommentsTable = pgTable("post_comments", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").notNull(),
  userId: integer("user_id").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const postLikesTable = pgTable("post_likes", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").notNull(),
  userId: integer("user_id").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const postSavesTable = pgTable("post_saves", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").notNull(),
  userId: integer("user_id").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(usersTable).omit({ id: true, createdAt: true });
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof usersTable.$inferSelect;

export const insertUserCategorySchema = createInsertSchema(userCategoriesTable).omit({ id: true, createdAt: true });
export type InsertUserCategory = z.infer<typeof insertUserCategorySchema>;
export type UserCategory = typeof userCategoriesTable.$inferSelect;

export const insertWorkExperienceSchema = createInsertSchema(workExperiencesTable).omit({ id: true, createdAt: true });
export type InsertWorkExperience = z.infer<typeof insertWorkExperienceSchema>;
export type WorkExperience = typeof workExperiencesTable.$inferSelect;

export const insertUserSkillSchema = createInsertSchema(userSkillsTable).omit({ id: true, createdAt: true });
export type InsertUserSkill = z.infer<typeof insertUserSkillSchema>;
export type UserSkill = typeof userSkillsTable.$inferSelect;

export const insertPostSchema = createInsertSchema(postsTable).omit({ id: true, createdAt: true });
export type InsertPost = z.infer<typeof insertPostSchema>;
export type Post = typeof postsTable.$inferSelect;

export const insertPostCommentSchema = createInsertSchema(postCommentsTable).omit({ id: true, createdAt: true });
export type InsertPostComment = z.infer<typeof insertPostCommentSchema>;
export type PostComment = typeof postCommentsTable.$inferSelect;
