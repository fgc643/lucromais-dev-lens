import { forwardRef } from "react";
import { Input } from "./ui/input";
import { cn } from "@/lib/utils";

interface CurrencyInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  value: number;
  onChange: (value: number) => void;
}

export const CurrencyInput = forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ value, onChange, className, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const rawValue = e.target.value.replace(/\D/g, "");
      const numValue = parseInt(rawValue || "0") / 100;
      onChange(numValue);
    };

    const formatDisplay = (val: number): string => {
      return new Intl.NumberFormat("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(val);
    };

    return (
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
          R$
        </span>
        <Input
          ref={ref}
          type="text"
          inputMode="decimal"
          value={formatDisplay(value)}
          onChange={handleChange}
          className={cn("pl-10", className)}
          {...props}
        />
      </div>
    );
  }
);

CurrencyInput.displayName = "CurrencyInput";
