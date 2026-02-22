import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCurrency } from "@/hooks/useCurrency";

interface CurrencyInputProps {
  label?: string;
  value: number; // Value in pounds
  onChange: (valueInPounds: number) => void;
  placeholder?: string;
  id?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

/**
 * Currency input with automatic formatting
 * Values in POUNDS (not pence)
 * User types 650 → saves 650 → displays £650.00
 */
export function CurrencyInput({
  label,
  value,
  onChange,
  placeholder,
  id,
  required,
  disabled,
  className,
}: CurrencyInputProps) {
  const { format, priceLabel, symbol } = useCurrency();
  
  // Local state for display
  const [displayValue, setDisplayValue] = useState("");
  
  // Sync with prop value (when changed externally)
  useEffect(() => {
    if (value === 0 && displayValue === "") return;
    // Format value in pounds for display
    const formatted = new Intl.NumberFormat("en-GB", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
    setDisplayValue(value > 0 ? formatted : "");
  }, [value]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    
    // Remove everything except digits
    const digitsOnly = input.replace(/\D/g, "");
    
    if (!digitsOnly) {
      setDisplayValue("");
      onChange(0);
      return;
    }
    
    // Convert to pounds
    const pounds = parseInt(digitsOnly, 10);
    
    // Format for display with thousands separators
    const formatted = new Intl.NumberFormat("en-GB", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(pounds);
    setDisplayValue(formatted);
    
    // Notify change in pounds
    onChange(pounds);
  };
  
  const handleBlur = () => {
    // Ensure correct formatting on blur
    if (value > 0) {
      const formatted = new Intl.NumberFormat("en-GB", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(value);
      setDisplayValue(formatted);
    }
  };
  
  return (
    <div className={className}>
      {label && (
        <Label htmlFor={id}>
          {label || priceLabel}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
      )}
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
          {symbol}
        </span>
        <Input
          id={id}
          type="text"
          inputMode="numeric"
          value={displayValue}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder={placeholder || "0"}
          disabled={disabled}
          className="pl-12"
        />
      </div>
    </div>
  );
}
