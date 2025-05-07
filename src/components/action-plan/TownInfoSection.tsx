'use client'
import React from 'react';
import { TownData } from './types';

interface TownInfoSectionProps {
  townData: TownData | null;
  loading: boolean;
}

const TownInfoSection: React.FC<TownInfoSectionProps> = ({
  townData,
  loading
}) => {
  if (loading || !townData) {
    return null;
  }

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h3 className="text-2xl font-semibold mb-4 text-left">Township Information</h3>
      <div className="text-left space-y-2">
        <p><strong>Town Name:</strong> {townData.name}</p>
        <p>
          <strong>Township Website:</strong>{' '}
          <a 
            href={townData.website} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-[#6CD9CA] hover:underline inline-flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Search Township Website
          </a>{' '}
          <span className="text-sm text-gray-600">
            (Click to learn more about local opportunities!)
          </span>
        </p>
        <p><strong>Description:</strong> {townData.description}</p>
      </div>
    </div>
  );
};

export default TownInfoSection;
