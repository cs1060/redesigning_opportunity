'use client'
import React from 'react';
import { useTranslations } from 'next-intl';
import { MapOnly } from '../OpportunityMap';
import ActionReminder from '../ActionReminder';
import { Neighborhood } from './types';

interface OpportunityMapSectionProps {
  mapAddress: string;
  zipCode: string;
  neighborhoods: Neighborhood[];
  selectedNeighborhood: string | null;
  handleNeighborhoodSelect: (neighborhoodName: string) => void;
  loading: boolean;
}

const OpportunityMapSection: React.FC<OpportunityMapSectionProps> = ({
  mapAddress,
  zipCode,
  neighborhoods,
  selectedNeighborhood,
  handleNeighborhoodSelect,
  loading
}) => {
  const t = useTranslations('move');

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Opportunity Map - Takes up left half on desktop */}
        <div className="w-full lg:w-1/2">
          <h3 className="text-2xl font-semibold mb-4">Opportunity Map</h3>
          <div className="h-[500px] rounded-lg overflow-hidden border border-gray-200">
            {mapAddress ? (
              <div className="w-full h-full">
                <MapOnly 
                  address={mapAddress}
                  isVisible={true}
                />
              </div>
            ) : (
              <div className="flex items-center justify-center h-full bg-gray-50">
                <p className="text-gray-500">Enter a ZIP code to see the opportunity map</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Neighborhoods List - Takes up right half on desktop */}
        <div className="w-full lg:w-1/2">
          <h3 className="text-2xl font-semibold mb-4">Top Neighborhoods in {zipCode}</h3>
          <p className="mb-4 text-center">{t('selectNeighborhood')}</p>
          
          <ActionReminder 
            message={t('selectNeighborhoodReminder', { fallback: "Tip: Select a neighborhood to see it on the map and continue your plan" })} 
            isVisible={!selectedNeighborhood && neighborhoods.length > 0} 
          />
          
          <div className="space-y-4">
            {neighborhoods.map((neighborhood) => (
              <div 
                key={neighborhood.name} 
                className={`
                  border rounded-lg p-4 cursor-pointer transition-all duration-300
                  ${selectedNeighborhood === neighborhood.name 
                    ? 'border-[#6CD9CA] bg-[#6CD9CA] bg-opacity-10' 
                    : 'border-gray-200 hover:border-[#6CD9CA] hover:bg-[#6CD9CA] hover:bg-opacity-10'}
                `}
                onClick={() => handleNeighborhoodSelect(neighborhood.name)}
              >
                <div className="flex justify-between items-center">
                  <h4 className="text-xl font-semibold">{neighborhood.name}</h4>
                  <div className="flex items-center">
                    <span className="text-sm mr-2">{t('opportunityScore')}:</span>
                    <span className="bg-[#6CD9CA] text-white font-bold px-2 py-1 rounded-md">{neighborhood.score}/10</span>
                  </div>
                </div>
                <p className="text-gray-700 mt-2">{neighborhood.description}</p>
              </div>
            ))}
          </div>

          {selectedNeighborhood && (
            <p className="mt-4 text-lg font-semibold">
              {t('neighborhoodSelected', {neighborhood: selectedNeighborhood})}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default OpportunityMapSection;
