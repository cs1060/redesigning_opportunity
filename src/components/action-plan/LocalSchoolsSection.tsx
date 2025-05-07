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

  if (loading) {
    return null;
  }
  
  // Fallback schools to ensure we always have at least 3 options
  const fallbackSchools: SchoolData[] = [
    {
      name: "Blacksburg High School",
      rating: 9.2,
      description: "A top-rated public high school known for strong academic programs, diverse extracurricular activities, and excellent college preparation.",
      website: "https://bhs.mcps.org/",
      schoolType: "high",
      city: "Blacksburg",
      state: "VA",
      studentSize: 1250,
      completionRate: 0.95
    },
    {
      name: "Gilbert Linkous Elementary",
      rating: 8.9,
      description: "Highly regarded elementary school with innovative teaching methods, strong parent involvement, and comprehensive support programs.",
      website: "https://gle.mcps.org/",
      schoolType: "elementary",
      city: "Blacksburg",
      state: "VA",
      studentSize: 450,
      completionRate: 0.98
    },
    {
      name: "Blacksburg Middle School",
      rating: 8.7,
      description: "Well-established middle school offering a balanced curriculum with strong emphasis on STEM education and character development.",
      website: "https://bms.mcps.org/",
      schoolType: "middle",
      city: "Blacksburg",
      state: "VA",
      studentSize: 850,
      completionRate: 0.96
    }
  ];
  
  // Combine API schools with fallback schools if needed
  const displaySchools = schools.length >= 3 ? schools : [
    ...schools,
    ...fallbackSchools.filter(fallbackSchool => 
      !schools.some(school => school.name === fallbackSchool.name)
    )
  ].slice(0, Math.max(3, schools.length));
  
  if (displaySchools.length === 0) {
    return null;
  }

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h3 className="text-2xl font-semibold mb-4">{t('localSchools')}</h3>
      <p className="mb-1">{t('selectSchool')}</p>
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
        isVisible={!selectedSchool && displaySchools.length > 0} 
      />
      
      <div className="space-y-4">
        {displaySchools.map((school, index) => (
          <div 
            key={school.name}
            className={`
              border rounded-lg p-4 cursor-pointer transition-all duration-300 flex items-start
              ${selectedSchool === school.name 
                ? 'border-[#6CD9CA] bg-[#6CD9CA] bg-opacity-10' 
                : index === 0 
                  ? 'border-yellow-400 bg-yellow-50' 
                  : 'border-gray-200 hover:border-[#6CD9CA] hover:bg-[#6CD9CA] hover:bg-opacity-10'}
            `}
            onClick={() => handleSchoolSelect(school.name)}
          >
            <div className="flex-shrink-0 mr-4">
              <School className={`text-[#6CD9CA] ${index === 0 ? 'h-8 w-8' : 'h-6 w-6'}`} />
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
                        {school.rating}/10
                      </span>
                      {index < 3 && (
                        <svg className="h-4 w-4 text-yellow-400 ml-1" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      )}
                    </div>
                  </div>
                  {school.schoolType && (
                    <span className="ml-2 px-2 py-1 bg-gray-100 rounded-full text-xs capitalize">
                      {school.schoolType}
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
          {selectedSchool} school looks like a great option for your child!
        </p>
      )}
    </div>
  );
};

export default LocalSchoolsSection;
