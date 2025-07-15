'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { offlineCacheService } from '@/services/offlineCacheService';

interface OfflineContextType {
  isOnline: boolean;
  cacheStatus: any;
  initializeOfflineMode: (profileId: string, subjects?: string[], grades?: string[]) => Promise<void>;
  clearCache: () => void;
  preloadContent: (subject: string, grade: string) => Promise<void>;
}

const OfflineContext = createContext<OfflineContextType | undefined>(undefined);

export const useOffline = () => {
  const context = useContext(OfflineContext);
  if (context === undefined) {
    throw new Error('useOffline must be used within an OfflineProvider');
  }
  return context;
};

interface OfflineProviderProps {
  children: ReactNode;
}

export const OfflineProvider: React.FC<OfflineProviderProps> = ({ children }) => {
  const [isOnline, setIsOnline] = useState(true);
  const [cacheStatus, setCacheStatus] = useState<any>(null);

  useEffect(() => {
    const updateOnlineStatus = () => {
      setIsOnline(navigator.onLine);
    };

    const updateCacheStatus = () => {
      const status = offlineCacheService.getCacheStatus();
      setCacheStatus(status);
    };

    // Initial check
    updateOnlineStatus();
    updateCacheStatus();

    // Listen for online/offline events
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    // Update cache status periodically
    const interval = setInterval(updateCacheStatus, 30000);

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
      clearInterval(interval);
    };
  }, []);

  const initializeOfflineMode = async (profileId: string, subjects?: string[], grades?: string[]) => {
    try {
      await offlineCacheService.initializeOfflineMode(profileId, subjects, grades);
      setCacheStatus(offlineCacheService.getCacheStatus());
    } catch (error) {
      console.error('Failed to initialize offline mode:', error);
    }
  };

  const clearCache = () => {
    offlineCacheService.clearCache();
    setCacheStatus(offlineCacheService.getCacheStatus());
  };

  const preloadContent = async (subject: string, grade: string) => {
    try {
      await offlineCacheService.preloadCurriculum(subject, grade);
      await offlineCacheService.preloadLessonsForGrade(subject, grade, 10);
      setCacheStatus(offlineCacheService.getCacheStatus());
    } catch (error) {
      console.error('Failed to preload content:', error);
    }
  };

  return (
    <OfflineContext.Provider
      value={{
        isOnline,
        cacheStatus,
        initializeOfflineMode,
        clearCache,
        preloadContent
      }}
    >
      {children}
    </OfflineContext.Provider>
  );
};