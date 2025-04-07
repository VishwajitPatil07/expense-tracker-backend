import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Download } from "lucide-react";
import Sidebar from "@/components/layout/sidebar";
import MobileNav from "@/components/layout/mobile-nav";
import TopNav from "@/components/layout/top-nav";
import ExpenseChart from "@/components/dashboard/expense-chart";
import IncomeExpenseChart from "@/components/dashboard/income-expense-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

export default function ReportsPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [reportPeriod, setReportPeriod] = useState("this-month");
  
  // Fetch summary data for reports
  const { data: summaryData, isLoading } = useQuery({
    queryKey: ['/api/dashboard/summary', reportPeriod],
  });

  // Available periods for reports
  const periodOptions = [
    { value: "this-month", label: "This Month" },
    { value: "last-month", label: "Last Month" },
    { value: "last-3-months", label: "Last 3 Months" },
    { value: "this-year", label: "This Year" },
  ];

  // Mock function for exporting reports - this would be connected to a real endpoint in production
  const handleExportReport = (format: string) => {
    toast({
      title: "Report Export Started",
      description: `Your ${format.toUpperCase()} report is being generated.`,
    });
    
    // In a real application, this would trigger a download
    setTimeout(() => {
      toast({
        title: "Report Ready",
        description: `Your financial report has been exported as ${format.toUpperCase()}.`,
      });
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex">
      {/* Sidebar Navigation */}
      <Sidebar />
      
      {/* Mobile Navigation */}
      <MobileNav />
      
      {/* Main Content */}
      <main className="min-h-screen bg-neutral-50 pb-10 transition-all duration-300 w-full lg:ml-64">
        {/* Top Navigation */}
        <TopNav pageTitle="Financial Reports" />
        
        {/* Reports Content */}
        <div className="px-4 py-6 sm:px-6 lg:px-8">
          {/* Header Section */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <h3 className="text-2xl font-semibold text-neutral-900">Reports & Analysis</h3>
            <div className="flex items-center gap-2">
              <Select
                value={reportPeriod}
                onValueChange={setReportPeriod}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  {periodOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button 
                variant="outline" 
                className="gap-1"
                onClick={() => handleExportReport('pdf')}
              >
                <Download className="h-4 w-4" /> Export PDF
              </Button>
            </div>
          </div>
          
          {/* Report Tabs */}
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="space-y-6"
          >
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="expenses">Expenses</TabsTrigger>
              <TabsTrigger value="income">Income</TabsTrigger>
            </TabsList>
            
            {/* Overview Tab */}
            <TabsContent value="overview">
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <>
                  {/* Summary Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                    <Card className="shadow-sm">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-neutral-500">Total Income</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-neutral-900">
                          ${summaryData?.income?.toFixed(2) || "0.00"}
                        </div>
                        <p className="text-xs text-success-600 mt-1">
                          +{summaryData?.incomeChange || "0"}% from previous period
                        </p>
                      </CardContent>
                    </Card>
                    <Card className="shadow-sm">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-neutral-500">Total Expenses</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-neutral-900">
                          ${summaryData?.expenses?.toFixed(2) || "0.00"}
                        </div>
                        <p className="text-xs text-danger-600 mt-1">
                          +{summaryData?.expenseChange || "0"}% from previous period
                        </p>
                      </CardContent>
                    </Card>
                    <Card className="shadow-sm">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-neutral-500">Net Savings</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-neutral-900">
                          ${((summaryData?.income || 0) - (summaryData?.expenses || 0)).toFixed(2)}
                        </div>
                        <p className="text-xs text-success-600 mt-1">
                          {summaryData?.savingsRate || "0"}% of income
                        </p>
                      </CardContent>
                    </Card>
                    <Card className="shadow-sm">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-neutral-500">Largest Expense</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-lg font-bold text-neutral-900">
                          {summaryData?.largestExpenseCategory || "None"}
                        </div>
                        <p className="text-sm text-neutral-500 mt-1">
                          ${summaryData?.largestExpenseAmount?.toFixed(2) || "0.00"}
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                  
                  {/* Charts */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <ExpenseChart />
                    <IncomeExpenseChart />
                  </div>
                </>
              )}
            </TabsContent>
            
            {/* Expenses Tab */}
            <TabsContent value="expenses">
              <Card className="shadow-sm">
                <CardContent className="p-6">
                  <h3 className="text-lg font-medium text-neutral-900 mb-4">Expense Analysis</h3>
                  <div className="h-[500px]">
                    <ExpenseChart />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Income Tab */}
            <TabsContent value="income">
              <Card className="shadow-sm">
                <CardContent className="p-6">
                  <h3 className="text-lg font-medium text-neutral-900 mb-4">Income vs Expense Trend</h3>
                  <div className="h-[500px]">
                    <IncomeExpenseChart />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}