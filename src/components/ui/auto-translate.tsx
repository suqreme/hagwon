'use client'

import React, { ReactNode } from 'react'
import { useTranslation } from '@/hooks/useTranslation'

interface AutoTranslateProps {
  children: ReactNode
  variables?: Record<string, string | number>
}

// Simple translation mappings - much lighter than hundreds of keys
const translations: Record<string, Record<string, string>> = {
  ko: {
    // Dashboard
    'Hagwon Dashboard': '학원 대시보드',
    'Welcome back': '다시 오신 것을 환영합니다',
    'Choose Your Subject': '과목 선택',
    'Current Grade Level': '현재 학년',
    'Mathematics': '수학',
    'English Language Arts': '영어',
    'Upgrade': '업그레이드',
    'Games': '게임',
    'Achievements': '성취',
    'Offline Learning': '오프라인 학습',
    'Loading your learning dashboard...': '학습 대시보드를 로딩 중...',
    
    // Grades
    'Kindergarten': '유치원',
    '1st Grade': '1학년',
    '2nd Grade': '2학년',
    '3rd Grade': '3학년',
    '4th Grade': '4학년',
    '5th Grade': '5학년',
    '6th Grade': '6학년',
    '7th Grade': '7학년',
    '8th Grade': '8학년',
    '9th Grade': '9학년',
    '10th Grade': '10학년',
    '11th Grade': '11학년',
    '12th Grade': '12학년',
    
    // Learning Progress
    'Continue Learning': '학습 계속하기',
    'Resume your lesson': '수업 재개',
    'Review Lesson': '수업 복습',
    'Continue Lesson': '수업 계속',
    'Completed': '완료됨',
    'Your Learning Path': '학습 경로',
    'Start Lesson': '수업 시작',
    'Complete': '완료',
    'Complete previous lessons to unlock': '이전 수업을 완료하여 잠금 해제',
    'Level': '레벨',
    'Lessons Completed': '완료한 수업',
    'Quizzes Passed': '통과한 퀴즈',
    'XP Earned': '획득한 XP',
    'Day Streak': '연속 학습일',
    'Your Progress': '학습 진도',
    'Your Plan': '학습 계획',
    'Daily Lessons': '일일 수업',
    'remaining today': '오늘 남은 수업',
    
    // Onboarding
    'Welcome to Hagwon': '학원에 오신 것을 환영합니다',
    'Let\'s find your perfect starting point': '완벽한 시작점을 찾아보겠습니다',
    'Ready to Learn!': '학습 준비 완료!',
    'Start Learning': '학습 시작',
    'Loading...': '로딩 중...',
    
    // Navigation
    'Impact Map': '영향 지도',
    'Our Goals': '우리의 목표',
  },
  es: {
    // Dashboard
    'Hagwon Dashboard': 'Panel de Hagwon',
    'Welcome back': 'Bienvenido de vuelta',
    'Choose Your Subject': 'Elige Tu Materia',
    'Current Grade Level': 'Nivel de Grado Actual',
    'Mathematics': 'Matemáticas',
    'English Language Arts': 'Artes del Lenguaje Inglés',
    'Upgrade': 'Mejorar',
    'Games': 'Juegos',
    'Achievements': 'Logros',
    'Offline Learning': 'Aprendizaje Sin Conexión',
    'Loading your learning dashboard...': 'Cargando tu panel de aprendizaje...',
    
    // Onboarding
    'Welcome to Hagwon': 'Bienvenido a Hagwon',
    'Let\'s find your perfect starting point': 'Encontremos tu punto de partida perfecto',
    'Ready to Learn!': '¡Listo para Aprender!',
    'Start Learning': 'Comenzar a Aprender',
    'Loading...': 'Cargando...',
    
    // Navigation
    'Impact Map': 'Mapa de Impacto',
    'Our Goals': 'Nuestros Objetivos',
  }
}

export function AutoTranslate({ children, variables }: AutoTranslateProps) {
  const { currentLanguage } = useTranslation()
  
  // If English or no translation needed, return as-is
  if (currentLanguage === 'en' || typeof children !== 'string') {
    return <>{children}</>
  }
  
  // Get translation for current language
  const languageTranslations = translations[currentLanguage]
  if (!languageTranslations) {
    return <>{children}</>
  }
  
  // Find translation
  let translatedText = languageTranslations[children as string] || children
  
  // Replace variables if provided
  if (variables && typeof translatedText === 'string') {
    Object.entries(variables).forEach(([key, value]) => {
      translatedText = translatedText.replace(`{${key}}`, String(value))
    })
  }
  
  return <>{translatedText}</>
}

// Shorthand component
export const T = AutoTranslate