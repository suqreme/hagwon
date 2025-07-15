interface CachedLesson {
  id: string;
  subject: string;
  grade: string;
  topic: string;
  subtopic: string;
  content: string;
  quiz: any;
  timestamp: number;
  size: number;
}

interface CachedCurriculum {
  subject: string;
  grade: string;
  data: any;
  timestamp: number;
  size: number;
}

interface CacheStats {
  totalSize: number;
  lessonCount: number;
  curriculumCount: number;
  lastUpdated: number;
}

class OfflineCacheService {
  private readonly CACHE_PREFIX = 'hagwon_cache_';
  private readonly LESSON_PREFIX = 'lesson_';
  private readonly CURRICULUM_PREFIX = 'curriculum_';
  private readonly CACHE_STATS_KEY = 'cache_stats';
  private readonly MAX_CACHE_SIZE = 50 * 1024 * 1024; // 50MB limit
  private readonly CACHE_EXPIRY = 7 * 24 * 60 * 60 * 1000; // 7 days

  constructor() {
    this.initializeCache();
  }

  private initializeCache(): void {
    if (typeof window === 'undefined') return;
    
    const stats = this.getCacheStats();
    if (!stats) {
      this.setCacheStats({
        totalSize: 0,
        lessonCount: 0,
        curriculumCount: 0,
        lastUpdated: Date.now()
      });
    }
  }

  private getCacheStats(): CacheStats | null {
    if (typeof window === 'undefined') return null;
    
    try {
      const stats = localStorage.getItem(this.CACHE_PREFIX + this.CACHE_STATS_KEY);
      return stats ? JSON.parse(stats) : null;
    } catch (error) {
      console.error('Failed to get cache stats:', error);
      return null;
    }
  }

