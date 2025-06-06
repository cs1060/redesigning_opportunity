import React from 'react';

interface ActionReminderProps {
  message: string;
  isVisible: boolean;
}

/**
 * A non-intrusive reminder component to guide users through interactive sections
 */
const ActionReminder: React.FC<ActionReminderProps> = ({ message, isVisible }) => {
  if (!isVisible) return null;
  
  return (
    <div className="mt-2 mb-4 flex items-center py-2 px-3 bg-gray-100 border-l-4 border-[#6CD9CA] rounded-r-md text-gray-700 text-sm animate-fadeIn">
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        className="h-5 w-5 mr-2 text-[#6CD9CA]" 
        viewBox="0 0 20 20" 
        fill="currentColor"
      >
        <path 
          fillRule="evenodd" 
          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" 
          clipRule="evenodd" 
        />
      </svg>
      {message}
    </div>
  );
};

export default ActionReminder; 