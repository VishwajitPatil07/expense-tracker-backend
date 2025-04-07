import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Loader2, PlusCircle } from "lucide-react";
import Sidebar from "@/components/layout/sidebar";
import MobileNav from "@/components/layout/mobile-nav";
import TopNav from "@/components/layout/top-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertBudgetSchema, transactionCategories } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function BudgetPage() {
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  
  // Fetch budgets data
  const { data: budgets, isLoading } = useQuery({
    queryKey: ['/api/budget-progress'],
  });
  
  // Setup form with validation
  const form = useForm({
    resolver: zodResolver(insertBudgetSchema),
    defaultValues: {
      category: "",
      amount: "",
      period: "monthly",
    },
  });
  
  // Mutation for creating budget
  const createBudgetMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/budgets", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/budget-progress'] });
      setDialogOpen(false);
      form.reset();
      toast({
        title: "Budget created",
        description: "Your budget has been created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to create budget",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  function onSubmit(data: any) {
    createBudgetMutation.mutate({
      ...data,
      amount: parseFloat(data.amount),
    });
  }
  
  // Function to determine the color variant based on percentage
  const getProgressVariant = (percent: number) => {
    if (percent < 50) return "success";
    if (percent < 85) return "default";
    if (percent < 100) return "warning";
    return "danger";
  };
  
  // Function to format the status message
  const getStatusMessage = (budget: any) => {
    const { percentUsed, remaining } = budget;
    
    if (percentUsed > 100) {
      return (
        <span className="text-sm font-medium text-danger-600">
          Over budget by ${Math.abs(remaining).toFixed(2)}
        </span>
      );
    }
    
    return (
      <span className={`text-sm font-medium ${percentUsed < 50 ? 'text-success-600' : percentUsed < 85 ? 'text-neutral-500' : 'text-warning-600'}`}>
        ${remaining.toFixed(2)} remaining
      </span>
    );
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
        <TopNav pageTitle="Budget Management" />
        
        {/* Budget Content */}
        <div className="px-4 py-6 sm:px-6 lg:px-8">
          {/* Header & Add Budget Button */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <h3 className="text-2xl font-semibold text-neutral-900">Budget Overview</h3>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-1">
                  <PlusCircle className="h-4 w-4" /> Create New Budget
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Set New Budget</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {transactionCategories.map((category) => (
                                <SelectItem key={category} value={category}>
                                  {category}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="amount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Budget Amount ($)</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="0.00" 
                              {...field}
                              type="number"
                              step="0.01"
                              min="0"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={createBudgetMutation.isPending}
                    >
                      {createBudgetMutation.isPending ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : null}
                      Set Budget
                    </Button>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
          
          {/* Budgets Grid */}
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : budgets && budgets.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {budgets.map((budget: any, index: number) => (
                <Card key={index} className="shadow-sm hover:shadow transition-shadow duration-200">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-lg">{budget.category}</CardTitle>
                      <Badge variant={getBadgeVariant(budget.category)}>
                        {budget.period}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-2xl font-bold">
                          ${budget.spent.toFixed(2)}
                        </span>
                        <span className="text-neutral-500">
                          of ${budget.budgetAmount.toFixed(2)}
                        </span>
                      </div>
                      
                      <Progress 
                        value={budget.percentUsed > 100 ? 100 : budget.percentUsed} 
                        variant={getProgressVariant(budget.percentUsed)}
                        className="h-2"
                      />
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-neutral-500">
                          {budget.percentUsed}% used
                        </span>
                        {getStatusMessage(budget)}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="shadow-sm">
              <CardContent className="p-8 text-center">
                <h3 className="text-xl font-medium text-neutral-900 mb-2">No Budgets Set</h3>
                <p className="text-neutral-500 mb-6">
                  Start managing your finances by creating budget targets for your spending categories.
                </p>
                <Button onClick={() => setDialogOpen(true)}>
                  <PlusCircle className="h-4 w-4 mr-2" /> Create Your First Budget
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}