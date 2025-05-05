import { useEffect, useRef, useState } from 'react';

interface FadeInOptions {
  threshold?: number;
  rootMargin?: string;
  delay?: number;
}

/**
 * Custom hook to add fade-in animation when an element enters the viewport
 */
export const useFadeIn = (options: FadeInOptions = {}) => {
  const {
    threshold = 0.1,
    rootMargin = '0px',
    delay = 0
  } = options;
  
  const ref = useRef<HTMLElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        // When the element enters the viewport
        if (entry.isIntersecting) {
          // Add a delay if specified
          if (delay) {
            setTimeout(() => {
              setIsVisible(true);
            }, delay);
          } else {
            setIsVisible(true);
          }
          // Once we've seen it, no need to keep observing
          if (ref.current) {
            observer.unobserve(ref.current);
          }
        }
      },
      { threshold, rootMargin }
    );

    const currentRef = ref.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [threshold, rootMargin, delay]);

  return { ref, isVisible };
};
