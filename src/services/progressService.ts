import { StudentProfile } from './profileService';

export interface LessonProgress {
  id: string;
  profileId: string;
  subject: string;
  grade: string;
  topic: string;
  subtopic: string;
  status: 'not_started' | 'in_progress' | 'completed';
  score?: number;
  attempts: number;
  timeSpent: number; // in seconds
  startedAt?: string;
  completedAt?: string;
  lastAccessedAt: string;
}

export interface QuizResult {
  id: string;
  profileId: string;
  lessonId: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  timeSpent: number;
  answers: Array<{
    questionId: string;
    selectedAnswer: number;
    isCorrect: boolean;
    timeSpent: number;
  }>;
  completedAt: string;
}

export interface ProgressStats {
  totalLessonsCompleted: number;
  totalQuizzesPassed: number;
  currentStreak: number;
  longestStreak: number;
  averageScore: number;
  totalTimeSpent: number;
  subjectProgress: Record<string, {
    lessonsCompleted: number;
    quizzesPassed: number;
    averageScore: number;
    topicsCompleted: string[];
  }>;
  lastActivity: string;
}

export interface AchievementBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt: string;
  type: 'lesson' | 'quiz' | 'streak' | 'mastery' | 'time';
}

class ProgressService {
  private storageKey = 'hagwon_progress_data';

