
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        low: "border-transparent bg-risk-low text-white",
        medium: "border-transparent bg-risk-medium text-white",
        high: "border-transparent bg-risk-high text-white",
        positive: "border-transparent bg-green-500 text-white",
        neutral: "border-transparent bg-blue-500 text-white",
        negative: "border-transparent bg-red-500 text-white",
        prediction: "border-transparent bg-purple-600 text-white",
        "ai-generated": "border-transparent bg-gradient-to-r from-purple-600 to-indigo-600 text-white",
        success: "border-transparent bg-green-500 text-white",
        warning: "border-transparent bg-amber-500 text-white",
        info: "border-transparent bg-blue-500 text-white",
        required: "border-transparent bg-gray-200 text-gray-800",
      },
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
