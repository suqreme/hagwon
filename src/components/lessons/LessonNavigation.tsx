'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { curriculumService } from '@/services/curriculumService';
import { progressService } from '@/services/progressService';
import { useProfile } from '@/contexts/ProfileContext';

interface LessonNavigationProps {
  subject: string;
  grade: string;
  topic: string;
  subtopic: string;
  canProceed: boolean;
  onNext: () => void;
}

export default function LessonNavigation({ 
  subject, 
  grade, 
  topic, 
  subtopic, 
  canProceed, 
  onNext 
}: LessonNavigationProps) {
  const router = useRouter();
  const { currentProfile } = useProfile();
  const [previousLesson, setPreviousLesson] = useState<any>(null);
  const [nextLesson, setNextLesson] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (currentProfile) {
      loadNavigationData();
    }
  }, [subject, grade, topic, subtopic, currentProfile]);

  const loadNavigationData = async () => {
    try {
      setIsLoading(true);
      
      // Get curriculum data
      const curriculum = await curriculumService.loadCurriculum(subject, grade);
      const topics = Object.entries(curriculum.topics).sort((a, b) => a[1].order - b[1].order);
      
      // Find current position
      let currentTopicIndex = -1;
      let currentSubtopicIndex = -1;
      
      for (let i = 0; i < topics.length; i++) {
        const [topicKey, topicData] = topics[i];
        if (topicKey === topic) {
          currentTopicIndex = i;
          const subtopics = Object.entries(topicData.subtopics).sort((a, b) => a[1].order - b[1].order);
          for (let j = 0; j < subtopics.length; j++) {
            const [subtopicKey] = subtopics[j];
            if (subtopicKey === subtopic) {
              currentSubtopicIndex = j;
              break;
            }
          }
          break;
        }
      }

      // Find previous lesson
      let prevLesson = null;
      if (currentTopicIndex >= 0 && currentSubtopicIndex >= 0) {
        const currentTopicData = topics[currentTopicIndex][1];
        const currentSubtopics = Object.entries(currentTopicData.subtopics).sort((a, b) => a[1].order - b[1].order);
        
        if (currentSubtopicIndex > 0) {
          // Previous subtopic in same topic
          const [prevSubtopicKey, prevSubtopicData] = currentSubtopics[currentSubtopicIndex - 1];
          prevLesson = {
            topic: topic,
            subtopic: prevSubtopicKey,
            title: prevSubtopicData.title
          };
        } else if (currentTopicIndex > 0) {
          // Last subtopic of previous topic
          const [prevTopicKey, prevTopicData] = topics[currentTopicIndex - 1];
          const prevSubtopics = Object.entries(prevTopicData.subtopics).sort((a, b) => a[1].order - b[1].order);
          if (prevSubtopics.length > 0) {
            const [prevSubtopicKey, prevSubtopicData] = prevSubtopics[prevSubtopics.length - 1];
            prevLesson = {
              topic: prevTopicKey,
              subtopic: prevSubtopicKey,
              title: prevSubtopicData.title
            };
          }
        }
      }

      // Find next lesson
      const nextLessonData = await curriculumService.getNextSubtopic(subject, grade, topic, subtopic);
      if (nextLessonData) {
        const nextSubtopicData = await curriculumService.getSubtopicData(
          subject, grade, nextLessonData.topic, nextLessonData.subtopic
        );
        setNextLesson({
          ...nextLessonData,
          title: nextSubtopicData?.title || nextLessonData.subtopic.replace('_', ' ')
        });
      }

      setPreviousLesson(prevLesson);
      
    } catch (error) {
      console.error('Failed to load navigation data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrevious = () => {
    if (previousLesson) {
      router.push(`/lesson/${subject}/${grade}/${previousLesson.topic}/${previousLesson.subtopic}`);
    }
  };

  const handleNext = () => {
    if (canProceed && nextLesson) {
      onNext();
    }
  };

  const handleBackToDashboard = () => {
    router.push('/dashboard');
  };

  if (isLoading) {
    return (
      <div className="mt-6 p-4 bg-white rounded-lg shadow-sm">
        <div className="animate-pulse flex justify-between">
          <div className="h-10 w-24 bg-gray-200 rounded"></div>
          <div className="h-10 w-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6 space-y-4">
      {/* Main Navigation */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleBackToDashboard}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              ← Dashboard
            </button>
            
            {previousLesson && (
              <button
                onClick={handlePrevious}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                ← Previous
              </button>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {nextLesson && (
              <button
                onClick={handleNext}
                disabled={!canProceed}
                className={`px-4 py-2 rounded-lg ${
                  canProceed
                    ? 'bg-blue-500 text-white hover:bg-blue-600'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Next →
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Lesson Context */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Previous Lesson */}
          <div className="text-center">
            {previousLesson ? (
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-500 mb-1">Previous</div>
                <div className="text-sm font-medium text-gray-700 truncate">
                  {previousLesson.title}
                </div>
              </div>
            ) : (
              <div className="p-3 bg-gray-100 rounded-lg">
                <div className="text-sm text-gray-400">First lesson</div>
              </div>
            )}
          </div>

          {/* Current Lesson */}
          <div className="text-center">
            <div className="p-3 bg-blue-50 rounded-lg border-2 border-blue-200">
              <div className="text-sm text-blue-600 mb-1">Current</div>
              <div className="text-sm font-medium text-blue-800">
                {subtopic.replace('_', ' ')}
              </div>
            </div>
          </div>

          {/* Next Lesson */}
          <div className="text-center">
            {nextLesson ? (
              <div className={`p-3 rounded-lg ${
                canProceed ? 'bg-green-50 border-2 border-green-200' : 'bg-gray-50'
              }`}>
                <div className={`text-sm mb-1 ${
                  canProceed ? 'text-green-600' : 'text-gray-500'
                }`}>
                  Next
                </div>
                <div className={`text-sm font-medium truncate ${
                  canProceed ? 'text-green-800' : 'text-gray-700'
                }`}>
                  {nextLesson.title}
                </div>
              </div>
            ) : (
              <div className="p-3 bg-gray-100 rounded-lg">
                <div className="text-sm text-gray-400">Last lesson</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Progress Hint */}
      {!canProceed && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="text-yellow-600 mr-2">⚠️</div>
            <div className="text-sm text-yellow-800">
              Complete the lesson and pass the quiz to unlock the next lesson.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}