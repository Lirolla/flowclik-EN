import { useMemo } from "react";
import {
  formatCurrency,
  getCurrencySymbol,
  getLocale,
  getPriceLabel,
  formatInputCurrency,
  parseCurrencyInput,
  getPhoneCode,
  getTimezone,
} from "@/lib/currency";

/**
 * Hook para usar sistema de moeda brasileiro
 * Hardcoded: R$ (BRL), pt-BR, +55, America/Sao_Paulo
 * VALORES EM REAIS (não centavos)
 */
export function useCurrency() {
  return useMemo(
    () => ({
      // Configuração do Brasil (hardcoded)
      country: "Brasil",
      currency: "BRL",
      symbol: "R$",
      locale: "pt-BR",
      phoneCode: "+55",
      timezone: "America/Sao_Paulo",
      
      // Funções de formatação - valor em REAIS
      format: (valueInReais: number) => formatCurrency(valueInReais),
      
      formatInput: (value: string) => formatInputCurrency(value),
      
      parseInput: (formattedValue: string) => parseCurrencyInput(formattedValue),
      
      // Labels fixos em português
      priceLabel: getPriceLabel(),
      
      // Helpers
      getCurrencySymbol,
      getLocale,
      getPhoneCode,
      getTimezone,
    }),
    []
  );
}
