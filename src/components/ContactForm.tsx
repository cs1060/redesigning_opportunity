'use client'

import React, { useState } from 'react'
import { useTranslations } from 'next-intl'
import { FaEnvelope, FaUser, FaPaperPlane } from 'react-icons/fa'

const ContactForm: React.FC = () => {
  const t = useTranslations('contact')
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })
  
  const [status, setStatus] = useState<{
    type: 'success' | 'error' | 'sending' | null,
    message: string
  }>({ type: null, message: '' })
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setStatus({
        type: 'sending',
        message: t('sending')
      })
      
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          recipients: [
            'mahiarahman@college.harvard.edu',
            'celestecarrasco@college.harvard.edu',
            'evasquezreyes@college.harvard.edu'
          ]
        })
      })
      
      const data = await response.json()
      
      if (response.ok) {
        setStatus({
          type: 'success',
          message: t('messageSent')
        })
        
        // Reset form
        setFormData({
          name: '',
          email: '',
          subject: '',
          message: ''
        })
        
        // Clear success message after 5 seconds
        setTimeout(() => {
          setStatus({ type: null, message: '' })
        }, 5000)
      } else {
        throw new Error(data.message || 'Something went wrong')
      }
    } catch (error) {
      console.error('Error sending message:', error)
      setStatus({
        type: 'error',
        message: error instanceof Error ? error.message : t('messageError')
      })
    }
  }
  
  return (
    <div id="contact-us" className="bg-gray-50 py-16 px-4 scroll-mt-20">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-2">{t('title')}</h2>
          <p className="text-lg text-gray-600">
            {t('subtitle')}
          </p>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-8">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label htmlFor="name" className="block mb-2 text-sm font-medium text-gray-700">
                  {t('yourName')}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <FaUser className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                    placeholder="John Doe"
                    required
                  />
                </div>
              </div>
              <div>
                <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-700">
                  {t('yourEmail')}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <FaEnvelope className="text-gray-400" />
                  </div>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                    placeholder="john.doe@example.com"
                    required
                  />
                </div>
              </div>
            </div>
            
            <div className="mb-6">
              <label htmlFor="subject" className="block mb-2 text-sm font-medium text-gray-700">
                {t('subject')}
              </label>
              <input
                type="text"
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                placeholder="How can we help you?"
                required
              />
            </div>
            
            <div className="mb-6">
              <label htmlFor="message" className="block mb-2 text-sm font-medium text-gray-700">
                {t('yourMessage')}
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows={5}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                placeholder="Write your message here..."
                required
              />
            </div>
            
            {status.type && (
              <div className={`mb-6 p-4 rounded-lg ${
                status.type === 'success' ? 'bg-green-50 text-green-700' :
                status.type === 'error' ? 'bg-red-50 text-red-700' :
                'bg-blue-50 text-blue-700'
              }`}>
                {status.message}
              </div>
            )}
            
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={status.type === 'sending'}
                className={`inline-flex items-center px-5 py-2.5 ${
                  status.type === 'sending'
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-primary hover:bg-opacity-90'
                } text-white font-medium rounded-lg`}
              >
                {status.type === 'sending' ? (
                  <>
                    <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full"></div>
                    {t('sending')}
                  </>
                ) : (
                  <>
                    <FaPaperPlane className="mr-2" />
                    {t('sendMessage')}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ContactForm
