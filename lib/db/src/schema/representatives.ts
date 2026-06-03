import { pgTable, serial, integer, text, real, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const stateRepresentativesTable = pgTable("state_representatives", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  stateCode: text("state_code").notNull(),
  commissionRate: real("commission_rate").notNull().default(0.02),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertStateRepresentativeSchema = createInsertSchema(stateRepresentativesTable).omit({ id: true, createdAt: true });
export type InsertStateRepresentative = z.infer<typeof insertStateRepresentativeSchema>;
export type StateRepresentative = typeof stateRepresentativesTable.$inferSelect;