  private setCacheStats(stats: CacheStats): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(this.CACHE_PREFIX + this.CACHE_STATS_KEY, JSON.stringify(stats));
    } catch (error) {
      console.error('Failed to set cache stats:', error);
    }
  }

  private updateCacheStats(sizeDelta: number, lessonDelta: number = 0, curriculumDelta: number = 0): void {
    const stats = this.getCacheStats();
    if (!stats) return;

    const newStats: CacheStats = {
      totalSize: Math.max(0, stats.totalSize + sizeDelta),
      lessonCount: Math.max(0, stats.lessonCount + lessonDelta),
      curriculumCount: Math.max(0, stats.curriculumCount + curriculumDelta),
      lastUpdated: Date.now()
    };

    this.setCacheStats(newStats);
  }

  private calculateSize(data: any): number {
    return JSON.stringify(data).length * 2; // Rough estimate (2 bytes per character)
  }

  private makeSpace(requiredSize: number): boolean {
    const stats = this.getCacheStats();
    if (!stats) return false;

    if (stats.totalSize + requiredSize <= this.MAX_CACHE_SIZE) {
      return true;
    }

    // Get all cached items with timestamps
    const cachedItems: Array<{key: string, timestamp: number, size: number}> = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(this.CACHE_PREFIX)) {
        try {
          const item = JSON.parse(localStorage.getItem(key) || '{}');
          if (item.timestamp && item.size) {
            cachedItems.push({
              key,
              timestamp: item.timestamp,
              size: item.size
            });
          }
        } catch (error) {
          console.error('Failed to parse cached item:', error);
        }
      }
    }

    // Sort by timestamp (oldest first)
    cachedItems.sort((a, b) => a.timestamp - b.timestamp);

    let freedSpace = 0;
    let removedLessons = 0;
    let removedCurricula = 0;

    for (const item of cachedItems) {
      if (stats.totalSize - freedSpace + requiredSize <= this.MAX_CACHE_SIZE) {
        break;
      }

      localStorage.removeItem(item.key);
      freedSpace += item.size;

      if (item.key.includes(this.LESSON_PREFIX)) {
        removedLessons++;
      } else if (item.key.includes(this.CURRICULUM_PREFIX)) {
        removedCurricula++;
      }
    }

    this.updateCacheStats(-freedSpace, -removedLessons, -removedCurricula);
    return stats.totalSize - freedSpace + requiredSize <= this.MAX_CACHE_SIZE;
  }

  async cacheLesson(lessonId: string, subject: string, grade: string, topic: string, subtopic: string, content: string, quiz: any): Promise<boolean> {
    if (typeof window === 'undefined') return false;

    try {
      const cachedLesson: CachedLesson = {
        id: lessonId,
        subject,
        grade,
        topic,
        subtopic,
        content,
        quiz,
        timestamp: Date.now(),
        size: 0
      };

      cachedLesson.size = this.calculateSize(cachedLesson);

      if (!this.makeSpace(cachedLesson.size)) {
        console.warn('Not enough space to cache lesson');
        return false;
      }

      const cacheKey = this.CACHE_PREFIX + this.LESSON_PREFIX + lessonId;
      localStorage.setItem(cacheKey, JSON.stringify(cachedLesson));
      
      this.updateCacheStats(cachedLesson.size, 1, 0);
      return true;
    } catch (error) {
      console.error('Failed to cache lesson:', error);
      return false;
    }
  }

  getCachedLesson(lessonId: string): CachedLesson | null {
    if (typeof window === 'undefined') return null;

    try {
      const cacheKey = this.CACHE_PREFIX + this.LESSON_PREFIX + lessonId;
      const cached = localStorage.getItem(cacheKey);
      
      if (!cached) return null;

      const lesson: CachedLesson = JSON.parse(cached);
      
      // Check if cache is expired
      if (Date.now() - lesson.timestamp > this.CACHE_EXPIRY) {
        localStorage.removeItem(cacheKey);
        this.updateCacheStats(-lesson.size, -1, 0);
        return null;
      }

      return lesson;
    } catch (error) {
      console.error('Failed to get cached lesson:', error);
      return null;
    }
  }

  async cacheCurriculum(subject: string, grade: string, data: any): Promise<boolean> {
    if (typeof window === 'undefined') return false;

    try {
      const cachedCurriculum: CachedCurriculum = {
        subject,
        grade,
        data,
        timestamp: Date.now(),
        size: 0
      };

      cachedCurriculum.size = this.calculateSize(cachedCurriculum);

      if (!this.makeSpace(cachedCurriculum.size)) {
        console.warn('Not enough space to cache curriculum');
        return false;
      }

      const cacheKey = this.CACHE_PREFIX + this.CURRICULUM_PREFIX + `${subject}_${grade}`;
      localStorage.setItem(cacheKey, JSON.stringify(cachedCurriculum));
      
      this.updateCacheStats(cachedCurriculum.size, 0, 1);
      return true;
    } catch (error) {
      console.error('Failed to cache curriculum:', error);
      return false;
    }
  }

  getCachedCurriculum(subject: string, grade: string): any | null {
    if (typeof window === 'undefined') return null;

    try {
      const cacheKey = this.CACHE_PREFIX + this.CURRICULUM_PREFIX + `${subject}_${grade}`;
      const cached = localStorage.getItem(cacheKey);
      
      if (!cached) return null;

      const curriculum: CachedCurriculum = JSON.parse(cached);
      
      // Check if cache is expired
      if (Date.now() - curriculum.timestamp > this.CACHE_EXPIRY) {
        localStorage.removeItem(cacheKey);
        this.updateCacheStats(-curriculum.size, 0, -1);
        return null;
      }

      return curriculum.data;
    } catch (error) {
      console.error('Failed to get cached curriculum:', error);
      return null;
    }
  }

  async preloadCurriculum(subject: string, grade: string): Promise<boolean> {
    try {
      // Check if already cached
      const cached = this.getCachedCurriculum(subject, grade);
      if (cached) return true;

      // Fetch and cache curriculum
      const response = await fetch(`/curriculum/subjects/${subject}/${grade}.json`);
      if (!response.ok) return false;

      const data = await response.json();
      return await this.cacheCurriculum(subject, grade, data);
    } catch (error) {
      console.error('Failed to preload curriculum:', error);
      return false;
    }
  }

  async preloadLessonsForGrade(subject: string, grade: string, maxLessons: number = 10): Promise<number> {
    try {
      let loadedCount = 0;
      const curriculum = this.getCachedCurriculum(subject, grade);
      
      if (!curriculum) {
        await this.preloadCurriculum(subject, grade);
        return 0;
      }

      // Get first few lessons from curriculum
      const topics = Object.entries(curriculum.topics || {})
        .sort(([,a], [,b]) => (a as any).order - (b as any).order)
        .slice(0, 3); // First 3 topics

      for (const [topicKey, topicData] of topics) {
        const subtopics = Object.entries((topicData as any).subtopics || {})
          .sort(([,a], [,b]) => (a as any).order - (b as any).order)
          .slice(0, Math.ceil(maxLessons / topics.length));

        for (const [subtopicKey, subtopicData] of subtopics) {
          if (loadedCount >= maxLessons) break;

          const lessonId = `${subject}_${grade}_${topicKey}_${subtopicKey}`;
          const cached = this.getCachedLesson(lessonId);
          
          if (!cached) {
            // For now, just mark as preloaded - actual lesson generation would happen on demand
            await this.cacheLesson(
              lessonId,
              subject,
              grade,
              topicKey,
              subtopicKey,
              '', // Empty content - will be generated on demand
              null
            );
            loadedCount++;
          }
        }
      }

      return loadedCount;
    } catch (error) {
      console.error('Failed to preload lessons:', error);
      return 0;
    }
  }

  clearCache(): void {
    if (typeof window === 'undefined') return;

    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(this.CACHE_PREFIX)) {
        keysToRemove.push(key);
      }
    }

    keysToRemove.forEach(key => localStorage.removeItem(key));
    
    this.setCacheStats({
      totalSize: 0,
      lessonCount: 0,
      curriculumCount: 0,
      lastUpdated: Date.now()
    });
  }

  getCacheStatus(): {
    stats: CacheStats | null;
    isOnline: boolean;
    hasSpace: boolean;
    supportLevel: 'full' | 'partial' | 'none';
  } {
    const stats = this.getCacheStats();
    const isOnline = typeof navigator !== 'undefined' && navigator.onLine;
    const hasSpace = stats ? stats.totalSize < this.MAX_CACHE_SIZE * 0.8 : true;
    
    let supportLevel: 'full' | 'partial' | 'none' = 'none';
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('test', 'test');
        localStorage.removeItem('test');
        supportLevel = hasSpace ? 'full' : 'partial';
      } catch {
        supportLevel = 'none';
      }
    }

    return {
      stats,
      isOnline,
      hasSpace,
      supportLevel
    };
  }

  async initializeOfflineMode(profileId: string, subjects: string[] = ['math', 'english'], grades: string[] = ['grade_1']): Promise<void> {
    console.log('Initializing offline mode for profile:', profileId);
    
    for (const subject of subjects) {
      for (const grade of grades) {
        await this.preloadCurriculum(subject, grade);
        await this.preloadLessonsForGrade(subject, grade, 5);
      }
    }

    console.log('Offline mode initialized');
  }
}

export const offlineCacheService = new OfflineCacheService();