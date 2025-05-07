'use client'
import { useState, useEffect } from 'react';
import { FaChevronDown, FaExclamationTriangle } from 'react-icons/fa';
import { geocodeAddress } from '../utils/geocodingUtils';
import { useTranslations } from 'next-intl';
import { useAssessment, type AssessData } from './AssessProvider';

const AssessYourCommunity = () => {
  const { setFullData } = useAssessment();
  const t = useTranslations('assessment');
  
  // Initialize formData with ALL fields, including address components
  // Modified to ensure there's only one child
  const [formData, setFormData] = useState<AssessData>({
    street: '',
    city: '',
    state: '',
    address: '',
    income: '',
    country: '',
    isEmployed: false,
    children: [{ name: '', gender: '', age: '', ethnicity: '' }]
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [addressValidationStatus, setAddressValidationStatus] = useState<'idle' | 'validating' | 'valid' | 'invalid'>('idle');
  const [validationMessage, setValidationMessage] = useState('');

  const handleParentInfoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prevData => {
      const newData = {
        ...prevData,
        [name]: value
      };
      
      // If any address component changes, update the combined address
      if (['street', 'city', 'state'].includes(name)) {
        newData.address = `${newData.street}, ${newData.city}, ${newData.state}`.replace(/^[,\s]+|[,\s]+$/g, '');
        
        // Reset validation status when address changes
        setAddressValidationStatus('idle');
        setValidationMessage('');
      }
      
      return newData;
    });
  };

  // Modified to always work with the first (and only) child
  const handleChildInfoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const key = name.split('-')[1]; // Extract the field name (name, gender, age, ethnicity)
    
    setFormData(prevData => {
      // Create updated child info (always for index 0)
      const updatedChild = {
        ...prevData.children[0],
        [key]: value
      };
      
      return {
        ...prevData,
        children: [updatedChild] // Always just one child
      };
    });
  };

  // Validate address when all address fields are filled
  useEffect(() => {
    const validateAddress = async () => {
      // Only validate if all address fields have values
      if (formData.street && formData.city && formData.state) {
        setAddressValidationStatus('validating');
        
        try {
          const result = await geocodeAddress(formData.address);
          
          if (result) {
            setAddressValidationStatus('valid');
            setValidationMessage('Address validated successfully');
          } else {
            setAddressValidationStatus('invalid');
            setValidationMessage('This address may not exist or could not be found. Please verify your address.');
          }
        } catch (err) {
          setAddressValidationStatus('invalid');
          setValidationMessage('Error validating address. Please check your input.');
          console.error('Address validation error:', err);
        }
      }
    };
    
    // Debounce validation to avoid too many API calls
    const timeoutId = setTimeout(() => {
      if (formData.street && formData.city && formData.state && addressValidationStatus === 'idle') {
        validateAddress();
      }
    }, 1000);
    
    return () => clearTimeout(timeoutId);
  }, [formData.address, formData.street, formData.city, formData.state, addressValidationStatus]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate address before submitting if not already validated
    if (addressValidationStatus === 'idle' && formData.street && formData.city && formData.state) {
      setAddressValidationStatus('validating');
      const result = await geocodeAddress(formData.address);
      
      if (!result) {
        setAddressValidationStatus('invalid');
        setValidationMessage('This address may not exist or could not be found. Please verify your address.');
        
        // Show warning but allow submission
        if (!window.confirm('The address you entered could not be validated. Do you still want to continue?')) {
          return;
        }
      } else {
        setAddressValidationStatus('valid');
      }
    }
    
    setIsSubmitting(true);
    
    try {
      console.log('Submitting form data:', formData);
      
      // Save to context for use across the site
      setFullData(formData);
      
      // Make the API call
      const response = await fetch('/api/save-family-data', { 
        method: 'POST', 
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData) 
      });
      
      const result = await response.json();
      console.log('API response:', result);
      
      // Show success state
      setSubmitSuccess(true);
      setTimeout(() => setSubmitSuccess(false), 3000); // Show checkmark for 3 seconds
      
      // Scroll to the map section after a short delay to ensure data is processed
      setTimeout(() => {
        const mapSection = document.getElementById('opportunity-map');
        if (mapSection) {
          mapSection.scrollIntoView({ behavior: 'smooth' });
        }
      }, 300);
    } catch (err) {
      console.error('Error submitting form:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div id="quiz-section" className="min-h-screen px-4 py-16 max-w-4xl mx-auto scroll-mt-28">
      <div className="bg-white rounded-xl shadow-lg p-8 md:p-10">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-2">{t('title')}</h2>
          <p className="text-lg text-gray-600">{t('subtitle')}</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Parent Information Section */}
          <div className="space-y-6">
            <div className="flex items-center">
              <h3 className="text-xl font-semibold">{t('parentInfo')}</h3>
              <div className="flex-grow ml-4 h-px bg-gray-200"></div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label htmlFor="street" className="block text-sm font-medium">
                  {t('streetAddress')}<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="street"
                  name="street"
                  value={formData.street || ''}
                  onChange={handleParentInfoChange}
                  placeholder={t('streetAddressPlaceholder')}
                  required
                  className={`w-full px-4 py-2 border ${addressValidationStatus === 'invalid' ? 'border-red-500' : 'border-gray-300'} rounded-md focus:ring-2 focus:ring-primary focus:border-transparent`}
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="city" className="block text-sm font-medium">
                  {t('city')}<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={formData.city || ''}
                  onChange={handleParentInfoChange}
                  placeholder={t('cityPlaceholder')}
                  required
                  className={`w-full px-4 py-2 border ${addressValidationStatus === 'invalid' ? 'border-red-500' : 'border-gray-300'} rounded-md focus:ring-2 focus:ring-primary focus:border-transparent`}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="state" className="block text-sm font-medium">
                  {t('state')}<span className="text-red-500">*</span>
                </label>
                <select
                  id="state"
                  name="state"
                  value={formData.state || ''}
                  onChange={handleParentInfoChange}
                  required
                  className={`w-full px-4 py-2 border ${addressValidationStatus === 'invalid' ? 'border-red-500' : 'border-gray-300'} rounded-md appearance-none focus:ring-2 focus:ring-primary focus:border-transparent`}
                >
                  <option value="">{t('selectState')}</option>
                  <option value="AL">Alabama</option>
                  <option value="AK">Alaska</option>
                  <option value="AZ">Arizona</option>
                  <option value="AR">Arkansas</option>
                  <option value="CA">California</option>
                  <option value="CO">Colorado</option>
                  <option value="CT">Connecticut</option>
                  <option value="DE">Delaware</option>
                  <option value="FL">Florida</option>
                  <option value="GA">Georgia</option>
                  <option value="HI">Hawaii</option>
                  <option value="ID">Idaho</option>
                  <option value="IL">Illinois</option>
                  <option value="IN">Indiana</option>
                  <option value="IA">Iowa</option>
                  <option value="KS">Kansas</option>
                  <option value="KY">Kentucky</option>
                  <option value="LA">Louisiana</option>
                  <option value="ME">Maine</option>
                  <option value="MD">Maryland</option>
                  <option value="MA">Massachusetts</option>
                  <option value="MI">Michigan</option>
                  <option value="MN">Minnesota</option>
                  <option value="MS">Mississippi</option>
                  <option value="MO">Missouri</option>
                  <option value="MT">Montana</option>
                  <option value="NE">Nebraska</option>
                  <option value="NV">Nevada</option>
                  <option value="NH">New Hampshire</option>
                  <option value="NJ">New Jersey</option>
                  <option value="NM">New Mexico</option>
                  <option value="NY">New York</option>
                  <option value="NC">North Carolina</option>
                  <option value="ND">North Dakota</option>
                  <option value="OH">Ohio</option>
                  <option value="OK">Oklahoma</option>
                  <option value="OR">Oregon</option>
                  <option value="PA">Pennsylvania</option>
                  <option value="RI">Rhode Island</option>
                  <option value="SC">South Carolina</option>
                  <option value="SD">South Dakota</option>
                  <option value="TN">Tennessee</option>
                  <option value="TX">Texas</option>
                  <option value="UT">Utah</option>
                  <option value="VT">Vermont</option>
                  <option value="VA">Virginia</option>
                  <option value="WA">Washington</option>
                  <option value="WV">West Virginia</option>
                  <option value="WI">Wisconsin</option>
                  <option value="WY">Wyoming</option>
                </select>
              </div>
            </div>
            
            {/* Address validation message */}
            {addressValidationStatus !== 'idle' && (
              <div className={`mt-2 ${addressValidationStatus === 'valid' ? 'text-green-600' : addressValidationStatus === 'invalid' ? 'text-red-600' : 'text-gray-600'} text-sm flex items-center`}>
                {addressValidationStatus === 'validating' ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {t('validatingAddress')}
                  </div>
                ) : addressValidationStatus === 'invalid' ? (
                  <div className="flex items-center">
                    <FaExclamationTriangle className="mr-2" />
                    {validationMessage === 'This address may not exist or could not be found. Please verify your address.' 
                      ? t('addressNotFound')
                      : validationMessage === 'Please complete all address fields'
                      ? t('completeAddressFields')
                      : validationMessage}
                  </div>
                ) : (
                  <div className="flex items-center">
                    <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    {t('addressValidated')}
                  </div>
                )}
              </div>
            )}
            
            <div className="space-y-2">
              <label htmlFor="income" className="block text-sm font-medium">
                Annual Household Income<span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  id="income"
                  name="income"
                  value={formData.income || ''}
                  onChange={handleParentInfoChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md appearance-none focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="">Select income range</option>
                  <option value="<25k">Less than $25,000</option>
                  <option value="25-50k">$25,000 - $50,000</option>
                  <option value="50-75k">$50,000 - $75,000</option>
                  <option value="75-100k">$75,000 - $100,000</option>
                  <option value=">100k">More than $100,000</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                  <FaChevronDown className="text-gray-400" />
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="country" className="block text-sm font-medium">
                Country of Origin (Optional)
              </label>
              <input
                type="text"
                id="country"
                name="country"
                value={formData.country || ''}
                onChange={handleParentInfoChange}
                placeholder="Enter country"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            
            <div className="mt-4 space-y-2">
              <label className="block text-sm font-medium">
                {t('isEmployed')}
              </label>
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <input
                      type="radio"
                      id="isEmployedYes"
                      name="isEmployed"
                      checked={formData.isEmployed === true}
                      onChange={() => {
                        setFormData(prevData => ({
                          ...prevData,
                          isEmployed: true
                        }));
                      }}
                      className="sr-only" // Hide the actual radio button
                    />
                    <div 
                      className={`w-5 h-5 rounded-full border-2 ${formData.isEmployed === true ? 'border-primary' : 'border-gray-300'}`}
                      onClick={() => {
                        setFormData(prevData => ({
                          ...prevData,
                          isEmployed: true
                        }));
                      }}
                    >
                      {formData.isEmployed === true && (
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-primary"></div>
                      )}
                    </div>
                  </div>
                  <label 
                    htmlFor="isEmployedYes" 
                    className="text-sm"
                    onClick={() => {
                      setFormData(prevData => ({
                        ...prevData,
                        isEmployed: true
                      }));
                    }}
                  >
                    {t('yes')}
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <input
                      type="radio"
                      id="isEmployedNo"
                      name="isEmployed"
                      checked={formData.isEmployed === false}
                      onChange={() => {
                        setFormData(prevData => ({
                          ...prevData,
                          isEmployed: false
                        }));
                      }}
                      className="sr-only" // Hide the actual radio button
                    />
                    <div 
                      className={`w-5 h-5 rounded-full border-2 ${formData.isEmployed === false ? 'border-primary' : 'border-gray-300'}`}
                      onClick={() => {
                        setFormData(prevData => ({
                          ...prevData,
                          isEmployed: false
                        }));
                      }}
                    >
                      {formData.isEmployed === false && (
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-primary"></div>
                      )}
                    </div>
                  </div>
                  <label 
                    htmlFor="isEmployedNo" 
                    className="text-sm"
                    onClick={() => {
                      setFormData(prevData => ({
                        ...prevData,
                        isEmployed: false
                      }));
                    }}
                  >
                    {t('no')}
                  </label>
                </div>
              </div>
            </div>
          </div>
          
          {/* Child Information Section */}
          <div className="space-y-6">
            <div className="flex items-center">
              <h3 className="text-xl font-semibold">{t('childInfo')}</h3>
              <div className="flex-grow ml-4 h-px bg-gray-200"></div>
            </div>
            
            {/* Data Collection Disclaimer */}
            <div className="bg-gray-100 border border-gray-200 rounded-md p-4 mb-4">
              <p className="text-sm text-gray-600">
                <strong>{t('disclaimer', { fallback: 'Note' })}: </strong>
                {t('childDataDisclaimer', { 
                  fallback: 'Information about your child (name, age, ethnicity, and gender) is collected only to provide personalized recommendations and is not stored or saved after your session ends.'
                })}
              </p>
            </div>
            
            {/* Modified to remove child numbering and only use the first child */}
            <div className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="child-name" className="block text-sm font-medium">
                  {t('childName')}<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="child-name"
                  name="child-name"
                  value={formData.children[0]?.name || ''}
                  onChange={handleChildInfoChange}
                  placeholder={t('childNamePlaceholder')}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label htmlFor="child-gender" className="block text-sm font-medium">
                    {t('gender')}<span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      id="child-gender"
                      name="child-gender"
                      value={formData.children[0]?.gender || ''}
                      onChange={handleChildInfoChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-md appearance-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value="">{t('selectGender')}</option>
                      <option value="M">{t('male')}</option>
                      <option value="F">{t('female')}</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                      <FaChevronDown className="text-gray-400" />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="child-age" className="block text-sm font-medium">
                    {t('age')}<span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    id="child-age"
                    name="child-age"
                    value={formData.children[0]?.age || ''}
                    onChange={handleChildInfoChange}
                    placeholder={t('agePlaceholder')}
                    min="0"
                    max="18"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="child-ethnicity" className="block text-sm font-medium">
                    {t('ethnicity')}<span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      id="child-ethnicity"
                      name="child-ethnicity"
                      value={formData.children[0]?.ethnicity || ''}
                      onChange={handleChildInfoChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-md appearance-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value="">{t('selectEthnicity')}</option>
                      <option value="W">{t('white')}</option>
                      <option value="B">{t('black')}</option>
                      <option value="H">{t('hispanic')}</option>
                      <option value="A">{t('asian')}</option>
                      <option value="NA">{t('nativeAmerican')}</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                      <FaChevronDown className="text-gray-400" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Removed the "Add Child Button" section */}
          </div>
          
          {/* Submit Button */}
          <div className="flex justify-center mt-10">
            <div className="relative inline-flex items-center">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`bg-primary hover:bg-opacity-90 text-white py-3 px-12 rounded-full font-medium text-lg transition-all ${
                  isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {t('submitting')}
                  </span>
                ) : t('submit')}
              </button>
              
              {/* Success Checkmark */}
              {submitSuccess && (
                <div className="ml-4 flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AssessYourCommunity;