import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import Sidebar from "@/components/layout/sidebar";
import MobileNav from "@/components/layout/mobile-nav";
import TopNav from "@/components/layout/top-nav";
import SummaryCard from "@/components/dashboard/summary-card";
import ExpenseChart from "@/components/dashboard/expense-chart";
import IncomeExpenseChart from "@/components/dashboard/income-expense-chart";
import BudgetProgress from "@/components/dashboard/budget-progress";
import RecentTransactions from "@/components/dashboard/recent-transactions";
import AddTransactionForm from "@/components/dashboard/add-transaction-form";
import { useToast } from "@/hooks/use-toast";

export default function Dashboard() {
  const { toast } = useToast();
  
  // Fetch dashboard summary data
  const { data: summaryData, isLoading: summaryLoading, error: summaryError } = useQuery({
    queryKey: ['/api/dashboard/summary'],
  });

  // Show error toast if any query fails
  useEffect(() => {
    if (summaryError) {
      toast({
        title: "Error loading data",
        description: "There was a problem loading your dashboard data",
        variant: "destructive",
      });
    }
  }, [summaryError, toast]);

  return (
    <div className="min-h-screen bg-neutral-50 flex">
      {/* Sidebar Navigation */}
      <Sidebar />
      
      {/* Mobile Navigation */}
      <MobileNav />
      
      {/* Main Content */}
      <main className="min-h-screen bg-neutral-50 pb-10 transition-all duration-300 w-full lg:ml-64">
        {/* Top Navigation */}
        <TopNav pageTitle="Dashboard" />
        
        {/* Dashboard Content */}
        <div className="px-4 py-6 sm:px-6 lg:px-8">
          {summaryLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
          ) : (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                <SummaryCard 
                  title="Total Balance"
                  value={summaryData?.balance}
                  icon="wallet"
                  change={3.6}
                  trend="up"
                  format="currency"
                />
                <SummaryCard 
                  title="Monthly Income"
                  value={summaryData?.income}
                  icon="income"
                  change={8.2}
                  trend="up"
                  format="currency"
                />
                <SummaryCard 
                  title="Monthly Expenses"
                  value={summaryData?.expenses}
                  icon="expense"
                  change={2.4}
                  trend="up"
                  trendColor="negative"
                  format="currency"
                />
                <SummaryCard 
                  title="Savings Rate"
                  value={summaryData?.savingsRate}
                  icon="savings"
                  change={5.3}
                  trend="up"
                  format="percent"
                />
              </div>

              {/* Charts Section */}
              <div className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-2">
                <ExpenseChart />
                <IncomeExpenseChart />
              </div>

              {/* Budget Progress */}
              <div className="mt-8">
                <BudgetProgress />
              </div>

              {/* Recent Transactions */}
              <div className="mt-8">
                <RecentTransactions />
              </div>

              {/* Quick Add Transaction */}
              <div className="mt-8">
                <AddTransactionForm />
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
