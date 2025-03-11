import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formatează o valoare numerică ca preț în moneda specificată
 * @param amount - Suma de formatat
 * @param currency - Codul monedei (implicit EUR)
 * @returns String formatat cu simbolul monedei
 */
export function formatCurrency(amount: number, currency: string = 'EUR'): string {
  const formatter = new Intl.NumberFormat('ro-RO', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  });
  
  return formatter.format(amount);
}
