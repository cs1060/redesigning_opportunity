'use client'
import React from 'react';
import { School } from 'lucide-react';
import { useTranslations } from 'next-intl';
import ActionReminder from '../ActionReminder';
import { SchoolData, getSchoolLevelMessage } from './types';
import { AssessData } from '../AssessProvider';

interface LocalSchoolsSectionProps {
  schools: SchoolData[];
  selectedSchool: string | null;
  handleSchoolSelect: (schoolName: string) => void;
  userData?: AssessData;
  loading: boolean;
}

const LocalSchoolsSection: React.FC<LocalSchoolsSectionProps> = ({
  schools,
  selectedSchool,
  handleSchoolSelect,
  userData,
  loading
}) => {
  const t = useTranslations('move');

  if (loading || schools.length === 0) {
    return null;
  }

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h3 className="text-2xl font-semibold mb-4">{t('localSchools')}</h3>
      <p className="mb-1">{t('selectSchool')}</p>
      <p className="mb-4 text-sm text-gray-600">{getSchoolLevelMessage(userData)}</p>
      
      <ActionReminder 
        message={t('selectSchoolReminder', { fallback: "Tip: Select a school that would be a good match for your child" })} 
        isVisible={!selectedSchool && schools.length > 0} 
      />
      
      <div className="space-y-4">
        {schools.map((school) => (
          <div 
            key={school.name}
            className={`
              border rounded-lg p-4 cursor-pointer transition-all duration-300 flex items-center
              ${selectedSchool === school.name 
                ? 'border-[#6CD9CA] bg-[#6CD9CA] bg-opacity-10' 
                : 'border-gray-200 hover:border-[#6CD9CA] hover:bg-[#6CD9CA] hover:bg-opacity-10'}
            `}
            onClick={() => handleSchoolSelect(school.name)}
          >
            <School className="mr-4 text-[#6CD9CA]" size={24} />
            <div className="flex-grow flex justify-between items-center">
              <div className="flex-grow">
                <div className="flex items-center justify-between">
                  <h4 className="text-xl font-semibold">{school.name}</h4>
                  <div className="flex items-center">
                    <p className="text-sm text-gray-600 ml-4">Rating: {school.rating}/10</p>
                    {school.schoolType && (
                      <span className="ml-2 px-2 py-0.5 bg-gray-100 rounded-full text-xs capitalize">
                        {school.schoolType}
                      </span>
                    )}
                  </div>
                </div>
                <p className="mt-1">{school.description}</p>
              </div>
              <a 
                href={school.website} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-[#6CD9CA] hover:underline ml-4 flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Search
              </a>
            </div>
          </div>
        ))}
      </div>

      {selectedSchool && (
        <p className="mt-4 text-lg font-semibold">
          {selectedSchool} school looks like a great option for your child!
        </p>
      )}
    </div>
  );
};

export default LocalSchoolsSection;
