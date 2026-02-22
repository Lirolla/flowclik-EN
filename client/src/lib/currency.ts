/**
 * Currency system 100% UK
 * Hardcoded: £ (GBP), en-GB, Europe/London, +44
 * 
 * VALUES IN POUNDS (not pence)
 * When the photographer types 650, it saves 650 and displays £650.00
 */

/**
 * Formats value in pounds to British currency
 * @param value Value in pounds (e.g.: 650 = £650.00)
 * @returns Formatted string (e.g.: "£650.00")
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Formats user input number to British currency format
 * Adds thousands separators automatically
 * @param value String typed by the user
 * @returns Formatted string without symbol (e.g.: "1,234")
 */
export function formatInputCurrency(value: string): string {
  // Remove everything except digits
  const digitsOnly = value.replace(/\D/g, "");
  
  if (!digitsOnly) return "";
  
  // Convert to integer (pounds)
  const pounds = parseInt(digitsOnly, 10);
  
  // Format without symbol
  return new Intl.NumberFormat("en-GB", {
    style: "decimal",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(pounds);
}

/**
 * Converts formatted string back to value in pounds
 * @param formattedValue Formatted string (e.g.: "1,234" or "£1,234")
 * @returns Value in pounds
 */
export function parseCurrencyInput(formattedValue: string): number {
  // Remove currency symbols and spaces
  let cleaned = formattedValue.replace(/[^\d,.-]/g, "");
  
  // UK: comma is thousands separator, dot is decimal
  cleaned = cleaned.replace(/,/g, "");
  
  const value = parseFloat(cleaned) || 0;
  return Math.round(value);
}

/**
 * Returns British currency symbol
 */
export function getCurrencySymbol(): string {
  return "£";
}

/**
 * Returns British locale
 */
export function getLocale(): string {
  return "en-GB";
}

/**
 * Returns price field label
 */
export function getPriceLabel(): string {
  return "Price (£)";
}

/**
 * Returns British phone code
 */
export function getPhoneCode(): string {
  return "+44";
}

/**
 * Returns British timezone
 */
export function getTimezone(): string {
  return "Europe/London";
}

/**
 * UK address fields configuration
 */
export const ADDRESS_CONFIG = {
  postalCodeLabel: "Postcode",
  postalCodePlaceholder: "SW1A 1AA",
  cityStateLabel: "City/County",
  cityStatePlaceholder: "London, Greater London",
  taxIdLabel: "Company Number",
  taxIdPlaceholder: "12345678",
};
