import React from 'react';
import IntlProvider from '../../components/IntlProvider';
import MobileLanguageSwitcher from '../../components/MobileLanguageSwitcher';

// Define supported locales
export function generateStaticParams() {
  return [{ locale: 'en' }, { locale: 'es' }, { locale: 'fr' }]; // All supported locales
}

// Main layout component
export default function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  // Get the locale from the params
  const { locale } = params;
  
  // Use a synchronous approach to avoid type issues with async/await
  let messages;
  try {
    // Use a synchronous approach with require instead of dynamic import
    messages = require(`../../messages/${locale}.json`);
  } catch (error) {
    console.error(`Failed to load messages for locale: ${locale}`, error);
    messages = require('../../messages/en.json');
  }
  
  return (
    <IntlProvider locale={locale} messages={messages}>
      <MobileLanguageSwitcher />
      {children}
    </IntlProvider>
  );
}
