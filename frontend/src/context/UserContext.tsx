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
    id: 'usr_shop_owner',
    name: 'Shop Owner',
    email: 'shop-owner@bhopal.local',
    title: 'Small Shop Owner, Bhopal',
    company: 'My Shop, Bhopal',
    avatarUrl:
      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='50' fill='%234f46e5'/%3E%3Ctext x='50' y='66' font-size='44' font-family='sans-serif' font-weight='700' fill='white' text-anchor='middle'%3ES%3C/text%3E%3C/svg%3E",
    timezone: detectedTimezone,
    executiveTone: 'concise',
    vipContacts: ['Supplier', 'Accountant', 'Online store'],
  };

  const [profile, setProfile] = useState<UserProfile>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('homingo_user_profile_v2');
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
      localStorage.setItem('homingo_user_profile_v2', JSON.stringify(next));
      return next;
    });
  };

  // Dynamic time-of-day greeting
  const hour = currentDate.getHours();
  const salutation =
    hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const currentTimeFormatted = new Intl.DateTimeFormat('en-IN', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(currentDate);

  const currentDateFormatted = new Intl.DateTimeFormat('en-IN', {
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
