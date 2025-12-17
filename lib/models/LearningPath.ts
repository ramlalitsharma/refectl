import { ObjectId } from 'mongodb';

export interface LearningPath {
  _id?: ObjectId;
  id?: string;
  title: string;
  description?: string;
  authorId: string;
  courses: Array<{
    courseId: string;
    order: number;
    isRequired: boolean;
    prerequisites?: string[]; // Course IDs that must be completed first
  }>;
  estimatedDuration?: number; // in hours
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  tags?: string[];
  isPublic: boolean;
  enrolledCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserLearningPath {
  _id?: ObjectId;
  id?: string;
  userId: string;
  learningPathId: string;
  progress: number; // 0-100
  currentCourseIndex: number;
  completedCourses: string[]; // Course IDs
  startedAt: Date;
  completedAt?: Date;
  updatedAt: Date;
}

export function serializeLearningPath(path: LearningPath & { _id?: any }): LearningPath {
  return {
    id: path._id ? String(path._id) : path.id,
    title: path.title,
    description: path.description,
    authorId: path.authorId,
    courses: path.courses || [],
    estimatedDuration: path.estimatedDuration,
    difficulty: path.difficulty,
    tags: path.tags || [],
    isPublic: path.isPublic || false,
    enrolledCount: path.enrolledCount || 0,
    createdAt: path.createdAt instanceof Date ? path.createdAt : new Date(path.createdAt),
    updatedAt: path.updatedAt instanceof Date ? path.updatedAt : new Date(path.updatedAt),
  };
}