  private getStorageData(): Record<string, any> {
    if (typeof window === 'undefined') return {};
    
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.error('Failed to get progress data:', error);
      return {};
    }
  }

  private setStorageData(data: Record<string, any>): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to set progress data:', error);
    }
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  startLesson(profileId: string, subject: string, grade: string, topic: string, subtopic: string): string {
    const data = this.getStorageData();
    const lessonId = this.generateId();
    
    const progressKey = `${profileId}_progress`;
    if (!data[progressKey]) {
      data[progressKey] = {};
    }

    const lessonProgress: LessonProgress = {
      id: lessonId,
      profileId,
      subject,
      grade,
      topic,
      subtopic,
      status: 'in_progress',
      attempts: 1,
      timeSpent: 0,
      startedAt: new Date().toISOString(),
      lastAccessedAt: new Date().toISOString()
    };

    data[progressKey][lessonId] = lessonProgress;
    this.setStorageData(data);
    
    return lessonId;
  }

  updateLessonProgress(lessonId: string, updates: Partial<LessonProgress>): void {
    const data = this.getStorageData();
    
    // Find lesson in all profiles
    for (const key in data) {
      if (key.endsWith('_progress') && data[key][lessonId]) {
        data[key][lessonId] = {
          ...data[key][lessonId],
          ...updates,
          lastAccessedAt: new Date().toISOString()
        };
        this.setStorageData(data);
        return;
      }
    }
  }

  completeLesson(lessonId: string, score?: number): void {
    this.updateLessonProgress(lessonId, {
      status: 'completed',
      score,
      completedAt: new Date().toISOString()
    });
  }

  recordQuizResult(profileId: string, lessonId: string, result: Omit<QuizResult, 'id' | 'profileId' | 'lessonId' | 'completedAt'>): void {
    const data = this.getStorageData();
    const quizId = this.generateId();
    
    const quizKey = `${profileId}_quizzes`;
    if (!data[quizKey]) {
      data[quizKey] = {};
    }

    const quizResult: QuizResult = {
      id: quizId,
      profileId,
      lessonId,
      ...result,
      completedAt: new Date().toISOString()
    };

    data[quizKey][quizId] = quizResult;
    this.setStorageData(data);

    // Update lesson progress based on quiz result
    const passed = result.score >= 70; // 70% passing score
    if (passed) {
      this.completeLesson(lessonId, result.score);
    }
  }

  getProgressStats(profileId: string): ProgressStats {
    const data = this.getStorageData();
    const progressKey = `${profileId}_progress`;
    const quizKey = `${profileId}_quizzes`;
    
    const lessons = data[progressKey] || {};
    const quizzes = data[quizKey] || {};
    
    const completedLessons = Object.values(lessons).filter(
      (lesson: any) => lesson.status === 'completed'
    );
    
    const passedQuizzes = Object.values(quizzes).filter(
      (quiz: any) => quiz.score >= 70
    );

    // Calculate streak
    const currentStreak = this.calculateCurrentStreak(profileId);
    const longestStreak = this.calculateLongestStreak(profileId);

    // Calculate subject progress
    const subjectProgress: Record<string, any> = {};
    completedLessons.forEach((lesson: any) => {
      const subject = lesson.subject;
      if (!subjectProgress[subject]) {
        subjectProgress[subject] = {
          lessonsCompleted: 0,
          quizzesPassed: 0,
          averageScore: 0,
          topicsCompleted: new Set()
        };
      }
      
      subjectProgress[subject].lessonsCompleted++;
      subjectProgress[subject].topicsCompleted.add(lesson.topic);
    });

    passedQuizzes.forEach((quiz: any) => {
      const lesson = Object.values(lessons).find((l: any) => l.id === quiz.lessonId);
      if (lesson) {
        const subject = (lesson as any).subject;
        if (subjectProgress[subject]) {
          subjectProgress[subject].quizzesPassed++;
        }
      }
    });

    // Calculate average scores
    Object.keys(subjectProgress).forEach(subject => {
      const subjectQuizzes = passedQuizzes.filter((quiz: any) => {
        const lesson = Object.values(lessons).find((l: any) => l.id === quiz.lessonId);
        return lesson && (lesson as any).subject === subject;
      });
      
      if (subjectQuizzes.length > 0) {
        const totalScore = subjectQuizzes.reduce((sum: number, quiz: any) => sum + quiz.score, 0);
        subjectProgress[subject].averageScore = totalScore / subjectQuizzes.length;
      }
      
      subjectProgress[subject].topicsCompleted = Array.from(subjectProgress[subject].topicsCompleted);
    });

    const totalTimeSpent = Object.values(lessons).reduce(
      (total: number, lesson: any) => total + (lesson.timeSpent || 0),
      0
    );

    const lastActivity = Math.max(
      ...Object.values(lessons).map((lesson: any) => 
        new Date(lesson.lastAccessedAt).getTime()
      ),
      0
    );

    return {
      totalLessonsCompleted: completedLessons.length,
      totalQuizzesPassed: passedQuizzes.length,
      currentStreak,
      longestStreak,
      averageScore: passedQuizzes.length > 0 
        ? passedQuizzes.reduce((sum: number, quiz: any) => sum + quiz.score, 0) / passedQuizzes.length
        : 0,
      totalTimeSpent,
      subjectProgress,
      lastActivity: lastActivity > 0 ? new Date(lastActivity).toISOString() : new Date().toISOString()
    };
  }

  private calculateCurrentStreak(profileId: string): number {
    const data = this.getStorageData();
    const quizKey = `${profileId}_quizzes`;
    const quizzes = Object.values(data[quizKey] || {}) as QuizResult[];
    
    if (quizzes.length === 0) return 0;
    
    // Sort by completion date (newest first)
    const sortedQuizzes = quizzes.sort((a, b) => 
      new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
    );
    
    let streak = 0;
    for (const quiz of sortedQuizzes) {
      if (quiz.score >= 70) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  }

  private calculateLongestStreak(profileId: string): number {
    const data = this.getStorageData();
    const quizKey = `${profileId}_quizzes`;
    const quizzes = Object.values(data[quizKey] || {}) as QuizResult[];
    
    if (quizzes.length === 0) return 0;
    
    // Sort by completion date (oldest first)
    const sortedQuizzes = quizzes.sort((a, b) => 
      new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime()
    );
    
    let longestStreak = 0;
    let currentStreak = 0;
    
    for (const quiz of sortedQuizzes) {
      if (quiz.score >= 70) {
        currentStreak++;
        longestStreak = Math.max(longestStreak, currentStreak);
      } else {
        currentStreak = 0;
      }
    }
    
    return longestStreak;
  }

  getCompletedLessons(profileId: string, subject?: string, grade?: string): string[] {
    const data = this.getStorageData();
    const progressKey = `${profileId}_progress`;
    const lessons = Object.values(data[progressKey] || {}) as LessonProgress[];
    
    return lessons
      .filter(lesson => {
        const isCompleted = lesson.status === 'completed';
        const subjectMatch = !subject || lesson.subject === subject;
        const gradeMatch = !grade || lesson.grade === grade;
        return isCompleted && subjectMatch && gradeMatch;
      })
      .map(lesson => `${lesson.topic}_${lesson.subtopic}`);
  }

  getUnlockedLessons(profileId: string, subject: string, grade: string): string[] {
    const completed = this.getCompletedLessons(profileId, subject, grade);
    const unlocked = ['numbers_and_counting_counting_to_10']; // Always unlock first lesson
    
    // For now, simple logic - unlock next lesson when previous is completed
    // This should be replaced with curriculum-based prerequisite checking
    const lessonOrder = [
      'numbers_and_counting_counting_to_10',
      'numbers_and_counting_counting_to_20',
      'numbers_and_counting_number_recognition',
      'addition_basic_addition',
      'addition_addition_with_objects',
      'addition_addition_word_problems',
      'subtraction_basic_subtraction',
      'subtraction_subtraction_with_objects',
      'shapes_basic_shapes',
      'shapes_shape_properties'
    ];
    
    lessonOrder.forEach((lesson, index) => {
      if (index > 0 && completed.includes(lessonOrder[index - 1])) {
        unlocked.push(lesson);
      }
    });
    
    return unlocked;
  }

  getInProgressLessons(profileId: string): LessonProgress[] {
    const data = this.getStorageData();
    const progressKey = `${profileId}_progress`;
    const lessons = Object.values(data[progressKey] || {}) as LessonProgress[];
    
    return lessons.filter(lesson => lesson.status === 'in_progress');
  }

  getLessonProgress(lessonId: string): LessonProgress | null {
    const data = this.getStorageData();
    
    for (const key in data) {
      if (key.endsWith('_progress') && data[key][lessonId]) {
        return data[key][lessonId];
      }
    }
    
    return null;
  }

  getQuizHistory(profileId: string, limit: number = 10): QuizResult[] {
    const data = this.getStorageData();
    const quizKey = `${profileId}_quizzes`;
    const quizzes = Object.values(data[quizKey] || {}) as QuizResult[];
    
    return quizzes
      .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())
      .slice(0, limit);
  }

  unlockAchievement(profileId: string, achievement: Omit<AchievementBadge, 'unlockedAt'>): void {
    const data = this.getStorageData();
    const achievementKey = `${profileId}_achievements`;
    
    if (!data[achievementKey]) {
      data[achievementKey] = {};
    }

    const badge: AchievementBadge = {
      ...achievement,
      unlockedAt: new Date().toISOString()
    };

    data[achievementKey][achievement.id] = badge;
    this.setStorageData(data);
  }

  getAchievements(profileId: string): AchievementBadge[] {
    const data = this.getStorageData();
    const achievementKey = `${profileId}_achievements`;
    
    return Object.values(data[achievementKey] || {}) as AchievementBadge[];
  }

  clearProgress(profileId: string): void {
    const data = this.getStorageData();
    const progressKey = `${profileId}_progress`;
    const quizKey = `${profileId}_quizzes`;
    const achievementKey = `${profileId}_achievements`;

    delete data[progressKey];
    delete data[quizKey];
    delete data[achievementKey];
    
    this.setStorageData(data);
  }
}

// Singleton instance
export const progressService = new ProgressService()