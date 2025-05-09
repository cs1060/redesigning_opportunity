'use client'

import { FaChevronDown } from 'react-icons/fa'
import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'

const Welcome = () => {
  const t = useTranslations('welcome');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Trigger animations after component mounts
    setIsLoaded(true);
  }, []);

  return (
    <div id="welcome" className="min-h-screen flex flex-col items-center justify-center text-center px-4 pt-20 pb-10">
      <div className="max-w-4xl mx-auto">
        <h1 
          className={`text-5xl md:text-7xl font-bold text-primary mb-8 transition-all duration-1000 ease-out ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
        >
          {t('title')}
        </h1>
        
        <p 
          className={`text-xl md:text-2xl font-semibold mb-12 transition-all duration-1000 delay-300 ease-out ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
        >
          {t('subtitle')}
        </p>
        
        <div className="space-y-5 mb-16 text-lg">
          <p 
            className={`transition-all duration-700 delay-500 ease-out ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
          >
            {t('discover')}
          </p>
          <p 
            className={`transition-all duration-700 delay-700 ease-out ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
          >
            {t('search')}
          </p>
          <p 
            className={`transition-all duration-700 delay-900 ease-out ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
          >
            {t('find')}
          </p>
        </div>
        
        <div className="mt-8 mb-12 space-y-2">
          <p 
            className={`text-xl font-semibold transition-all duration-700 delay-1100 ease-out ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
          >
            {t('journey1')}
          </p>
          <p 
            className={`text-xl font-semibold transition-all duration-700 delay-1300 ease-out ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
          >
            {t('journey2')}
          </p>
        </div>
        
        <div 
          className={`text-primary text-4xl mt-6 animate-bounce cursor-pointer hover:text-primary-dark transition-all duration-1000 delay-1500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
          onClick={() => {
            const quizSection = document.getElementById('quiz-section');
            if (quizSection) {
              quizSection.scrollIntoView({ behavior: 'smooth' });
            }
          }}
          aria-label="Scroll to assessment quiz"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              const quizSection = document.getElementById('quiz-section');
              if (quizSection) {
                quizSection.scrollIntoView({ behavior: 'smooth' });
              }
            }
          }}
        >
          <FaChevronDown className="mx-auto" />
        </div>
      </div>
    </div>
  )
}

export default Welcome