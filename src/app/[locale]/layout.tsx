import React from 'react';
import IntlProvider from '../../components/IntlProvider';
import MobileLanguageSwitcher from '../../components/MobileLanguageSwitcher';
import { notFound } from 'next/navigation';

// Define supported locales
export function generateStaticParams() {
  return [{ locale: 'en' }, { locale: 'es' }, { locale: 'fr' }]; // All supported locales
}

// Helper function to load messages
async function loadMessages(locale: string) {
  try {
    return (await import(`../../messages/${locale}.json`)).default;
  } catch (error) {
    console.error(`Failed to load messages for locale: ${locale}`, error);
    return (await import('../../messages/en.json')).default;
  }
}

// Main layout component
export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  // Get the locale from the params
  const { locale } = params;
  
  // Check if the locale is supported
  const supportedLocales = ['en', 'es', 'fr'];
  if (!supportedLocales.includes(locale)) {
    notFound();
  }
  
  // Load messages
  const messages = await loadMessages(locale);
  
  return (
    <IntlProvider locale={locale} messages={messages}>
      <MobileLanguageSwitcher />
      {children}
    </IntlProvider>
  );
}
