'use client';

import React, { useState } from 'react';
import { useProfile } from '@/contexts/ProfileContext';
import { useOffline } from '@/contexts/OfflineContext';
import SubjectSelector from '@/components/assessment/SubjectSelector';
import GradeSelector from '@/components/assessment/GradeSelector';

interface OnboardingFlowProps {
  onComplete: (profile: any) => void;
}

export default function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [selectedGrade, setSelectedGrade] = useState<string>('');
  const { currentProfile, updateProgress } = useProfile();
  const { initializeOfflineMode } = useOffline();

  const steps = [
    'Subject Selection',
    'Grade Selection', 
    'Setup Complete'
  ];

  const handleSubjectSelected = (subject: string) => {
    setSelectedSubject(subject);
    setCurrentStep(1);
  };

  const handleGradeSelected = async (grade: string, subject: string) => {
    setSelectedGrade(grade);
    setSelectedSubject(subject);
    
    // Initialize offline mode for this profile
    if (currentProfile) {
      await initializeOfflineMode(currentProfile.id, [subject], [grade]);
    }
    
    setCurrentStep(2);
  };

  const handleComplete = () => {
    if (currentProfile) {
      // Update profile with selected preferences
      const updatedProfile = {
        ...currentProfile,
        preferences: {
          ...currentProfile.preferences,
          primarySubject: selectedSubject,
          currentGrade: selectedGrade
        }
      };
      
      onComplete(updatedProfile);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <SubjectSelector 
            onSubjectSelected={handleSubjectSelected}
            selectedSubject={selectedSubject}
          />
        );
      case 1:
        return (
          <GradeSelector 
            onGradeSelected={handleGradeSelected}
            selectedSubject={selectedSubject}
          />
        );
      case 2:
        return (
          <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg text-center">
            <div className="mb-6">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-2xl font-bold mb-2">You're All Set!</h2>
              <p className="text-gray-600">
                Ready to start learning {selectedSubject} at {selectedGrade.replace('_', ' ')} level?
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <h3 className="font-semibold mb-2">Your Learning Plan</h3>
              <div className="text-sm text-gray-600 space-y-1">
                <p>📚 Subject: {selectedSubject}</p>
                <p>🎯 Grade: {selectedGrade.replace('_', ' ')}</p>
                <p>👤 Profile: {currentProfile?.name}</p>
              </div>
            </div>

            <button
              onClick={handleComplete}
              className="w-full bg-green-500 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-600 transition-colors"
            >
              Start Learning!
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Progress indicator */}
        <div className="mb-8">
          <div className="flex justify-center items-center space-x-4">
            {steps.map((step, index) => (
              <div key={index} className="flex items-center">
                <div
                  className={`
                    w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold
                    ${index <= currentStep
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-500'
                    }
                  `}
                >
                  {index + 1}
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`
                      w-16 h-1 mx-2
                      ${index < currentStep
                        ? 'bg-blue-500'
                        : 'bg-gray-200'
                      }
                    `}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-center mt-2">
            <span className="text-sm text-gray-500">
              {steps[currentStep]}
            </span>
          </div>
        </div>

        {/* Step content */}
        <div className="mb-8">
          {renderStep()}
        </div>

        {/* Navigation */}
        {currentStep > 0 && currentStep < 2 && (
          <div className="flex justify-center">
            <button
              onClick={() => setCurrentStep(currentStep - 1)}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              ← Go Back
            </button>
          </div>
        )}
      </div>
    </div>
  );
}