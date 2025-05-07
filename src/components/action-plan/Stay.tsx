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
      
      // Call the OpenAI API to get personalized recommendations
      const response = await fetch('/api/openai-stay', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          city,
          income,
          children
        })
      });
      
      if (!response.ok) {
        const errorMessage = `API returned status code ${response.status}: ${response.statusText}`;
        console.error(`API error: ${errorMessage}`);
        
        try {
          // Try to get more detailed error information from the response
          const errorData = await response.json();
          console.error('Error details:', errorData);
          
          if (errorData.details) {
            console.error('API error details:', errorData.details);
          }
          
          if (errorData.rawResponse) {
            console.error('Raw API response:', errorData.rawResponse);
          }
          
          // If we have valid JSON data in the error response that looks like recommendations,
          // we can use it instead of falling back to default data
          if (errorData.townData && errorData.schoolData) {
            console.log('Found valid recommendation data in error response, using it');
            
            // Process the data we received
            const filteredSchools = filterSchoolsByChildAge(errorData.schoolData, userData);
            const filteredPrograms = filterCommunityPrograms(errorData.communityProgramData || [], userData);
            
            // Update state with the data from the error response
            setFilteredSchools(filteredSchools);
            setFilteredPrograms(filteredPrograms);
            setTownData(errorData.townData);
            
            // Show a warning but don't treat it as a full error
            setError(`Using recommendations from response despite API error: ${errorMessage}`);
            setLoading(false);
            
            // Exit early from the function
            return;
          }
        } catch (e) {
          console.error('Could not parse error response:', e);
        }
        
        throw new Error(`API error: ${errorMessage}`);
      }
      
      let recommendationsData;
      try {
        recommendationsData = await response.json();
      } catch (jsonError) {
        console.error('Error parsing API response as JSON:', jsonError);
        throw new Error('Could not parse API response as JSON');
      }
      
      // Ensure the response has the expected structure
      if (!recommendationsData.townData || !recommendationsData.schoolData) {
        throw new Error('API response missing required data');
      }
      
      // Apply filters based on user data
      const filteredSchoolData = filterSchoolsByChildAge(recommendationsData.schoolData, userData);
      const filteredProgramData = filterCommunityPrograms(recommendationsData.communityProgramData, userData);
      
      setFilteredSchools(filteredSchoolData);
      setFilteredPrograms(filteredProgramData);
      setTownData(recommendationsData.townData);
      
    } catch (err) {
      console.error('Error fetching local recommendations:', err);
      setError(`Failed to fetch local recommendations: ${err instanceof Error ? err.message : String(err)}`);
      
      // Use fallback recommendations but apply filtering
      const filteredDefaultSchools = filterSchoolsByChildAge(defaultRecommendations.schoolData, userData);
      const filteredDefaultPrograms = filterCommunityPrograms(defaultRecommendations.communityProgramData, userData);
      
      // Create a fallback town data based on the user's location if available
      const fallbackTownData: TownData = {
        name: userData?.city || 'Your Current Location',
        website: `https://www.google.com/search?q=${encodeURIComponent(userData?.city || '')}`,
        description: `${userData?.city || 'Your current location'} is where you currently reside. This section will help you explore opportunities in your area.`
      };
      
      setFilteredSchools(filteredDefaultSchools);
      setFilteredPrograms(filteredDefaultPrograms);
      setTownData(fallbackTownData);
    } finally {
      setLoading(false);
    }
  }, [userData]);
  
  // Fetch data on component mount
  // Trigger the API call when the component mounts
  useEffect(() => {
    fetchLocalRecommendations();
  }, [fetchLocalRecommendations]);

  const handleSaveChoices = () => {
    if (onSaveChoices) {
      const choices = {
        town: townData?.name || userData?.city || 'Current Location',
        selectedSchool,
        selectedCommunityPrograms
      };
      onSaveChoices(choices);
    }
  };

  const hasRequiredSelections = 
    selectedSchool && 
    selectedCommunityPrograms.length > 0;

  return (
    <div className="space-y-12 mt-16">
      <div className="bg-white shadow-md rounded-lg p-6 text-center">
        <h2 className="text-3xl font-bold mb-4">Staying in Your Current Location</h2>
        <p className="text-xl mb-6">Let&apos;s explore opportunities in your current area</p>
      </div>

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