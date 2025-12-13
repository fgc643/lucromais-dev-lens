import * as React from "react";

import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-12 w-full rounded-xl border-2 border-[hsl(42,30%,20%,0.5)] bg-[hsl(225,20%,8%)] px-4 py-3 text-base font-medium text-foreground",
          "ring-offset-background placeholder:text-muted-foreground",
          "shadow-[inset_0_2px_10px_rgba(0,0,0,0.3)]",
          "transition-all duration-300 ease-out",
          "file:border-0 file:bg-transparent file:text-sm file:font-semibold file:text-foreground",
          "focus-visible:outline-none focus-visible:border-[hsl(42,100%,50%,0.6)] focus-visible:shadow-[inset_0_2px_10px_rgba(0,0,0,0.3),0_0_25px_hsl(42,100%,50%,0.2)]",
          "focus-visible:ring-0",
          "hover:border-[hsl(42,100%,50%,0.3)]",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "md:text-sm",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };