'use client'
import React, { useState, useEffect, useCallback } from 'react'
import { useAssessment, type AssessData } from '../AssessProvider'
import { useTranslations } from 'next-intl'
import { geocodeNeighborhood, geocodeZipCode } from '../../utils/geocodingUtils'
import ActionReminder from '../ActionReminder'
import OpportunityMapSection from './OpportunityMapSection'
import LocalSchoolsSection from './LocalSchoolsSection'
import CommunityProgramsSection from './CommunityProgramsSection'
import CommunityDemographicsSection from './CommunityDemographicsSection'
import HousingOptionsSection from './HousingOptionsSection'
import JobOpportunitiesSection from './JobOpportunitiesSection'
import TownInfoSection from './TownInfoSection'
import { 
  MoveRecommendations, 
  defaultRecommendations, 
  filterSchoolsByChildAge, 
  filterCommunityPrograms, 
  filterHousingOptions, 
  inferSchoolType, 
  generatePersonalizedCareerAdvice, 
  generatePersonalizedAdvice 
} from './types'

interface MoveProps {
  onSaveChoices?: (choices: {
    town: string;
    selectedSchool: string | null;
    selectedCommunityPrograms: string[];
    selectedNeighborhood?: string;
    selectedHousingType?: string;
  }) => void;
  town: string;
  selectedSchool: string | null;
  selectedCommunityPrograms: string[];
  selectedNeighborhood?: string;
  selectedHousingType?: string;
  assessmentData?: AssessData;
}

