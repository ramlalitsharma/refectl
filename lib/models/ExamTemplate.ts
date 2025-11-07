export interface ExamTemplate {
  _id?: any;
  name: string;
  description?: string;
  questionBankIds: string[];
  questionIds: string[];
  durationMinutes: number;
  totalMarks: number;
  category?: string;
  examType?: string;
  tags?: string[];
  sections?: Array<{
    title: string;
    bankId?: string;
    questionIds?: string[];
    count: number;
    difficultyMix?: {
      easy?: number;
      medium?: number;
      hard?: number;
    };
    marksPerQuestion?: number;
  }>;
  releaseAt?: string;
  closeAt?: string;
  visibility?: 'private' | 'public' | 'cohort';
  cohorts?: string[];
  passingScore?: number;
  price?: {
    currency: string;
    amount: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export function serializeExamTemplate(template: ExamTemplate & { _id?: any }) {
  return {
    id: template._id ? String(template._id) : undefined,
    name: template.name,
    description: template.description || '',
    questionBankIds: template.questionBankIds || [],
    questionIds: template.questionIds || [],
    durationMinutes: template.durationMinutes,
    totalMarks: template.totalMarks,
    category: template.category || '',
    examType: template.examType || '',
    tags: template.tags || [],
    sections: template.sections || [],
    releaseAt: template.releaseAt,
    closeAt: template.closeAt,
    visibility: template.visibility || 'private',
    cohorts: template.cohorts || [],
    passingScore: template.passingScore,
    price: template.price,
    createdAt: template.createdAt instanceof Date ? template.createdAt.toISOString() : template.createdAt,
    updatedAt: template.updatedAt instanceof Date ? template.updatedAt.toISOString() : template.updatedAt,
  };
}
