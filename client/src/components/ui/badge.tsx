import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
  {
    variants: {
      variant: {
        default: "bg-primary-100 text-primary-800",
        income: "bg-success-100 text-success-800",
        expense: "bg-danger-100 text-danger-800",
        warning: "bg-warning-100 text-warning-800",
        entertainment: "bg-secondary-100 text-secondary-800",
        dining: "bg-warning-100 text-warning-800",
        groceries: "bg-primary-100 text-primary-800",
        shopping: "bg-neutral-100 text-neutral-800",
        housing: "bg-blue-100 text-blue-800",
        utilities: "bg-cyan-100 text-cyan-800",
        transportation: "bg-emerald-100 text-emerald-800",
        others: "bg-stone-100 text-stone-800",
      }
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
