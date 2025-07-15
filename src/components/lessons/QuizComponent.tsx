'use client';

import React, { useState, useEffect } from 'react';

interface QuizQuestion {
  id: number;
  question: string;
  type: string;
  options: string[];
  correct_answer: number;
  explanation: string;
  points: number;
  difficulty: string;
}

interface QuizData {
  questions: QuizQuestion[];
  total_points: number;
  passing_score: number;
  time_estimate: string;
}

interface QuizComponentProps {
  quiz: QuizData;
  onComplete: (results: any) => void;
  isOffline: boolean;
}

export default function QuizComponent({ quiz, onComplete, isOffline }: QuizComponentProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState(false);
  const [quizStartTime, setQuizStartTime] = useState(Date.now());
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [timeSpent, setTimeSpent] = useState<Record<number, number>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    setQuestionStartTime(Date.now());
  }, [currentQuestion]);

  const handleAnswer = (optionIndex: number) => {
    const questionTime = Date.now() - questionStartTime;
    
    setTimeSpent(prev => ({
      ...prev,
      [currentQuestion]: questionTime
    }));

    setAnswers(prev => ({
      ...prev,
      [currentQuestion]: optionIndex
    }));
  };

  const handleNext = () => {
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      submitQuiz();
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const submitQuiz = () => {
    setIsSubmitted(true);
    setShowResults(true);
  };

  const calculateResults = () => {
    const totalQuestions = quiz.questions.length;
    let correctAnswers = 0;
    let totalPoints = 0;

    const detailedAnswers = quiz.questions.map((question, index) => {
      const userAnswer = answers[index];
      const isCorrect = userAnswer === question.correct_answer;
      
      if (isCorrect) {
        correctAnswers++;
        totalPoints += question.points;
      }

      return {
        questionId: question.id.toString(),
        selectedAnswer: userAnswer ?? -1,
        isCorrect,
        timeSpent: timeSpent[index] || 0
      };
    });

    const score = Math.round((correctAnswers / totalQuestions) * 100);
    const passed = score >= 70; // 70% passing score
    const totalTimeSpent = Math.floor((Date.now() - quizStartTime) / 1000);

    return {
      score,
      totalQuestions,
      correctAnswers,
      totalPoints,
      passed,
      timeSpent: totalTimeSpent,
      answers: detailedAnswers
    };
  };

  const handleRetry = () => {
    setCurrentQuestion(0);
    setAnswers({});
    setShowResults(false);
    setIsSubmitted(false);
    setQuizStartTime(Date.now());
    setQuestionStartTime(Date.now());
    setTimeSpent({});
  };

  const handleFinish = () => {
    const results = calculateResults();
    onComplete(results);
  };

  const results = showResults ? calculateResults() : null;
  const question = quiz.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / quiz.questions.length) * 100;

  if (showResults && results) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="text-center mb-6">
          <div className={`text-6xl mb-4 ${results.passed ? 'text-green-500' : 'text-red-500'}`}>
            {results.passed ? '🎉' : '😔'}
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            {results.passed ? 'Great Job!' : 'Keep Trying!'}
          </h2>
          <p className="text-gray-600">
            You scored {results.score}% ({results.correctAnswers}/{results.totalQuestions} correct)
          </p>
        </div>

        {/* Results Summary */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">{results.score}%</div>
              <div className="text-sm text-gray-600">Score</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{results.correctAnswers}</div>
              <div className="text-sm text-gray-600">Correct</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">{results.totalQuestions - results.correctAnswers}</div>
              <div className="text-sm text-gray-600">Incorrect</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-600">{Math.floor(results.timeSpent / 60)}m</div>
              <div className="text-sm text-gray-600">Time</div>
            </div>
          </div>
        </div>

        {/* Question Review */}
        <div className="space-y-4 mb-6">
          <h3 className="text-lg font-semibold text-gray-800">Review Your Answers</h3>
          {quiz.questions.map((q, index) => {
            const userAnswer = answers[index];
            const isCorrect = userAnswer === q.correct_answer;
            
            return (
              <div key={q.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-gray-800">
                    {index + 1}. {q.question}
                  </h4>
                  <div className={`text-sm px-2 py-1 rounded ${
                    isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {isCorrect ? 'Correct' : 'Incorrect'}
                  </div>
                </div>
                
                <div className="space-y-1 mb-2">
                  {q.options.map((option, optionIndex) => (
                    <div key={optionIndex} className={`p-2 rounded text-sm ${
                      optionIndex === q.correct_answer 
                        ? 'bg-green-100 text-green-800' 
                        : optionIndex === userAnswer && !isCorrect
                        ? 'bg-red-100 text-red-800'
                        : 'bg-gray-50'
                    }`}>
                      {option}
                      {optionIndex === q.correct_answer && ' ✓'}
                      {optionIndex === userAnswer && !isCorrect && ' ✗'}
                    </div>
                  ))}
                </div>
                
                <div className="text-sm text-gray-600 italic">
                  {q.explanation}
                </div>
              </div>
            );
          })}
        </div>

        {/* Actions */}
        <div className="flex justify-center space-x-4">
          {!results.passed && (
            <button
              onClick={handleRetry}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Try Again
            </button>
          )}
          
          <button
            onClick={handleFinish}
            className={`px-6 py-2 rounded-lg ${
              results.passed 
                ? 'bg-green-500 text-white hover:bg-green-600'
                : 'bg-gray-300 text-gray-600'
            }`}
          >
            {results.passed ? 'Continue' : 'Back to Lesson'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-bold text-gray-800">Quiz Time!</h2>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-500">
              {currentQuestion + 1} of {quiz.questions.length}
            </span>
            {isOffline && (
              <div className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs">
                Offline Mode
              </div>
            )}
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="p-6">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            {question.question}
          </h3>
          
          <div className="space-y-3">
            {question.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswer(index)}
                className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                  answers[currentQuestion] === index
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center">
                  <div className={`w-6 h-6 rounded-full border-2 mr-3 flex items-center justify-center ${
                    answers[currentQuestion] === index
                      ? 'border-blue-500 bg-blue-500'
                      : 'border-gray-300'
                  }`}>
                    {answers[currentQuestion] === index && (
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    )}
                  </div>
                  <span className="text-gray-700">{option}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex justify-between items-center">
          <button
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
            className={`px-4 py-2 rounded-lg ${
              currentQuestion === 0
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Previous
          </button>

          <div className="text-sm text-gray-500">
            {answers[currentQuestion] !== undefined ? 'Answer selected' : 'Select an answer'}
          </div>

          <button
            onClick={handleNext}
            disabled={answers[currentQuestion] === undefined}
            className={`px-4 py-2 rounded-lg ${
              answers[currentQuestion] !== undefined
                ? 'bg-blue-500 text-white hover:bg-blue-600'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {currentQuestion === quiz.questions.length - 1 ? 'Submit' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
}