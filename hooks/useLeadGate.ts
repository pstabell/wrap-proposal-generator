'use client';

import { useState, useEffect } from 'react';

const CONFIG = {
  accessCookieName: 'wrap_access',
};

export function useLeadGate() {
  const [hasAccess, setHasAccess] = useState<boolean | null>(null); // null = checking, boolean = result

  useEffect(() => {
    // Check access on component mount
    const checkAccess = () => {
      if (typeof window === 'undefined') {
        setHasAccess(false);
        return;
      }

      // Check cookie first
      const cookieAccess = getCookie(CONFIG.accessCookieName);
      if (cookieAccess) {
        setHasAccess(true);
        return;
      }

      // Fallback to localStorage with expiry check
      const storageAccess = localStorage.getItem('wrap_access');
      const expiryTime = localStorage.getItem('wrap_access_expires');

      if (storageAccess && expiryTime) {
        const currentTime = Date.now();
        const expiry = parseInt(expiryTime);

        if (currentTime < expiry) {
          // Valid access - refresh cookie
          refreshAccessCookie(storageAccess, expiry);
          setHasAccess(true);
          return;
        } else {
          // Expired - clear
          clearAccess();
        }
      }

      setHasAccess(false);
    };

    checkAccess();
  }, []);

  const getCookie = (name: string): string | null => {
    if (typeof document === 'undefined') return null;
    
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
    return null;
  };

  const refreshAccessCookie = (token: string, expiryTime: number) => {
    if (typeof document === 'undefined') return;
    
    const expiryDate = new Date(expiryTime);
    document.cookie = `${CONFIG.accessCookieName}=${token}; expires=${expiryDate.toUTCString()}; path=/; SameSite=Lax; Secure`;
  };

  const clearAccess = () => {
    if (typeof document === 'undefined') return;
    
    document.cookie = `${CONFIG.accessCookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('wrap_access');
      localStorage.removeItem('wrap_access_expires');
    }
  };

  const grantAccess = () => {
    setHasAccess(true);
  };

  return {
    hasAccess,
    grantAccess,
    isChecking: hasAccess === null
  };
}