import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Filter, Plus, FileDown, Clock, Tag } from "lucide-react";
import Sidebar from "@/components/layout/sidebar";
import MobileNav from "@/components/layout/mobile-nav";
import TopNav from "@/components/layout/top-nav";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import AddTransactionForm from "@/components/dashboard/add-transaction-form";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { exportTransactionsToPdf } from "@/lib/export-pdf";
import { Transaction } from "@shared/schema";

export default function TransactionsPage() {
  const { toast } = useToast();
  const [filterType, setFilterType] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string | null>(null);
  const [addTransactionOpen, setAddTransactionOpen] = useState(false);

  // Fetch transactions data
  const { data: transactions, isLoading, error } = useQuery<Transaction[]>({
    queryKey: ['/api/transactions'],
  });

  // Show error toast if query fails
  useEffect(() => {
    if (error) {
      toast({
        title: "Error loading transactions",
        description: "There was a problem loading your transactions data",
        variant: "destructive",
      });
    }
  }, [error, toast]);

  // Format currency
  const formatCurrency = (amount: number, type: string) => {
    const formattedAmount = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(Math.abs(amount));
    
    if (type === 'expense') {
      return <span className="text-danger-600">-{formattedAmount}</span>;
    }
    return <span className="text-success-600">+{formattedAmount}</span>;
  };
  
  // Format date
  const formatDate = (dateInput: any) => {
    try {
      if (!dateInput) return 'N/A';
      return format(new Date(dateInput), 'MMM d, yyyy');
    } catch (error) {
      console.error('Date format error:', error);
      return 'Invalid date';
    }
  };
  
  // Get badge variant based on category
  const getBadgeVariant = (category: string) => {
    const lowerCategory = category.toLowerCase();
    
    if (lowerCategory === 'income') return 'income';
    if (lowerCategory === 'groceries') return 'groceries';
    if (lowerCategory === 'dining out') return 'dining';
    if (lowerCategory === 'entertainment') return 'entertainment';
    if (lowerCategory === 'shopping') return 'shopping';
    if (lowerCategory === 'housing') return 'housing';
    if (lowerCategory === 'utilities') return 'utilities';
    if (lowerCategory === 'transportation') return 'transportation';
    
    return 'default';
  };

  // Filter transactions
  const filteredTransactions = transactions
    ? transactions.filter((transaction: Transaction) => {
        let match = true;
        if (filterType && transaction.type !== filterType) match = false;
        if (filterCategory && transaction.category !== filterCategory) match = false;
        return match;
      }).sort((a: Transaction, b: Transaction) => {
        try {
          const dateA = new Date(a.date);
          const dateB = new Date(b.date);
          
          if (isNaN(dateA.getTime()) || isNaN(dateB.getTime())) {
            return 0; // If either date is invalid, maintain original order
          }
          
          return dateB.getTime() - dateA.getTime();
        } catch (error) {
          console.error('Date sorting error:', error);
          return 0;
        }
      })
    : [];

  // Get unique categories for filter
  const categories = transactions
    ? Array.from(new Set(transactions.map((t: Transaction) => t.category)))
    : [];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar Navigation */}
      <Sidebar />
      
      {/* Mobile Navigation */}
      <MobileNav />
      
      {/* Main Content */}
      <main className="min-h-screen bg-background pb-10 transition-all duration-300 w-full lg:ml-64">
        {/* Top Navigation */}
        <TopNav pageTitle="Transactions" />
        
        {/* Add Transaction Button - Fixed */}
        <div className="fixed bottom-20 right-6 z-50 lg:bottom-10">
          <Dialog open={addTransactionOpen} onOpenChange={setAddTransactionOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="rounded-full shadow-lg h-14 w-14 p-0">
                <Plus className="h-6 w-6" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Add New Transaction</DialogTitle>
              </DialogHeader>
              <AddTransactionForm onSuccess={() => setAddTransactionOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
        
        {/* Transactions Content */}
        <div className="px-4 py-6 sm:px-6 lg:px-8">
          <Card className="shadow-sm">
            <CardContent className="p-5">
              {/* Filters */}
              <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center justify-between gap-4 mb-6">
                <h3 className="text-xl font-semibold text-foreground">All Transactions</h3>
                <div className="flex flex-wrap gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="h-9 gap-1">
                        <Filter className="h-4 w-4" />
                        <span className="hidden sm:inline">Type</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem 
                        onClick={() => setFilterType(null)}
                        className={!filterType ? "bg-accent/50" : ""}
                      >
                        All Types
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => setFilterType("expense")}
                        className={filterType === "expense" ? "bg-accent/50" : ""}
                      >
                        Expenses
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => setFilterType("income")}
                        className={filterType === "income" ? "bg-accent/50" : ""}
                      >
                        Income
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="h-9 gap-1">
                        <Tag className="h-4 w-4" />
                        <span className="hidden sm:inline">Category</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem 
                        onClick={() => setFilterCategory(null)}
                        className={!filterCategory ? "bg-accent/50" : ""}
                      >
                        All Categories
                      </DropdownMenuItem>
                      {categories.map((category) => (
                        <DropdownMenuItem 
                          key={category}
                          onClick={() => setFilterCategory(category)}
                          className={filterCategory === category ? "bg-accent/50" : ""}
                        >
                          {category}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                  
                  {/* Export to PDF Button */}
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-9 gap-1"
                          onClick={() => {
                            if (transactions && transactions.length > 0) {
                              exportTransactionsToPdf(transactions, {
                                title: filterType || filterCategory
                                  ? `Filtered Transactions (${filterType || ""} ${filterCategory || ""})`
                                  : "All Transactions",
                                fileName: "expense-tracker-transactions"
                              });
                              
                              toast({
                                title: "Export successful",
                                description: "Your transactions have been exported to PDF",
                              });
                            } else {
                              toast({
                                title: "No transactions to export",
                                description: "Add some transactions before exporting",
                                variant: "destructive"
                              });
                            }
                          }}
                        >
                          <FileDown className="h-4 w-4" />
                          <span className="hidden sm:inline">Export</span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Export transactions to PDF</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
              
              {/* Transactions Table */}
              <div className="flow-root">
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : filteredTransactions.length > 0 ? (
                  <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                    <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                      <table className="min-w-full divide-y divide-border">
                        <thead>
                          <tr>
                            <th className="px-3 py-3.5 text-left text-sm font-semibold text-foreground">Description</th>
                            <th className="px-3 py-3.5 text-left text-sm font-semibold text-foreground">Category</th>
                            <th className="px-3 py-3.5 text-left text-sm font-semibold text-foreground">Date</th>
                            <th className="px-3 py-3.5 text-right text-sm font-semibold text-foreground">Amount</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {filteredTransactions.map((transaction) => (
                            <tr key={transaction.id} className="hover:bg-muted/50">
                              <td className="whitespace-nowrap px-3 py-4 text-sm text-foreground">
                                {transaction.description}
                              </td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm text-muted-foreground">
                                <Badge variant={getBadgeVariant(transaction.category)}>
                                  {transaction.category}
                                </Badge>
                              </td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm text-muted-foreground">
                                {formatDate(transaction.date)}
                              </td>
                              <td className="whitespace-nowrap px-3 py-4 text-right text-sm font-medium">
                                {formatCurrency(Number(transaction.amount), transaction.type)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No transactions found. Add your first transaction using the + button.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}