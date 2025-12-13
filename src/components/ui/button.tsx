import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-bold ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 uppercase tracking-wide",
  {
    variants: {
      variant: {
        default: 
          "bg-gradient-to-r from-[hsl(42,100%,50%)] via-[hsl(45,100%,55%)] to-[hsl(38,95%,45%)] text-[hsl(225,25%,3%)] shadow-[0_10px_40px_-10px_hsl(42,100%,50%,0.5),inset_0_1px_0_hsl(48,100%,70%,0.4)] border border-[hsl(48,100%,70%,0.3)] hover:shadow-[0_20px_60px_-10px_hsl(42,100%,50%,0.6),0_0_100px_hsl(42,100%,50%,0.3)] hover:-translate-y-1 hover:scale-[1.02] active:translate-y-0 active:scale-100",
        destructive: 
          "bg-gradient-to-r from-[hsl(0,90%,55%)] to-[hsl(350,85%,45%)] text-white shadow-[0_10px_40px_-10px_hsl(0,90%,55%,0.5)] border border-[hsl(0,85%,65%,0.3)] hover:shadow-[0_20px_60px_-10px_hsl(0,90%,55%,0.7)] hover:-translate-y-1",
        outline: 
          "border-2 border-[hsl(42,100%,50%,0.4)] bg-transparent text-[hsl(42,100%,55%)] shadow-[inset_0_0_20px_hsl(42,100%,50%,0.05)] hover:bg-[hsl(42,100%,50%,0.1)] hover:border-[hsl(42,100%,50%,0.6)] hover:shadow-[0_0_30px_hsl(42,100%,50%,0.2)]",
        secondary: 
          "bg-gradient-to-r from-[hsl(225,30%,15%)] to-[hsl(225,25%,10%)] text-foreground border border-[hsl(42,30%,25%,0.3)] shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)] hover:border-[hsl(42,100%,50%,0.3)] hover:shadow-[0_15px_40px_-10px_rgba(0,0,0,0.6)]",
        ghost: 
          "text-[hsl(42,100%,55%)] hover:bg-[hsl(42,100%,50%,0.1)] hover:text-[hsl(42,100%,60%)]",
        link: 
          "text-[hsl(42,100%,55%)] underline-offset-4 hover:underline hover:text-[hsl(42,100%,65%)]",
        premium:
          "bg-gradient-to-r from-[hsl(42,100%,50%)] via-[hsl(45,100%,55%)] to-[hsl(38,95%,45%)] text-[hsl(225,25%,3%)] shadow-[0_15px_50px_-10px_hsl(42,100%,50%,0.6),inset_0_1px_0_hsl(48,100%,70%,0.5)] border border-[hsl(48,100%,70%,0.4)] hover:shadow-[0_25px_80px_-10px_hsl(42,100%,50%,0.7),0_0_120px_hsl(42,100%,50%,0.4)] hover:-translate-y-2 hover:scale-[1.03]",
        profit:
          "bg-gradient-to-r from-[hsl(145,85%,45%)] to-[hsl(140,80%,35%)] text-white shadow-[0_15px_50px_-10px_hsl(145,85%,45%,0.6),inset_0_1px_0_rgba(255,255,255,0.2)] border border-[hsl(145,80%,55%,0.5)] hover:shadow-[0_20px_60px_-10px_hsl(145,85%,45%,0.8),0_0_100px_hsl(145,85%,50%,0.4)] hover:-translate-y-1",
        loss:
          "bg-gradient-to-r from-[hsl(0,90%,55%)] to-[hsl(350,85%,45%)] text-white shadow-[0_15px_50px_-10px_hsl(0,90%,55%,0.6),inset_0_1px_0_rgba(255,255,255,0.2)] border border-[hsl(0,85%,65%,0.5)] hover:shadow-[0_20px_60px_-10px_hsl(0,90%,55%,0.8),0_0_100px_hsl(0,90%,60%,0.4)] hover:-translate-y-1",
      },
      size: {
        default: "h-11 px-6 py-2",
        sm: "h-9 rounded-lg px-4 text-xs",
        lg: "h-14 rounded-xl px-10 text-base",
        xl: "h-16 rounded-2xl px-12 text-lg",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };