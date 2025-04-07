import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";

export default function RecentTransactions() {
  const { data: transactions, isLoading } = useQuery({
    queryKey: ['/api/transactions'],
  });
  
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
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM d, yyyy');
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
  
  // Sort and limit to 5 most recent transactions
  const recentTransactions = transactions
    ? [...transactions]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5)
    : [];

  return (
    <Card className="shadow-sm hover:shadow transition-shadow duration-200">
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-neutral-900">Recent Transactions</h3>
          <a href="#" className="text-sm font-medium text-primary hover:text-primary/80">View All</a>
        </div>
        <div className="mt-6 flow-root">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : recentTransactions.length > 0 ? (
            <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
              <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                <table className="min-w-full divide-y divide-neutral-200">
                  <thead>
                    <tr>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-neutral-900">Description</th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-neutral-900">Category</th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-neutral-900">Date</th>
                      <th className="px-3 py-3.5 text-right text-sm font-semibold text-neutral-900">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200">
                    {recentTransactions.map((transaction) => (
                      <tr key={transaction.id}>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-neutral-900">
                          {transaction.description}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-neutral-500">
                          <Badge variant={getBadgeVariant(transaction.category)}>
                            {transaction.category}
                          </Badge>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-neutral-500">
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
            <div className="text-center py-8 text-neutral-500">
              No transactions found. Add your first transaction below.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
