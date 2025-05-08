'use client'
import React, { useState, useEffect, useCallback } from 'react'
import { School, Home } from 'lucide-react'
import { useAssessment, type AssessData } from '../AssessProvider'
import { useTranslations } from 'next-intl'
import { geocodeNeighborhood, geocodeZipCode, isValidZipCode } from '../../utils/geocodingUtils'
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
  
  // Function to fetch recommendations from the API
  const fetchRecommendations = useCallback(async () => {
    setLoading(true);
    setError(null);
    setZipCodeError(null);
    
    try {
      // Get user data for the API request
      const openaiResponse = await fetch('/api/openai-move', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          zipCode,
          income: userData?.income || '<25k',
          children: userData?.children || [],
          includeJobData: true
        })
      });
      
      // Initialize recommendations data
      let recommendationsData: MoveRecommendations;
      
      // Check if the OpenAI API request was successful
      if (!openaiResponse.ok) {
        const errorText = `Failed to fetch recommendations: ${openaiResponse.status} ${openaiResponse.statusText}`;
        console.error(errorText);
        setError(errorText);
        recommendationsData = defaultRecommendations;
      } else {
        // Successfully got data from OpenAI API
        recommendationsData = await openaiResponse.json();
      }
      
      // Now fetch real school data from SchoolDigger API
      let schoolData: SchoolData[] = recommendationsData.schoolData || [];
      try {
        console.log(`Fetching real schools for ZIP code: ${zipCode}`);
        
        // Call SchoolDigger API with just the ZIP code (same as in Stay.tsx)
        const schoolDiggerUrl = `/api/schooldigger?zipCode=${zipCode}&distance=15`;
        console.log('Calling SchoolDigger API with URL:', schoolDiggerUrl);
        const schoolDiggerResponse = await fetch(schoolDiggerUrl);
        
        if (schoolDiggerResponse.ok) {
          const schoolDiggerData = await schoolDiggerResponse.json();
          console.log('SchoolDigger API response:', JSON.stringify(schoolDiggerData, null, 2));
          console.log('Is mock data?', schoolDiggerData.isMockData);
          console.log('Number of schools:', schoolDiggerData.schools ? schoolDiggerData.schools.length : 0);
          console.log('Response status:', schoolDiggerResponse.status);
          
          if (!schoolDiggerData.isMockData && schoolDiggerData.schools && schoolDiggerData.schools.length > 0) {
            console.log(`Found ${schoolDiggerData.schools.length} real schools from SchoolDigger API`);
            
            // Replace the OpenAI-generated schools with real schools from SchoolDigger
            schoolData = schoolDiggerData.schools;
            
            // Sort schools by rating (highest first)
            schoolData.sort((a: SchoolData, b: SchoolData) => (b.rating || 0) - (a.rating || 0));
            
            // Limit to top 3 schools
            schoolData = schoolData.slice(0, 3);
          } else {
            console.log('Using mock data from SchoolDigger API');
            schoolData = schoolDiggerData.schools;
          }
        } else {
          console.log('Failed to fetch from SchoolDigger API, using OpenAI-generated schools');
        }
      } catch (schoolError) {
        console.error('Error fetching from SchoolDigger API:', schoolError);
        console.log('Using OpenAI-generated schools due to SchoolDigger API error');
      }
      
      // Ensure all required properties are present and update with real school data
      const validatedData: MoveRecommendations = {
        townData: recommendationsData.townData || defaultRecommendations.townData,
        neighborhoodData: recommendationsData.neighborhoodData || defaultRecommendations.neighborhoodData,
        schoolData: schoolData, // Use the real school data from SchoolDigger
        communityProgramData: recommendationsData.communityProgramData || defaultRecommendations.communityProgramData,
        communityDemographics: recommendationsData.communityDemographics || defaultRecommendations.communityDemographics,
        housingOptions: recommendationsData.housingOptions || defaultRecommendations.housingOptions,
        jobSectors: recommendationsData.jobSectors || defaultRecommendations.jobSectors,
        careerAdvice: recommendationsData.careerAdvice || defaultRecommendations.careerAdvice
      };
      
      // Apply filtering based on user data
      const filteredSchools = filterSchoolsByChildAge(validatedData.schoolData, userData);
      const filteredPrograms = filterCommunityPrograms(validatedData.communityProgramData, userData);
      const filteredHousingOptions = filterHousingOptions(validatedData.housingOptions, userData);
      
      // Generate personalized career advice if not provided in the API response
      const personalizedAdvice = validatedData.careerAdvice || generatePersonalizedCareerAdvice(userData);
      
      // Update state with the data
      setFilteredSchools(filteredSchools);
      setFilteredPrograms(filteredPrograms);
      setFilteredHousingOptions(filteredHousingOptions);
      setRecommendations(validatedData);
      setPersonalizedCareerAdvice(personalizedAdvice);
      
      // Set the map address to the ZIP code initially
      setMapAddress(`${zipCode}, USA`);
      
      // If we have neighborhoods, select the first one by default
      if (validatedData.neighborhoodData && 
          validatedData.neighborhoodData.topNeighborhoods && 
          validatedData.neighborhoodData.topNeighborhoods.length > 0) {
        const firstNeighborhood = validatedData.neighborhoodData.topNeighborhoods[0].name;
        setSelectedNeighborhood(firstNeighborhood);
        
        // Update map address with the selected neighborhood
        handleNeighborhoodSelect(firstNeighborhood);
      }
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
      
      // Use default recommendations as fallback
      setRecommendations(defaultRecommendations);
      
      // Filter default data based on user's needs
      const filteredSchools = filterSchoolsByChildAge(defaultRecommendations.schoolData, userData);
      const filteredPrograms = filterCommunityPrograms(defaultRecommendations.communityProgramData, userData);
      const filteredHousing = filterHousingOptions(defaultRecommendations.housingOptions, userData);
      
      setFilteredSchools(filteredSchools);
      setFilteredPrograms(filteredPrograms);
      setFilteredHousingOptions(filteredHousing);
      
      // Generate personalized career advice
      setPersonalizedCareerAdvice(generatePersonalizedCareerAdvice(userData));
    } finally {
      setLoading(false);
    }
  }, [zipCode, userData, validateZipCode, handleNeighborhoodSelect]);
  
  // Effect to fetch recommendations when ZIP code changes
  useEffect(() => {
    if (shouldFetchData && zipCode && validateZipCode(zipCode)) {
      fetchRecommendations();
      setShouldFetchData(false);
    }
  }, [shouldFetchData, zipCode, validateZipCode, fetchRecommendations]);
  
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

  // Safe number formatting function to handle undefined values
  const formatNumber = (value: number | undefined | null): string => {
    if (value === undefined || value === null) {
      return 'N/A';
    }
    try {
      return value.toLocaleString();
    } catch (error) {
      console.error('Error formatting number:', error);
      return String(value || 'N/A');
    }
  };

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

      {/* Main Content */}
      {zipCode ? (
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
              className="bg-white shadow-md rounded-lg p-6"
              titleClassName="text-2xl font-semibold mb-4 text-left"
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
              className="bg-white shadow-md rounded-lg p-6"
              titleClassName="text-2xl font-semibold mb-4"
              neighborhoodItemClassName={(name) => `
                border rounded-lg p-4 cursor-pointer transition-all duration-300
                ${selectedNeighborhood === name 
                  ? 'border-[#6CD9CA] bg-[#6CD9CA] bg-opacity-10' 
                  : 'border-gray-200 hover:border-[#6CD9CA] hover:bg-[#6CD9CA] hover:bg-opacity-10'}
              `}
              mapContainerClassName="h-[500px] rounded-lg overflow-hidden border border-gray-200"
            />
          )}

          {/* Local Schools */}
          <LocalSchoolsSection
            schools={filteredSchools}
            selectedSchool={selectedSchool}
            handleSchoolSelect={handleSchoolSelect}
            userData={userData}
            loading={loading}
            className="bg-white shadow-md rounded-lg p-6"
            titleClassName="text-2xl font-semibold mb-4"
            schoolItemClassName={(name) => `
              border rounded-lg p-4 cursor-pointer transition-all duration-300 flex items-center
              ${selectedSchool === name 
                ? 'border-[#6CD9CA] bg-[#6CD9CA] bg-opacity-10' 
                : 'border-gray-200 hover:border-[#6CD9CA] hover:bg-[#6CD9CA] hover:bg-opacity-10'}
            `}
            icon={<School className="mr-4 text-[#6CD9CA]" size={24} />}
          />

          {/* Community Programs */}
          <CommunityProgramsSection
            programs={filteredPrograms}
            selectedPrograms={selectedCommunityPrograms}
            handleProgramToggle={handleCommunityProgramToggle}
            loading={loading}
            className="bg-white shadow-md rounded-lg p-6"
            titleClassName="text-2xl font-semibold mb-4"
            programItemClassName={(name) => `
              border rounded-lg p-4 cursor-pointer transition-all duration-300
              ${selectedCommunityPrograms.includes(name)
                ? 'border-[#6CD9CA] bg-[#6CD9CA] bg-opacity-10' 
                : 'border-gray-200 hover:border-[#6CD9CA] hover:bg-[#6CD9CA] hover:bg-opacity-10'}
            `}
            tagClassName="px-2 py-0.5 bg-gray-100 rounded-full text-xs capitalize"
          />

          {/* Community Demographics */}
          <CommunityDemographicsSection
            demographics={recommendations.communityDemographics}
            zipCode={zipCode}
            loading={loading}
            className="bg-white shadow-md rounded-lg p-6"
            titleClassName="text-2xl font-semibold mb-6 text-center"
            contentClassName="grid md:grid-cols-2 gap-6"
            formatNumber={formatNumber}
            getIconColor={(group) => {
              if (group && typeof group === 'string') {
                switch(group.toLowerCase()) {
                  case "hispanic": return "text-[#d07e59]";
                  case "white": return "text-[#9dbda9]";
                  case "black": return "text-[#b65441]";
                  case "asian": return "text-[#4f7f8b]";
                  case "other": return "text-[#9b252f]";
                  default: return "text-[#729d9d]";
                }
              }
              return "text-[#729d9d]";
            }}
            getReligionIconColor={(religion) => {
              if (religion && typeof religion === 'string') {
                switch(religion.toLowerCase()) {
                  case "christian": return "text-[#34687e]";
                  case "jewish": return "text-[#4f7f8b]";
                  case "muslim": return "text-[#729d9d]";
                  case "hindu": return "text-[#d07e59]";
                  case "non-religious": return "text-[#9dbda9]";
                  default: return "text-[#b65441]";
                }
              }
              return "text-[#b65441]";
            }}
          />

          {/* Housing Options */}
          <HousingOptionsSection
            housingOptions={filteredHousingOptions}
            selectedHousingType={selectedHousingType}
            handleHousingTypeSelect={handleHousingTypeSelect}
            loading={loading}
            className="bg-white shadow-md rounded-lg p-6"
            titleClassName="text-2xl font-semibold mb-4"
            housingItemClassName={(type) => `
              border rounded-lg p-4 cursor-pointer transition-all duration-300
              ${selectedHousingType === type 
                ? 'border-[#6CD9CA] bg-[#6CD9CA] bg-opacity-10' 
                : 'border-gray-200 hover:border-[#6CD9CA] hover:bg-[#6CD9CA] hover:bg-opacity-10'}
            `}
            icon={<Home className="mr-2 text-[#6CD9CA]" size={20} />}
            resourceLinkClassName="group flex flex-col items-center justify-center bg-white hover:bg-[#6CD9CA] hover:bg-opacity-10 border border-gray-200 rounded-xl p-5 shadow-sm transition-all duration-300 hover:shadow-md"
          />

          {/* Job Opportunities */}
          <JobOpportunitiesSection
            jobSectors={recommendations.jobSectors}
            personalizedCareerAdvice={personalizedCareerAdvice}
            zipCode={zipCode}
            loading={loading}
            className="bg-white shadow-md rounded-lg p-8 mt-8"
            titleClassName="text-3xl font-bold mb-2"
            sectionClassName="bg-[#6CD9CA] bg-opacity-10 p-6 rounded-lg mb-8"
            sectionTitleClassName="text-xl font-semibold mb-4"
            jobSectorClassName="border rounded-lg p-5 hover:border-[#6CD9CA] hover:bg-[#6CD9CA] hover:bg-opacity-5 transition-all duration-300"
            resourceLinkClassName="group flex flex-col items-center justify-center bg-white hover:bg-[#6CD9CA] hover:bg-opacity-10 border border-gray-200 rounded-xl p-5 shadow-sm transition-all duration-300 hover:shadow-md"
            adviceLabelClassName="font-medium text-[#6CD9CA]"
            getDemandLevelClassName={(level) => `
              px-3 py-1 rounded-full text-sm font-medium
              ${level === 'high' ? 'bg-green-100 text-green-800' : 
                level === 'medium' ? 'bg-blue-100 text-blue-800' : 
                'bg-gray-100 text-gray-800'}
            `}
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