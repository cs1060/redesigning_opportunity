'use client'

import React, { useState, useEffect } from 'react'
import { FaStar, FaQuoteLeft, FaQuoteRight, FaMapMarkerAlt, FaComment } from 'react-icons/fa'
import { useTranslations } from 'next-intl'
import { db } from '../utils/firebase'
import { collection, addDoc, getDocs, query, orderBy, serverTimestamp } from 'firebase/firestore'

interface Testimonial {
  id: string;
  name: string;
  location: string;
  rating: number;
  text: string;
  date: string;
  avatar?: string;
  translationKey?: string; // For sample testimonials
  dateKey?: string; // For sample testimonial dates
}

const CommunityConnections: React.FC = () => {
  const t = useTranslations('community');
  const [activeTab, setActiveTab] = useState<'testimonials' | 'share'>('testimonials')
  const [newTestimonialForm, setNewTestimonialForm] = useState({
    name: '',
    location: '',
    rating: 5,
    text: '',
  })
  
  // State for testimonials data
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [submitStatus, setSubmitStatus] = useState<{success?: boolean; message?: string} | null>(null)
  
  // Fetch testimonials from Firestore
  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        setIsLoading(true)
        const testimonialsCollection = collection(db, 'testimonials')
        const testimonialsQuery = query(testimonialsCollection, orderBy('createdAt', 'desc'))
        const querySnapshot = await getDocs(testimonialsQuery)
        
        const fetchedTestimonials: Testimonial[] = []
        querySnapshot.forEach((doc) => {
          const data = doc.data()
          fetchedTestimonials.push({
            id: doc.id,
            name: data.name,
            location: data.location,
            rating: data.rating,
            text: data.text,
            date: data.date,
            avatar: data.avatar || undefined
          })
        })
        
        // Sample testimonials data to use as fallback
        const sampleTestimonials: Testimonial[] = [
          {
            id: '1',
            name: 'Sarah Johnson',
            location: 'Brookline, MA',
            rating: 5,
            text: '',
            date: '',
            avatar: '/avatars/sarah.svg',
            translationKey: 'testimonial1',
            dateKey: 'march2'
          },
          {
            id: '2',
            name: 'Marcus Williams',
            location: 'Cambridge, MA',
            rating: 4,
            text: '',
            date: '',
            avatar: '/avatars/marcus.svg',
            translationKey: 'testimonial2',
            dateKey: 'february15'
          },
          {
            id: '3',
            name: 'Elena Rodriguez',
            location: 'Somerville, MA',
            rating: 5,
            text: '',
            date: '',
            avatar: '/avatars/elena.svg',
            translationKey: 'testimonial3',
            dateKey: 'january28'
          },
          {
            id: '4',
            name: 'David Chen',
            location: 'Newton, MA',
            rating: 5,
            text: '',
            date: '',
            avatar: '/avatars/david.svg',
            translationKey: 'testimonial4',
            dateKey: 'january10'
          },
        ]
        
        // Combine fetched testimonials with sample testimonials
        // Only use sample testimonials if we don't have any from Firebase
        if (fetchedTestimonials.length > 0) {
          setTestimonials(fetchedTestimonials)
        } else {
          setTestimonials(sampleTestimonials)
        }
      } catch (error) {
        console.error('Error fetching testimonials:', error)
        // If there's an error fetching from Firebase, use sample data as fallback
        const sampleTestimonials: Testimonial[] = [
          {
            id: '1',
            name: 'Sarah Johnson',
            location: 'Brookline, MA',
            rating: 5,
            text: '',
            date: '',
            avatar: '/avatars/sarah.svg',
            translationKey: 'testimonial1',
            dateKey: 'march2'
          },
          {
            id: '2',
            name: 'Marcus Williams',
            location: 'Cambridge, MA',
            rating: 4,
            text: '',
            date: '',
            avatar: '/avatars/marcus.svg',
            translationKey: 'testimonial2',
            dateKey: 'february15'
          },
          {
            id: '3',
            name: 'Elena Rodriguez',
            location: 'Somerville, MA',
            rating: 5,
            text: '',
            date: '',
            avatar: '/avatars/elena.svg',
            translationKey: 'testimonial3',
            dateKey: 'january28'
          },
          {
            id: '4',
            name: 'David Chen',
            location: 'Newton, MA',
            rating: 5,
            text: '',
            date: '',
            avatar: '/avatars/david.svg',
            translationKey: 'testimonial4',
            dateKey: 'january10'
          },
        ]
        setTestimonials(sampleTestimonials)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchTestimonials()
  }, []) // Remove 't' from the dependency array
  
  // Rest of the code remains the same
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setNewTestimonialForm({
      ...newTestimonialForm,
      [name]: value
    })
  }
  
  const handleRatingChange = (rating: number) => {
    setNewTestimonialForm({
      ...newTestimonialForm,
      rating
    })
  }
  
  const handleSubmitTestimonial = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setSubmitStatus({ message: t('submittingStory') })
      
      // Format the current date
      const currentDate = new Date()
      const formattedDate = t('formattedDate', {
        month: currentDate.toLocaleString('default', { month: 'long' }),
        day: currentDate.getDate(),
        year: currentDate.getFullYear()
      })
      
      // Add the testimonial to Firestore
      const testimonialsCollection = collection(db, 'testimonials')
      const newTestimonial = {
        name: newTestimonialForm.name,
        location: newTestimonialForm.location,
        rating: newTestimonialForm.rating,
        text: newTestimonialForm.text,
        date: formattedDate,
        createdAt: serverTimestamp() // For sorting by date added
      }
      
      const docRef = await addDoc(testimonialsCollection, newTestimonial)
      
      // Add the new testimonial to the state with the generated ID
      setTestimonials(prevTestimonials => [
        {
          id: docRef.id,
          ...newTestimonial,
          date: formattedDate // Use the formatted date string
        } as Testimonial,
        ...prevTestimonials
      ])
      
      // Reset the form
      setNewTestimonialForm({
        name: '',
        location: '',
        rating: 5,
        text: '',
      })
      
      // Show success message
      setSubmitStatus({ success: true, message: t('storySubmitted') })
      
      // Clear the success message after 5 seconds
      setTimeout(() => {
        setSubmitStatus(null)
      }, 5000)
    } catch (error) {
      console.error('Error adding testimonial:', error)
      setSubmitStatus({ success: false, message: t('errorSubmitting') })
    }
  }
  
  const renderStars = (rating: number) => {
    return Array(5).fill(0).map((_, i) => (
      <FaStar 
        key={i} 
        className={i < rating ? 'text-yellow-500' : 'text-gray-300'} 
      />
    ))
  }
  
  // Generate initials from a name (takes first letter of first and last name)
  const getInitials = (name: string): string => {
    const nameParts = name.split(' ').filter(part => part.length > 0);
    if (nameParts.length === 0) return '?';
    if (nameParts.length === 1) return nameParts[0][0].toUpperCase();
    return (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase();
  }
  
  // Use the site's primary green color for all avatars
  const getAvatarColor = (): string => {
    // Primary color from tailwind config
    return '#6CD9CA';
  }
  
  // Render avatar with initials
  const renderAvatar = (testimonial: Testimonial) => {
    const initials = getInitials(testimonial.name);
    const bgColor = getAvatarColor();
    
    return (
      <div 
        className="w-12 h-12 rounded-full flex items-center justify-center text-white font-medium"
        style={{ backgroundColor: bgColor }}
      >
        {initials}
      </div>
    );
  }
  
  return (
    <div id="community-connections" className="min-h-screen px-4 py-10 max-w-6xl mx-auto scroll-mt-20">
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">{t('title')}</h1>
        <p className="text-xl">{t('subtitle')}</p>
      </div>
      
      {/* Tab Navigation */}
      <div className="flex justify-center mb-8">
        <div className="inline-flex rounded-md shadow-sm">
          <button
            onClick={() => setActiveTab('testimonials')}
            className={`px-5 py-2.5 text-sm font-medium rounded-l-lg ${
              activeTab === 'testimonials'
                ? 'bg-primary text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            {t('testimonials')}
          </button>
          <button
            onClick={() => setActiveTab('share')}
            className={`px-5 py-2.5 text-sm font-medium rounded-r-lg ${
              activeTab === 'share'
                ? 'bg-primary text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            {t('shareYourStory')}
          </button>
        </div>
      </div>
      
      {/* Testimonials Tab */}
      {activeTab === 'testimonials' && (
        <>
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : testimonials.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">{t('noStories')}</p>
              <button
                onClick={() => setActiveTab('share')}
                className="mt-4 px-5 py-2 bg-primary text-white font-medium rounded-lg hover:bg-opacity-90"
                data-cy="share-your-story"
              >
                {t('shareYourStory')}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6" data-cy="comments">
              {testimonials.map((testimonial) => (
                <div key={testimonial.id} className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex items-start mb-4">
                    <div className="flex-shrink-0 mr-4">
                      {renderAvatar(testimonial)}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">{testimonial.name}</h3>
                      <div className="flex items-center text-sm text-gray-600 mb-1">
                        <FaMapMarkerAlt className="mr-1" />
                        <span>{testimonial.location}</span>
                      </div>
                      <div className="flex">
                        {renderStars(testimonial.rating)}
                      </div>
                    </div>
                  </div>
                  <div className="mb-3 text-gray-700">
                    <FaQuoteLeft className="inline text-primary opacity-50 mr-2" size={12} />
                    {testimonial.translationKey ? t(testimonial.translationKey) : testimonial.text}
                    <FaQuoteRight className="inline text-primary opacity-50 ml-2" size={12} />
                  </div>
                  <div className="text-sm text-gray-500 text-right">
                    {testimonial.dateKey ? t(testimonial.dateKey) : testimonial.date}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
      

      
      {/* Share Your Story Tab */}
      {activeTab === 'share' && (
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-semibold mb-6">{t('shareYourJourney')}</h2>
          <p className="mb-6">{t('shareYourJourneyDescription')}</p>
          
          <form onSubmit={handleSubmitTestimonial}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label htmlFor="name" className="block mb-2 text-sm font-medium text-gray-700">
                  {t('yourName')}
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={newTestimonialForm.name}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                  required
                />
              </div>
              <div>
                <label htmlFor="location" className="block mb-2 text-sm font-medium text-gray-700">
                  {t('yourLocation')}
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={newTestimonialForm.location}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                  required
                />
              </div>
            </div>
            
            <div className="mb-6">
              <label htmlFor="rating" className="block mb-2 text-sm font-medium text-gray-700">
                {t('rateExperience')}
              </label>
              <div className="flex space-x-2">
                {Array(5).fill(0).map((_, i) => (
                  <FaStar 
                    key={i} 
                    data-testid="rating-star"
                    className={`text-2xl cursor-pointer ${i < newTestimonialForm.rating ? 'text-yellow-500' : 'text-gray-300'}`}
                    onClick={() => handleRatingChange(i + 1)}
                  />
                ))}
              </div>
            </div>
            
            <div className="mb-6">
              <label htmlFor="text" className="block mb-2 text-sm font-medium text-gray-700">
                {t('yourStory')}
              </label>
              <textarea
                id="text"
                name="text"
                value={newTestimonialForm.text}
                onChange={handleInputChange}
                rows={5}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                required
                placeholder={t('storyPlaceholder')}
              />
            </div>
            
            {/* Submission status message */}
            {submitStatus && (
              <div className={`mb-4 p-4 rounded-lg ${
                submitStatus.success === undefined ? 'bg-blue-50 text-blue-700' :
                submitStatus.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
              }`}>
                {submitStatus.message}
              </div>
            )}
            
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={!!submitStatus && submitStatus.success === undefined}
                className={`inline-flex items-center px-5 py-2.5 ${
                  submitStatus && submitStatus.success === undefined 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-primary hover:bg-opacity-90'
                } text-white font-medium rounded-lg`}
              >
                {submitStatus && submitStatus.success === undefined ? (
                  <>
                    <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full"></div>
                    {t('submitting')}
                  </>
                ) : (
                  <>
                    <FaComment className="mr-2" />
                    {t('submitStory')}
                  </>
                )}
              </button>
            </div>
          </form>
          
          <div className="mt-10 pt-6 border-t border-gray-200">
            <h3 className="text-xl font-semibold mb-4">{t('whyShare')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">{t('inspireOthers')}</h4>
                <p className="text-gray-700">{t('inspireOthersDescription')}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">{t('buildCommunity')}</h4>
                <p className="text-gray-700">{t('buildCommunityDescription')}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">{t('shareKnowledge')}</h4>
                <p className="text-gray-700">{t('shareKnowledgeDescription')}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">{t('createChange')}</h4>
                <p className="text-gray-700">{t('createChangeDescription')}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CommunityConnections
