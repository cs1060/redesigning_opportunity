'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { FaGlobe, FaTimes } from 'react-icons/fa';

export default function MobileLanguageSwitcher() {
  const t = useTranslations('languageSelector');
  const locale = useLocale();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const languages = [
    { code: 'en', name: t('english') },
    { code: 'es', name: t('spanish') },
    { code: 'zh', name: t('chinese') }
  ];

  const handleLanguageChange = (newLocale: string) => {
    // Navigate to the same path but with a different locale
    router.push(`/${newLocale}${window.location.pathname.substring(3)}`);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      {/* Language button in navbar */}
      <button
        className="flex items-center text-gray-700 hover:text-primary transition-colors"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label={t('language')}
      >
        <FaGlobe size={20} />
      </button>

      {/* Modal/Dropdown */}
      {isOpen && (
        <div className="fixed inset-0 z-50 md:relative md:inset-auto">
          {/* Backdrop for mobile - only covers the full screen on mobile */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 md:hidden"
            onClick={() => setIsOpen(false)}
          ></div>
          
          {/* Language selection menu */}
          <div className="fixed top-16 right-0 left-0 mx-4 md:absolute md:right-0 md:left-auto md:top-full md:mt-2 bg-white rounded-md shadow-lg z-50 md:w-48">
            <div className="flex justify-between items-center p-4 border-b md:hidden">
              <h2 className="text-lg font-semibold">{t('language')}</h2>
              <button 
                onClick={() => setIsOpen(false)}
                aria-label="Close"
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes />
              </button>
            </div>
            <ul className="py-1">
              {languages.map((language) => (
                <li key={language.code}>
                  <button
                    className={`block w-full text-left px-4 py-3 md:py-2 ${
                      locale === language.code
                        ? 'bg-primary text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                    onClick={() => handleLanguageChange(language.code)}
                    aria-selected={locale === language.code}
                    role="option"
                  >
                    {language.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
