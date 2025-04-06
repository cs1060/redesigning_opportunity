import { useLocale } from 'next-intl';

/**
 * Format a date according to the current locale
 * @param date The date to format
 * @param options Intl.DateTimeFormatOptions
 * @returns Formatted date string
 */
export function useFormattedDate(date: Date, options?: Intl.DateTimeFormatOptions) {
  const locale = useLocale();
  
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options
  }).format(date);
}

/**
 * Format a number according to the current locale
 * @param number The number to format
 * @param options Intl.NumberFormatOptions
 * @returns Formatted number string
 */
export function useFormattedNumber(number: number, options?: Intl.NumberFormatOptions) {
  const locale = useLocale();
  
  return new Intl.NumberFormat(locale, options).format(number);
}

/**
 * Format a currency value according to the current locale
 * @param amount The amount to format
 * @param currency The currency code (default: 'USD')
 * @returns Formatted currency string
 */
export function useFormattedCurrency(amount: number, currency = 'USD') {
  const locale = useLocale();
  
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(amount);
}

/**
 * Format a percentage according to the current locale
 * @param value The value to format (0.1 = 10%)
 * @param decimals Number of decimal places
 * @returns Formatted percentage string
 */
export function useFormattedPercentage(value: number, decimals = 1) {
  const locale = useLocale();
  
  return new Intl.NumberFormat(locale, {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(value);
}
