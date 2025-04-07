import { 
  Wallet2, 
  ArrowUpCircle, 
  ArrowDownCircle, 
  PiggyBank, 
  TrendingUp, 
  TrendingDown 
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

type SummaryCardProps = {
  title: string;
  value: number;
  icon: "wallet" | "income" | "expense" | "savings";
  change?: number;
  trend?: "up" | "down";
  trendColor?: "positive" | "negative";
  format?: "currency" | "percent";
};

export default function SummaryCard({
  title,
  value = 0,
  icon,
  change,
  trend = "up",
  trendColor,
  format = "currency",
}: SummaryCardProps) {
  // Format the value
  const formatValue = () => {
    if (format === "currency") {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2,
      }).format(value);
    } else if (format === "percent") {
      return `${value.toFixed(1)}%`;
    }
    return value;
  };

  // Determine text color for trend
  const getTrendColor = () => {
    if (trendColor === "negative") return "text-danger-600";
    if (trendColor === "positive") return "text-success-600";
    return trend === "up" ? "text-success-600" : "text-danger-600";
  };

  // Determine icon for trend
  const TrendIcon = trend === "up" ? TrendingUp : TrendingDown;

  // Determine card icon
  const getCardIcon = () => {
    switch (icon) {
      case "wallet":
        return <Wallet2 className="text-2xl" />;
      case "income":
        return <ArrowUpCircle className="text-2xl" />;
      case "expense":
        return <ArrowDownCircle className="text-2xl" />;
      case "savings":
        return <PiggyBank className="text-2xl" />;
      default:
        return <Wallet2 className="text-2xl" />;
    }
  };

  // Determine background color for icon
  const getIconBgColor = () => {
    switch (icon) {
      case "wallet":
        return "bg-primary-100 text-primary-600";
      case "income":
        return "bg-success-100 text-success-600";
      case "expense":
        return "bg-danger-100 text-danger-600";
      case "savings":
        return "bg-secondary-100 text-secondary-600";
      default:
        return "bg-primary-100 text-primary-600";
    }
  };

  return (
    <Card className="shadow-sm hover:shadow transition-shadow duration-200 h-32">
      <CardContent className="p-5">
        <div className="flex justify-between">
          <div>
            <p className="text-sm font-medium text-neutral-500">{title}</p>
            <h3 className="mt-1 text-2xl font-semibold text-neutral-900">
              {formatValue()}
            </h3>
          </div>
          <div className={`flex h-12 w-12 items-center justify-center rounded-full ${getIconBgColor()}`}>
            {getCardIcon()}
          </div>
        </div>
        {change !== undefined && (
          <p className={`mt-2 text-xs font-medium flex items-center ${getTrendColor()}`}>
            <TrendIcon className="mr-1 h-3 w-3" />
            <span>
              {change}% from last month
            </span>
          </p>
        )}
      </CardContent>
    </Card>
  );
}
