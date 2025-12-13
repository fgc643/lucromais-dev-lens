import * as React from "react";

import { cn } from "@/lib/utils";

const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "rounded-2xl border border-[hsl(42,30%,20%,0.5)] bg-gradient-to-br from-[hsl(225,20%,10%)] to-[hsl(225,25%,6%)] text-card-foreground",
        "shadow-[0_25px_80px_-20px_rgba(0,0,0,0.8),0_10px_30px_-10px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.05)]",
        "backdrop-filter backdrop-blur-xl",
        "transition-all duration-500 ease-out",
        "hover:shadow-[0_30px_100px_-20px_rgba(0,0,0,0.9),0_0_60px_-10px_hsl(42,100%,50%,0.15)]",
        "hover:border-[hsl(42,100%,50%,0.3)]",
        "hover:-translate-y-1",
        "relative overflow-hidden",
        "before:absolute before:top-0 before:left-0 before:right-0 before:h-[1px] before:bg-gradient-to-r before:from-transparent before:via-[hsl(42,100%,50%,0.4)] before:to-transparent",
        className
      )}
      {...props}
    />
  )
);
Card.displayName = "Card";

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div 
      ref={ref} 
      className={cn(
        "flex flex-col space-y-2 p-6 pb-4",
        "border-b border-[hsl(42,30%,20%,0.2)]",
        className
      )} 
      {...props} 
    />
  ),
);
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn(
        "text-2xl font-extrabold leading-tight tracking-tight",
        "bg-gradient-to-r from-[hsl(48,100%,70%)] via-[hsl(42,100%,55%)] to-[hsl(35,90%,50%)] bg-clip-text text-transparent",
        "drop-shadow-[0_2px_10px_hsl(42,100%,50%,0.3)]",
        className
      )}
      {...props}
    />
  ),
);
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p 
      ref={ref} 
      className={cn(
        "text-sm text-muted-foreground font-medium",
        className
      )} 
      {...props} 
    />
  ),
);
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div 
      ref={ref} 
      className={cn("p-6 pt-4", className)} 
      {...props} 
    />
  ),
);
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "flex items-center p-6 pt-4",
        "border-t border-[hsl(42,30%,20%,0.2)]",
        className
      )}
      {...props}
    />
  ),
);
CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };