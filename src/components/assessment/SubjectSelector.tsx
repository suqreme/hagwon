'use client';

import React, { useState, useEffect } from 'react';
import { curriculumService } from '@/services/curriculumService';

interface SubjectSelectorProps {
  onSubjectSelected: (subject: string) => void;
  selectedSubject?: string;
}

export default function SubjectSelector({ onSubjectSelected, selectedSubject }: SubjectSelectorProps) {
  const [availableSubjects, setAvailableSubjects] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAvailableSubjects();
  }, []);

  const loadAvailableSubjects = async () => {
    try {
      const subjects = await curriculumService.getAllSubjects();
      setAvailableSubjects(subjects);
    } catch (error) {
      console.error('Failed to load subjects:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const subjectInfo = {
    math: {
      title: 'Mathematics',
      description: 'Numbers, counting, addition, subtraction, and basic geometry',
      icon: '🔢',
      color: 'blue'
    },
    english: {
      title: 'English Language Arts',
      description: 'Reading, writing, phonics, and language skills',
      icon: '📚',
      color: 'green'
    },
    science: {
      title: 'Science',
      description: 'Basic scientific concepts and exploration',
      icon: '🔬',
      color: 'purple'
    },
    social_studies: {
      title: 'Social Studies',
      description: 'History, geography, and community studies',
      icon: '🌍',
      color: 'orange'
    }
  };

  const getColorClasses = (color: string, isSelected: boolean) => {
    const colorMap = {
      blue: {
        border: isSelected ? 'border-blue-500' : 'border-gray-300 hover:border-blue-300',
        bg: isSelected ? 'bg-blue-50' : 'hover:bg-blue-50',
        text: isSelected ? 'text-blue-700' : 'text-gray-700'
      },
      green: {
        border: isSelected ? 'border-green-500' : 'border-gray-300 hover:border-green-300',
        bg: isSelected ? 'bg-green-50' : 'hover:bg-green-50',
        text: isSelected ? 'text-green-700' : 'text-gray-700'
      },
      purple: {
        border: isSelected ? 'border-purple-500' : 'border-gray-300 hover:border-purple-300',
        bg: isSelected ? 'bg-purple-50' : 'hover:bg-purple-50',
        text: isSelected ? 'text-purple-700' : 'text-gray-700'
      },
      orange: {
        border: isSelected ? 'border-orange-500' : 'border-gray-300 hover:border-orange-300',
        bg: isSelected ? 'bg-orange-50' : 'hover:bg-orange-50',
        text: isSelected ? 'text-orange-700' : 'text-gray-700'
      }
    };

    return colorMap[color as keyof typeof colorMap] || colorMap.blue;
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-center">Choose Your Subject</h2>
      
      <div className="mb-6">
        <p className="text-gray-600 text-center mb-4">
          What would you like to learn today? You can always switch subjects later.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {availableSubjects.map((subject) => {
          const info = subjectInfo[subject as keyof typeof subjectInfo];
          if (!info) return null;

          const isSelected = selectedSubject === subject;
          const colorClasses = getColorClasses(info.color, isSelected);

          return (
            <button
              key={subject}
              onClick={() => onSubjectSelected(subject)}
              className={`
                p-6 rounded-lg border-2 transition-all duration-200 text-left
                ${colorClasses.border} ${colorClasses.bg} ${colorClasses.text}
              `}
            >
              <div className="flex items-start space-x-4">
                <div className="text-3xl flex-shrink-0">
                  {info.icon}
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">
                    {info.title}
                  </h3>
                  <p className="text-sm opacity-80">
                    {info.description}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-500">
          Each subject is designed to build strong foundations step by step.
        </p>
      </div>
    </div>
  );
}