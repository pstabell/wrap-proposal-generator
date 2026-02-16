'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface LeadGateProps {
  onAccessGranted: () => void;
  enabled?: boolean;
}

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  agencyName: string;
  phone: string;
  howDidYouFindUs: string;
}

export default function LeadGate({ onAccessGranted, enabled = true }: LeadGateProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    agencyName: '',
    phone: '',
    howDidYouFindUs: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  // Configuration
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const ACCESS_COOKIE_NAME = 'wrap_access';
  const ACCESS_DURATION_DAYS = parseInt(process.env.NEXT_PUBLIC_ACCESS_DURATION_DAYS || '30');

  useEffect(() => {
    if (!enabled) {
      onAccessGranted();
      return;
    }

    // Check if user already has access
    const hasAccess = document.cookie
      .split('; ')
      .find(row => row.startsWith(`${ACCESS_COOKIE_NAME}=`))
      ?.split('=')[1] === 'true';

    if (hasAccess) {
      onAccessGranted();
    } else {
      setIsVisible(true);
    }
  }, [enabled, onAccessGranted]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const validateForm = (): boolean => {
    if (!formData.firstName.trim()) {
      setError('First name is required');
      return false;
    }
    if (!formData.lastName.trim()) {
      setError('Last name is required');
      return false;
    }
    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Valid email address is required');
      return false;
    }
    if (!formData.agencyName.trim()) {
      setError('Agency name is required');
      return false;
    }
    if (!formData.howDidYouFindUs) {
      setError('Please select how you found us');
      return false;
    }
    return true;
  };

  const createContact = async (): Promise<boolean> => {
    if (!SUPABASE_URL || !SUPABASE_KEY) {
      console.error('Missing Supabase configuration');
      return false;
    }

    try {
      const contactData = {
        first_name: formData.firstName.trim(),
        last_name: formData.lastName.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim() || null,
        company: formData.agencyName.trim(),
        type: 'prospect',
        source: 'wrap-proposal-generator',
        source_detail: `WRAP Lead Gate - ${formData.howDidYouFindUs}`,
        tags: ['AMS-AGENCY'],
        notes: `Interested in WRAP Proposal Generator. Agency: ${formData.agencyName}. Found us via: ${formData.howDidYouFindUs}`,
        email_status: 'subscribed',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const response = await fetch(`${SUPABASE_URL}/rest/v1/contacts`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(contactData)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to create contact:', response.status, errorText);
        
        // Handle duplicate email gracefully
        if (response.status === 409 || errorText.includes('duplicate') || errorText.includes('unique')) {
          console.log('Contact already exists, proceeding anyway');
          return true;
        }
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error creating contact:', error);
      return false;
    }
  };

  const setAccessCookie = () => {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + ACCESS_DURATION_DAYS);
    document.cookie = `${ACCESS_COOKIE_NAME}=true; expires=${expiryDate.toUTCString()}; path=/; SameSite=Lax`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const success = await createContact();
      
      if (success) {
        setShowSuccess(true);
        setAccessCookie();
        
        // Show success message then grant access
        setTimeout(() => {
          setIsVisible(false);
          onAccessGranted();
        }, 2000);
      } else {
        setError('Something went wrong. Please try again or contact support.');
      }
    } catch (error) {
      console.error('Submit error:', error);
      setError('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!enabled || !isVisible) {
    return null;
  }

  return (
    <div className=\"fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4\">
      <div className=\"bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto\">
        {showSuccess ? (
          // Success State
          <div className=\"p-8 text-center\">
            <div className=\"w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4\">
              <svg className=\"w-8 h-8 text-green-600\" fill=\"none\" stroke=\"currentColor\" viewBox=\"0 0 24 24\">
                <path strokeLinecap=\"round\" strokeLinejoin=\"round\" strokeWidth={2} d=\"M5 13l4 4L19 7\" />
              </svg>
            </div>
            <h3 className=\"text-xl font-bold text-gray-900 mb-2\">Welcome to WRAP!</h3>
            <p className=\"text-gray-600\">Your access has been activated. Loading the proposal tool...</p>
          </div>
        ) : (
          // Form State
          <>
            <div className=\"p-6 border-b border-gray-200\">
              <div className=\"text-center\">
                <h2 className=\"text-2xl font-bold text-gray-900 mb-2\">Access WRAP Proposal Generator</h2>
                <p className=\"text-gray-600\">Create professional insurance proposals in minutes</p>
              </div>
              
              <div className=\"mt-4 space-y-2\">
                <div className=\"flex items-center text-sm text-gray-600\">
                  <span className=\"text-blue-500 mr-2\">⚡</span>
                  10-minute proposals instead of 2 hours
                </div>
                <div className=\"flex items-center text-sm text-gray-600\">
                  <span className=\"text-blue-500 mr-2\">🏢</span>
                  Professional documents with your branding
                </div>
                <div className=\"flex items-center text-sm text-gray-600\">
                  <span className=\"text-blue-500 mr-2\">💰</span>
                  10 coverage types with automatic savings calculations
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className=\"p-6 space-y-4\">
              <div className=\"grid grid-cols-2 gap-4\">
                <div>
                  <label htmlFor=\"firstName\" className=\"block text-sm font-medium text-gray-700 mb-1\">
                    First Name *
                  </label>
                  <input
                    type=\"text\"
                    id=\"firstName\"
                    name=\"firstName\"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className=\"w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent\"
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <label htmlFor=\"lastName\" className=\"block text-sm font-medium text-gray-700 mb-1\">
                    Last Name *
                  </label>
                  <input
                    type=\"text\"
                    id=\"lastName\"
                    name=\"lastName\"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className=\"w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent\"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div>
                <label htmlFor=\"email\" className=\"block text-sm font-medium text-gray-700 mb-1\">
                  Email Address *
                </label>
                <input
                  type=\"email\"
                  id=\"email\"
                  name=\"email\"
                  value={formData.email}
                  onChange={handleInputChange}
                  className=\"w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent\"
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label htmlFor=\"agencyName\" className=\"block text-sm font-medium text-gray-700 mb-1\">
                  Agency Name *
                </label>
                <input
                  type=\"text\"
                  id=\"agencyName\"
                  name=\"agencyName\"
                  value={formData.agencyName}
                  onChange={handleInputChange}
                  placeholder=\"e.g., ABC Insurance Agency\"
                  className=\"w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent\"
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label htmlFor=\"phone\" className=\"block text-sm font-medium text-gray-700 mb-1\">
                  Phone Number
                </label>
                <input
                  type=\"tel\"
                  id=\"phone\"
                  name=\"phone\"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder=\"(239) 555-1234\"
                  className=\"w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent\"
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label htmlFor=\"howDidYouFindUs\" className=\"block text-sm font-medium text-gray-700 mb-1\">
                  How did you find us? *
                </label>
                <select
                  id=\"howDidYouFindUs\"
                  name=\"howDidYouFindUs\"
                  value={formData.howDidYouFindUs}
                  onChange={handleInputChange}
                  className=\"w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent\"
                  disabled={isSubmitting}
                >
                  <option value=\"\">Please select...</option>
                  <option value=\"Google\">Google</option>
                  <option value=\"Social Media\">Social Media</option>
                  <option value=\"Referral\">Referral</option>
                  <option value=\"Chamber Event\">Chamber Event</option>
                  <option value=\"Other\">Other</option>
                </select>
              </div>

              {error && (
                <div className=\"p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm\">
                  {error}
                </div>
              )}

              <button
                type=\"submit\"
                disabled={isSubmitting}
                className=\"w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors\"
              >
                {isSubmitting ? (
                  <span className=\"flex items-center justify-center\">
                    <svg className=\"animate-spin -ml-1 mr-3 h-5 w-5 text-white\" xmlns=\"http://www.w3.org/2000/svg\" fill=\"none\" viewBox=\"0 0 24 24\">
                      <circle className=\"opacity-25\" cx=\"12\" cy=\"12\" r=\"10\" stroke=\"currentColor\" strokeWidth=\"4\"></circle>
                      <path className=\"opacity-75\" fill=\"currentColor\" d=\"M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z\"></path>
                    </svg>
                    Creating your access...
                  </span>
                ) : (
                  'Access WRAP Generator'
                )}
              </button>
            </form>

            <div className=\"px-6 pb-6 text-center text-xs text-gray-500\">
              <p className=\"font-semibold mb-1\">100% Free to Use • No credit card required • Instant access</p>
              <p>Your information is secure and will only be used to provide valuable insurance software updates.</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}