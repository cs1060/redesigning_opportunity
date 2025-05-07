'use client'
import React, { useState, useEffect, useCallback } from 'react'
import { useAssessment, type AssessData } from '../AssessProvider'
import { useTranslations } from 'next-intl'
import ActionReminder from '../ActionReminder'
import LocalSchoolsSection from './LocalSchoolsSection'
import CommunityProgramsSection from './CommunityProgramsSection'
import JobOpportunitiesSection from './JobOpportunitiesSection'
import TownInfoSection from './TownInfoSection'
import { 
  SchoolData,
  CommunityProgramData,
  JobSector,
  CareerAdvice,
  TownData,
  defaultRecommendations, 
  filterSchoolsByChildAge, 
  filterCommunityPrograms,
  generatePersonalizedCareerAdvice
} from './types'

interface StayProps {
  onSaveChoices?: (choices: {
    selectedSchool: string | null;
    selectedCommunityPrograms: string[];
  }) => void;
  selectedSchool: string | null;
  selectedCommunityPrograms: string[];
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
  const [personalizedCareerAdvice, setPersonalizedCareerAdvice] = useState<CareerAdvice | null>(null);
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

  // Fetch local recommendations
  const fetchLocalRecommendations = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = userData || {};
      const address = data.address || '';
      const zipCode = data.zipCode || '';
      const income = data.income || '<25k';
      const children = data.children || [];
      
      // In a real implementation, you would fetch data from your API
      // For now, we'll use the default recommendations
      
      // Apply filters based on user data
      const filteredSchoolData = filterSchoolsByChildAge(defaultRecommendations.schoolData, userData);
      const filteredProgramData = filterCommunityPrograms(defaultRecommendations.communityProgramData, userData);
      
      setFilteredSchools(filteredSchoolData);
      setFilteredPrograms(filteredProgramData);
      setTownData(defaultRecommendations.townData);
      
    } catch (err) {
      console.error('Error fetching local recommendations:', err);
      setError(`Failed to fetch local recommendations: ${err instanceof Error ? err.message : String(err)}`);
      
      // Use fallback recommendations but apply filtering
      const filteredDefaultSchools = filterSchoolsByChildAge(defaultRecommendations.schoolData, userData);
      const filteredDefaultPrograms = filterCommunityPrograms(defaultRecommendations.communityProgramData, userData);
      
      setFilteredSchools(filteredDefaultSchools);
      setFilteredPrograms(filteredDefaultPrograms);
      setTownData(defaultRecommendations.townData);
    } finally {
      setLoading(false);
    }
  }, [userData]);
  
  // Fetch data on component mount
  useEffect(() => {
    fetchLocalRecommendations();
  }, [fetchLocalRecommendations]);

  useEffect(() => {
    if (userData) {
      const advice = generatePersonalizedCareerAdvice(userData);
      setPersonalizedCareerAdvice(advice);
    }
  }, [userData]);

  const handleSaveChoices = () => {
    if (onSaveChoices && selectedSchool && selectedCommunityPrograms.length > 0) {
      const choices = {
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
        <p className="text-xl mb-6">Let's explore opportunities in your current area</p>
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
          <p className="mb-4">We're showing you our default recommendations instead.</p>
          <button 
            onClick={fetchLocalRecommendations}
            className="bg-[#6CD9CA] hover:bg-opacity-90 text-white py-2 px-4 rounded-md text-sm transition-colors"
          >
            Try Again
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
            Staying in your current location has many advantages. You're already familiar with the area, 
            have established connections, and don't need to deal with the stress of moving.
          </p>
          <p>
            Let's explore how you can make the most of your current community by finding the best schools 
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

      {/* Job Opportunities */}
      <JobOpportunitiesSection
        jobSectors={defaultRecommendations.jobSectors}
        personalizedCareerAdvice={personalizedCareerAdvice}
        zipCode={userData?.zipCode || ''}
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