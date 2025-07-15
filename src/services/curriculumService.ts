export interface SubtopicData {
  title: string;
  description: string;
  order: number;
  learning_objective: string;
  estimated_duration: string;
  prerequisites: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

export interface TopicData {
  title: string;
  description: string;
  order: number;
  subtopics: Record<string, SubtopicData>;
}

export interface CurriculumData {
  grade: string;
  subject: string;
  title: string;
  description: string;
  topics: Record<string, TopicData>;
}

export interface MasterIndex {
  subjects: string[];
  grades: string[];
  structure: Record<string, Record<string, string>>;
  metadata: {
    version: string;
    lastUpdated: string;
    description: string;
  };
}

export interface LessonRequest {
  grade: string;
  subject: string;
  topic: string;
  subtopic: string;
  quiz_type?: 'practice' | 'assessment' | 'review';
}

export interface PromptVariables {
  grade_level: string;
  subject: string;
  topic: string;
  subtopic: string;
  learning_objective: string;
  estimated_duration: string;
  quiz_type?: string;
}

export class CurriculumService {
  private masterIndex: MasterIndex | null = null;
  private curriculumCache: Map<string, CurriculumData> = new Map();

  async loadMasterIndex(): Promise<MasterIndex> {
    if (this.masterIndex) {
      return this.masterIndex;
    }

    try {
      const response = await fetch('/curriculum/masterIndex.json');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      this.masterIndex = await response.json();
      return this.masterIndex;
    } catch (error) {
      console.error('Failed to load master index:', error);
      throw new Error('Unable to load curriculum master index');
    }
  }

  async loadCurriculum(subject: string, grade: string): Promise<CurriculumData> {
    const cacheKey = `${subject}-${grade}`;
    
    if (this.curriculumCache.has(cacheKey)) {
      return this.curriculumCache.get(cacheKey)!;
    }

    // Try offline cache first
    if (typeof window !== 'undefined') {
      const { offlineCacheService } = await import('./offlineCacheService');
      const cachedData = offlineCacheService.getCachedCurriculum(subject, grade);
      if (cachedData) {
        this.curriculumCache.set(cacheKey, cachedData);
        return cachedData;
      }
    }

    try {
      const master = await this.loadMasterIndex();
      const fileName = master.structure[subject]?.[grade];
      
      if (!fileName) {
        throw new Error(`No curriculum found for ${subject} ${grade}`);
      }

      const response = await fetch(`/curriculum/subjects/${subject}/${fileName}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const curriculumData = await response.json();
      this.curriculumCache.set(cacheKey, curriculumData);
      
      // Cache for offline use
      if (typeof window !== 'undefined') {
        const { offlineCacheService } = await import('./offlineCacheService');
        offlineCacheService.cacheCurriculum(subject, grade, curriculumData);
      }
      
      return curriculumData;
    } catch (error) {
      console.error(`Failed to load curriculum for ${subject} ${grade}:`, error);
      throw new Error(`Unable to load curriculum for ${subject} ${grade}`);
    }
  }

  async getSubtopicData(subject: string, grade: string, topic: string, subtopic: string): Promise<SubtopicData | null> {
    try {
      const curriculum = await this.loadCurriculum(subject, grade);
      return curriculum.topics[topic]?.subtopics[subtopic] || null;
    } catch (error) {
      console.error('Failed to get subtopic data:', error);
      return null;
    }
  }

  async getAvailableTopics(subject: string, grade: string): Promise<Record<string, TopicData>> {
    try {
      const curriculum = await this.loadCurriculum(subject, grade);
      return curriculum.topics;
    } catch (error) {
      console.error('Failed to get available topics:', error);
      return {};
    }
  }

  async validatePrerequisites(subject: string, grade: string, topic: string, subtopic: string, completedSubtopics: string[]): Promise<boolean> {
    try {
      const subtopicData = await this.getSubtopicData(subject, grade, topic, subtopic);
      if (!subtopicData || !subtopicData.prerequisites.length) {
        return true;
      }

      return subtopicData.prerequisites.every(prereq => 
        completedSubtopics.includes(prereq)
      );
    } catch (error) {
      console.error('Failed to validate prerequisites:', error);
      return false;
    }
  }

  async renderLessonPrompt(request: LessonRequest): Promise<string> {
    try {
      const subtopicData = await this.getSubtopicData(
        request.subject,
        request.grade,
        request.topic,
        request.subtopic
      );

      if (!subtopicData) {
        throw new Error('Subtopic not found');
      }

      const response = await fetch('/prompts/lesson-explanation.md');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const promptTemplate = await response.text();

      const variables: PromptVariables = {
        grade_level: this.formatGradeLevel(request.grade),
        subject: request.subject,
        topic: request.topic,
        subtopic: request.subtopic,
        learning_objective: subtopicData.learning_objective,
        estimated_duration: subtopicData.estimated_duration
      };

      return this.replaceVariables(promptTemplate, variables);
    } catch (error) {
      console.error('Failed to render lesson prompt:', error);
      throw new Error('Unable to generate lesson prompt');
    }
  }

  async renderQuizPrompt(request: LessonRequest): Promise<string> {
    try {
      const subtopicData = await this.getSubtopicData(
        request.subject,
        request.grade,
        request.topic,
        request.subtopic
      );

      if (!subtopicData) {
        throw new Error('Subtopic not found');
      }

      const response = await fetch('/prompts/quiz-generator.md');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const promptTemplate = await response.text();

      const variables: PromptVariables = {
        grade_level: this.formatGradeLevel(request.grade),
        subject: request.subject,
        topic: request.topic,
        subtopic: request.subtopic,
        learning_objective: subtopicData.learning_objective,
        estimated_duration: subtopicData.estimated_duration,
        quiz_type: request.quiz_type || 'practice'
      };

      return this.replaceVariables(promptTemplate, variables);
    } catch (error) {
      console.error('Failed to render quiz prompt:', error);
      throw new Error('Unable to generate quiz prompt');
    }
  }

  private replaceVariables(template: string, variables: PromptVariables): string {
    let result = template;
    
    Object.entries(variables).forEach(([key, value]) => {
      if (value !== undefined) {
        const regex = new RegExp(`{{${key}}}`, 'g');
        result = result.replace(regex, value);
      }
    });

    return result;
  }

  private formatGradeLevel(grade: string): string {
    const gradeMap: Record<string, string> = {
      'kindergarten': 'Kindergarten',
      'grade_1': 'Grade 1',
      'grade_2': 'Grade 2',
      'grade_3': 'Grade 3',
      'grade_4': 'Grade 4',
      'grade_5': 'Grade 5'
    };

    return gradeMap[grade] || grade;
  }

  async getNextSubtopic(subject: string, grade: string, currentTopic: string, currentSubtopic: string): Promise<{topic: string, subtopic: string} | null> {
    try {
      const curriculum = await this.loadCurriculum(subject, grade);
      const topics = Object.entries(curriculum.topics).sort((a, b) => a[1].order - b[1].order);
      
      for (const [topicKey, topicData] of topics) {
        const subtopics = Object.entries(topicData.subtopics).sort((a, b) => a[1].order - b[1].order);
        
        if (topicKey === currentTopic) {
          const currentIndex = subtopics.findIndex(([key]) => key === currentSubtopic);
          if (currentIndex >= 0 && currentIndex < subtopics.length - 1) {
            return {
              topic: topicKey,
              subtopic: subtopics[currentIndex + 1][0]
            };
          }
        }
        
        if (topicData.order > curriculum.topics[currentTopic]?.order) {
          return {
            topic: topicKey,
            subtopic: subtopics[0][0]
          };
        }
      }
      
      return null;
    } catch (error) {
      console.error('Failed to get next subtopic:', error);
      return null;
    }
  }

  async getAllSubjects(): Promise<string[]> {
    try {
      const master = await this.loadMasterIndex();
      return master.subjects;
    } catch (error) {
      console.error('Failed to get subjects:', error);
      return [];
    }
  }

  async getAllGrades(): Promise<string[]> {
    try {
      const master = await this.loadMasterIndex();
      return master.grades;
    } catch (error) {
      console.error('Failed to get grades:', error);
      return [];
    }
  }
}

// Singleton instance
export const curriculumService = new CurriculumService()