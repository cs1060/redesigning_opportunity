import { notFound } from 'next/navigation';

// Define the locales we support
export const locales = ['en', 'es', 'fr'];

// Define the default locale
export const defaultLocale = 'en';

// Define the getMessages function to load messages for a specific locale
export async function getMessages(locale: string) {
  try {
    return (await import(`./messages/${locale}.json`)).default;
  } catch (error) {
    console.error(`Could not load messages for locale: ${locale}`, error);
    return (await import(`./messages/en.json`)).default;
  }
}

// This is used by the middleware to validate the locale
export function isValidLocale(locale: string): boolean {
  return locales.includes(locale);
}

// Configuration for next-intl
export default function getRequestConfig(context: { locale: string }) {
  const locale = context.locale;
  
  // Validate that the locale is supported
  if (!isValidLocale(locale)) {
    notFound();
  }
  
  return {
    locale,
    messages: getMessages(locale)
  };
}
