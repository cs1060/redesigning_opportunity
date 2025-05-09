'use client';

import React from 'react';
import { NextIntlClientProvider } from 'next-intl';

// Define a more flexible type for messages that accommodates nested structures
// This is a more specific type than 'any' but still flexible enough to handle various message formats
type Messages = Record<string, unknown>;

// Client component for the provider
export default function IntlProvider({ 
  locale, 
  messages, 
  children 
}: { 
  locale: string; 
  messages: Messages; 
  children: React.ReactNode 
}) {
  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}
