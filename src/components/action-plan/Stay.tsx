'use client'

import React, { useState, useEffect } from 'react'
import { useAssessment, type AssessData } from '../AssessProvider'
import { useTranslations } from 'next-intl'
import ActionReminder from '../ActionReminder'
import LocalSchoolsSection from './LocalSchoolsSection'
import CommunityProgramsSection from './CommunityProgramsSection'
import { 
  SchoolData,
  CommunityProgramData,
  defaultRecommendations, 
  filterSchoolsByChildAge, 
  filterCommunityPrograms,
  inferSchoolType,
  generatePersonalizedAdvice
} from './types'

interface StayProps {
  onSaveChoices?: (choices: {
    town: string;
    selectedSchool: string | null;
    selectedCommunityPrograms: string[];
  }) => void;
  assessmentData?: AssessData;
}

const Stay: React.FC<StayProps> = ({ onSaveChoices, assessmentData }) => {
  const t = useTranslations('stay')
  const [selectedSchool, setSelectedSchool] = useState<string | null>(null)
  const [selectedCommunityPrograms, setSelectedCommunityPrograms] = useState<string[]>([])
  const [recommendations, setRecommendations] = useState(defaultRecommendations)
  const [filteredSchools, setFilteredSchools] = useState<SchoolData[]>(defaultRecommendations.schoolData)
  const [filteredPrograms, setFilteredPrograms] = useState<CommunityProgramData[]>(defaultRecommendations.communityProgramData)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  
  // Get assessment data from context if not provided as prop
  const assessmentContext = useAssessment()
  const userData = assessmentData || assessmentContext.data

  const handleSchoolSelect = (schoolName: string) => {
    setSelectedSchool(schoolName)
  }

  const handleCommunityProgramToggle = (programName: string) => {
    setSelectedCommunityPrograms(prev => 
      prev.includes(programName)
        ? prev.filter(p => p !== programName)
        : [...prev, programName]
    )
  }

  // Fetch recommendations from OpenAI API and NCES API
  useEffect(() => {
    const fetchRecommendations = async () => {
      // Skip if no address is available
      if (!userData?.address) {
        setError('No address provided. Please complete the assessment form first.')
        return
      }
      
      setIsLoading(true)
      setError(null)
      
      try {
        // First, get general recommendations from OpenAI API
        const response = await fetch('/api/openai', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            address: userData.address,
            income: userData.income,
            children: userData.children
          })
        })
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.details || 
            `Failed to fetch recommendations: ${response.status} ${response.statusText}`
          );
        }
        
        const data = await response.json();
        
        // Extract ZIP code from the user's address
        let zipCode = '';
        if (userData.address) {
          // Simple regex to extract ZIP code from address
          const zipMatch = userData.address.match(/\b(\d{5})(?:-\d{4})?\b/);
          if (zipMatch && zipMatch[1]) {
            zipCode = zipMatch[1];
          }
        }
        
        // If we have a ZIP code, fetch real schools from NCES API
        let schoolData = data.schoolData || [];
        if (zipCode) {
          try {
            console.log(`Fetching real schools for ZIP code: ${zipCode}`);
            const ncesResponse = await fetch(`/api/nces-schools?zipCode=${zipCode}&distance=15`);
            
            if (ncesResponse.ok) {
              const ncesData = await ncesResponse.json();
              if (ncesData.schools && ncesData.schools.length > 0) {
                console.log(`Found ${ncesData.schools.length} real schools from NCES API`);
                // Replace the OpenAI-generated schools with real schools from NCES
                schoolData = ncesData.schools;
              }
            }
          } catch (ncesError) {
            console.error('Error fetching schools from NCES API:', ncesError);
            // Continue with OpenAI schools if NCES API fails
          }
        }
        
        // Ensure schoolType is present or infer it
        const processedSchoolData = schoolData.map(inferSchoolType);
        
        // Apply filters based on child's age
        const filteredSchoolData = filterSchoolsByChildAge(processedSchoolData, userData);
        const filteredProgramData = filterCommunityPrograms(data.communityProgramData, userData);
        
        // Store both the complete and filtered data
        setRecommendations({
          ...data,
          schoolData: processedSchoolData
        });
        
        setFilteredSchools(filteredSchoolData);
        setFilteredPrograms(filteredProgramData);
      } catch (err) {
        console.error('Error fetching recommendations:', err)
        setError(`Failed to load personalized recommendations: ${err instanceof Error ? err.message : String(err)}. Using default data instead.`)
        
        // Fall back to default recommendations but apply filtering
        const filteredDefaultSchools = filterSchoolsByChildAge(defaultRecommendations.schoolData, userData);
        const filteredDefaultPrograms = filterCommunityPrograms(defaultRecommendations.communityProgramData, userData);
        
        setFilteredSchools(filteredDefaultSchools);
        setFilteredPrograms(filteredDefaultPrograms);
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchRecommendations()
  }, [userData])
  
  const handleSaveChoices = () => {
    if (onSaveChoices && selectedSchool && selectedCommunityPrograms.length > 0) {
      const choices = {
        town: recommendations.townData.name,
        selectedSchool,
        selectedCommunityPrograms
      }
      onSaveChoices(choices)
    }
  }

  return (
    <div className="space-y-12 mt-16">
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6CD9CA]"></div>
          <p className="mt-4 text-lg">Loading personalized recommendations based on your address...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-600">{error}</p>
          <p className="mt-2">Please make sure you&apos;ve completed the assessment form with your address.</p>
        </div>
      ) : (
        <>
          {/* Personalized Advice */}
          {userData && (
            <div className="bg-[#6CD9CA] bg-opacity-10 p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-2">Personalized Advice</h3>
              <p>{generatePersonalizedAdvice(userData)}</p>
            </div>
          )}

          {/* Town Information */}
          <div className="bg-white shadow-md rounded-lg p-6">
            <h3 className="text-2xl font-semibold mb-4 text-left">Township Information</h3>
            <div className="text-left space-y-2">
              <p><strong>Town Name:</strong> {recommendations.townData.name}</p>
              <p>
                <strong>Township Website:</strong>{' '}
                <a 
                  href={recommendations.townData.website} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-[#6CD9CA] hover:underline"
                >
                  {recommendations.townData.website}
                </a>{' '}
                <span className="text-sm text-gray-600">
                  {t('clickToLearnMore')}
                </span>
              </p>
              <p><strong>{t('description')}:</strong> {recommendations.townData.description}</p>
            </div>
          </div>

          {/* Local Schools */}
          <LocalSchoolsSection
            schools={filteredSchools}
            selectedSchool={selectedSchool}
            handleSchoolSelect={handleSchoolSelect}
            userData={userData}
            loading={isLoading}
          />

          {/* Community Programs */}
          <CommunityProgramsSection
            programs={filteredPrograms}
            selectedPrograms={selectedCommunityPrograms}
            handleProgramToggle={handleCommunityProgramToggle}
            loading={isLoading}
          />
        </>
      )}

      {/* Save Choices Button */}
      {selectedSchool && selectedCommunityPrograms.length > 0 && (
        <div className="text-center">
          <button 
            onClick={handleSaveChoices}
            className="bg-[#6CD9CA] text-white py-3 px-6 rounded-full text-lg font-semibold hover:bg-opacity-90 transition-colors"
          >
            Save My Choices
          </button>
        </div>
      )}
      
      {/* Reminder to complete selections to save */}
      {!(selectedSchool && selectedCommunityPrograms.length > 0) && !isLoading && !error && (
        <ActionReminder 
          message={t('completeSelectionsReminder', { fallback: "Complete all selections above to save your choices and proceed to the next steps" })} 
          isVisible={true} 
        />
      )}
    </div>
  )
};

export default Stay
