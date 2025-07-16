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
    
    // Authentication
    'Check Your Email': '이메일 확인',
    'We\'ve sent a confirmation link to:': '확인 링크를 보냈습니다:',
    'Click the link in your email to activate your account. You may need to check your spam folder.': '계정을 활성화하려면 이메일의 링크를 클릭하세요. 스팸 폴더를 확인해야 할 수도 있습니다.',
    'Back to Sign In': '로그인으로 돌아가기',
    'Create Account': '계정 만들기',
    'Sign In': '로그인',
    'Email': '이메일',
    'Password': '비밀번호',
    'Country (Optional)': '국가 (선택사항)',
    'Creating Account...': '계정 생성 중...',
    'Signing In...': '로그인 중...',
    'Already have an account? Sign in': '이미 계정이 있나요? 로그인',
    'Don\'t have an account? Sign up': '계정이 없나요? 가입하기',
    'Continue as Guest (Coming Soon)': '게스트로 계속 (곧 출시)',
    
    // User Menu
    'Administrator': '관리자',
    'Classroom Student': '교실 학생',
    'Student': '학생',
    'Dashboard': '대시보드',
    'Admin Panel': '관리자 패널',
    'Back to Classroom': '교실로 돌아가기',
    'Reset Demo': '데모 초기화',
    'Logout': '로그아웃',
    
    // Achievements
    'Loading achievements...': '성취를 로딩 중...',
    '← Back to Dashboard': '← 대시보드로 돌아가기',
    'Achievements & Badges': '성취 및 배지',
    'Track your learning progress and earn rewards': '학습 진도를 추적하고 보상을 받으세요',
    'Total XP': '총 XP',
    'Progress to Level': '레벨까지 진도',
    'XP needed': 'XP 필요',
    'Badges': '배지',
    'Recent Achievements': '최근 성취',
    'Statistics': '통계',
    'Badge Collection': '배지 컬렉션',
    '✓ Earned': '✓ 획득',
    'complete': '완료',
    'No achievements yet': '아직 성취가 없습니다',
    'Complete lessons and quizzes to start earning achievements!': '수업과 퀴즈를 완료하여 성취를 시작하세요!',
    'Learning Statistics': '학습 통계',
    'Perfect Scores': '완벽한 점수',
    'Current Streak': '현재 연속',
    'Achievement Progress': '성취 진도',
    'Badges Earned': '획득한 배지',
    'Total Achievements': '총 성취',
    
    // Admin Dashboard
    'Access Denied': '접근 거부',
    'You need administrator privileges to access this page.': '이 페이지에 액세스하려면 관리자 권한이 필요합니다.',
    'Loading admin dashboard...': '관리자 대시보드 로딩 중...',
    'Admin Dashboard': '관리자 대시보드',
    'Hagwon Platform Management': '학원 플랫폼 관리',
    'Student View': '학생 보기',
    'Refresh Data': '데이터 새로고침',
    'Total Users': '총 사용자',
    'Active Users': '활성 사용자',
    'Monthly Revenue': '월 수익',
    'Subscription Overview': '구독 개요',
    'Free Users': '무료 사용자',
    'Supporters ($5/mo)': '서포터 ($5/월)',
    'Sponsors ($25/mo)': '스폰서 ($25/월)',
    'Hardship Approved': '생활고 승인',
    'Pending Hardship Requests': '대기 중인 생활고 요청',
    'Approve': '승인',
    'Deny': '거부',
    'Recent Users': '최근 사용자',
    'lessons completed': '완료된 수업',
    'Joined': '가입일',
    'Top Countries': '상위 국가',
    
    // Dashboard additional
    'Welcome back': '다시 오신 것을 환영합니다',
    'Placed at': '배치된 위치',
    'Your Plan': '학습 계획',
    'Daily Lessons': '일일 수업',
    'remaining today': '오늘 남은 수업',
    'Advanced Analytics': '고급 분석',
    'Certificates': '인증서',
    'Upgrade for Unlimited Access': '무제한 액세스로 업그레이드',
    'Your Progress': '학습 진도',
    'XP Earned': '획득한 XP',
    'Day Streak': '연속 학습일',
    'Last activity': '마지막 활동',
    
    // Lesson page
    'Generating your lesson...': '수업을 생성하는 중...',
    'Creating your quiz...': '퀴즈를 만드는 중...',
    'Something went wrong': '문제가 발생했습니다',
    'Upgrade Now': '지금 업그레이드',
    'Lesson': '수업',
    'Step': '단계',
    'of': '의',
    'Lesson Complete!': '수업 완료!',
    'Congratulations! You\'ve successfully completed the lesson on': '축하합니다! 다음 수업을 성공적으로 완료했습니다:',
    
    // Main page additional
    'Based on your diagnostic test, we\'ve placed you at': '진단 테스트를 바탕으로',
    'level': '수준에 배치했습니다',
    'You can always adjust this later as you progress through your lessons.': '수업을 진행하면서 언제든지 조정할 수 있습니다.',
    
    // Games page
    'Loading games...': '게임을 로딩 중...',
    'Learning Games': '학습 게임',
    'Have fun while learning with interactive mini-games': '상호작용 미니게임으로 재미있게 학습하세요',
    'View Achievements': '성취 보기',
    'Choose Your Game': '게임 선택',
    'Math': '수학',
    'English': '영어',
    'Easy': '쉬움',
    'Medium': '보통',
    'Hard': '어려움',
    'Flashcard Challenge': '플래시카드 챌린지',
    'Test your knowledge with quick-fire flashcard questions': '빠른 플래시카드 문제로 지식을 테스트하세요',
    'Speed Quiz': '스피드 퀴즈',
    'Answer as many questions as possible in 60 seconds': '60초 동안 가능한 한 많은 문제에 답하세요',
    'Memory Match': '기억 매치',
    'Match concepts with their definitions': '개념과 정의를 매치하세요',
    'Word Builder': '단어 생성기',
    'Build words from given letters to improve vocabulary': '주어진 글자로 단어를 만들어 어휘력을 향상시키세요',
    'Time': '시간',
    'Reward': '보상',
    'Start Game': '게임 시작',
    'Coming Soon': '곧 출시',
    'How XP Works': 'XP 작동 방식',
    'Earn XP': 'XP 획득',
    'Complete games and answer questions correctly to earn experience points': '게임을 완료하고 문제에 정확히 답하여 경험치를 얻으세요',
    'Level Up': '레벨업',
    'Accumulate XP to increase your level and unlock new badges': 'XP를 축적하여 레벨을 올리고 새로운 배지를 잠금 해제하세요',
    'Unlock Badges': '배지 잠금 해제',
    'Achieve milestones to earn unique badges and special recognition': '마일스톤을 달성하여 독특한 배지와 특별한 인정을 받으세요',
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