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
 * Hook for UK currency system
 * Hardcoded: £ (GBP), en-GB, +44, Europe/London
 * VALUES IN POUNDS (not pence)
 */
export function useCurrency() {
  return useMemo(
    () => ({
      // UK configuration (hardcoded)
      country: "United Kingdom",
      currency: "GBP",
      symbol: "£",
      locale: "en-GB",
      phoneCode: "+44",
      timezone: "Europe/London",
      
      // Formatting functions - value in POUNDS
      format: (valueInPounds: number) => formatCurrency(valueInPounds),
      
      formatInput: (value: string) => formatInputCurrency(value),
      
      parseInput: (formattedValue: string) => parseCurrencyInput(formattedValue),
      
      // Fixed labels in English
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
