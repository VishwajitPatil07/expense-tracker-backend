import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertTransactionSchema, transactionCategories } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { CalendarIcon, Loader2, Plus } from "lucide-react";
import { format } from "date-fns";

interface AddTransactionFormProps {
  onSuccess?: () => void;
}

export default function AddTransactionForm({ onSuccess }: AddTransactionFormProps = {}) {
  const { toast } = useToast();
  
  // Setup form with validation
  const form = useForm({
    resolver: zodResolver(insertTransactionSchema),
    defaultValues: {
      description: "",
      amount: 0, // Changed from empty string to 0
      category: "",
      type: "expense",
      date: new Date(), // Now directly using Date object
    },
  });
  
  // Mutation for creating transaction
  const createTransactionMutation = useMutation({
    mutationFn: async (data: any) => {
      // Convert amount to number before sending to API
      const formattedData = {
        ...data,
        amount: data.amount ? parseFloat(data.amount) : 0, // Safely handle amount conversion
        // No need to convert date as it's already a Date object that the API can handle
      };
      return await apiRequest("POST", "/api/transactions", formattedData);
    },
    onSuccess: () => {
      // Invalidate all transaction-related queries to refetch data
      queryClient.invalidateQueries({ queryKey: ['/api/transactions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/summary'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/expense-breakdown'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/income-expense'] });
      queryClient.invalidateQueries({ queryKey: ['/api/budget-progress'] });
      
      // Reset form
      form.reset({
        description: "",
        amount: 0, // Changed from empty string to 0
        category: "",
        type: "expense",
        date: new Date(),
      });
      
      toast({
        title: "Transaction added",
        description: "Your transaction has been added successfully",
      });
      
      // Call the success callback if provided
      if (onSuccess) {
        onSuccess();
      }
    },
    onError: (error) => {
      toast({
        title: "Failed to add transaction",
        description: error.message || "An error occurred while adding your transaction",
        variant: "destructive",
      });
    },
  });
  
  function onSubmit(data: any) {
    createTransactionMutation.mutate(data);
  }

  return (
    <Card className="shadow-sm hover:shadow transition-shadow duration-200">
      <CardContent className="p-5">
        <h3 className="text-lg font-medium text-neutral-900">Add New Transaction</h3>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input placeholder="Coffee shop" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="0.00" 
                      type="number"
                      step="0.01"
                      min="0"
                      {...field}
                      value={field.value || 0} // Ensure value is never null or undefined
                      onChange={(e) => {
                        const value = e.target.value;
                        field.onChange(value === "" ? 0 : parseFloat(value));
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
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
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value instanceof Date ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value instanceof Date ? field.value : undefined}
                        onSelect={(date) => {
                          if (date) {
                            field.onChange(date); // Now directly passing the Date object
                          }
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem className="lg:col-span-4 flex justify-end items-center space-x-4">
                  <div className="flex space-x-2">
                    <FormLabel className="text-sm font-medium mt-2">Transaction Type:</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-[120px]">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="expense">Expense</SelectItem>
                        <SelectItem value="income">Income</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    type="submit"
                    disabled={createTransactionMutation.isPending}
                    className="gap-1"
                  >
                    {createTransactionMutation.isPending ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Plus className="h-4 w-4 mr-1" />
                    )}
                    Add Transaction
                  </Button>
                </FormItem>
              )}
            />
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
