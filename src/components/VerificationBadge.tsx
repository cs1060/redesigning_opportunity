'use client'

import React from 'react';

interface VerificationBadgeProps {
  verified?: boolean;
  confidence?: number;
  className?: string;
}

/**
 * A component that displays a verification badge indicating whether content has been verified
 */
const VerificationBadge: React.FC<VerificationBadgeProps> = ({ 
  verified = false, 
  confidence = 0,
  className = ''
}) => {
  // Determine badge color based on verification status and confidence
  let badgeColor = 'bg-gray-200 text-gray-700'; // Default (unknown)
  let badgeText = 'Unverified';
  let badgeIcon = '?';
  
  if (verified) {
    if (confidence > 0.7) {
      badgeColor = 'bg-green-100 text-green-800';
      badgeText = 'Verified';
      badgeIcon = '✓';
    } else {
      badgeColor = 'bg-yellow-100 text-yellow-800';
      badgeText = 'Partially Verified';
      badgeIcon = '~';
    }
  } else {
    badgeColor = 'bg-red-100 text-red-800';
    badgeText = 'Unverified';
    badgeIcon = '!';
  }
  
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${badgeColor} ${className}`}>
      <span className="mr-1">{badgeIcon}</span>
      {badgeText}
    </span>
  );
};

export default VerificationBadge;
