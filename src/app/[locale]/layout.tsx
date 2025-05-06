import React from 'react';
import LocaleWrapper from '../../components/LocaleWrapper';

// Define supported locales
export function generateStaticParams() {
  return [{ locale: 'en' }, { locale: 'es' }, { locale: 'fr' }]; // All supported locales
}

// Simple layout component that delegates internationalization to the client component
export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  // Next.js LayoutProps expects `params` to be a Promise (typed in next-types-plugin)
  params: Promise<{ locale: string }>;
}) {
  // Await the promise to get the actual locale value
  const { locale } = await params;
  return <LocaleWrapper locale={locale}>{children}</LocaleWrapper>;
}
