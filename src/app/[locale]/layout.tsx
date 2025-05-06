import React from 'react';
import LocaleWrapper from '../../components/LocaleWrapper';

// Define supported locales
export function generateStaticParams() {
  return [{ locale: 'en' }, { locale: 'es' }, { locale: 'fr' }]; // All supported locales
}

// Simple layout component that delegates internationalization to the client component
export default function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  return <LocaleWrapper locale={params.locale}>{children}</LocaleWrapper>;
}
