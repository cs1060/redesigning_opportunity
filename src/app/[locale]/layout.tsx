import React from 'react';
import IntlProvider from '../../components/IntlProvider';

type Props = {
  children: React.ReactNode;
  params: { locale: string };
};

// Define supported locales
export function generateStaticParams() {
  return [{ locale: 'en' }, { locale: 'es' }]; // Add all supported locales here
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
  params
}: Props) {
  // Get the locale string from the params object
  const locale = params.locale;
  
  // Load messages dynamically using the helper function
  const messages = await loadMessages(locale);
  
  return (
    <IntlProvider locale={locale} messages={messages}>
      {children}
    </IntlProvider>
  );
}
