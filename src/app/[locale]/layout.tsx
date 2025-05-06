

import React from 'react';
import LocaleWrapper from '../../components/LocaleWrapper';
import MobileLanguageSwitcher from '../../components/MobileLanguageSwitcher';

// Define supported locales
export function generateStaticParams() {
  return [{ locale: 'en' }, { locale: 'es' }, { locale: 'fr' }]; // All supported locales
}

// Main layout component - non-async to avoid type issues
export default function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const { locale } = params;
  
  return (
    <LocaleWrapper locale={locale}>
      <MobileLanguageSwitcher />
      {children}
    </LocaleWrapper>
  );
}
