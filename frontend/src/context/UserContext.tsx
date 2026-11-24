import React, { createContext, useContext, useEffect, useState } from 'react';
import type { UserProfile } from '../types';

interface UserContextType {
  profile: UserProfile;
  updateProfile: (updated: Partial<UserProfile>) => void;
  salutation: string;
  detectedTimezone: string;
  currentTimeFormatted: string;
  currentDateFormatted: string;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Detect system timezone dynamically
  const detectedTimezone =
    typeof Intl !== 'undefined'
      ? Intl.DateTimeFormat().resolvedOptions().timeZone
      : 'UTC';

  const defaultProfile: UserProfile = {
    id: 'usr_current',
    name: 'Jordan',
    email: 'jordan@personal.homingo.ai',
    title: 'Creative Architect & Resident',
    company: 'Rivera Studio',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    timezone: detectedTimezone,
    executiveTone: 'concise',
    vipContacts: ['clinic@metrohealth.org', 'landlord@skylineapts.com', 'family@rivera.net'],
  };

  const [profile, setProfile] = useState<UserProfile>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('homingo_user_profile');
      if (saved) {
        try {
          return { ...defaultProfile, ...JSON.parse(saved) };
        } catch {
          // ignore error
        }
      }
    }
    return defaultProfile;
  });

  const [currentDate, setCurrentDate] = useState(new Date());

  // Update clock every 30 seconds
  useEffect(() => {
    const timer = setInterval(() => setCurrentDate(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);

  const updateProfile = (updated: Partial<UserProfile>) => {
    setProfile((prev) => {
      const next = { ...prev, ...updated };
      localStorage.setItem('homingo_user_profile', JSON.stringify(next));
      return next;
    });
  };

  // Dynamic time-of-day greeting
  const hour = currentDate.getHours();
  const salutation =
    hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const currentTimeFormatted = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(currentDate);

  const currentDateFormatted = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  }).format(currentDate);

  return (
    <UserContext.Provider
      value={{
        profile,
        updateProfile,
        salutation,
        detectedTimezone,
        currentTimeFormatted,
        currentDateFormatted,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
