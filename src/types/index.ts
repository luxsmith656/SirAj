export type Role = 'student' | 'instructor' | 'admin';
export type LearningMode = 'class_based' | 'self_review';

export interface UserProfile {
  uid: string;
  email: string;
  role: Role;
  fullName: string;
  age?: number;
  onboarded: boolean;
  learningMode?: LearningMode;
  activeClassId?: string;
  instructorId?: string;
  selectedFocus?: string; // e.g., 'gened', 'profed', 'major'
  diagnosticCompleted: boolean;
  streak: number;
  lastLoginDate: string;
  earnedBadges: string[];
  xp: number;
  level: number;
  createdAt: any;
  updatedAt: any;
}

export interface MasteryRecord {
  [key: string]: number; // 0-100
}

export interface LearnerProfile {
  userId: string;
  learningMode: LearningMode;
  activeClassId?: string;
  selectedFocus?: string;
  currentLevel: number;
  masteryBySkill: MasteryRecord;
  masteryByTopic: MasteryRecord;
  masteryByCategory: MasteryRecord;
  weakSkills: string[];
  strongSkills: string[];
  weakTopics: string[];
  strongTopics: string[];
  recommendedModuleIds: string[];
  nextRecommendedModuleId?: string;
  diagnosticAttemptId?: string;
  streak: number;
  badges: string[];
  lastUpdatedAt: any;
}

export interface Question {
  id: string;
  stem: string;
  options: { id: string; text: string }[];
  correctOptionId: string;
  explanation: string;
  categoryId: string;
  topicId: string;
  skillIds: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  type: 'diagnostic' | 'practice' | 'mock_exam';
  approved: boolean;
  isPublished: boolean;
  aiGenerated: boolean;
  createdBy: string;
  version: number;
  createdAt: any;
  updatedAt: any;
}

export interface AnswerRecord {
  questionId: string;
  selectedOptionId: string;
  correctOptionId: string;
  isCorrect: boolean;
  categoryId: string;
  topicId: string;
  skillIds: string[];
  timeSpentSeconds: number;
}

export interface Attempt {
  id: string;
  userId: string;
  type: 'diagnostic' | 'quiz' | 'mock_exam' | 'module_check';
  mode: LearningMode;
  classId?: string;
  scorePercent: number;
  totalQuestions: number;
  correctCount: number;
  answers: AnswerRecord[];
  completedAt: any;
}

export interface Module {
  id: string;
  title: string;
  description: string;
  categoryId: string;
  topicId: string;
  skillIds: string[];
  level: number;
  lessonBlocks: {
    type: 'text' | 'image' | 'video' | 'callout';
    content: string;
    caption?: string;
  }[];
  checkQuestionIds: string[];
  challengeQuestionIds: string[];
  prerequisiteModuleIds: string[];
  isPublished: boolean;
  createdAt: any;
  updatedAt: any;
}

export interface ModuleProgress {
  userId: string;
  moduleId: string;
  status: 'locked' | 'available' | 'in_progress' | 'completed';
  lastAccessedAt: any;
  completedAt?: any;
  checkScores: Record<string, number>;
}
