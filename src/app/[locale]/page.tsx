'use client'
import { RefObject, useEffect, useRef, useState } from 'react'
import Navbar from '../../components/Navbar'
import Welcome from '../../components/Welcome'
import PersonalizationQuiz from '../../components/AssessQuiz'
import OpportunityMap from '../../components/OpportunityMap'
import TakeAction from '@/components/action-plan/ActionPlan'
import NextSteps from '../../components/NextSteps'
import { PersonalizationProvider, usePersonalization } from '../../components/AssessProvider'
import CommunityConnections from '../../components/CommunityConnections'
import AdditionalResources from '../../components/AdditionalResources'
import ContactForm from '../../components/ContactForm'
import FadeIn from '@/components/FadeIn'

interface SavedChoices {
  town: string;
  selectedSchool: string | null;
  selectedCommunityPrograms: string[];
  selectedNeighborhood?: string;
  selectedHousingType?: string;
}

function Home() {
  const progressBarRef = useRef<HTMLDivElement>(null)
  const [isMounted, setIsMounted] = useState(false)
  const [selectedAction, setSelectedAction] = useState<'stay' | 'move' | null>(null)
  const [savedChoices, setSavedChoices] = useState<SavedChoices | null>(null)
  
  // Function to receive action and choices from TakeAction component
  const handleActionAndChoicesSave = (action: 'stay' | 'move', choices: SavedChoices | null) => {
    setSelectedAction(action)
    setSavedChoices(choices)
  }
  
  useEffect(() => {
    setIsMounted(true)
    
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight
      const scrollPosition = window.scrollY
      const scrollPercentage = (scrollPosition / totalScroll) * 100
      
      if (progressBarRef.current) {
        progressBarRef.current.style.width = `${scrollPercentage}%`
      }
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])
  
  // Only render full content after component mounts on client
  if (!isMounted) {
    return <div className="min-h-screen"></div> // Empty placeholder during server render
  }
  
  return (
    <>
      <Navbar progressBarRef={progressBarRef as RefObject<HTMLDivElement>} />
      
      <main>
        <PersonalizationProvider>
          <HomeContent 
            selectedAction={selectedAction} 
            savedChoices={savedChoices}
            handleActionAndChoicesSave={handleActionAndChoicesSave}
          />
        </PersonalizationProvider>
      </main>
    </>
  )
}

// This component allows us to access the personalization context
function HomeContent({ 
  selectedAction, 
  savedChoices,
  handleActionAndChoicesSave
}: { 
  selectedAction: 'stay' | 'move' | null;
  savedChoices: SavedChoices | null;
  handleActionAndChoicesSave: (action: 'stay' | 'move', choices: SavedChoices | null) => void;
}) {
  // Now we can use the personalization context
  const { data } = usePersonalization();
  
  return (
    <>
      <section className="bg-white w-full">
        <FadeIn>
          <div className="container mx-auto">
            <Welcome />
          </div>
        </FadeIn>
      </section>
      
      <section className="bg-gray-100 w-full">
        <FadeIn threshold={0.15} delay={100}>
          <div className="container mx-auto">
            <PersonalizationQuiz />
          </div>
        </FadeIn>
      </section>

      <section className="bg-white w-full">
        <FadeIn threshold={0.15} delay={200}>
          <div className="container mx-auto">
            <OpportunityMap address={data.address} />
          </div>
        </FadeIn>
      </section>
      
      <section className="bg-gray-100 w-full">
        <FadeIn threshold={0.15} delay={300}>
          <div className="container mx-auto">
            <TakeAction onSaveActionAndChoices={handleActionAndChoicesSave} />
          </div>
        </FadeIn>
      </section>

      <section className="bg-white w-full">
        <FadeIn threshold={0.15} delay={400}>
          <div className="container mx-auto">
            <NextSteps 
              key={`${selectedAction}-${JSON.stringify(savedChoices)}`} 
              selectedAction={selectedAction} 
              savedChoices={savedChoices} 
            />
          </div>
        </FadeIn>
      </section>

      <section className="bg-gray-100 w-full">
        <FadeIn threshold={0.15} delay={500}>
          <div className="container mx-auto">
            <AdditionalResources />
          </div>
        </FadeIn>
      </section>

      <section className="bg-white w-full">
        <FadeIn threshold={0.15} delay={600}>
          <div className="container mx-auto">
            <CommunityConnections />
          </div>
        </FadeIn>
      </section>

      <section className="bg-gray-50 w-full">
        <FadeIn threshold={0.15} delay={700}>
          <div className="container mx-auto">
            <ContactForm />
          </div>
        </FadeIn>
      </section>
    </>
  );
}

export default Home