const Move: React.FC<MoveProps> = ({ onSaveChoices, assessmentData }) => {
  const t = useTranslations('move');
  const [selectedSchool, setSelectedSchool] = useState<string | null>(null);
  const [selectedCommunityPrograms, setSelectedCommunityPrograms] = useState<string[]>([]);
  const [selectedNeighborhood, setSelectedNeighborhood] = useState<string | null>(null);
  const [selectedHousingType, setSelectedHousingType] = useState<string | null>(null);
  const [zipCode, setZipCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<MoveRecommendations>(defaultRecommendations);
  const [filteredSchools, setFilteredSchools] = useState<SchoolData[]>([]);
  const [filteredPrograms, setFilteredPrograms] = useState<CommunityProgramData[]>([]);
  const [filteredHousingOptions, setFilteredHousingOptions] = useState<HousingOption[]>([]);
  const [mapAddress, setMapAddress] = useState<string>('');
  const [shouldFetchData, setShouldFetchData] = useState(false);
  const [personalizedCareerAdvice, setPersonalizedCareerAdvice] = useState<CareerAdvice | null>(null);
  const [zipCodeError, setZipCodeError] = useState<string | null>(null);
  
  // Get assessment data from context if not provided as prop
  const assessmentContext = useAssessment();
  const contextData = assessmentContext?.data;
  const userData = assessmentData || contextData;

  const validateZipCode = (zip: string): boolean => {
    // Check if the ZIP code is a valid US ZIP code format (5 digits or 5+4 format)
    const zipRegex = /^\d{5}(-\d{4})?$/;
    return zipRegex.test(zip);
  };

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

  const handleNeighborhoodSelect = async (neighborhoodName: string) => {
    setSelectedNeighborhood(neighborhoodName);
    
    // Update map address when neighborhood is selected
    if (zipCode) {
      try {
        // Get state information from ZIP code first
        const stateInfo = await geocodeZipCode(zipCode);
        if (stateInfo) {
          // Use geocodeNeighborhood to ensure we find the neighborhood within the correct state
          const geocodedAddress = await geocodeNeighborhood(neighborhoodName, stateInfo.state);
          if (geocodedAddress) {
            // Format the address as a string that includes the neighborhood and state
            setMapAddress(`${neighborhoodName}, ${stateInfo.city}, ${stateInfo.stateCode}`);
            return;
          }
        }
      } catch (error) {
        console.error('Error geocoding neighborhood:', error);
      }
      
      // Fallback to simple concatenation if geocoding fails
      setMapAddress(`${neighborhoodName}, ${zipCode}`);
    }
  };

  const handleHousingTypeSelect = (housingType: string) => {
    setSelectedHousingType(housingType);
  };

  const handleZipCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setZipCode(e.target.value);
    // Set flag to fetch data when zipCode changes and length is at least 5
    if (e.target.value.length >= 5) {
      setShouldFetchData(true);
    }
  };
  
  // Fallback data in case the API call fails
  const fallbackRecommendations = defaultRecommendations;

  // Fetch personalized recommendations from OpenAI API
  const fetchRecommendations = useCallback(async () => {
    if (!zipCode || zipCode.length < 5) return;
    
    // Validate ZIP code format first
    if (!validateZipCode(zipCode)) {
      setZipCodeError('Please enter a valid ZIP code (5 digits or 5+4 format)');
      setLoading(false);
      return;
    }
    
    setLoading(true);
    setError(null);
    setZipCodeError(null);
    
    try {
      // Get state information from ZIP code to ensure we search within the correct state
      const stateInfo = await geocodeZipCode(zipCode);
      if (!stateInfo) {
        setZipCodeError('Could not find this ZIP code. Please check and try again.');
        setLoading(false);
        return;
      }
      
      const data = userData || {};
      const address = data.address || '';
      const income = data.income || '<25k';
      const children = data.children || [];
      
      // Update map address when zip code changes
      setMapAddress(zipCode);
      
      const response = await fetch('/api/openai-move', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          address,
          zipCode,
          income,
          children,
          includeJobData: true // Add flag to request job data
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
            setRecommendations(errorData);
            
            // Show a warning but don't treat it as a full error
            setError(`Using recommendations from response despite API error: ${errorMessage}`);
            setLoading(false);
            
            // Exit early from the function
            return;
          }
        } catch (e) {
          console.error('Could not parse error response:', e);
        }
        
        // Apply filtering to fallback recommendations
        const filteredDefaultSchools = filterSchoolsByChildAge(fallbackRecommendations.schoolData, userData);
        const filteredDefaultPrograms = filterCommunityPrograms(fallbackRecommendations.communityProgramData, userData);
        
        // Update state with fallback data
        setFilteredSchools(filteredDefaultSchools);
        setFilteredPrograms(filteredDefaultPrograms);
        setRecommendations(fallbackRecommendations);
        setError(`Using default recommendations. API error: ${errorMessage}`);
        setLoading(false);
        
        // Exit early from the function
        return;
      }
      
      let recommendationsData;
      try {
        recommendationsData = await response.json();
      } catch (jsonError) {
        console.error('Error parsing API response as JSON:', jsonError);
        
        // Apply filtering to fallback recommendations
        const filteredDefaultSchools = filterSchoolsByChildAge(fallbackRecommendations.schoolData, userData);
        const filteredDefaultPrograms = filterCommunityPrograms(fallbackRecommendations.communityProgramData, userData);
        
        // Update state with fallback data
        setFilteredSchools(filteredDefaultSchools);
        setFilteredPrograms(filteredDefaultPrograms);
        setRecommendations(fallbackRecommendations);
        setError('Could not parse API response. Using default recommendations instead.');
        setLoading(false);
        return;
      }
      
      // Ensure the response has the expected structure
      const validatedData: MoveRecommendations = {
        townData: recommendationsData.townData || defaultRecommendations.townData,
        neighborhoodData: {
          topNeighborhoods: Array.isArray(recommendationsData.neighborhoodData?.topNeighborhoods) 
            ? recommendationsData.neighborhoodData.topNeighborhoods 
            : defaultRecommendations.neighborhoodData.topNeighborhoods
        },
        schoolData: Array.isArray(recommendationsData.schoolData) 
          ? recommendationsData.schoolData.map(inferSchoolType)
          : defaultRecommendations.schoolData,
        communityProgramData: Array.isArray(recommendationsData.communityProgramData) 
          ? recommendationsData.communityProgramData 
          : defaultRecommendations.communityProgramData,
        communityDemographics: recommendationsData.communityDemographics || defaultRecommendations.communityDemographics,
        housingOptions: Array.isArray(recommendationsData.housingOptions) 
          ? recommendationsData.housingOptions 
          : defaultRecommendations.housingOptions,
        jobSectors: Array.isArray(recommendationsData.jobSectors) 
          ? recommendationsData.jobSectors 
          : defaultRecommendations.jobSectors,
        careerAdvice: recommendationsData.careerAdvice || defaultRecommendations.careerAdvice
      };
      
      // Apply filters based on user data
      const filteredSchoolData = filterSchoolsByChildAge(validatedData.schoolData, userData);
      const filteredProgramData = filterCommunityPrograms(validatedData.communityProgramData, userData);
      setFilteredSchools(filteredSchoolData);
      setFilteredPrograms(filteredProgramData);
      setRecommendations(validatedData);
      setFilteredHousingOptions(filterHousingOptions(validatedData.housingOptions, userData));
      
    } catch (err) {
      console.error('Error fetching move recommendations:', err);
      setError(`Failed to fetch personalized recommendations: ${err instanceof Error ? err.message : String(err)}. Using default data instead.`);
      
      // Use fallback recommendations but apply filtering
      const filteredDefaultSchools = filterSchoolsByChildAge(fallbackRecommendations.schoolData, userData);
      const filteredDefaultPrograms = filterCommunityPrograms(fallbackRecommendations.communityProgramData, userData);
      
      setFilteredSchools(filteredDefaultSchools);
      setFilteredPrograms(filteredDefaultPrograms);
      
      // Use fallback recommendations
      setRecommendations(fallbackRecommendations);
    } finally {
      setLoading(false);
      // Reset the flag after fetching
      setShouldFetchData(false);
    }
  }, [zipCode, userData, fallbackRecommendations]);
  
  // Trigger the API call when shouldFetchData is true
  useEffect(() => {
    if (shouldFetchData) {
      fetchRecommendations();
    }
  }, [shouldFetchData, fetchRecommendations]);

  useEffect(() => {
    if (userData) {
      const advice = generatePersonalizedCareerAdvice(userData);
      setPersonalizedCareerAdvice(advice);
    }
  }, [userData]);

  const handleSaveChoices = () => {
    if (onSaveChoices && selectedSchool && selectedCommunityPrograms.length > 0) {
      const choices = {
        town: recommendations.townData.name,
        selectedSchool,
        selectedCommunityPrograms,
        selectedNeighborhood: selectedNeighborhood || undefined,
        selectedHousingType: selectedHousingType || undefined
      };
      onSaveChoices(choices);
    }
  };

  const hasRequiredSelections = 
    selectedSchool && 
    selectedCommunityPrograms.length > 0 && 
    zipCode && 
    selectedNeighborhood && 
    selectedHousingType;

  // Ensure neighborhoods data is valid
  const neighborhoods = Array.isArray(recommendations?.neighborhoodData?.topNeighborhoods) 
    ? recommendations.neighborhoodData.topNeighborhoods 
    : defaultRecommendations.neighborhoodData.topNeighborhoods;

  return (
    <div className="space-y-12 mt-16">
      {/* ZIP Code Input */}
      <div className="bg-white shadow-md rounded-lg p-6 text-center">
        <h2 className="text-3xl font-bold mb-4">Where Would You Like to Move?</h2>
        <p className="text-xl mb-6">Do you know where you want to live next?</p>
        <div className="flex justify-center items-center">
          <label htmlFor="zipCode" className="mr-4 text-lg">Enter ZIP Code:</label>
          <div className="relative">
            <input 
              type="text" 
              id="zipCode"
              value={zipCode}
              onChange={handleZipCodeChange}
              placeholder="e.g. 22204"
              className={`border-2 ${zipCodeError ? 'border-red-500' : 'border-[#6CD9CA]'} rounded-md px-4 py-2 text-lg w-40`}
              disabled={loading}
            />
            {zipCodeError && (
              <div className="text-red-500 text-sm mt-1">{zipCodeError}</div>
            )}
            {loading && zipCode && !zipCodeError && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#6CD9CA]"></div>
              </div>
            )}
          </div>
          {zipCode && !loading && (
            <button 
              onClick={() => setShouldFetchData(true)}
              className="ml-2 bg-[#6CD9CA] hover:bg-opacity-90 text-white py-2 px-4 rounded-md text-sm transition-colors"
            >
              Update
            </button>
          )}
        </div>
        
        <ActionReminder 
          message={t('enterZipReminder', { fallback: "Enter a ZIP code to view recommendations and continue your plan" })} 
          isVisible={!zipCode && !loading} 
        />
      </div>

      {/* Render following sections only when ZIP code is entered */}
      {zipCode && (
        <>
          {/* Loading State */}
          {loading && (
            <div className="bg-white shadow-md rounded-lg p-6 text-center">
              <div className="animate-pulse flex flex-col items-center">
                <div className="h-8 w-64 bg-gray-200 rounded mb-4"></div>
                <div className="h-4 w-full bg-gray-200 rounded mb-2"></div>
                <div className="h-4 w-5/6 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 w-4/6 bg-gray-200 rounded"></div>
              </div>
              <p className="mt-4 text-gray-600">Fetching personalized recommendations for {zipCode}...</p>
            </div>
          )}
          
          {/* Error State */}
          {error && !loading && (
            <div className="bg-white shadow-md rounded-lg p-6 border-l-4 border-red-500">
              <h3 className="text-2xl font-semibold mb-4 text-left">Notice</h3>
              <p className="text-red-600 mb-4">{error}</p>
              <p className="mb-4">We&apos;re showing you our default recommendations instead.</p>
              <button 
                onClick={() => setShouldFetchData(true)}
                className="bg-[#6CD9CA] hover:bg-opacity-90 text-white py-2 px-4 rounded-md text-sm transition-colors"
              >
                Try Again
              </button>
            </div>
          )}
          
          {/* Personalized Advice */}
          {!loading && userData && (
            <div className="bg-[#6CD9CA] bg-opacity-10 p-6 rounded-lg mb-8">
              <h3 className="text-xl font-semibold mb-2">Personalized Advice</h3>
              <p>{generatePersonalizedAdvice(userData)}</p>
            </div>
          )}
          
          {/* Town Information */}
          {!loading && recommendations?.townData && (
            <TownInfoSection 
              townData={recommendations.townData}
              loading={loading}
            />
          )}

          {/* Opportunity Map & Top Neighborhoods */}
          {!loading && (
            <OpportunityMapSection
              mapAddress={mapAddress}
              zipCode={zipCode}
              neighborhoods={neighborhoods}
              selectedNeighborhood={selectedNeighborhood}
              handleNeighborhoodSelect={handleNeighborhoodSelect}
              loading={loading}
            />
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

          {/* Community Demographics */}
          <CommunityDemographicsSection
            demographics={recommendations.communityDemographics}
            zipCode={zipCode}
            loading={loading}
          />

          {/* Housing Options */}
          <HousingOptionsSection
            housingOptions={filteredHousingOptions}
            selectedHousingType={selectedHousingType}
            handleHousingTypeSelect={handleHousingTypeSelect}
            loading={loading}
          />

          {/* Job Opportunities */}
          <JobOpportunitiesSection
            jobSectors={recommendations.jobSectors}
            personalizedCareerAdvice={personalizedCareerAdvice}
            zipCode={zipCode}
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
              <p>Please select a neighborhood, school, housing type, and at least one community program to continue</p>
              
              <ActionReminder 
                message={t('completeSelectionsReminder', { fallback: "Complete all selections above to save your choices and proceed to the next steps" })} 
                isVisible={true} 
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Move;