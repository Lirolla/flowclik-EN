import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCurrency } from "@/hooks/useCurrency";

interface CurrencyInputProps {
  label?: string;
  value: number; // Valor em reais
  onChange: (valueInReais: number) => void;
  placeholder?: string;
  id?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

/**
 * Input de moeda com formatação automática
 * Valores em REAIS (não centavos)
 * Usuário digita 650 → salva 650 → exibe R$ 650,00
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
  
  // Estado local para exibição
  const [displayValue, setDisplayValue] = useState("");
  
  // Sincronizar com prop value (quando muda externamente)
  useEffect(() => {
    if (value === 0 && displayValue === "") return;
    // Formata o valor em reais para exibição
    const formatted = new Intl.NumberFormat("pt-BR", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
    setDisplayValue(value > 0 ? formatted : "");
  }, [value]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    
    // Remove tudo exceto dígitos
    const digitsOnly = input.replace(/\D/g, "");
    
    if (!digitsOnly) {
      setDisplayValue("");
      onChange(0);
      return;
    }
    
    // Converte para reais
    const reais = parseInt(digitsOnly, 10);
    
    // Formata para exibição com separadores de milhar
    const formatted = new Intl.NumberFormat("pt-BR", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(reais);
    setDisplayValue(formatted);
    
    // Notifica mudança em reais
    onChange(reais);
  };
  
  const handleBlur = () => {
    // Garante formatação correta ao sair do campo
    if (value > 0) {
      const formatted = new Intl.NumberFormat("pt-BR", {
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
