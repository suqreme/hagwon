'use client';

import React, { useState, useEffect } from 'react';
import { offlineCacheService } from '@/services/offlineCacheService';

export default function OfflineIndicator() {
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
    const interval = setInterval(updateCacheStatus, 30000); // Every 30 seconds

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
      clearInterval(interval);
    };
  }, []);

  if (!cacheStatus) return null;

  const { stats, supportLevel } = cacheStatus;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className={`
        px-3 py-2 rounded-lg shadow-lg text-sm font-medium
        ${isOnline 
          ? 'bg-green-500 text-white' 
          : 'bg-orange-500 text-white'
        }
      `}>
        <div className="flex items-center space-x-2">
          <div className={`
            w-2 h-2 rounded-full
            ${isOnline ? 'bg-green-200' : 'bg-orange-200'}
          `} />
          <span>
            {isOnline ? 'Online' : 'Offline'}
          </span>
        </div>
        
        {!isOnline && supportLevel !== 'none' && (
          <div className="mt-1 text-xs opacity-90">
            {stats?.lessonCount || 0} lessons cached
          </div>
        )}
        
        {!isOnline && supportLevel === 'none' && (
          <div className="mt-1 text-xs opacity-90">
            Limited offline support
          </div>
        )}
      </div>
    </div>
  );
}