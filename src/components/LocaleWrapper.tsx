'use client';

import React, { useEffect, useState } from 'react';
import { NextIntlClientProvider } from 'next-intl';

type Messages = Record<string, unknown>;

export default function LocaleWrapper({ 
  children, 
  locale 
}: { 
  children: React.ReactNode;
  locale: string;
}) {
  const [messages, setMessages] = useState<Messages>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadMessages() {
      try {
        const messages = await import(`../messages/${locale}.json`).then(m => m.default);
        setMessages(messages);
      } catch (error) {
        console.error(`Failed to load messages for locale: ${locale}`, error);
        const fallbackMessages = await import('../messages/en.json').then(m => m.default);
        setMessages(fallbackMessages);
      } finally {
        setIsLoading(false);
      }
    }

    loadMessages();
  }, [locale]);

  if (isLoading) {
    // You could show a loading indicator here
    return <div>Loading translations...</div>;
  }

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}
