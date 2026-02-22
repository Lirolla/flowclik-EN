/**
 * Sistema de moeda 100% BRASIL
 * Hardcoded: R$ (BRL), pt-BR, America/Sao_Paulo, +55
 * 
 * VALORES EM REAIS (não centavos)
 * Quando o fotógrafo digita 650, salva 650 e exibe R$ 650,00
 */

/**
 * Formata valor em reais para moeda brasileira
 * @param value Valor em reais (ex: 650 = R$ 650,00)
 * @returns String formatada (ex: "R$ 650,00")
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Formata número de input do usuário para moeda brasileira
 * Adiciona separadores de milhar e decimal automaticamente
 * @param value String digitada pelo usuário
 * @returns String formatada sem símbolo (ex: "1.234,56")
 */
export function formatInputCurrency(value: string): string {
  // Remove tudo exceto dígitos
  const digitsOnly = value.replace(/\D/g, "");
  
  if (!digitsOnly) return "";
  
  // Converte para número inteiro (reais)
  const reais = parseInt(digitsOnly, 10);
  
  // Formata sem símbolo
  return new Intl.NumberFormat("pt-BR", {
    style: "decimal",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(reais);
}

/**
 * Converte string formatada de volta para valor em reais
 * @param formattedValue String formatada (ex: "1.234" ou "R$ 1.234")
 * @returns Valor em reais
 */
export function parseCurrencyInput(formattedValue: string): number {
  // Remove símbolos de moeda e espaços
  let cleaned = formattedValue.replace(/[^\d,.-]/g, "");
  
  // Brasil: vírgula é decimal, ponto é milhar
  cleaned = cleaned.replace(/\./g, "").replace(",", ".");
  
  const value = parseFloat(cleaned) || 0;
  return Math.round(value);
}

/**
 * Retorna símbolo da moeda brasileira
 */
export function getCurrencySymbol(): string {
  return "R$";
}

/**
 * Retorna locale brasileiro
 */
export function getLocale(): string {
  return "pt-BR";
}

/**
 * Retorna label de campo de preço
 */
export function getPriceLabel(): string {
  return "Preço (R$)";
}

/**
 * Retorna código do telefone brasileiro
 */
export function getPhoneCode(): string {
  return "+55";
}

/**
 * Retorna timezone brasileiro
 */
export function getTimezone(): string {
  return "America/Sao_Paulo";
}

/**
 * Configuração de campos de endereço brasileiro
 */
export const ADDRESS_CONFIG = {
  postalCodeLabel: "CEP",
  postalCodePlaceholder: "01310-100",
  cityStateLabel: "Cidade/Estado",
  cityStatePlaceholder: "São Paulo, SP",
  taxIdLabel: "CPF",
  taxIdPlaceholder: "000.000.000-00",
};
