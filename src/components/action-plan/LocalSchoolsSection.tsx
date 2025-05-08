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
  className?: string;
  titleClassName?: string;
  schoolItemClassName?: (name: string) => string;
  icon?: React.ReactNode;
}

const LocalSchoolsSection: React.FC<LocalSchoolsSectionProps> = ({
  schools,
  selectedSchool,
  handleSchoolSelect,
  userData,
  loading,
  className = "bg-white shadow-md rounded-lg p-6",
  titleClassName = "text-2xl font-semibold mb-4",
  schoolItemClassName = (name) => `
    border rounded-lg p-4 cursor-pointer transition-all duration-300 flex items-start
    ${selectedSchool === name 
      ? 'border-[#6CD9CA] bg-[#6CD9CA] bg-opacity-10' 
      : 'border-gray-200 hover:border-[#6CD9CA] hover:bg-[#6CD9CA] hover:bg-opacity-10'}
  `,
  icon = <School className="text-[#6CD9CA] h-6 w-6" />
}) => {
  const t = useTranslations('move');

  if (loading) {
    return (
      <div className={className}>
        <h3 className={titleClassName}>{t('localSchools')}</h3>
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="space-y-4 mt-6">
            {[1, 2, 3].map((item) => (
              <div key={item} className="border rounded-lg p-4 flex items-start">
                <div className="w-8 h-8 bg-gray-200 rounded-full mr-4"></div>
                <div className="flex-1">
                  <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
  
  // Ensure we have a valid array of schools
  const validSchools = Array.isArray(schools) ? schools : [];
  
  // If no schools data, show a fallback message
  if (validSchools.length === 0) {
    return (
      <div className={className}>
        <h3 className={titleClassName}>{t('localSchools')}</h3>
        <p className="text-gray-600">No school data is available for this area. Please try a different ZIP code.</p>
      </div>
    );
  }

  // Ensure each school has all the required properties
  const completeSchools = validSchools.map((school, index) => ({
    ...school,
    // Set default values for any missing fields
    name: school.name || `School ${index + 1}`,
    type: school.type || 'unknown',
    rating: typeof school.rating === 'number' ? school.rating : 5,
    description: school.description || `School located in ${school.city || 'the area'}.`,
    completionRate: typeof school.completionRate === 'number' 
      ? school.completionRate 
      : (typeof school.graduationRate === 'number' 
          ? (school.graduationRate > 1 ? school.graduationRate / 100 : school.graduationRate) 
          : 0.85),
    studentSize: typeof school.studentSize === 'number' 
      ? school.studentSize 
      : (typeof school.enrollmentSize === 'number' ? school.enrollmentSize : 500),
    website: school.website || school.url || '#',
    city: school.city || (school.location ? school.location.split(',')[0].trim() : ''),
    state: school.state || (school.location && school.location.includes(',') ? school.location.split(',')[1].trim() : '')
  }));

  return (
    <div className={className}>
      <h3 className={titleClassName}>{t('localSchools')}</h3>
      <p className="mb-1">{t('selectSchool', { fallback: 'Select a school that would best meet your needs:' })}</p>
      <p className="mb-4 text-sm text-gray-600">{getSchoolLevelMessage(userData)}</p>
      
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-blue-800">
              Showing the best schools near your location, sorted by quality rating. Schools are rated based on graduation rates, selectivity, and other factors.
            </p>
          </div>
        </div>
      </div>
      
      <ActionReminder 
        message={t('selectSchoolReminder', { fallback: "Tip: Select a school that would be a good match for your child" })} 
        isVisible={!selectedSchool && completeSchools.length > 0} 
      />
      
      <div className="space-y-4">
        {completeSchools.map((school, index) => (
          <div 
            key={`${school.name}-${index}`}
            className={schoolItemClassName(school.name)}
            onClick={() => handleSchoolSelect(school.name)}
          >
            <div className="flex-shrink-0 mr-4">
              {icon}
              {index === 0 && (
                <div className="mt-2 bg-yellow-400 text-xs font-bold text-white px-2 py-1 rounded text-center">
                  TOP RATED
                </div>
              )}
            </div>
            <div className="flex-grow">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <h4 className={`font-semibold ${index === 0 ? 'text-xl' : 'text-lg'}`}>{school.name}</h4>
                <div className="flex items-center mt-1 sm:mt-0">
                  <div className="flex items-center bg-gray-100 px-2 py-1 rounded-lg">
                    <span className="text-sm font-semibold mr-1">Rating:</span>
                    <div className="flex items-center">
                      <span className={`${index === 0 ? 'text-yellow-600 font-bold' : 'text-gray-700'}`}>
                        {school.rating.toFixed(1)}/10
                      </span>
                      {index < 3 && (
                        <svg className="h-4 w-4 text-yellow-400 ml-1" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      )}
                    </div>
                  </div>
                  {school.type && (
                    <span className="ml-2 px-2 py-1 bg-gray-100 rounded-full text-xs capitalize">
                      {school.type}
                    </span>
                  )}
                </div>
              </div>
              
              <p className="mt-2 text-gray-700">{school.description}</p>
              
              <div className="mt-3 flex flex-wrap gap-2">
                {school.completionRate !== undefined && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Graduation rate: {Math.round(school.completionRate * 100)}%
                  </span>
                )}
                {school.studentSize !== undefined && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Student body: {school.studentSize.toLocaleString()}
                  </span>
                )}
                {school.city && school.state && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    {school.city}, {school.state}
                  </span>
                )}
              </div>
              
              <div className="mt-3 flex justify-end">
                <a 
                  href={school.website} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-[#6CD9CA] hover:underline flex items-center text-sm font-medium"
                  onClick={(e) => e.stopPropagation()}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  Visit School Website
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedSchool && (
        <p className="mt-4 text-lg font-semibold">
          {selectedSchool} looks like a great option for your child!
        </p>
      )}
    </div>
  );
};

export default LocalSchoolsSection;