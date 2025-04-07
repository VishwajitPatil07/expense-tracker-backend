import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { insertTransactionSchema, insertBudgetSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes
  setupAuth(app);

  // Middleware to check authentication
  const checkAuth = (req: any, res: any, next: any) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    next();
  };

  // Transaction Routes
  app.get("/api/transactions", checkAuth, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const transactions = await storage.getTransactionsByUserId(userId);
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  app.post("/api/transactions", checkAuth, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const result = insertTransactionSchema.safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({ message: "Invalid transaction data", errors: result.error.format() });
      }
      
      const transaction = await storage.createTransaction({
        ...result.data,
        userId,
      });
      
      res.status(201).json(transaction);
    } catch (error) {
      res.status(500).json({ message: "Failed to create transaction" });
    }
  });

  // Budget Routes
  app.get("/api/budgets", checkAuth, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const budgets = await storage.getBudgetsByUserId(userId);
      res.json(budgets);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch budgets" });
    }
  });

  app.post("/api/budgets", checkAuth, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const result = insertBudgetSchema.safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({ message: "Invalid budget data", errors: result.error.format() });
      }
      
      const budget = await storage.createBudget({
        ...result.data,
        userId,
      });
      
      res.status(201).json(budget);
    } catch (error) {
      res.status(500).json({ message: "Failed to create budget" });
    }
  });

  // Dashboard Summary Data
  app.get("/api/dashboard/summary", checkAuth, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const summary = await storage.getDashboardSummary(userId);
      res.json(summary);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard summary" });
    }
  });

  app.get("/api/dashboard/expense-breakdown", checkAuth, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const breakdownData = await storage.getExpenseBreakdown(userId);
      res.json(breakdownData);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch expense breakdown" });
    }
  });

  app.get("/api/dashboard/income-expense", checkAuth, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const incomeExpenseData = await storage.getIncomeVsExpense(userId);
      res.json(incomeExpenseData);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch income vs expense data" });
    }
  });

  app.get("/api/budget-progress", checkAuth, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const budgetProgress = await storage.getBudgetProgress(userId);
      res.json(budgetProgress);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch budget progress" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
