'use client';

import { useState, useEffect } from 'react';

interface LeadGateProps {
  onAccessGranted: () => void;
}

interface LeadFormData {
  firstName: string;
  lastName: string;
  email: string;
  agencyName: string;
  phone: string;
  howDidYouFindUs: string;
}

const CONFIG = {
  supabaseUrl: "https://qgtjpdviboxxlrivwcan.supabase.co",
  supabaseKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFndGpwZHZpYm94eGxyaXZ3Y2FuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkyNzc0MzIsImV4cCI6MjA4NDg1MzQzMn0.c4HugHTbj1FJ79pLnJ3an45Kg9nOjGDNmH00pv0foJA",
  accessCookieName: 'wrap_access',
  accessDurationDays: 30,
  campaignId: 'software-solutions-drip'
};

export default function LeadGate({ onAccessGranted }: LeadGateProps) {
  const [formData, setFormData] = useState<LeadFormData>({
    firstName: '',
    lastName: '',
    email: '',
    agencyName: '',
    phone: '',
    howDidYouFindUs: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    // Check if user already has access
    if (hasValidAccess()) {
      onAccessGranted();
    }
  }, [onAccessGranted]);

  const hasValidAccess = (): boolean => {
    // Check cookie first
    const cookieAccess = getCookie(CONFIG.accessCookieName);
    if (cookieAccess) {
      return true;
    }

    // Fallback to localStorage with expiry check
    const storageAccess = localStorage.getItem('wrap_access');
    const expiryTime = localStorage.getItem('wrap_access_expires');

    if (storageAccess && expiryTime) {
      const currentTime = Date.now();
      const expiry = parseInt(expiryTime);

      if (currentTime < expiry) {
        // Refresh cookie from localStorage
        refreshAccessCookie(storageAccess, expiry);
        return true;
      } else {
        // Clear expired access
        clearAccess();
      }
    }

    return false;
  };

  const getCookie = (name: string): string | null => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
    return null;
  };

  const refreshAccessCookie = (token: string, expiryTime: number) => {
    const expiryDate = new Date(expiryTime);
    document.cookie = `${CONFIG.accessCookieName}=${token}; expires=${expiryDate.toUTCString()}; path=/; SameSite=Lax; Secure`;
  };

  const clearAccess = () => {
    document.cookie = `${CONFIG.accessCookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    localStorage.removeItem('wrap_access');
    localStorage.removeItem('wrap_access_expires');
  };

  const generateAccessToken = (): string => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9);
    return btoa(`wrap_access_${timestamp}_${random}`);
  };

  const setAccessCookie = () => {
    const accessToken = generateAccessToken();
    const expiryDate = new Date(Date.now() + (CONFIG.accessDurationDays * 24 * 60 * 60 * 1000));

    document.cookie = `${CONFIG.accessCookieName}=${accessToken}; expires=${expiryDate.toUTCString()}; path=/; SameSite=Lax; Secure`;

    localStorage.setItem('wrap_access', accessToken);
    localStorage.setItem('wrap_access_expires', expiryDate.getTime().toString());
  };

  const validateForm = (): string[] => {
    const errors: string[] = [];

    if (!formData.firstName.trim()) errors.push('First name is required');
    if (!formData.lastName.trim()) errors.push('Last name is required');
    if (!formData.email.trim()) errors.push('Email is required');
    if (!formData.agencyName.trim()) errors.push('Agency name is required');
    if (!formData.howDidYouFindUs) errors.push('Please select how you found us');

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      errors.push('Please enter a valid email address');
    }

    return errors;
  };

  const findExistingContact = async (email: string) => {
    try {
      const response = await fetch(
        `${CONFIG.supabaseUrl}/rest/v1/contacts?email=eq.${encodeURIComponent(email)}&limit=1`,
        {
          headers: {
            'apikey': CONFIG.supabaseKey,
            'Authorization': `Bearer ${CONFIG.supabaseKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.ok) {
        const contacts = await response.json();
        return contacts[0] || null;
      }

      return null;
    } catch (error) {
      console.log('Find existing contact error:', error);
      return null;
    }
  };

  const createContact = async (formData: LeadFormData) => {
    try {
      const contactData = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        phone: formData.phone || null,
        company: formData.agencyName,
        type: 'prospect',
        source: 'wrap-proposal-generator',
        source_detail: `WRAP Lead Gate - ${formData.howDidYouFindUs}`,
        tags: ['AMS-AGENCY'],
        notes: `Interested in WRAP Proposal Generator. Agency: ${formData.agencyName}. Found us via: ${formData.howDidYouFindUs}`,
        created_at: new Date().toISOString()
      };

      const response = await fetch(`${CONFIG.supabaseUrl}/rest/v1/contacts`, {
        method: 'POST',
        headers: {
          'apikey': CONFIG.supabaseKey,
          'Authorization': `Bearer ${CONFIG.supabaseKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(contactData)
      });

      if (response.ok) {
        const contact = await response.json();
        return { 
          success: true, 
          contactId: contact[0]?.id || contact.id,
          contact: contact[0] || contact
        };
      } else if (response.status === 409) {
        // Handle duplicate email gracefully
        const existing = await findExistingContact(formData.email);
        if (existing) {
          return { 
            success: true, 
            contactId: existing.id,
            contact: existing,
            isExisting: true
          };
        }
      }

      const errorText = await response.text();
      throw new Error(`CRM Error: ${response.status} - ${errorText}`);

    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  };

  const enrollInDripCampaign = async (contactId: string, formData: LeadFormData) => {
    try {
      // Check existing enrollment
      const existingCheck = await fetch(
        `${CONFIG.supabaseUrl}/rest/v1/campaign_enrollments?contact_id=eq.${contactId}&campaign_id=eq.${CONFIG.campaignId}&status=eq.active&limit=1`,
        {
          headers: {
            'apikey': CONFIG.supabaseKey,
            'Authorization': `Bearer ${CONFIG.supabaseKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (existingCheck.ok) {
        const existing = await existingCheck.json();
        if (existing.length > 0) {
          return { success: true, isExisting: true };
        }
      }

      // Create enrollment
      const now = Date.now();
      const enrollmentData = {
        contact_id: contactId,
        campaign_id: CONFIG.campaignId,
        campaign_name: 'Software Solutions for Insurance Agencies',
        status: 'active',
        current_step: 0,
        total_steps: 5,
        step_schedule: JSON.stringify([
          {
            step: 0,
            day: 1,
            purpose: "welcome_wrap",
            subject: "Welcome! Your WRAP Proposal Generator access is ready",
            scheduled_for: new Date(now + 24 * 60 * 60 * 1000).toISOString(),
            sent: false
          },
          {
            step: 1,
            day: 3,
            purpose: "commission_tracker_intro",
            subject: "Beyond WRAP: Track every commission dollar",
            scheduled_for: new Date(now + 3 * 24 * 60 * 60 * 1000).toISOString(),
            sent: false
          },
          {
            step: 2,
            day: 7,
            purpose: "ams_platform_demo",
            subject: "Scale your agency with our AMS Platform",
            scheduled_for: new Date(now + 7 * 24 * 60 * 60 * 1000).toISOString(),
            sent: false
          },
          {
            step: 3,
            day: 14,
            purpose: "case_study_success",
            subject: "How agencies increased efficiency 300%",
            scheduled_for: new Date(now + 14 * 24 * 60 * 60 * 1000).toISOString(),
            sent: false
          },
          {
            step: 4,
            day: 21,
            purpose: "custom_dev_offer",
            subject: "Custom development? Let's talk",
            scheduled_for: new Date(now + 21 * 24 * 60 * 60 * 1000).toISOString(),
            sent: false
          }
        ]),
        source: 'wrap-proposal-generator',
        source_detail: `WRAP Lead Gate - ${formData.agencyName}`,
        emails_sent: 0,
        next_email_scheduled: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date().toISOString()
      };

      const response = await fetch(`${CONFIG.supabaseUrl}/rest/v1/campaign_enrollments`, {
        method: 'POST',
        headers: {
          'apikey': CONFIG.supabaseKey,
          'Authorization': `Bearer ${CONFIG.supabaseKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(enrollmentData)
      });

      if (response.ok) {
        return { success: true };
      } else {
        const errorText = await response.text();
        return { success: false, error: errorText };
      }

    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setError(validationErrors.join(', '));
      return;
    }

    setIsSubmitting(true);

    try {
      // Create contact in CRM
      const contactResult = await createContact(formData);

      if (contactResult.success) {
        // Enroll in drip campaign
        await enrollInDripCampaign(contactResult.contactId, formData);

        // Set access cookie
        setAccessCookie();

        // Show success
        setShowSuccess(true);

        // Unlock WRAP tool after 2.5 seconds
        setTimeout(() => {
          onAccessGranted();
        }, 2500);

      } else {
        throw new Error(contactResult.error || 'Failed to create contact');
      }

    } catch (error) {
      setError((error as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof LeadFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setError('');
    setShowSuccess(false);
  };

  // Don't render if access is already granted
  if (hasValidAccess()) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 backdrop-blur-sm flex items-center justify-center z-50 p-5">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-br from-blue-800 to-blue-900 text-white p-8 text-center rounded-t-xl">
          <div className="mb-5">
            <div className="text-2xl font-bold text-white">Metro Point Technology</div>
          </div>
          <h2 className="text-2xl font-bold mb-2">Access Your Professional WRAP Proposal Generator</h2>
          <p className="text-blue-100">Create beautiful insurance proposals in minutes. Built by agents, for agents.</p>
        </div>

        {showSuccess ? (
          <div className="p-10 text-center">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-5 text-white text-2xl font-bold">
              ✓
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Welcome to WRAP Proposal Generator!</h3>
            <p className="text-gray-600">Your access has been activated. Loading your professional proposal tool...</p>
          </div>
        ) : error ? (
          <div className="p-10 text-center">
            <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-5 text-white text-xl font-bold">
              ⚠
            </div>
            <h4 className="text-xl font-semibold text-gray-900 mb-4">Something went wrong</h4>
            <p className="text-gray-600 mb-5" dangerouslySetInnerHTML={{ __html: error }}></p>
            <button
              onClick={resetForm}
              className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : (
          <div className="p-8">
            {/* Benefits */}
            <div className="mb-8 bg-gray-50 rounded-lg p-5">
              <div className="flex items-center mb-3">
                <span className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-sm mr-3">⚡</span>
                <span className="text-gray-800">10-minute proposals instead of 2 hours</span>
              </div>
              <div className="flex items-center mb-3">
                <span className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-sm mr-3">🏢</span>
                <span className="text-gray-800">Professional Word documents with your branding</span>
              </div>
              <div className="flex items-center">
                <span className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-sm mr-3">💰</span>
                <span className="text-gray-800">10 coverage types with automatic calculations</span>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="flex gap-4">
                <div className="flex-1">
                  <label htmlFor="firstName" className="block text-sm font-semibold text-gray-700 mb-2">
                    First Name *
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    required
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none text-base"
                  />
                </div>
                <div className="flex-1">
                  <label htmlFor="lastName" className="block text-sm font-semibold text-gray-700 mb-2">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    required
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none text-base"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  required
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none text-base"
                />
              </div>

              <div>
                <label htmlFor="agencyName" className="block text-sm font-semibold text-gray-700 mb-2">
                  Agency Name *
                </label>
                <input
                  type="text"
                  id="agencyName"
                  required
                  value={formData.agencyName}
                  onChange={(e) => handleInputChange('agencyName', e.target.value)}
                  placeholder="e.g., ABC Insurance Agency"
                  className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none text-base"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="(239) 555-1234"
                  className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none text-base"
                />
              </div>

              <div>
                <label htmlFor="howDidYouFindUs" className="block text-sm font-semibold text-gray-700 mb-2">
                  How did you find us? *
                </label>
                <select
                  id="howDidYouFindUs"
                  required
                  value={formData.howDidYouFindUs}
                  onChange={(e) => handleInputChange('howDidYouFindUs', e.target.value)}
                  className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none text-base cursor-pointer"
                >
                  <option value="">Please select...</option>
                  <option value="Google">Google</option>
                  <option value="Social Media">Social Media</option>
                  <option value="Referral">Referral</option>
                  <option value="Chamber Event">Chamber Event</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-blue-800 to-blue-900 hover:from-blue-900 hover:to-blue-800 text-white font-semibold py-4 px-6 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-base"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <span className="mr-2">Creating your access...</span>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  </span>
                ) : (
                  'Access WRAP Generator'
                )}
              </button>
            </form>

            {/* Footer */}
            <div className="text-center mt-6 pt-5 border-t border-gray-200">
              <p className="font-semibold text-gray-900 mb-2">100% Free to Use • No credit card required • Instant access</p>
              <p className="text-xs text-gray-500 italic">
                Your information is secure and will only be used to provide you with valuable insurance software updates.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}