import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Loader2, Plus } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertBudgetSchema, transactionCategories } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

export default function BudgetProgress() {
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  
  const { data: budgetProgress, isLoading } = useQuery({
    queryKey: ['/api/budget-progress'],
  });
  
  const form = useForm({
    resolver: zodResolver(insertBudgetSchema),
    defaultValues: {
      category: "",
      amount: "",
      period: "monthly",
    },
  });
  
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
        <span className="text-xs font-medium text-danger-600">
          Over budget by ${Math.abs(remaining).toFixed(2)}
        </span>
      );
    }
    
    return (
      <span className={`text-xs font-medium ${percentUsed < 50 ? 'text-success-600' : percentUsed < 85 ? 'text-neutral-500' : 'text-warning-600'}`}>
        {percentUsed}% used
      </span>
    );
  };

  return (
    <Card className="shadow-sm hover:shadow transition-shadow duration-200">
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-neutral-900">Budget Progress</h3>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="h-8 gap-1 bg-primary-100 hover:bg-primary-200 text-primary-700">
                <Plus className="h-4 w-4" /> Set Budget
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
        <div className="mt-6 space-y-5">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : budgetProgress && budgetProgress.length > 0 ? (
            budgetProgress.map((budget: any, index: number) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-neutral-700">{budget.category}</span>
                  <span className="text-sm font-medium text-neutral-700">
                    ${budget.spent.toFixed(2)} / ${budget.budgetAmount.toFixed(2)}
                  </span>
                </div>
                <Progress 
                  value={budget.percentUsed > 100 ? 100 : budget.percentUsed} 
                  variant={getProgressVariant(budget.percentUsed)}
                  className="h-2"
                />
                <div className="flex justify-end">
                  {getStatusMessage(budget)}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-neutral-500">
              No budgets set yet. Click "Set Budget" to create one.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
