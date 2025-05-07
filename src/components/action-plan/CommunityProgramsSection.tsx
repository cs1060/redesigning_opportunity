'use client'
import React from 'react';
import { useTranslations } from 'next-intl';
import ActionReminder from '../ActionReminder';
import { CommunityProgramData } from './types';

interface CommunityProgramsSectionProps {
  programs: CommunityProgramData[];
  selectedPrograms: string[];
  handleProgramToggle: (programName: string) => void;
  loading: boolean;
}

const CommunityProgramsSection: React.FC<CommunityProgramsSectionProps> = ({
  programs,
  selectedPrograms,
  handleProgramToggle,
  loading
}) => {
  const t = useTranslations('move');

  if (loading || programs.length === 0) {
    return null;
  }

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h3 className="text-2xl font-semibold mb-4">Community Programs</h3>
      <p className="mb-4">Select community programs your child can be part of:</p>
      
      <ActionReminder 
        message={t('selectProgramsReminder', { fallback: "Tip: Select at least one community program that interests your child" })} 
        isVisible={selectedPrograms.length === 0 && programs.length > 0} 
      />
      
      <div className="space-y-4">
        {programs.map((program) => (
          <div 
            key={program.name}
            className={`
              border rounded-lg p-4 cursor-pointer transition-all duration-300
              ${selectedPrograms.includes(program.name)
                ? 'border-[#6CD9CA] bg-[#6CD9CA] bg-opacity-10' 
                : 'border-gray-200 hover:border-[#6CD9CA] hover:bg-[#6CD9CA] hover:bg-opacity-10'}
            `}
            onClick={() => handleProgramToggle(program.name)}
          >
            <div className="flex justify-between items-center">
              <div>
                <h4 className="text-xl font-semibold">{program.name}</h4>
              </div>
              <div className="flex items-center">
                {program.genderFocus && program.genderFocus !== 'all' && (
                  <span className="px-2 py-0.5 bg-gray-100 rounded-full text-xs mr-2 capitalize">
                    {program.genderFocus}
                  </span>
                )}
                {program.ageRanges && program.ageRanges.length > 0 && program.ageRanges[0] !== 'all' && (
                  <span className="px-2 py-0.5 bg-gray-100 rounded-full text-xs mr-2 capitalize">
                    {program.ageRanges.join(', ')}
                  </span>
                )}
                <a 
                  href={program.website} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-[#6CD9CA] hover:underline flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Search
                </a>
              </div>
            </div>
            <p className="mt-2">{program.description}</p>
            {program.tags && program.tags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {program.tags.map(tag => (
                  <span key={tag} className="px-2 py-0.5 bg-gray-100 rounded-full text-xs capitalize">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {selectedPrograms.length > 0 && (
        <p className="mt-4 text-lg font-semibold">
          {selectedPrograms.join(', ')} {selectedPrograms.length === 1 ? 'looks' : 'look'} like a great option for your child!
        </p>
      )}
    </div>
  );
};

export default CommunityProgramsSection;
