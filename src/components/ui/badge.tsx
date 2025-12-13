import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border-2 px-3 py-1 text-xs font-bold uppercase tracking-wider transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: 
          "border-[hsl(42,100%,50%,0.4)] bg-gradient-to-r from-[hsl(42,100%,50%)] to-[hsl(38,95%,45%)] text-[hsl(225,25%,3%)] shadow-[0_4px_20px_hsl(42,100%,50%,0.3)] hover:shadow-[0_6px_25px_hsl(42,100%,50%,0.5)]",
        secondary: 
          "border-[hsl(225,30%,25%)] bg-gradient-to-r from-[hsl(225,30%,15%)] to-[hsl(225,25%,12%)] text-foreground shadow-[0_4px_15px_rgba(0,0,0,0.3)]",
        destructive: 
          "border-[hsl(0,85%,55%,0.4)] bg-gradient-to-r from-[hsl(0,90%,55%)] to-[hsl(350,85%,45%)] text-white shadow-[0_4px_20px_hsl(0,90%,55%,0.4)]",
        outline: 
          "border-[hsl(42,100%,50%,0.4)] bg-transparent text-[hsl(42,100%,55%)] hover:bg-[hsl(42,100%,50%,0.1)]",
        profit:
          "border-[hsl(145,80%,50%,0.4)] bg-gradient-to-r from-[hsl(145,85%,45%)] to-[hsl(140,80%,35%)] text-white shadow-[0_4px_20px_hsl(145,85%,45%,0.4)]",
        loss:
          "border-[hsl(0,85%,60%,0.4)] bg-gradient-to-r from-[hsl(0,90%,55%)] to-[hsl(350,85%,45%)] text-white shadow-[0_4px_20px_hsl(0,90%,55%,0.4)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };