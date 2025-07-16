import { StudentProfile } from './profileService';
import { supabase } from '@/lib/supabase';

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

  async startLesson(profileId: string, subject: string, grade: string, topic: string, subtopic: string): Promise<string> {
    const lessonId = this.generateId();
    
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

    // Try to save to Supabase first
    if (supabase) {
      try {
        const { error } = await supabase
          .from('user_progress')
          .insert({
            user_id: profileId,
            subject,
            grade_level: grade,
            topic,
            subtopic,
            status: 'in_progress',
            attempts: 1
          });
        
        if (error) {
          console.error('Error saving to Supabase:', error);
        }
      } catch (error) {
        console.error('Supabase connection error:', error);
      }
    }

    // Also save to localStorage as fallback
    const data = this.getStorageData();
    const progressKey = `${profileId}_progress`;
    if (!data[progressKey]) {
      data[progressKey] = {};
    }
    data[progressKey][lessonId] = lessonProgress;
    this.setStorageData(data);
    
    return lessonId;
  }

  async updateLessonProgress(lessonId: string, updates: Partial<LessonProgress>): Promise<void> {
    const data = this.getStorageData();
    
    // Find lesson in all profiles and update in Supabase
    for (const key in data) {
      if (key.endsWith('_progress') && data[key][lessonId]) {
        const lesson = data[key][lessonId];
        const updatedLesson = {
          ...lesson,
          ...updates,
          lastAccessedAt: new Date().toISOString()
        };
        
        // Update in Supabase
        if (supabase) {
          try {
            const { error } = await supabase
              .from('user_progress')
              .update({
                status: updates.status || lesson.status,
                score: updates.score || lesson.score,
                attempts: updates.attempts || lesson.attempts,
                completed_at: updates.status === 'completed' ? new Date().toISOString() : null
              })
              .eq('user_id', lesson.profileId)
              .eq('subject', lesson.subject)
              .eq('grade_level', lesson.grade)
              .eq('topic', lesson.topic)
              .eq('subtopic', lesson.subtopic);
            
            if (error) {
              console.error('Error updating lesson progress in Supabase:', error);
            }
          } catch (error) {
            console.error('Supabase connection error:', error);
          }
        }
        
        // Update localStorage
        data[key][lessonId] = updatedLesson;
        this.setStorageData(data);
        return;
      }
    }
  }

  async completeLesson(lessonId: string, score?: number): Promise<void> {
    await this.updateLessonProgress(lessonId, {
      status: 'completed',
      score,
      completedAt: new Date().toISOString()
    });
  }

  async recordQuizResult(profileId: string, lessonId: string, result: Omit<QuizResult, 'id' | 'profileId' | 'lessonId' | 'completedAt'>): Promise<void> {
    const quizId = this.generateId();
    
    const quizResult: QuizResult = {
      id: quizId,
      profileId,
      lessonId,
      ...result,
      completedAt: new Date().toISOString()
    };

    // Try to save to Supabase first
    if (supabase) {
      try {
        const { error } = await supabase
          .from('quiz_results')
          .insert({
            user_id: profileId,
            lesson_id: lessonId,
            score: result.score,
            total_questions: result.totalQuestions,
            answers: result.answers,
            passed: result.score >= 70
          });
        
        if (error) {
          console.error('Error saving quiz result to Supabase:', error);
        }
      } catch (error) {
        console.error('Supabase connection error:', error);
      }
    }

    // Also save to localStorage as fallback
    const data = this.getStorageData();
    const quizKey = `${profileId}_quizzes`;
    if (!data[quizKey]) {
      data[quizKey] = {};
    }
    data[quizKey][quizId] = quizResult;
    this.setStorageData(data);

    // Update lesson progress based on quiz result
    const passed = result.score >= 70; // 70% passing score
    if (passed) {
      await this.completeLesson(lessonId, result.score);
    }
  }

  async getProgressStats(profileId: string): Promise<ProgressStats> {
    // Try to load from Supabase first
    if (supabase) {
      try {
        const [progressData, quizData] = await Promise.all([
          supabase
            .from('user_progress')
            .select('*')
            .eq('user_id', profileId),
          supabase
            .from('quiz_results')
            .select('*')
            .eq('user_id', profileId)
        ]);
        
        if (progressData.data && quizData.data) {
          return this.calculateStatsFromSupabase(progressData.data, quizData.data);
        }
      } catch (error) {
        console.error('Error loading progress from Supabase:', error);
      }
    }
    
    // Fallback to localStorage calculation
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

  private calculateStatsFromSupabase(progressData: any[], quizData: any[]): ProgressStats {
    const completedLessons = progressData.filter(p => p.status === 'completed');
    const passedQuizzes = quizData.filter(q => q.passed);
    
    // Calculate subject progress
    const subjectProgress: Record<string, any> = {};
    completedLessons.forEach(lesson => {
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
    
    // Calculate streaks (simplified)
    const currentStreak = Math.min(passedQuizzes.length, 5);
    const longestStreak = passedQuizzes.length;
    
    return {
      totalLessonsCompleted: completedLessons.length,
      totalQuizzesPassed: passedQuizzes.length,
      currentStreak,
      longestStreak,
      averageScore: passedQuizzes.length > 0 
        ? passedQuizzes.reduce((sum: number, quiz: any) => sum + quiz.score, 0) / passedQuizzes.length
        : 0,
      totalTimeSpent: 0,
      subjectProgress: Object.fromEntries(
        Object.entries(subjectProgress).map(([key, value]: [string, any]) => [
          key,
          {
            ...value,
            topicsCompleted: Array.from(value.topicsCompleted)
          }
        ])
      ),
      lastActivity: new Date().toISOString()
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