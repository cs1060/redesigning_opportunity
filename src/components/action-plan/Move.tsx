'use client'
import React, { useState, useEffect } from 'react'
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
  SchoolData,
  CommunityProgramData,
  HousingOption,
  CareerAdvice,
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
  town?: string;
  selectedSchool?: string | null;
  selectedCommunityPrograms?: string[];
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
  
  // Effect to fetch recommendations when ZIP code changes
  useEffect(() => {
    if (shouldFetchData && zipCode && validateZipCode(zipCode)) {
      fetchRecommendations();
      setShouldFetchData(false);
    }
  }, [shouldFetchData, zipCode]);

  // Function to fetch recommendations from the API
  const fetchRecommendations = async () => {
    setLoading(true);
    setError(null);
    setZipCodeError(null);
    
    try {
      // Get user data for the API request
      const data = userData || {};
      const address = data.address || '';
      const income = data.income || '<25k';
      const children = data.children || [];
      
      // Update map address when zip code changes
      setMapAddress(zipCode);
      
      // Get state information from ZIP code to ensure we search within the correct state
      const stateInfo = await geocodeZipCode(zipCode);
      if (!stateInfo) {
        setZipCodeError('Could not find this ZIP code. Please check and try again.');
        setLoading(false);
        return;
      }
      
      // Fetch recommendations from OpenAI API
      const openaiResponse = await fetch('/api/openai-move', {
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
      
      let recommendationsData: MoveRecommendations;
      
      if (!openaiResponse.ok) {
        const errorText = `API returned status code ${openaiResponse.status}`;
        console.error(errorText);
        
        // Try to get more detailed error information
        try {
          const errorData = await openaiResponse.json();
          console.error('Error details:', errorData);
          
          // If we have valid JSON data in the error response that looks like recommendations,
          // we can use it instead of falling back to default data
          if (errorData.townData && errorData.schoolData) {
            console.log('Found valid recommendation data in error response, using it');
            recommendationsData = errorData as MoveRecommendations;
          } else {
            setError(errorText);
            recommendationsData = defaultRecommendations;
          }
        } catch (e) {
          console.error('Could not parse error response:', e);
          setError(errorText);
          recommendationsData = defaultRecommendations;
        }
      } else {
        // Successfully got data from OpenAI API
        recommendationsData = await openaiResponse.json();
      }
      
      // Try to fetch real school data from NCES API
      try {
        console.log('Fetching real school data from NCES API for ZIP code:', zipCode);
        const schoolsResponse = await fetch(`/api/nces-schools?zipCode=${zipCode}&distance=15`);
        
        if (schoolsResponse.ok) {
          const schoolsData = await schoolsResponse.json();
          
          // If we have real school data, use it instead of the OpenAI-generated data
          if (schoolsData.schools && schoolsData.schools.length > 0) {
            console.log('Using real school data from NCES API:', schoolsData.schools.length, 'schools found');
            recommendationsData.schoolData = schoolsData.schools;
          } else {
            console.log('No schools found from NCES API, using OpenAI-generated data');
          }
        } else {
          console.error('Failed to fetch schools from NCES API:', await schoolsResponse.text());
        }
      } catch (schoolError) {
        console.error('Error fetching schools from NCES API:', schoolError);
        // Continue with OpenAI data if NCES API fails
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
      
      // Apply filtering based on user data
      const filteredSchools = filterSchoolsByChildAge(validatedData.schoolData, userData);
      const filteredPrograms = filterCommunityPrograms(validatedData.communityProgramData, userData);
      const filteredHousingOptions = filterHousingOptions(validatedData.housingOptions, userData);
      
      // Generate personalized career advice if not provided in the API response
      const personalizedAdvice = validatedData.careerAdvice || generatePersonalizedCareerAdvice(userData);
      
      // Update state with the filtered data
      setFilteredSchools(filteredSchools);
      setFilteredPrograms(filteredPrograms);
      setFilteredHousingOptions(filteredHousingOptions);
      setRecommendations(validatedData);
      setPersonalizedCareerAdvice(personalizedAdvice);
      
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      setError('Failed to fetch recommendations. Please try again later.');
      
      // Apply filtering to fallback recommendations
      const filteredDefaultSchools = filterSchoolsByChildAge(defaultRecommendations.schoolData, userData);
      const filteredDefaultPrograms = filterCommunityPrograms(defaultRecommendations.communityProgramData, userData);
      const filteredDefaultHousingOptions = filterHousingOptions(defaultRecommendations.housingOptions, userData);
      
      // Update state with fallback data
      setFilteredSchools(filteredDefaultSchools);
      setFilteredPrograms(filteredDefaultPrograms);
      setFilteredHousingOptions(filteredDefaultHousingOptions);
      setRecommendations(defaultRecommendations);
      setPersonalizedCareerAdvice(generatePersonalizedCareerAdvice(userData));
    } finally {
      setLoading(false);
    }
  };
  
  // Determine if the user has made all required selections
  const hasRequiredSelections = selectedSchool !== null && 
    selectedCommunityPrograms.length > 0 && 
    selectedNeighborhood !== null && 
    selectedHousingType !== null;
  
  // Extract neighborhoods from recommendations
  const neighborhoods = recommendations.neighborhoodData?.topNeighborhoods || [];
  
  // Handle saving user choices
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

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h2 className="text-3xl font-bold mb-6 text-center">{t('title')}</h2>
      <p className="text-lg mb-8 text-center">{t('subtitle')}</p>
      
      {/* ZIP Code Input */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-8">
        <h3 className="text-2xl font-semibold mb-4">{t('enterZipCode')}</h3>
        <p className="mb-4">{t('zipCodeInstructions')}</p>
        
        <div className="flex items-center">
          <input
            type="text"
            value={zipCode}
            onChange={handleZipCodeChange}
            placeholder="Enter ZIP code"
            className="border rounded-l-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-[#6CD9CA]"
            maxLength={10}
          />
          <button 
            onClick={() => setShouldFetchData(true)}
            disabled={!validateZipCode(zipCode) || loading}
            className={`
              bg-[#6CD9CA] text-white px-4 py-2 rounded-r-lg
              ${(!validateZipCode(zipCode) || loading) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-opacity-90'}
            `}
          >
            {loading ? 'Loading...' : 'Search'}
          </button>
        </div>
        
        {zipCodeError && (
          <p className="text-red-500 mt-2">{zipCodeError}</p>
        )}
      </div>
      
      {/* Main Content */}
      {zipCode ? (
        <>
          {/* Loading State */}
          {loading && (
            <div className="bg-white shadow-md rounded-lg p-6 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6CD9CA] mx-auto mb-4"></div>
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
      ) : (
        <div className="bg-white shadow-md rounded-lg p-6 text-center">
          <p className="text-gray-600">Enter a ZIP code above to get personalized recommendations</p>
        </div>
      )}
    </div>
  );
};

export default Move;
