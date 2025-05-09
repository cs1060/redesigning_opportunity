'use client';

import React, { ReactNode } from 'react';
import { useFadeIn } from '../hooks/useFadeIn';

interface FadeInProps {
  children: ReactNode;
  delay?: number;
  className?: string;
  threshold?: number;
  rootMargin?: string;
}

/**
 * A component that wraps its children in a fade-in animation when it enters the viewport
 */
const FadeIn: React.FC<FadeInProps> = ({
  children,
  delay = 0,
  className = '',
  threshold = 0.1,
  rootMargin = '0px'
}) => {
  const { ref, isVisible } = useFadeIn({ threshold, rootMargin, delay });

  return (
    <div
      ref={ref as React.RefObject<HTMLDivElement>}
      className={`transition-opacity duration-1000 ease-in-out ${isVisible ? 'opacity-100' : 'opacity-0'} ${className}`}
    >
      {children}
    </div>
  );
};

export default FadeIn;
