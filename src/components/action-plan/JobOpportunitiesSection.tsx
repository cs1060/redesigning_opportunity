'use client'
import React from 'react';
import { JobSector, CareerAdvice } from './types';

interface JobOpportunitiesSectionProps {
  jobSectors?: JobSector[];
  personalizedCareerAdvice: CareerAdvice | null;
  zipCode: string;
  loading: boolean;
}

const JobOpportunitiesSection: React.FC<JobOpportunitiesSectionProps> = ({
  jobSectors,
  personalizedCareerAdvice,
  zipCode,
  loading
}) => {
  if (loading || !zipCode) {
    return null;
  }

  return (
    <div className="bg-white shadow-md rounded-lg p-8 mt-8">
      <div className="text-center mb-8">
        <h3 className="text-3xl font-bold mb-2">Job Opportunities</h3>
        <p className="text-lg text-gray-600">Find employment opportunities in your new area</p>
      </div>
      
      {/* Personalized Career Advice */}
      {personalizedCareerAdvice && (
        <div className="bg-[#6CD9CA] bg-opacity-10 p-6 rounded-lg mb-8">
          <h4 className="text-xl font-semibold mb-4">Personalized Career Advice</h4>
          
          <div className="space-y-4">
            <div>
              <p className="font-medium text-[#6CD9CA]">Based on your income:</p>
              <p>{personalizedCareerAdvice.forIncome}</p>
            </div>
            
            <div>
              <p className="font-medium text-[#6CD9CA]">For your family size:</p>
              <p>{personalizedCareerAdvice.forFamilySize}</p>
            </div>
            
            <div>
              <p className="font-medium text-[#6CD9CA]">General advice:</p>
              <p>{personalizedCareerAdvice.generalAdvice}</p>
            </div>
            
            {personalizedCareerAdvice.recommendedSectors.length > 0 && (
              <div>
                <p className="font-medium text-[#6CD9CA]">Recommended sectors to explore:</p>
                <p>{personalizedCareerAdvice.recommendedSectors.join(', ')}</p>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Job Sectors in Area */}
      {jobSectors && jobSectors.length > 0 && (
        <div className="mb-10">
          <h4 className="text-2xl font-semibold mb-4 text-center">Top Job Sectors in {zipCode}</h4>
          
          <div className="grid md:grid-cols-2 gap-6">
            {jobSectors.map((sector) => (
              <div 
                key={sector.name}
                className="border rounded-lg p-5 hover:border-[#6CD9CA] hover:bg-[#6CD9CA] hover:bg-opacity-5 transition-all duration-300"
              >
                <div className="flex justify-between items-center mb-2">
                  <h5 className="text-xl font-semibold">{sector.name}</h5>
                  <div className={`
                    px-3 py-1 rounded-full text-sm font-medium
                    ${sector.demandLevel === 'high' ? 'bg-green-100 text-green-800' : 
                      sector.demandLevel === 'medium' ? 'bg-blue-100 text-blue-800' : 
                      'bg-gray-100 text-gray-800'}
                  `}>
                    {sector.demandLevel === 'high' ? 'High Demand' : 
                     sector.demandLevel === 'medium' ? 'Medium Demand' : 
                     'Lower Demand'}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <p>{sector.description}</p>
                  <div className="flex justify-between text-sm">
                    <span><strong>Growth Rate:</strong> {sector.growthRate}%</span>
                    <span><strong>Median Salary:</strong> {sector.medianSalary}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Job Search Resources */}
      <div className="text-center mb-6">
        <h4 className="text-2xl font-bold mb-2">Job Search Resources</h4>
        <p className="text-lg text-gray-600">Find your next career opportunity</p>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
        <a 
          href="https://www.linkedin.com/jobs" 
          target="_blank" 
          rel="noopener noreferrer"
          className="group flex flex-col items-center justify-center bg-white hover:bg-[#6CD9CA] hover:bg-opacity-10 border border-gray-200 rounded-xl p-5 shadow-sm transition-all duration-300 hover:shadow-md"
        >
          <div className="w-12 h-12 mb-3 flex items-center justify-center rounded-full bg-[#6CD9CA] bg-opacity-20 text-[#6CD9CA] group-hover:bg-opacity-30 transition-all duration-300">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <span className="font-medium group-hover:text-[#6CD9CA] transition-colors duration-300">LinkedIn Jobs</span>
        </a>
        <a 
          href="https://www.indeed.com" 
          target="_blank" 
          rel="noopener noreferrer"
          className="group flex flex-col items-center justify-center bg-white hover:bg-[#6CD9CA] hover:bg-opacity-10 border border-gray-200 rounded-xl p-5 shadow-sm transition-all duration-300 hover:shadow-md"
        >
          <div className="w-12 h-12 mb-3 flex items-center justify-center rounded-full bg-[#6CD9CA] bg-opacity-20 text-[#6CD9CA] group-hover:bg-opacity-30 transition-all duration-300">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <span className="font-medium group-hover:text-[#6CD9CA] transition-colors duration-300">Indeed</span>
        </a>
        <a 
          href="https://www.glassdoor.com" 
          target="_blank" 
          rel="noopener noreferrer"
          className="group flex flex-col items-center justify-center bg-white hover:bg-[#6CD9CA] hover:bg-opacity-10 border border-gray-200 rounded-xl p-5 shadow-sm transition-all duration-300 hover:shadow-md"
        >
          <div className="w-12 h-12 mb-3 flex items-center justify-center rounded-full bg-[#6CD9CA] bg-opacity-20 text-[#6CD9CA] group-hover:bg-opacity-30 transition-all duration-300">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <span className="font-medium group-hover:text-[#6CD9CA] transition-colors duration-300">Glassdoor</span>
        </a>
        <a 
          href="https://www.usajobs.gov" 
          target="_blank" 
          rel="noopener noreferrer"
          className="group flex flex-col items-center justify-center bg-white hover:bg-[#6CD9CA] hover:bg-opacity-10 border border-gray-200 rounded-xl p-5 shadow-sm transition-all duration-300 hover:shadow-md"
        >
          <div className="w-12 h-12 mb-3 flex items-center justify-center rounded-full bg-[#6CD9CA] bg-opacity-20 text-[#6CD9CA] group-hover:bg-opacity-30 transition-all duration-300">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <span className="font-medium group-hover:text-[#6CD9CA] transition-colors duration-300">USAJobs</span>
        </a>
      </div>
      
      {/* Additional Career Resources */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <a 
          href="https://www.careeronestop.org/LocalHelp/AmericanJobCenters/find-american-job-centers.aspx" 
          target="_blank" 
          rel="noopener noreferrer"
          className="group flex items-center bg-white hover:bg-[#6CD9CA] hover:bg-opacity-10 border border-gray-200 rounded-xl p-4 shadow-sm transition-all duration-300 hover:shadow-md"
        >
          <div className="w-10 h-10 mr-4 flex-shrink-0 flex items-center justify-center rounded-full bg-[#6CD9CA] bg-opacity-20 text-[#6CD9CA] group-hover:bg-opacity-30 transition-all duration-300">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <span className="font-medium group-hover:text-[#6CD9CA] transition-colors duration-300">American Job Centers</span>
        </a>
        <a 
          href="https://www.sba.gov/local-assistance" 
          target="_blank" 
          rel="noopener noreferrer"
          className="group flex items-center bg-white hover:bg-[#6CD9CA] hover:bg-opacity-10 border border-gray-200 rounded-xl p-4 shadow-sm transition-all duration-300 hover:shadow-md"
        >
          <div className="w-10 h-10 mr-4 flex-shrink-0 flex items-center justify-center rounded-full bg-[#6CD9CA] bg-opacity-20 text-[#6CD9CA] group-hover:bg-opacity-30 transition-all duration-300">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <span className="font-medium group-hover:text-[#6CD9CA] transition-colors duration-300">Small Business Resources</span>
        </a>
        <a 
          href="https://www.meetup.com" 
          target="_blank" 
          rel="noopener noreferrer"
          className="group flex items-center bg-white hover:bg-[#6CD9CA] hover:bg-opacity-10 border border-gray-200 rounded-xl p-4 shadow-sm transition-all duration-300 hover:shadow-md"
        >
          <div className="w-10 h-10 mr-4 flex-shrink-0 flex items-center justify-center rounded-full bg-[#6CD9CA] bg-opacity-20 text-[#6CD9CA] group-hover:bg-opacity-30 transition-all duration-300">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <span className="font-medium group-hover:text-[#6CD9CA] transition-colors duration-300">Professional Meetups</span>
        </a>
      </div>
    </div>
  );
};

export default JobOpportunitiesSection;
