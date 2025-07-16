'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { curriculumService } from '@/services/curriculumService';
import { progressService } from '@/services/progressService';
import { useProfile } from '@/contexts/ProfileContext';
import { useOffline } from '@/contexts/OfflineContext';
import LessonContent from './LessonContent';
import QuizComponent from './QuizComponent';
import LessonNavigation from './LessonNavigation';

interface LessonPageProps {
  subject: string;
  grade: string;
  topic: string;
  subtopic: string;
}

export default function LessonPage({ subject, grade, topic, subtopic }: LessonPageProps) {
  const router = useRouter();
  const { currentProfile } = useProfile();
  const { isOnline } = useOffline();
  
  const [subtopicData, setSubtopicData] = useState<any>(null);
  const [lessonContent, setLessonContent] = useState<string>('');
  const [currentLessonId, setCurrentLessonId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lessonStep, setLessonStep] = useState<'lesson' | 'quiz' | 'completed'>('lesson');
  const [lessonStartTime, setLessonStartTime] = useState<number>(Date.now());
  const [quizData, setQuizData] = useState<any>(null);
  const [canProceed, setCanProceed] = useState(false);

  useEffect(() => {
    if (currentProfile) {
      loadLesson();
    }
  }, [subject, grade, topic, subtopic, currentProfile]);

  const loadLesson = async () => {
    if (!currentProfile) return;

    try {
      setIsLoading(true);
      setError(null);

      // Get subtopic data from curriculum
      const data = await curriculumService.getSubtopicData(subject, grade, topic, subtopic);
      if (!data) {
        setError('Lesson not found');
        return;
      }

      setSubtopicData(data);

      // Check prerequisites
      const completedLessons = progressService.getCompletedLessons(currentProfile.id, subject, grade);
      const hasPrerequisites = await curriculumService.validatePrerequisites(
        subject, grade, topic, subtopic, completedLessons
      );

      if (!hasPrerequisites) {
        setError('You need to complete previous lessons first');
        return;
      }

      // Start lesson tracking
      const lessonId = await progressService.startLesson(currentProfile.id, subject, grade, topic, subtopic);
      setCurrentLessonId(lessonId);
      setLessonStartTime(Date.now());

      // Generate lesson content
      await generateLessonContent(data);

    } catch (error) {
      console.error('Failed to load lesson:', error);
      setError('Failed to load lesson');
    } finally {
      setIsLoading(false);
    }
  };

  const generateLessonContent = async (data: any) => {
    try {
      if (!isOnline) {
        // Offline fallback content
        setLessonContent(generateOfflineContent(data));
        return;
      }

      // Generate AI content
      const prompt = await curriculumService.renderLessonPrompt({
        subject,
        grade,
        topic,
        subtopic
      });

      const response = await fetch('/api/ai/generate-lesson', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          subject,
          grade,
          topic,
          subtopic
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate lesson content');
      }

      const result = await response.json();
      setLessonContent(result.content);

    } catch (error) {
      console.error('Failed to generate lesson content:', error);
      // Fallback to offline content
      setLessonContent(generateOfflineContent(data));
    }
  };

  const generateOfflineContent = (data: any): string => {
    return `
# ${data.title}

## What You'll Learn
${data.learning_objective}

## Let's Start!

Today we're going to learn about **${subtopic.replace('_', ' ')}** in ${subject}.

This lesson should take about **${data.estimated_duration}**.

### Key Points:
- This is an important topic in ${subject}
- We'll practice step by step
- Don't worry if it seems hard at first
- You can always go back and review

### Ready to Begin?
Let's start with the basics and work our way up. Remember, learning takes time and practice!

*Note: You're currently offline. This is a simplified version of the lesson. Connect to the internet for the full AI-powered experience.*
    `;
  };

  const handleLessonComplete = async () => {
    if (!currentLessonId) return;
    
    const timeSpent = Math.floor((Date.now() - lessonStartTime) / 1000);
    await progressService.updateLessonProgress(currentLessonId, {
      timeSpent,
      status: 'in_progress'
    });
    
    setLessonStep('quiz');
    generateQuiz();
  };

  const generateQuiz = async () => {
    try {
      if (!isOnline) {
        // Offline fallback quiz
        setQuizData(generateOfflineQuiz());
        return;
      }

      const prompt = await curriculumService.renderQuizPrompt({
        subject,
        grade,
        topic,
        subtopic
      });

      const response = await fetch('/api/ai/generate-quiz', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          subject,
          grade,
          topic,
          subtopic
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate quiz');
      }

      const result = await response.json();
      setQuizData(result.quiz);

    } catch (error) {
      console.error('Failed to generate quiz:', error);
      setQuizData(generateOfflineQuiz());
    }
  };

  const generateOfflineQuiz = () => {
    // Simple fallback quiz based on subject
    const mathQuiz = {
      questions: [
        {
          id: 1,
          question: "What did you learn in this lesson?",
          type: "multiple_choice",
          options: ["Important concepts", "Nothing", "Just basics", "Too hard"],
          correct_answer: 0,
          explanation: "Great! You learned important concepts about " + subtopic.replace('_', ' '),
          points: 1,
          difficulty: "beginner"
        },
        {
          id: 2,
          question: "Do you feel ready to practice more?",
          type: "multiple_choice",
          options: ["Yes, I'm ready!", "I need more practice", "Maybe later", "I'm not sure"],
          correct_answer: 0,
          explanation: "Excellent attitude! Practice makes perfect.",
          points: 1,
          difficulty: "beginner"
        }
      ],
      total_points: 2,
      passing_score: 1,
      time_estimate: "2-3 minutes"
    };

    return mathQuiz;
  };

  const handleQuizComplete = async (results: any) => {
    if (!currentProfile || !currentLessonId) return;

    const timeSpent = Math.floor((Date.now() - lessonStartTime) / 1000);
    
    // Record quiz results
    await progressService.recordQuizResult(currentProfile.id, currentLessonId, {
      score: results.score,
      totalQuestions: results.totalQuestions,
      correctAnswers: results.correctAnswers,
      timeSpent: results.timeSpent,
      answers: results.answers
    });

    // Update lesson progress
    await progressService.updateLessonProgress(currentLessonId, {
      timeSpent,
      status: results.passed ? 'completed' : 'in_progress',
      score: results.score
    });

    if (results.passed) {
      setLessonStep('completed');
      setCanProceed(true);
    } else {
      // Allow retry
      setLessonStep('lesson');
    }
  };

  const handleNextLesson = async () => {
    const nextLesson = await curriculumService.getNextSubtopic(subject, grade, topic, subtopic);
    if (nextLesson) {
      router.push(`/lesson/${subject}/${grade}/${nextLesson.topic}/${nextLesson.subtopic}`);
    } else {
      router.push('/dashboard');
    }
  };

  const handleRetryLesson = () => {
    setLessonStep('lesson');
    setLessonStartTime(Date.now());
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your lesson...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Oops!</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                {subtopicData?.title || subtopic.replace('_', ' ')}
              </h1>
              <p className="text-gray-600">
                {subject} • {grade.replace('_', ' ')} • {topic.replace('_', ' ')}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">
                Estimated time: {subtopicData?.estimated_duration || '15-20 minutes'}
              </p>
              <p className="text-sm text-gray-500">
                Difficulty: {subtopicData?.difficulty || 'beginner'}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        {lessonStep === 'lesson' && (
          <LessonContent
            content={lessonContent}
            onComplete={handleLessonComplete}
            isOffline={!isOnline}
          />
        )}

        {lessonStep === 'quiz' && quizData && (
          <QuizComponent
            quiz={quizData}
            onComplete={handleQuizComplete}
            isOffline={!isOnline}
          />
        )}

        {lessonStep === 'completed' && (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="text-green-500 text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Congratulations!
            </h2>
            <p className="text-gray-600 mb-6">
              You've completed the lesson on {subtopicData?.title}
            </p>
            
            <div className="flex gap-4 justify-center">
              <button
                onClick={handleRetryLesson}
                className="px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Review Lesson
              </button>
              <button
                onClick={handleNextLesson}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Next Lesson
              </button>
            </div>
          </div>
        )}

        {/* Navigation */}
        <LessonNavigation
          subject={subject}
          grade={grade}
          topic={topic}
          subtopic={subtopic}
          canProceed={canProceed}
          onNext={handleNextLesson}
        />
      </div>
    </div>
  );
}