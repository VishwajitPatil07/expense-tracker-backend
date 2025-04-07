import { pgTable, text, serial, integer, decimal, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User model
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name"),
});

// Transaction model
export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  description: text("description").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  category: text("category").notNull(),
  type: text("type").notNull(),  // "income" or "expense"
  date: timestamp("date").notNull(),
});

// Budget model
export const budgets = pgTable("budgets", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  category: text("category").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  period: text("period").notNull().default("monthly"),  // monthly, yearly, etc.
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  fullName: true,
});

// Base schema from Drizzle
const baseTransactionSchema = createInsertSchema(transactions).pick({
  description: true,
  amount: true,
  category: true,
  type: true,
});

// Custom transaction schema with modified date handling and amount validation
export const insertTransactionSchema = baseTransactionSchema.extend({
  date: z.coerce.date(),  // Coerce various date formats into a JavaScript Date object
  amount: z.number().min(0).default(0),  // Ensure amount is always a number and at least 0
});

export const insertBudgetSchema = createInsertSchema(budgets).pick({
  category: true,
  amount: true,
  period: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Budget = typeof budgets.$inferSelect;
export type InsertBudget = z.infer<typeof insertBudgetSchema>;

// Custom schemas
export const transactionCategories = [
  "Groceries",
  "Dining Out",
  "Entertainment",
  "Transportation",
  "Shopping",
  "Housing",
  "Utilities",
  "Income",
  "Others"
];

export const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export type LoginData = z.infer<typeof loginSchema>;
