'use client';

import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';

interface LessonContentProps {
  content: string;
  onComplete: () => void;
  isOffline: boolean;
}

export default function LessonContent({ content, onComplete, isOffline }: LessonContentProps) {
  const [currentSection, setCurrentSection] = useState(0);
  const [isRead, setIsRead] = useState(false);
  const [readingTime, setReadingTime] = useState(0);

  useEffect(() => {
    // Start reading timer
    const timer = setInterval(() => {
      setReadingTime(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Auto-mark as read after minimum time
    if (readingTime >= 30) { // 30 seconds minimum
      setIsRead(true);
    }
  }, [readingTime]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleMarkAsRead = () => {
    setIsRead(true);
  };

  const handleTakeQuiz = () => {
    onComplete();
  };

  const sections = content.split('\n## ').filter(section => section.trim());
  const currentSectionContent = sections[currentSection] || content;

  return (
    <div className="bg-white rounded-lg shadow-sm">
      {/* Reading Progress */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-500">
              Reading time: {formatTime(readingTime)}
            </div>
            {isOffline && (
              <div className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs">
                Offline Mode
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            {sections.length > 1 && (
              <div className="text-sm text-gray-500">
                Section {currentSection + 1} of {sections.length}
              </div>
            )}
            
            {!isRead && readingTime >= 30 && (
              <button
                onClick={handleMarkAsRead}
                className="text-blue-500 hover:text-blue-600 text-sm"
              >
                Mark as Read
              </button>
            )}
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ 
              width: `${Math.min((readingTime / 180) * 100, 100)}%` // 3 minutes = 100%
            }}
          />
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="prose max-w-none">
          <ReactMarkdown
            components={{
              h1: ({ children }) => (
                <h1 className="text-3xl font-bold text-gray-800 mb-4">{children}</h1>
              ),
              h2: ({ children }) => (
                <h2 className="text-2xl font-semibold text-gray-700 mb-3 mt-6">{children}</h2>
              ),
              h3: ({ children }) => (
                <h3 className="text-xl font-medium text-gray-700 mb-2 mt-4">{children}</h3>
              ),
              p: ({ children }) => (
                <p className="text-gray-600 mb-4 leading-relaxed">{children}</p>
              ),
              ul: ({ children }) => (
                <ul className="list-disc list-inside text-gray-600 mb-4 space-y-2">{children}</ul>
              ),
              ol: ({ children }) => (
                <ol className="list-decimal list-inside text-gray-600 mb-4 space-y-2">{children}</ol>
              ),
              strong: ({ children }) => (
                <strong className="font-semibold text-gray-800">{children}</strong>
              ),
              em: ({ children }) => (
                <em className="italic text-gray-700">{children}</em>
              ),
              blockquote: ({ children }) => (
                <blockquote className="border-l-4 border-blue-500 pl-4 italic text-gray-600 mb-4">
                  {children}
                </blockquote>
              )
            }}
          >
            {currentSectionContent}
          </ReactMarkdown>
        </div>
      </div>

      {/* Navigation */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex justify-between items-center">
          <div className="flex space-x-2">
            {sections.length > 1 && currentSection > 0 && (
              <button
                onClick={() => setCurrentSection(prev => prev - 1)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                ← Previous Section
              </button>
            )}
            
            {sections.length > 1 && currentSection < sections.length - 1 && (
              <button
                onClick={() => setCurrentSection(prev => prev + 1)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Next Section →
              </button>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {!isRead && readingTime < 30 && (
              <div className="text-sm text-gray-500">
                Please read for at least 30 seconds
              </div>
            )}
            
            <button
              onClick={handleTakeQuiz}
              disabled={!isRead && readingTime < 30}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                isRead || readingTime >= 30
                  ? 'bg-green-500 text-white hover:bg-green-600'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Take Quiz
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}