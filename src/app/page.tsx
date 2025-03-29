'use client'

import { useRef, useEffect } from 'react'
import Welcome from '../components/Welcome'
import Navbar from '../components/Navbar'
import AssessYourCommunity, { AssessProvider } from '../components/AssessQuiz'

export default function Home() {
  const progressBarRef = useRef<HTMLDivElement>(null) as React.RefObject<HTMLDivElement>;

  useEffect(() => {
    const handleScroll = () => {
      if (progressBarRef.current) {
        const scrollTop = window.scrollY;
        const docHeight = document.body.offsetHeight - window.innerHeight;
        const scrollPercent = scrollTop / docHeight * 100;
        progressBarRef.current.style.width = `${scrollPercent}%`;
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <AssessProvider>
      <section className="bg-white w-full">
        <Navbar progressBarRef={progressBarRef} />
        <div className="container mx-auto">
          <Welcome />
          <AssessYourCommunity />
        </div>
      </section>
    </AssessProvider>
  );
}
