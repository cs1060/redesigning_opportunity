'use client'

import { useState } from 'react'
import { useLocale } from 'next-intl'
import { useRouter, usePathname } from 'next/navigation'
import { Globe } from 'lucide-react'

export default function LanguageSwitcher() {
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  const changeLanguage = (newLocale: string) => {
    // Get the path without the locale prefix
    const pathWithoutLocale = pathname.replace(`/${locale}`, '')
    // Navigate to the same page with the new locale
    router.push(`/${newLocale}${pathWithoutLocale}`)
    setIsOpen(false)
  }

  return (
    <div className="relative">
      <button
        className="flex items-center space-x-1 hover:text-primary transition-colors"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Change language"
      >
        <Globe className="h-5 w-5" />
        <span className="uppercase">{locale}</span>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-32 bg-white rounded-md shadow-lg py-1 z-50">
          <button
            className={`block w-full text-left px-4 py-2 text-sm ${locale === 'en' ? 'bg-gray-100' : 'hover:bg-gray-100'}`}
            onClick={() => changeLanguage('en')}
          >
            English
          </button>
          <button
            className={`block w-full text-left px-4 py-2 text-sm ${locale === 'es' ? 'bg-gray-100' : 'hover:bg-gray-100'}`}
            onClick={() => changeLanguage('es')}
          >
            Español
          </button>
          <button
            className={`block w-full text-left px-4 py-2 text-sm ${locale === 'fr' ? 'bg-gray-100' : 'hover:bg-gray-100'}`}
            onClick={() => changeLanguage('fr')}
          >
            Français
          </button>
        </div>
      )}
    </div>
  )
}
