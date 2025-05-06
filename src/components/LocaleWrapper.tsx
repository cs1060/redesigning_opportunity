'use client';

import React, { useEffect, useState } from 'react';
import IntlProvider from './IntlProvider';
import MobileLanguageSwitcher from './MobileLanguageSwitcher';

// Define supported locales
const supportedLocales = ['en', 'es', 'fr'];

// Helper function to load messages
async function loadMessages(locale: string) {
  try {
    return (await import(`../messages/${locale}.json`)).default;
  } catch (error) {
    console.error(`Failed to load messages for locale: ${locale}`, error);
    return (await import('../messages/en.json')).default;
  }
}

interface LocaleWrapperProps {
  children: React.ReactNode;
  locale: string;
}

// Client component wrapper for locale
export default function LocaleWrapper({ children, locale }: LocaleWrapperProps) {
  const [messages, setMessages] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  
  // Ensure locale is valid
  const safeLocale = supportedLocales.includes(locale) ? locale : 'en';
  
  // Load messages on the client side
  useEffect(() => {
    async function loadLocaleMessages() {
      setIsLoading(true);
      const loadedMessages = await loadMessages(safeLocale);
      setMessages(loadedMessages);
      setIsLoading(false);
    }
    
    loadLocaleMessages();
  }, [safeLocale]);
  
  // Show a simple loading state while messages are being loaded
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }
  
  return (
    <IntlProvider locale={safeLocale} messages={messages}>
      <MobileLanguageSwitcher />
      {children}
    </IntlProvider>
  );
}
