'use client'

import React, { useState, useRef, useEffect } from 'react'
import { FaCheckCircle, FaCircle, FaExternalLinkAlt } from 'react-icons/fa'
import { MdDownload, MdEmail, MdPrint, MdInfo } from 'react-icons/md'
import { useTranslations } from 'next-intl'
// We'll import these libraries dynamically in the component functions
// to avoid SSR issues with Next.js

interface SavedChoices {
  town: string;
  selectedSchool: string | null;
  selectedCommunityPrograms: string[];
  selectedNeighborhood?: string;
  selectedHousingType?: string;
}

interface NextStepsProps {
  selectedAction: 'stay' | 'move' | null;
  savedChoices: SavedChoices | null;
}

interface Task {
  id: string;
  text: string;
  details: string;
  explanation: string; // Why this task is important
  link?: {
    url: string;
    label: string;
  };
}

const NextSteps: React.FC<NextStepsProps> = ({ selectedAction, savedChoices }) => {
  const t = useTranslations('nextSteps');
  const [completedTasks, setCompletedTasks] = useState<string[]>([])
  const [expandedTasks, setExpandedTasks] = useState<string[]>([])
  const checklistRef = useRef<HTMLDivElement>(null);
  
  // Reset state when selectedAction or savedChoices changes
  useEffect(() => {
    // Reset completed and expanded tasks when action or choices change
    setCompletedTasks([]);
    setExpandedTasks([]);
  }, [selectedAction, savedChoices]);
  
  // Toggle task completion status
  const toggleTaskCompletion = (taskId: string) => {
    if (completedTasks.includes(taskId)) {
      setCompletedTasks(prev => prev.filter(id => id !== taskId))
    } else {
      setCompletedTasks(prev => [...prev, taskId])
    }
  }

  // Toggle explanation visibility
  const toggleExplanation = (taskId: string) => {
    if (expandedTasks.includes(taskId)) {
      setExpandedTasks(prev => prev.filter(id => id !== taskId))
    } else {
      setExpandedTasks(prev => [...prev, taskId])
    }
  }

  // Handle printing the checklist
  const handlePrint = () => {
    if (!checklistRef.current || !savedChoices) return;
    
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow pop-ups to print the checklist.');
      return;
    }
    
    // Create a styled document with only the checklist content
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Next Steps Checklist - ${savedChoices.town}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 20px;
              max-width: 800px;
              margin: 0 auto;
            }
            h1 {
              font-size: 24px;
              margin-bottom: 16px;
              text-align: center;
            }
            h2 {
              font-size: 20px;
              margin-bottom: 12px;
            }
            .task {
              margin-bottom: 16px;
              padding-bottom: 16px;
              border-bottom: 1px solid #eee;
            }
            .task:last-child {
              border-bottom: none;
            }
            .task-header {
              display: flex;
              align-items: flex-start;
              margin-bottom: 8px;
            }
            .task-title {
              font-weight: bold;
              margin-left: 8px;
            }
            .task-details {
              margin-left: 24px;
              color: #555;
            }
            .task-explanation {
              margin-top: 8px;
              margin-left: 24px;
              padding: 8px;
              background-color: #f5f5f5;
              border-radius: 4px;
            }
            .task-link {
              margin-top: 8px;
              margin-left: 24px;
              color: #0070f3;
            }
            .progress-bar {
              width: 100%;
              height: 20px;
              background-color: #eee;
              border-radius: 10px;
              margin-bottom: 8px;
              overflow: hidden;
            }
            .progress-fill {
              height: 100%;
              background-color: #0070f3;
              border-radius: 10px;
            }
            @media print {
              body {
                print-color-adjust: exact;
                -webkit-print-color-adjust: exact;
              }
            }
          </style>
        </head>
        <body>
          <h1>Next Steps for ${selectedAction === 'stay' ? 'Improving Opportunities in' : 'Moving to'} ${savedChoices.town}</h1>
          <div id="saved-choices">
            <h2>Your Saved Choices</h2>
            <p><strong>Town:</strong> ${savedChoices.town}</p>
            ${selectedAction === 'move' && savedChoices.selectedNeighborhood ? 
              `<p><strong>Selected Neighborhood:</strong> ${savedChoices.selectedNeighborhood}</p>` : ''}
            <p><strong>Selected School:</strong> ${savedChoices.selectedSchool || 'None'}</p>
            <p><strong>Selected Community Programs:</strong> ${savedChoices.selectedCommunityPrograms.join(', ') || 'None'}</p>
            ${selectedAction === 'move' && savedChoices.selectedHousingType ? 
              `<p><strong>Housing Type:</strong> ${savedChoices.selectedHousingType}</p>` : ''}
          </div>
          
          <div id="progress">
            <h2>Your Progress</h2>
            <div class="progress-bar">
              <div class="progress-fill" style="width: ${Math.round((completedTasks.length / tasks.length) * 100)}%"></div>
            </div>
            <p>${completedTasks.length} of ${tasks.length} tasks completed (${Math.round((completedTasks.length / tasks.length) * 100)}%)</p>
          </div>
          
          <div id="checklist">
            <h2>Your To-Do List</h2>
            ${tasks.map((task) => `
              <div class="task">
                <div class="task-header">
                  <span>${completedTasks.includes(task.id) ? '✓' : '□'}</span>
                  <span class="task-title ${completedTasks.includes(task.id) ? 'completed' : ''}">${task.text}</span>
                </div>
                <div class="task-details">${task.details}</div>
                ${expandedTasks.includes(task.id) ? 
                  `<div class="task-explanation">
                    <strong>Why this matters:</strong> ${task.explanation}
                  </div>` : ''}
                ${task.link ? 
                  `<div class="task-link">
                    <a href="${task.link.url}" target="_blank">${task.link.label}</a>
                  </div>` : ''}
              </div>
            `).join('')}
          </div>
        </body>
      </html>
    `);
    
    // Wait for content to load then print
    printWindow.document.close();
    printWindow.onload = () => {
      printWindow.print();
      // Close the window after printing (optional)
      printWindow.onafterprint = () => {
        printWindow.close();
      };
    };
  }

  // Handle emailing the checklist
  const handleEmail = () => {
    if (!savedChoices) return;
    
    const subject = encodeURIComponent(`My Next Steps for ${selectedAction === 'stay' ? 'Improving Opportunities in' : 'Moving to'} ${savedChoices.town}`);
    
    // Create email body with task list
    let body = encodeURIComponent(`My Next Steps for ${selectedAction === 'stay' ? 'Improving Opportunities in' : 'Moving to'} ${savedChoices.town}\n\n`);
    
    // Add saved choices
    body += encodeURIComponent(`Town: ${savedChoices.town}\n`);
    if (selectedAction === 'move' && savedChoices.selectedNeighborhood) {
      body += encodeURIComponent(`Selected Neighborhood: ${savedChoices.selectedNeighborhood}\n`);
    }
    body += encodeURIComponent(`Selected School: ${savedChoices.selectedSchool || 'None'}\n`);
    body += encodeURIComponent(`Selected Community Programs: ${savedChoices.selectedCommunityPrograms.join(', ') || 'None'}\n`);
    if (selectedAction === 'move' && savedChoices.selectedHousingType) {
      body += encodeURIComponent(`Housing Type: ${savedChoices.selectedHousingType}\n`);
    }
    
    body += encodeURIComponent(`\nMy To-Do List:\n\n`);
    
    // Add tasks
    const tasks = generateTasks();
    tasks.forEach((task, index) => {
      const status = completedTasks.includes(task.id) ? '✓' : '□';
      body += encodeURIComponent(`${status} ${index + 1}. ${task.text}\n   ${task.details}\n\n`);
    });
    
    // Add progress
    body += encodeURIComponent(`\nProgress: ${completedTasks.length} of ${tasks.length} tasks completed (${Math.round((completedTasks.length / tasks.length) * 100)}%)`);
    
    // Open email client
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  }

  // Handle downloading the checklist as PDF
  const handleDownload = async () => {
    if (!checklistRef.current || !savedChoices) return;
    
    try {
      // Dynamically import the libraries only when needed
      const html2canvasModule = await import('html2canvas');
      const html2canvas = html2canvasModule.default;
      
      const jsPDFModule = await import('jspdf');
      const jsPDF = jsPDFModule.default;
      
      // Create a canvas from the checklist element
      const canvas = await html2canvas(checklistRef.current, {
        logging: false,
        useCORS: true
      });
      
      // Create PDF
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      // Add title
      const title = `Next Steps for ${selectedAction === 'stay' ? 'Improving Opportunities in' : 'Moving to'} ${savedChoices.town}`;
      pdf.setFontSize(16);
      pdf.text(title, 105, 15, { align: 'center' });
      
      // Add image of the checklist
      const imgData = canvas.toDataURL('image/png');
      const imgWidth = 190;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 10, 25, imgWidth, imgHeight);
      
      // Save the PDF
      pdf.save(`next_steps_checklist_${selectedAction}_${savedChoices.town.replace(/\s+/g, '_').toLowerCase()}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('There was an error generating your PDF. Please try again.');
    }
  }

  // Generate tasks based on the selected action and saved choices
  const generateTasks = (): Task[] => {
    if (!selectedAction || !savedChoices) return []

    const commonTasks: Task[] = [
      {
        id: 'review_choices',
        text: t('reviewChoices', {town: savedChoices.town}),
        details: t('reviewChoicesDetails'),
        explanation: t('reviewChoicesExplanation')
      },
      {
        id: 'create_calendar',
        text: t('createCalendar'),
        details: t('createCalendarDetails'),
        explanation: t('createCalendarExplanation')
      }
    ]

    if (selectedAction === 'stay') {
      return [
        {
          id: 'township_website',
          text: t('visitTownshipWebsite', {town: savedChoices.town}),
          details: t('exploreTownshipResources'),
          explanation: t('townshipWebsiteExplanation'),
          link: {
            url: `https://www.google.com/search?q=${encodeURIComponent(savedChoices.town + ' township official website')}`,
            label: t('searchTownshipWebsite')
          }
        },
        {
          id: 'school_contact',
          text: savedChoices.selectedSchool 
            ? t('contactSelectedSchool', {school: savedChoices.selectedSchool}) 
            : t('researchSchoolOptions'),
          details: t('prepareSchoolQuestions'),
          explanation: t('schoolQualityExplanation'),
          link: savedChoices.selectedSchool ? {
            url: `https://www.google.com/search?q=${encodeURIComponent(savedChoices.selectedSchool + ' ' + savedChoices.town)}`,
            label: t('searchSchoolInfo')
          } : undefined
        },
        {
          id: 'program_research',
          text: savedChoices.selectedCommunityPrograms.length > 0
            ? t('researchProgramDetails', {programs: savedChoices.selectedCommunityPrograms.join(', ')})
            : t('exploreCommunityPrograms'),
          details: t('lookForProgramDetails'),
          explanation: t('communityProgramsExplanation'),
          link: savedChoices.selectedCommunityPrograms.length > 0 ? {
            url: `https://www.google.com/search?q=${encodeURIComponent(savedChoices.selectedCommunityPrograms[0] + ' ' + savedChoices.town)}`,
            label: t('searchProgramInfo')
          } : undefined
        },
        {
          id: 'community_visit',
          text: savedChoices.selectedCommunityPrograms.length > 0
            ? t('scheduleVisits', {programs: savedChoices.selectedCommunityPrograms.join(', ')})
            : t('visitCommunityCenters'),
          details: t('meetCoordinators'),
          explanation: t('inPersonVisitsExplanation')
        },
        {
          id: 'parent_network',
          text: t('connectWithParents'),
          details: t('joinParentGroups'),
          explanation: t('parentNetworksExplanation'),
          link: {
            url: `https://www.facebook.com/search/groups/?q=${encodeURIComponent('parents ' + savedChoices.town)}`,
            label: t('findParentGroups')
          }
        },
        {
          id: 'advocate',
          text: t('identifyAdvocacyWays'),
          details: t('attendTownMeetings'),
          explanation: t('communityAdvocacyExplanation'),
          link: {
            url: `https://www.google.com/search?q=${encodeURIComponent('city council meetings ' + savedChoices.town)}`,
            label: t('findGovernmentMeetings')
          }
        },
        ...commonTasks
      ]
    } else if (selectedAction === 'move') {
      return [
        {
          id: 'housing_research',
          text: savedChoices.selectedHousingType 
            ? t('researchHousingType', {housingType: savedChoices.selectedHousingType, town: savedChoices.town})
            : t('researchHousing', {town: savedChoices.town}),
          details: t('compareHousingOptions'),
          explanation: t('housingLocationExplanation'),
          link: {
            url: `https://www.zillow.com/homes/${encodeURIComponent(savedChoices.town)}_rb/`,
            label: t('viewHousingOptions')
          }
        },
        {
          id: 'neighborhood_visit',
          text: savedChoices.selectedNeighborhood 
            ? t('scheduleNeighborhoodVisit', {neighborhood: savedChoices.selectedNeighborhood, town: savedChoices.town})
            : t('scheduleTownVisit', {town: savedChoices.town}),
          details: t('exploreNeighborhood'),
          explanation: t('visitingInPersonExplanation'),
          link: savedChoices.selectedNeighborhood ? {
            url: `https://www.google.com/maps/search/${encodeURIComponent(savedChoices.selectedNeighborhood + ' ' + savedChoices.town)}`,
            label: t('viewNeighborhoodMap')
          } : undefined
        },
        {
          id: 'school_contact',
          text: savedChoices.selectedSchool 
            ? t('contactSchoolEnrollment', {school: savedChoices.selectedSchool}) 
            : t('researchSchoolEnrollment'),
          details: t('gatherEnrollmentInfo'),
          explanation: t('schoolEnrollmentExplanation'),
          link: savedChoices.selectedSchool ? {
            url: `https://www.google.com/search?q=${encodeURIComponent(savedChoices.selectedSchool + ' ' + savedChoices.town + ' enrollment')}`,
            label: t('searchSchoolEnrollmentInfo')
          } : undefined
        },
        {
          id: 'program_research',
          text: savedChoices.selectedCommunityPrograms.length > 0
            ? t('researchProgramRegistration', {programs: savedChoices.selectedCommunityPrograms.join(', ')})
            : t('exploreNewAreaPrograms'),
          details: t('lookForRegistrationDates'),
          explanation: t('communityProgramsSupportExplanation'),
          link: savedChoices.selectedCommunityPrograms.length > 0 ? {
            url: `https://www.google.com/search?q=${encodeURIComponent(savedChoices.selectedCommunityPrograms[0] + ' ' + savedChoices.town)}`,
            label: t('searchProgramInfo')
          } : undefined
        },
        {
          id: 'moving_plans',
          text: t('createMovingPlan'),
          details: t('includeMovingSteps'),
          explanation: t('movingPlanExplanation'),
          link: {
            url: 'https://www.moving.com/tips/creating-a-moving-timeline-checklist/',
            label: t('movingTimelineGuide')
          }
        },
        {
          id: 'budget',
          text: t('developMovingBudget'),
          details: t('considerMovingCosts'),
          explanation: t('movingBudgetExplanation'),
          link: {
            url: 'https://www.bankrate.com/calculators/savings/moving-cost-of-living-calculator.aspx',
            label: t('costOfLivingCalculator')
          }
        },
        {
          id: 'local_resources',
          text: t('identifyLocalResources'),
          details: t('findWelcomeCenters'),
          explanation: t('localResourcesExplanation'),
          link: {
            url: `https://www.google.com/search?q=${encodeURIComponent('family resources newcomers ' + savedChoices.town)}`,
            label: t('searchFamilyResources')
          }
        },
        {
          id: 'housing_arrangement',
          text: savedChoices.selectedHousingType 
            ? t('contactAgentsHousingType', {housingType: savedChoices.selectedHousingType})
            : t('contactAgentsHousing'),
          details: t('prepareHousingQuestions'),
          explanation: t('realEstateAgentsExplanation'),
          link: {
            url: `https://www.realtor.com/realestateagents/${encodeURIComponent(savedChoices.town)}`,
            label: t('findRealEstateAgents')
          }
        },
        ...commonTasks
      ]
    }
    
    return []
  }

  const tasks = generateTasks()
  const progress = tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0

  if (!selectedAction || !savedChoices) {
    return (
      <div id="next-steps" className="px-4 py-6 max-w-6xl mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">{t('title')}</h1>
          <p className="text-lg">{t('completeMessage')}</p>
        </div>
      </div>
    )
  }

  return (
    <div id="next-steps" className="min-h-screen px-4 py-10 max-w-6xl mx-auto scroll-mt-20">
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">{t('yourNextSteps')}</h1>
        <p className="text-xl">
          {selectedAction === 'stay' 
            ? t('personalizedToDoStay', {town: savedChoices.town})
            : t('personalizedToDoMove', {town: savedChoices.town})
          }
        </p>
      </div>
      
      {/* Display all saved choices */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-10">
        <h3 className="text-2xl font-semibold mb-4">Your Saved Choices</h3>
        <div className="space-y-2">
          <p><strong>Town:</strong> {savedChoices.town}</p>
          {selectedAction === 'move' && savedChoices.selectedNeighborhood && (
            <p><strong>Selected Neighborhood:</strong> {savedChoices.selectedNeighborhood}</p>
          )}
          <p><strong>Selected School:</strong> {savedChoices.selectedSchool}</p>
          <p>
            <strong>Selected Community Programs:</strong>{' '}
            {savedChoices.selectedCommunityPrograms.join(', ')}
          </p>
          {selectedAction === 'move' && savedChoices.selectedHousingType && (
            <p><strong>Housing Type:</strong> {savedChoices.selectedHousingType}</p>
          )}
        </div>
      </div>

      {/* Progress Tracker */}
      <div className="bg-white rounded-xl shadow-lg p-8 mb-10">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold mb-4 md:mb-0">Your Progress</h2>
          <div className="flex space-x-3">
            <button 
              onClick={handlePrint}
              className="flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-opacity-90"
            >
              <MdPrint className="mr-2" />
              Print
            </button>
            <button 
              onClick={handleEmail}
              className="flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-opacity-90"
            >
              <MdEmail className="mr-2" />
              Email
            </button>
            <button 
              onClick={handleDownload}
              className="flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-opacity-90"
            >
              <MdDownload className="mr-2" />
              Download
            </button>
          </div>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-5 mb-2">
          <div 
            className="bg-primary h-5 rounded-full transition-all duration-500 ease-in-out" 
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="text-right text-sm text-gray-600">
          {completedTasks.length} of {tasks.length} tasks completed ({progress}%)
        </div>
      </div>

      {/* Task List */}
      <div ref={checklistRef} className="bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-semibold mb-6">Your To-Do List</h2>
        
        <div className="space-y-6">
          {tasks.map((task) => (
            <div key={task.id} className="border-b border-gray-200 pb-4 last:border-0">
              <div className="flex items-start">
                <div 
                  className="mt-1 text-primary cursor-pointer"
                  onClick={() => toggleTaskCompletion(task.id)}
                >
                  {completedTasks.includes(task.id) 
                    ? <FaCheckCircle size={20} /> 
                    : <FaCircle size={20} className="text-gray-300 hover:text-primary-light" />
                  }
                </div>
                <div className="ml-4 flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className={`text-lg font-medium ${completedTasks.includes(task.id) ? 'line-through text-gray-500' : ''}`}>
                        {task.text}
                      </p>
                      <p className="text-gray-600 mt-1">
                        {task.details}
                      </p>
                    </div>
                    <button 
                      onClick={() => toggleExplanation(task.id)}
                      className="flex-shrink-0 p-1 text-primary hover:bg-primary hover:bg-opacity-10 rounded-full transition-colors"
                      aria-label={expandedTasks.includes(task.id) ? "Hide explanation" : "Show explanation"}
                    >
                      <MdInfo size={20} />
                    </button>
                  </div>
                  
                  {/* Task link */}
                  {task.link && (
                    <div className="mt-3">
                      <a 
                        href={task.link.url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="inline-flex items-center text-primary hover:underline"
                      >
                        {task.link.label} <FaExternalLinkAlt size={12} className="ml-1" />
                      </a>
                    </div>
                  )}
                  
                  {/* Task explanation */}
                  {expandedTasks.includes(task.id) && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                      <h4 className="font-medium text-sm mb-1">Why this matters:</h4>
                      <p className="text-sm text-gray-700">{task.explanation}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default NextSteps