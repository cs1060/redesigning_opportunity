'use client'
import React, { useState, useEffect, useCallback } from 'react'
import { useAssessment, type AssessData } from '../AssessProvider'
import { useTranslations } from 'next-intl'
import ActionReminder from '../ActionReminder'
import LocalSchoolsSection from './LocalSchoolsSection'
import CommunityProgramsSection from './CommunityProgramsSection'
import TownInfoSection from './TownInfoSection'
import { 
  SchoolData,
  CommunityProgramData,
  TownData,
  defaultRecommendations, 
  filterSchoolsByChildAge, 
  filterCommunityPrograms,
} from './types'

interface StayProps {
  onSaveChoices?: (choices: {
    town: string;
    selectedSchool: string | null;
    selectedCommunityPrograms: string[];
  }) => void;
  selectedSchool?: string | null;
  selectedCommunityPrograms?: string[];
  assessmentData?: AssessData;
}

const Stay: React.FC<StayProps> = ({ onSaveChoices, assessmentData }) => {
  const t = useTranslations('stay');
  const [selectedSchool, setSelectedSchool] = useState<string | null>(null);
  const [selectedCommunityPrograms, setSelectedCommunityPrograms] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filteredSchools, setFilteredSchools] = useState<SchoolData[]>([]);
  const [filteredPrograms, setFilteredPrograms] = useState<CommunityProgramData[]>([]);
  const [townData, setTownData] = useState<TownData | null>(null);
  const [zipCode, setZipCode] = useState<string | null>(null);
  
  // Get assessment data from context if not provided as prop
  const assessmentContext = useAssessment();
  const contextData = assessmentContext?.data;
  const userData = assessmentData || contextData;

  const handleSchoolSelect = (schoolName: string) => {
    setSelectedSchool(schoolName);
  };

  const handleCommunityProgramToggle = (programName: string) => {
    setSelectedCommunityPrograms(prev => 
      prev.includes(programName)
        ? prev.filter(p => p !== programName)
        : [...prev, programName]
    );
  };

  // Get ZIP code from city name
  const getZipCodeFromCity = useCallback(async (city: string): Promise<string | null> => {
    try {
      const response = await fetch(`/api/city-to-zip?city=${encodeURIComponent(city)}`);
      
      if (!response.ok) {
        console.error(`Failed to get ZIP code for ${city}: ${response.status}`);
        return null;
      }
      
      const data = await response.json();
      return data.zipCode || null;
    } catch (error) {
      console.error('Error getting ZIP code:', error);
      return null;
    }
  }, []);

  // Fetch real school data from NCES API
  const fetchRealSchoolData = useCallback(async (zipCode: string): Promise<SchoolData[]> => {
    try {
      console.log('Fetching real school data from NCES API for ZIP code:', zipCode);
      const response = await fetch(`/api/nces-schools?zipCode=${zipCode}&distance=15`);
      
      if (!response.ok) {
        console.error(`Failed to fetch schools from NCES API: ${response.status}`);
        return [];
      }
      
      const data = await response.json();
      
      if (data.schools && data.schools.length > 0) {
        console.log(`Found ${data.schools.length} real schools from NCES API`);
        return data.schools;
      } else {
        console.log('No schools found from NCES API');
        return [];
      }
    } catch (error) {
      console.error('Error fetching schools from NCES API:', error);
      return [];
    }
  }, []);

  // Fetch local recommendations from OpenAI API
  const fetchLocalRecommendations = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Get user location data from the assessment
      if (!userData) {
        throw new Error('User data is not available');
      }
      
      // Prepare data for API call
      const city = userData.city || '';
      const income = userData.income || '<25k';
      const children = userData.children || [];
      
      // Get ZIP code for the city
      let cityZipCode = zipCode;
      if (!cityZipCode) {
        cityZipCode = await getZipCodeFromCity(city);
        if (cityZipCode) {
          setZipCode(cityZipCode);
          console.log(`Found ZIP code for ${city}: ${cityZipCode}`);
        } else {
          console.warn(`Could not find ZIP code for ${city}`);
        }
      }
      
      // Call the OpenAI API to get personalized recommendations
      const response = await fetch('/api/openai-stay', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          address: city, // Using city as the address
          income,
          children
        })
      });
      
      let recommendationsData;
      
      if (!response.ok) {
        const errorMessage = `API returned status code ${response.status}: ${response.statusText}`;
        console.error(`API error: ${errorMessage}`);
        
        try {
          // Try to get more detailed error information from the response
          const errorData = await response.json();
          console.error('Error details:', errorData);
          
          // If we have valid JSON data in the error response that looks like recommendations,
          // we can use it instead of falling back to default data
          if (errorData.townData && errorData.schoolData) {
            console.log('Found valid recommendation data in error response, using it');
            recommendationsData = errorData;
          } else {
            // Use default recommendations
            recommendationsData = defaultRecommendations;
            setError(`Using default recommendations. API error: ${errorMessage}`);
          }
        } catch (e) {
          console.error('Could not parse error response:', e);
          recommendationsData = defaultRecommendations;
          setError(`Using default recommendations. API error: ${errorMessage}`);
        }
      } else {
        recommendationsData = await response.json();
      }
      
      // Try to fetch real school data if we have a ZIP code
      if (cityZipCode) {
        const realSchools = await fetchRealSchoolData(cityZipCode);
        
        if (realSchools.length > 0) {
          // Replace the OpenAI-generated school data with real data
          recommendationsData.schoolData = realSchools;
        }
      }
      
      // Process the data
      const townInfo: TownData = recommendationsData.townData || defaultRecommendations.townData;
      const schools: SchoolData[] = recommendationsData.schoolData || defaultRecommendations.schoolData;
      const programs: CommunityProgramData[] = recommendationsData.communityProgramData || defaultRecommendations.communityProgramData;
      
      // Filter schools and programs based on user data
      const filteredSchools = filterSchoolsByChildAge(schools, userData);
      const filteredPrograms = filterCommunityPrograms(programs, userData);
      
      // Update state with the filtered data
      setTownData(townInfo);
      setFilteredSchools(filteredSchools);
      setFilteredPrograms(filteredPrograms);
      
    } catch (error) {
      console.error('Error fetching local recommendations:', error);
      setError('Failed to fetch recommendations. Please try again later.');
      
      // Use default recommendations
      const defaultSchools = filterSchoolsByChildAge(defaultRecommendations.schoolData, userData);
      const defaultPrograms = filterCommunityPrograms(defaultRecommendations.communityProgramData, userData);
      
      setTownData(defaultRecommendations.townData);
      setFilteredSchools(defaultSchools);
      setFilteredPrograms(defaultPrograms);
    } finally {
      setLoading(false);
    }
  }, [userData, zipCode, getZipCodeFromCity, fetchRealSchoolData]);
  
  // Fetch recommendations on component mount
  useEffect(() => {
    fetchLocalRecommendations();
  }, [fetchLocalRecommendations]);
  
  // Determine if the user has made all required selections
  const hasRequiredSelections = selectedSchool !== null && selectedCommunityPrograms.length > 0;
  
  // Handle saving user choices
  const handleSaveChoices = () => {
    if (onSaveChoices && selectedSchool && selectedCommunityPrograms.length > 0 && townData) {
      const choices = {
        town: townData.name,
        selectedSchool,
        selectedCommunityPrograms
      };
      onSaveChoices(choices);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h2 className="text-3xl font-bold mb-6 text-center">{t('title')}</h2>
      <p className="text-lg mb-8 text-center">{t('subtitle')}</p>
      
      {/* Loading State */}
      {loading && (
        <div className="bg-white shadow-md rounded-lg p-6 text-center">
          <div className="animate-pulse flex flex-col items-center">
            <div className="h-8 w-64 bg-gray-200 rounded mb-4"></div>
            <div className="h-4 w-full bg-gray-200 rounded mb-2"></div>
            <div className="h-4 w-5/6 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 w-4/6 bg-gray-200 rounded"></div>
          </div>
          <p className="mt-4 text-gray-600">Fetching local recommendations...</p>
        </div>
      )}
      
      {/* Error State */}
      {error && !loading && (
        <div className="bg-white shadow-md rounded-lg p-6 border-l-4 border-red-500">
          <h3 className="text-2xl font-semibold mb-4 text-left">Notice</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <p className="mb-4">We&apos;re showing you our default recommendations instead.</p>
          <button 
            onClick={fetchLocalRecommendations}
            className="bg-[#6CD9CA] hover:bg-opacity-90 text-white py-2 px-4 rounded-md text-sm transition-colors"
          >
            Try Again
          </button>
        </div>
      )}
      
      {/* Refresh Button */}
      {!loading && !error && (
        <div className="flex justify-end mb-4">
          <button 
            onClick={fetchLocalRecommendations}
            className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-md text-sm transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh Recommendations
          </button>
        </div>
      )}
      
      {/* Town Information */}
      <TownInfoSection 
        townData={townData} 
        loading={loading} 
      />
      
      {/* Current Location Overview */}
      {!loading && (
        <div className="bg-white shadow-md rounded-lg p-6">
          <h3 className="text-2xl font-semibold mb-4">Your Current Location</h3>
          <p className="mb-4">
            Staying in your current location has many advantages. You&#39;re already familiar with the area, 
            have established connections, and don&#39;t need to deal with the stress of moving.
          </p>
          <p>
            Let&#39;s explore how you can make the most of your current community by finding the best schools 
            and programs for your children.
          </p>
        </div>
      )}

      {/* Local Schools */}
      <LocalSchoolsSection
        schools={filteredSchools}
        selectedSchool={selectedSchool}
        handleSchoolSelect={handleSchoolSelect}
        userData={userData}
        loading={loading}
      />

      {/* Community Programs */}
      <CommunityProgramsSection
        programs={filteredPrograms}
        selectedPrograms={selectedCommunityPrograms}
        handleProgramToggle={handleCommunityProgramToggle}
        loading={loading}
      />

      {/* Save Choices Button */}
      {hasRequiredSelections ? (
        <div className="text-center">
          <button 
            onClick={handleSaveChoices}
            className="bg-[#6CD9CA] text-white py-3 px-6 rounded-full text-lg font-semibold hover:bg-opacity-90 transition-colors"
          >
            Save My Choices
          </button>
        </div>
      ) : (
        <div className="text-center text-gray-600">
          <p>Please select a school and at least one community program to continue</p>
          
          <ActionReminder 
            message={t('completeSelectionsReminder', { fallback: "Complete all selections above to save your choices and proceed to the next steps" })} 
            isVisible={true} 
          />
        </div>
      )}
    </div>
  );
};

export default Stay;
