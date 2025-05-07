'use client'
import React from 'react';
import { Home } from 'lucide-react';
import { useTranslations } from 'next-intl';
import ActionReminder from '../ActionReminder';
import { HousingOption } from './types';

interface HousingOptionsSectionProps {
  housingOptions: HousingOption[];
  selectedHousingType: string | null;
  handleHousingTypeSelect: (housingType: string) => void;
  loading: boolean;
}

const HousingOptionsSection: React.FC<HousingOptionsSectionProps> = ({
  housingOptions,
  selectedHousingType,
  handleHousingTypeSelect,
  loading
}) => {
  const t = useTranslations('move');

  if (loading || housingOptions.length === 0) {
    return null;
  }

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h3 className="text-2xl font-semibold mb-4">Housing Options</h3>
      <p className="mb-4">{t('selectHousingType')}</p>
      
      <ActionReminder 
        message={t('selectHousingReminder', { fallback: "Tip: Select a housing type that suits your family's needs" })} 
        isVisible={!selectedHousingType && housingOptions.length > 0} 
      />
      
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        {housingOptions.map((option) => (
          <div 
            key={option.type}
            className={`
              border rounded-lg p-4 cursor-pointer transition-all duration-300
              ${selectedHousingType === option.type 
                ? 'border-[#6CD9CA] bg-[#6CD9CA] bg-opacity-10' 
                : 'border-gray-200 hover:border-[#6CD9CA] hover:bg-[#6CD9CA] hover:bg-opacity-10'}
            `}
            onClick={() => handleHousingTypeSelect(option.type)}
          >
            <div className="flex items-center mb-2">
              <Home className="mr-2 text-[#6CD9CA]" size={20} />
              <h4 className="text-lg font-semibold">{option.type}</h4>
              {option.suitability && (
                <div className="ml-auto flex">
                  {[...Array(5)].map((_, i) => (
                    <svg 
                      key={i} 
                      className={`w-4 h-4 ${i < option.suitability! ? 'text-[#6CD9CA]' : 'text-gray-300'}`} 
                      fill="currentColor" 
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              )}
            </div>
            <p className="text-sm font-medium text-gray-600">Price: {option.priceRange}</p>
            <p className="text-sm font-medium text-gray-600">Size: {option.averageSize}</p>
            <p className="mt-2 text-sm">{option.description}</p>
          </div>
        ))}
      </div>

      {selectedHousingType && (
        <p className="mt-4 text-lg font-semibold text-center">
          {t('housingFit', {type: selectedHousingType})}
        </p>
      )}
      
      <h4 className="text-xl font-semibold mb-6 text-center">Find Housing On:</h4>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <a 
          href="https://www.redfin.com" 
          target="_blank" 
          rel="noopener noreferrer"
          className="group flex flex-col items-center justify-center bg-white hover:bg-[#6CD9CA] hover:bg-opacity-10 border border-gray-200 rounded-xl p-5 shadow-sm transition-all duration-300 hover:shadow-md"
        >
          <div className="w-12 h-12 mb-3 flex items-center justify-center rounded-full bg-[#6CD9CA] bg-opacity-20 text-[#6CD9CA] group-hover:bg-opacity-30 transition-all duration-300">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1h3" />
            </svg>
          </div>
          <span className="font-medium group-hover:text-[#6CD9CA] transition-colors duration-300">Redfin</span>
        </a>
        <a 
          href="https://www.zillow.com" 
          target="_blank" 
          rel="noopener noreferrer"
          className="group flex flex-col items-center justify-center bg-white hover:bg-[#6CD9CA] hover:bg-opacity-10 border border-gray-200 rounded-xl p-5 shadow-sm transition-all duration-300 hover:shadow-md"
        >
          <div className="w-12 h-12 mb-3 flex items-center justify-center rounded-full bg-[#6CD9CA] bg-opacity-20 text-[#6CD9CA] group-hover:bg-opacity-30 transition-all duration-300">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <span className="font-medium group-hover:text-[#6CD9CA] transition-colors duration-300">Zillow</span>
        </a>
        <a 
          href="https://www.hud.gov/program_offices/comm_planning/affordablehousing" 
          target="_blank" 
          rel="noopener noreferrer"
          className="group flex flex-col items-center justify-center bg-white hover:bg-[#6CD9CA] hover:bg-opacity-10 border border-gray-200 rounded-xl p-5 shadow-sm transition-all duration-300 hover:shadow-md"
        >
          <div className="w-12 h-12 mb-3 flex items-center justify-center rounded-full bg-[#6CD9CA] bg-opacity-20 text-[#6CD9CA] group-hover:bg-opacity-30 transition-all duration-300">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1h3" />
            </svg>
          </div>
          <span className="font-medium group-hover:text-[#6CD9CA] transition-colors duration-300">Affordable Housing</span>
        </a>
        <a 
          href="https://www.craigslist.org" 
          target="_blank" 
          rel="noopener noreferrer"
          className="group flex flex-col items-center justify-center bg-white hover:bg-[#6CD9CA] hover:bg-opacity-10 border border-gray-200 rounded-xl p-5 shadow-sm transition-all duration-300 hover:shadow-md"
        >
          <div className="w-12 h-12 mb-3 flex items-center justify-center rounded-full bg-[#6CD9CA] bg-opacity-20 text-[#6CD9CA] group-hover:bg-opacity-30 transition-all duration-300">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <span className="font-medium group-hover:text-[#6CD9CA] transition-colors duration-300">Craigslist</span>
        </a>
      </div>
    </div>
  );
};

export default HousingOptionsSection;
