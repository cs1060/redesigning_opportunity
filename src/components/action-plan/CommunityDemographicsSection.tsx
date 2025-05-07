'use client'
import React from 'react';
import { useTranslations } from 'next-intl';
import { CommunityDemographics, formatNumber } from './types';

interface CommunityDemographicsSectionProps {
  demographics: CommunityDemographics;
  zipCode: string;
  loading: boolean;
}

const CommunityDemographicsSection: React.FC<CommunityDemographicsSectionProps> = ({
  demographics,
  zipCode,
  loading
}) => {
  const t = useTranslations('move');

  if (loading || !demographics) {
    return null;
  }

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h3 className="text-2xl font-semibold mb-6 text-center">{t('communityDemographics')}</h3>
      
      {/* ZIP Code Header */}
      {zipCode && (
        <h4 className="text-xl text-center mb-8">
          {t('inZipCode', {
            zipCode,
            group: demographics.ethnicComposition.sort((a, b) => b.percentage - a.percentage)[0].group,
            percentage: demographics.ethnicComposition.sort((a, b) => b.percentage - a.percentage)[0].percentage
          })}
        </h4>
      )}
      
      {/* Ethnic Composition Visual */}
      <div className="mb-10">
        <div className="flex justify-center items-end space-x-8 mb-4">
          {Array.isArray(demographics.ethnicComposition) && 
            demographics.ethnicComposition
              .sort((a, b) => b.percentage - a.percentage)
              .map((group) => {
                // Assign colors based on ethnic group using the provided color scheme
                let iconColor = "text-[#729d9d]";
                if (group.group && typeof group.group === 'string') {
                  switch(group.group.toLowerCase()) {
                    case "hispanic": iconColor = "text-[#d07e59]"; break; // accent3
                    case "white": iconColor = "text-[#9dbda9]"; break; // accent8
                    case "black": iconColor = "text-[#b65441]"; break; // accent2
                    case "asian": iconColor = "text-[#4f7f8b]"; break; // accent10
                    case "other": iconColor = "text-[#9b252f]"; break; // accent1
                    default: iconColor = "text-[#729d9d]"; // accent9
                  }
                }
                
                return (
                  <div key={group.group} className="flex flex-col items-center">
                    <div className="flex">
                      {/* Create 5 person icons, with filled ones based on percentage */}
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className={`mx-0.5 ${i < Math.ceil(group.percentage / 20) ? iconColor : "text-gray-200"}`}>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" stroke="currentColor">
                            <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" clipRule="evenodd" />
                          </svg>
                        </div>
                      ))}
                    </div>
                    <div className="text-center mt-2">
                      <div className="font-medium">{group.group}</div>
                      <div className="text-xl font-bold">{group.percentage}%</div>
                    </div>
                  </div>
                );
              })
          }
        </div>
      </div>
      
      {/* Religious Composition */}
      {Array.isArray(demographics.religiousComposition) && (
        <div className="mt-8 mb-10">
          <h4 className="text-xl font-semibold mb-4 text-center">Religious Composition</h4>
          
          <div className="flex flex-wrap justify-center gap-4 mb-6">
            {demographics.religiousComposition
              .sort((a, b) => b.percentage - a.percentage)
              .map((religionData) => {
                // Assign colors based on religion using the provided color scheme
                let iconColor = "text-[#b65441]"; // default color (accent2)
                let iconPath = "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"; // default path
                
                if (religionData.religion && typeof religionData.religion === 'string') {
                  switch(religionData.religion.toLowerCase()) {
                    case "christian": 
                      iconColor = "text-[#34687e]"; // accent11
                      iconPath = "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z";
                      religionData.displayName = "Christian";
                      break;
                    case "jewish": 
                      iconColor = "text-[#4f7f8b]"; // accent10
                      religionData.displayName = "Jewish";
                      iconPath = "M12 22l-3.5-6.5L2 12l6.5-3.5L12 2l3.5 6.5L22 12l-6.5 3.5L12 22z";
                      break;
                    case "muslim": 
                      iconColor = "text-[#729d9d]"; // accent9
                      iconPath = "M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zm0-18a8 8 0 100 16 8 8 0 000-16zm0 14a6 6 0 110-12 6 6 0 010 12zm-3-6a3 3 0 106 0 3 3 0 00-6 0z";
                      religionData.displayName = "Muslim";
                      break;
                    case "hindu": 
                      iconColor = "text-[#d07e59]"; // accent3
                      iconPath = "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-5-9h10v2H7v-2z";
                      religionData.displayName = "Hindu";
                      break;
                    case "non-religious": 
                      iconColor = "text-[#9dbda9]"; // accent8
                      iconPath = "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z";
                      religionData.displayName = "Non-Religious";
                      break;
                    default: 
                      iconColor = "text-[#b65441]"; // accent2
                      iconPath = "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z";
                      religionData.displayName = religionData.religion;
                  }
                }
                
                return (
                  <div key={religionData.religion} className="flex flex-col items-center w-32">
                    <div className={`${iconColor} mb-2`}>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="currentColor" viewBox="0 0 24 24" stroke="currentColor">
                        <path d={iconPath}></path>
                      </svg>
                    </div>
                    <div className="text-center">
                      <div className="font-medium">{religionData.displayName || religionData.religion}</div>
                      <div className="text-xl font-bold">{religionData.percentage}%</div>
                    </div>
                  </div>
                );
              })
            }
          </div>
        </div>
      )}
      
      {/* Additional Demographics */}
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <h4 className="text-xl font-semibold mb-4">Population Overview</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Total Population:</span>
              <span>{formatNumber(demographics.population)}</span>
            </div>
            <div className="flex justify-between">
              <span>Median Age:</span>
              <span>{demographics.medianAge || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span>Median Household Income:</span>
              <span>${formatNumber(demographics.medianHousehold)}</span>
            </div>
          </div>
        </div>
        <div>
          <h4 className="text-xl font-semibold mb-4">Education Levels</h4>
          <div className="space-y-2">
            {Array.isArray(demographics.educationLevel) && 
              demographics.educationLevel.map((level) => {
                let translationKey = '';
                switch(level.level) {
                  case "Bachelor's or higher":
                    translationKey = 'bachelorsOrHigher';
                    break;
                  case "Some College":
                    translationKey = 'someCollege';
                    break;
                  case "High School":
                    translationKey = 'highSchool';
                    break;
                  case "Less than High School":
                    translationKey = 'lessThanHighSchool';
                    break;
                  default:
                    translationKey = '';
                }
                return (
                  <div key={level.level} className="flex justify-between">
                    <span>{translationKey ? t(translationKey) : level.level}</span>
                    <span>{level.percentage}%</span>
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityDemographicsSection;
