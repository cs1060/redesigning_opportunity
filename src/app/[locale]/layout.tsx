import React from 'react';
import IntlProvider from '../../components/IntlProvider';
import MobileLanguageSwitcher from '../../components/MobileLanguageSwitcher';

type Props = {
  children: React.ReactNode;
  params: { locale: string };
};

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

// Main layout component (Server Component)
export default async function LocaleLayout({
  children,
  params: { locale }
}: Props) {
  // Load messages dynamically using the helper function
  const messages = await loadMessages(locale);
  
  return (
    <IntlProvider locale={locale} messages={messages}>
      <MobileLanguageSwitcher />
      {children}
    </IntlProvider>
  );
}
