import { forwardRef } from "react";
import { Input } from "./ui/input";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/utils/calculator";

interface PercentageInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  value: number;
  onChange: (value: number) => void;
  salePrice?: number;
  showCalculatedValue?: boolean;
  error?: string;
}

export const PercentageInput = forwardRef<HTMLInputElement, PercentageInputProps>(
  ({ value, onChange, salePrice = 0, showCalculatedValue = true, error, className, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const rawValue = e.target.value.replace(/[^\d,\.]/g, "").replace(",", ".");
      let numValue = parseFloat(rawValue) || 0;
      
      // Limitar a 100%
      if (numValue > 100) {
        numValue = 100;
      }
      if (numValue < 0) {
        numValue = 0;
      }
      
      onChange(numValue);
    };

    const formatDisplay = (val: number): string => {
      if (val === 0) return "";
      return val.toString().replace(".", ",");
    };

    // Calcular o valor em R$ baseado no percentual
    const calculatedValue = (salePrice * value) / 100;
    const hasError = value > 100;

    return (
      <div className="space-y-1">
        <div className="relative">
          <Input
            ref={ref}
            type="text"
            inputMode="decimal"
            value={formatDisplay(value)}
            onChange={handleChange}
            className={cn(
              "pr-10",
              hasError && "border-destructive focus-visible:ring-destructive",
              className
            )}
            placeholder="0"
            {...props}
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
            %
          </span>
        </div>
        
        {hasError && (
          <p className="text-sm text-destructive">Máximo 100%</p>
        )}
        
        {showCalculatedValue && salePrice > 0 && value > 0 && !hasError && (
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            <span>=</span>
            <span className="font-medium text-primary">{formatCurrency(calculatedValue)}</span>
          </p>
        )}
        
        {error && !hasError && (
          <p className="text-sm text-destructive">{error}</p>
        )}
      </div>
    );
  }
);

PercentageInput.displayName = "PercentageInput";
