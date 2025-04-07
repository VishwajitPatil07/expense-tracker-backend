import { users, transactions, budgets } from "@shared/schema";
import type { User, InsertUser, Transaction, Budget, InsertTransaction, InsertBudget } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

// Extend the IStorage interface with CRUD operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Transaction operations
  getTransactionsByUserId(userId: number): Promise<Transaction[]>;
  createTransaction(transaction: InsertTransaction & { userId: number }): Promise<Transaction>;
  
  // Budget operations
  getBudgetsByUserId(userId: number): Promise<Budget[]>;
  createBudget(budget: InsertBudget & { userId: number }): Promise<Budget>;
  
  // Dashboard operations
  getDashboardSummary(userId: number): Promise<any>;
  getExpenseBreakdown(userId: number): Promise<any>;
  getIncomeVsExpense(userId: number): Promise<any>;
  getBudgetProgress(userId: number): Promise<any>;
  
  // Session store
  sessionStore: session.Store;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private transactions: Map<number, Transaction>;
  private budgets: Map<number, Budget>;
  sessionStore: session.Store;
  
  userIdCounter: number;
  transactionIdCounter: number;
  budgetIdCounter: number;

  constructor() {
    this.users = new Map();
    this.transactions = new Map();
    this.budgets = new Map();
    this.userIdCounter = 1;
    this.transactionIdCounter = 1;
    this.budgetIdCounter = 1;
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // 24 hours
    });
    
    // Add some initial seed data for demo
    this.seedData();
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getTransactionsByUserId(userId: number): Promise<Transaction[]> {
    return Array.from(this.transactions.values()).filter(
      (transaction) => transaction.userId === userId,
    );
  }

  async createTransaction(transaction: InsertTransaction & { userId: number }): Promise<Transaction> {
    const id = this.transactionIdCounter++;
    const newTransaction: Transaction = { ...transaction, id };
    this.transactions.set(id, newTransaction);
    return newTransaction;
  }

  async getBudgetsByUserId(userId: number): Promise<Budget[]> {
    return Array.from(this.budgets.values()).filter(
      (budget) => budget.userId === userId,
    );
  }

  async createBudget(budget: InsertBudget & { userId: number }): Promise<Budget> {
    const id = this.budgetIdCounter++;
    const newBudget: Budget = { ...budget, id };
    this.budgets.set(id, newBudget);
    return newBudget;
  }

  async getDashboardSummary(userId: number): Promise<any> {
    const userTransactions = await this.getTransactionsByUserId(userId);
    
    // Calculate total balance, income, and expenses
    const income = userTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + Number(t.amount), 0);
    
    const expenses = userTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0);
    
    const balance = income - expenses;
    
    // Calculate savings rate
    const savingsRate = income > 0 ? ((income - expenses) / income) * 100 : 0;
    
    return {
      balance,
      income,
      expenses,
      savingsRate: parseFloat(savingsRate.toFixed(1)),
    };
  }

  async getExpenseBreakdown(userId: number): Promise<any> {
    const userTransactions = await this.getTransactionsByUserId(userId);
    const expensesByCategory: Record<string, number> = {};
    
    userTransactions
      .filter(t => t.type === 'expense')
      .forEach(transaction => {
        const amount = Number(transaction.amount);
        expensesByCategory[transaction.category] = (expensesByCategory[transaction.category] || 0) + amount;
      });
    
    // Format data for chart
    return Object.entries(expensesByCategory).map(([category, amount]) => ({
      category,
      amount,
    }));
  }

  async getIncomeVsExpense(userId: number): Promise<any> {
    const userTransactions = await this.getTransactionsByUserId(userId);
    
    // Get the last 6 months
    const today = new Date();
    const months: string[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const month = d.toLocaleString('default', { month: 'short' });
      months.push(month);
    }
    
    // Initialize data structure
    const data = months.map(month => ({
      month,
      income: 0,
      expenses: 0,
    }));
    
    // Fill in data from transactions
    userTransactions.forEach(transaction => {
      const transactionDate = new Date(transaction.date);
      const transactionMonth = transactionDate.toLocaleString('default', { month: 'short' });
      const amount = Number(transaction.amount);
      
      const monthEntry = data.find(entry => entry.month === transactionMonth);
      if (monthEntry) {
        if (transaction.type === 'income') {
          monthEntry.income += amount;
        } else {
          monthEntry.expenses += amount;
        }
      }
    });
    
    return data;
  }

  async getBudgetProgress(userId: number): Promise<any> {
    const userBudgets = await this.getBudgetsByUserId(userId);
    const userTransactions = await this.getTransactionsByUserId(userId);
    
    // Calculate spending for each budget category
    const result = userBudgets.map(budget => {
      const category = budget.category;
      const budgetAmount = Number(budget.amount);
      
      // Sum expenses for this category
      const spent = userTransactions
        .filter(t => t.type === 'expense' && t.category === category)
        .reduce((sum, t) => sum + Number(t.amount), 0);
      
      // Calculate percentage used
      const percentUsed = budgetAmount > 0 ? (spent / budgetAmount) * 100 : 0;
      
      return {
        category,
        budgetAmount,
        spent,
        percentUsed: parseFloat(percentUsed.toFixed(1)),
        remaining: budgetAmount - spent,
      };
    });
    
    return result;
  }

  // Seed some initial data for testing purposes
  private seedData() {
    // This method is intentionally left empty
    // No mock data should be generated unless explicitly requested
  }
}

export const storage = new MemStorage();
