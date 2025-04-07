import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"
import { cn } from "@/lib/utils"

type ProgressVariant = "default" | "success" | "warning" | "danger";

const getProgressBarClass = (variant: ProgressVariant, value: number) => {
  const baseClasses = "h-full rounded-full transition-all";
  
  const variantClasses = {
    default: "bg-primary",
    success: "bg-success-500",
    warning: "bg-warning-500", 
    danger: "bg-danger-500"
  };
  
  // If no explicit variant is specified, use a variable one based on value
  if (variant === "default") {
    if (value < 50) return `${baseClasses} bg-success-500`;
    if (value < 85) return `${baseClasses} bg-primary`;
    if (value < 100) return `${baseClasses} bg-warning-500`;
    return `${baseClasses} bg-danger-500`;
  }
  
  return `${baseClasses} ${variantClasses[variant]}`;
};

interface ProgressProps extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
  variant?: ProgressVariant;
}

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  ProgressProps
>(({ className, value, variant = "default", ...props }, ref) => {
  const currentValue = value || 0;
  
  return (
    <ProgressPrimitive.Root
      ref={ref}
      className={cn(
        "h-2 w-full overflow-hidden rounded-full bg-neutral-200",
        className
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        className={getProgressBarClass(variant, currentValue)}
        style={{ width: `${currentValue}%` }}
      />
    </ProgressPrimitive.Root>
  )
})
Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }
