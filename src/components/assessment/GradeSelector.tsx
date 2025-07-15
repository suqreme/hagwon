'use client';

import React, { useState, useEffect } from 'react';
import { curriculumService } from '@/services/curriculumService';
import { useProfile } from '@/contexts/ProfileContext';

interface GradeSelectorProps {
  onGradeSelected: (grade: string, subject: string) => void;
  selectedSubject?: string;
}

export default function GradeSelector({ onGradeSelected, selectedSubject = 'math' }: GradeSelectorProps) {
  const { currentProfile } = useProfile();
  const [availableGrades, setAvailableGrades] = useState<string[]>([]);
  const [selectedGrade, setSelectedGrade] = useState<string>('');
  const [showDiagnostic, setShowDiagnostic] = useState(false);
  const [diagnosticQuestions, setDiagnosticQuestions] = useState<any[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [diagnosticResult, setDiagnosticResult] = useState<string | null>(null);

  useEffect(() => {
    loadAvailableGrades();
  }, []);

  const loadAvailableGrades = async () => {
    try {
      const grades = await curriculumService.getAllGrades();
      setAvailableGrades(grades);
    } catch (error) {
      console.error('Failed to load grades:', error);
    }
  };

  const gradeLabels: Record<string, string> = {
    'kindergarten': 'Kindergarten',
    'grade_1': 'Grade 1',
    'grade_2': 'Grade 2',
    'grade_3': 'Grade 3',
    'grade_4': 'Grade 4',
    'grade_5': 'Grade 5'
  };

  const handleGradeClick = (grade: string) => {
    setSelectedGrade(grade);
    
    // For kindergarten and grade 1, skip diagnostic
    if (grade === 'kindergarten' || grade === 'grade_1') {
      onGradeSelected(grade, selectedSubject);
      return;
    }
    
    // For higher grades, offer diagnostic option
    setShowDiagnostic(true);
  };

  const startDiagnostic = async () => {
    setIsLoading(true);
    try {
      // Generate diagnostic questions based on grade below selected
      const questions = await generateDiagnosticQuestions(selectedGrade, selectedSubject);
      setDiagnosticQuestions(questions);
      setCurrentQuestion(0);
      setAnswers({});
    } catch (error) {
      console.error('Failed to generate diagnostic questions:', error);
      // Fallback to selected grade
      onGradeSelected(selectedGrade, selectedSubject);
    } finally {
      setIsLoading(false);
    }
  };

  const generateDiagnosticQuestions = async (targetGrade: string, subject: string): Promise<any[]> => {
    // For demo purposes, return sample questions
    // In production, this would use AI to generate grade-appropriate questions
    
    const sampleQuestions = {
      math: {
        grade_2: [
          {
            question: "What is 5 + 3?",
            options: ["6", "7", "8", "9"],
            correct: 2,
            grade_level: "grade_1"
          },
          {
            question: "Count: How many fingers do you have?",
            options: ["8", "9", "10", "11"],
            correct: 2,
            grade_level: "kindergarten"
          }
        ],
        grade_3: [
          {
            question: "What is 12 + 8?",
            options: ["18", "19", "20", "21"],
            correct: 2,
            grade_level: "grade_2"
          },
          {
            question: "What is 4 + 6?",
            options: ["9", "10", "11", "12"],
            correct: 1,
            grade_level: "grade_1"
          }
        ]
      },
      english: {
        grade_2: [
          {
            question: "Which word rhymes with 'cat'?",
            options: ["dog", "bat", "car", "big"],
            correct: 1,
            grade_level: "grade_1"
          },
          {
            question: "What sound does the letter 'B' make?",
            options: ["buh", "bee", "bay", "boo"],
            correct: 0,
            grade_level: "kindergarten"
          }
        ],
        grade_3: [
          {
            question: "Complete the sentence: 'The dog is ___.'",
            options: ["run", "running", "ran", "runs"],
            correct: 1,
            grade_level: "grade_2"
          },
          {
            question: "Which is a sight word?",
            options: ["elephant", "the", "beautiful", "fantastic"],
            correct: 1,
            grade_level: "grade_1"
          }
        ]
      }
    };

    return sampleQuestions[subject as keyof typeof sampleQuestions]?.[targetGrade as keyof typeof sampleQuestions['math']] || [];
  };

  const handleAnswer = (optionIndex: number) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestion]: optionIndex
    }));

    if (currentQuestion < diagnosticQuestions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      // Calculate result
      calculateDiagnosticResult();
    }
  };

  const calculateDiagnosticResult = () => {
    let correctCount = 0;
    diagnosticQuestions.forEach((question, index) => {
      if (answers[index] === question.correct) {
        correctCount++;
      }
    });

    const percentage = (correctCount / diagnosticQuestions.length) * 100;
    
    let recommendedGrade = selectedGrade;
    if (percentage < 50) {
      // Recommend lower grade
      const gradeIndex = availableGrades.indexOf(selectedGrade);
      if (gradeIndex > 0) {
        recommendedGrade = availableGrades[gradeIndex - 1];
      }
    } else if (percentage < 70) {
      // Recommend one grade lower
      const gradeIndex = availableGrades.indexOf(selectedGrade);
      if (gradeIndex > 0) {
        recommendedGrade = availableGrades[gradeIndex - 1];
      }
    }

    setDiagnosticResult(recommendedGrade);
  };

  const acceptDiagnosticResult = () => {
    if (diagnosticResult) {
      onGradeSelected(diagnosticResult, selectedSubject);
    }
  };

  const skipDiagnostic = () => {
    onGradeSelected(selectedGrade, selectedSubject);
  };

  if (showDiagnostic && !diagnosticQuestions.length && !isLoading) {
    return (
      <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-4 text-center">Placement Assessment</h2>
        <p className="text-gray-600 mb-6 text-center">
          You selected {gradeLabels[selectedGrade]}. Would you like to take a quick assessment to make sure this is the right level for you?
        </p>
        
        <div className="space-y-4">
          <button
            onClick={startDiagnostic}
            disabled={isLoading}
            className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Preparing Assessment...' : 'Take Assessment (2 minutes)'}
          </button>
          
          <button
            onClick={skipDiagnostic}
            className="w-full bg-gray-300 text-gray-700 py-3 px-4 rounded-lg font-semibold hover:bg-gray-400"
          >
            Skip - I'm confident in my choice
          </button>
        </div>
      </div>
    );
  }

  if (diagnosticQuestions.length > 0 && !diagnosticResult) {
    const question = diagnosticQuestions[currentQuestion];
    const progress = ((currentQuestion + 1) / diagnosticQuestions.length) * 100;

    return (
      <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-xl font-bold">Quick Assessment</h2>
            <span className="text-sm text-gray-500">
              {currentQuestion + 1} of {diagnosticQuestions.length}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4">{question.question}</h3>
          <div className="space-y-2">
            {question.options.map((option: string, index: number) => (
              <button
                key={index}
                onClick={() => handleAnswer(index)}
                className="w-full text-left p-3 rounded-lg border border-gray-300 hover:bg-blue-50 hover:border-blue-500 transition-colors"
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (diagnosticResult) {
    return (
      <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-4 text-center">Assessment Complete!</h2>
        
        <div className="text-center mb-6">
          <p className="text-gray-600 mb-4">
            Based on your answers, we recommend starting with:
          </p>
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-xl font-bold text-blue-800">
              {gradeLabels[diagnosticResult]}
            </h3>
            <p className="text-sm text-blue-600 mt-1">
              {diagnosticResult === selectedGrade 
                ? 'Great choice! This matches your selection.'
                : 'This will help ensure you have a strong foundation.'
              }
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <button
            onClick={acceptDiagnosticResult}
            className="w-full bg-green-500 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-600"
          >
            Start with {gradeLabels[diagnosticResult]}
          </button>
          
          <button
            onClick={skipDiagnostic}
            className="w-full bg-gray-300 text-gray-700 py-3 px-4 rounded-lg font-semibold hover:bg-gray-400"
          >
            Continue with {gradeLabels[selectedGrade]}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-center">Select Your Grade Level</h2>
      
      <div className="mb-6">
        <p className="text-gray-600 text-center mb-4">
          Hello {currentProfile?.name}! Let's find the right starting point for your {selectedSubject} learning journey.
        </p>
        <p className="text-sm text-gray-500 text-center">
          Don't worry - you can always adjust this later!
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {availableGrades.map((grade) => (
          <button
            key={grade}
            onClick={() => handleGradeClick(grade)}
            className={`
              p-4 rounded-lg border-2 transition-all duration-200
              ${selectedGrade === grade
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-300 hover:border-blue-300 hover:bg-blue-50'
              }
            `}
          >
            <div className="text-center">
              <div className="text-lg font-semibold">
                {gradeLabels[grade]}
              </div>
              <div className="text-sm text-gray-500 mt-1">
                {grade === 'kindergarten' && 'Ages 4-5'}
                {grade === 'grade_1' && 'Ages 5-6'}
                {grade === 'grade_2' && 'Ages 6-7'}
                {grade === 'grade_3' && 'Ages 7-8'}
                {grade === 'grade_4' && 'Ages 8-9'}
                {grade === 'grade_5' && 'Ages 9-10'}
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-500">
          For grades 2 and above, you'll have the option to take a quick assessment to confirm your level.
        </p>
      </div>
    </div>
  );
}