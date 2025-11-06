export interface CourseLesson {
  id: string;
  title: string;
  slug: string;
  content?: string;
  resources?: { type: 'link' | 'pdf' | 'video'; url: string; title?: string }[];
  quiz?: { questions: any[] };
}

export interface CourseModule {
  id: string;
  title: string;
  slug: string;
  lessons: CourseLesson[];
}

export interface Course {
  _id?: string;
  authorId: string;
  title: string;
  slug: string;
  summary?: string;
  subject?: string;
  level?: 'basic' | 'intermediate' | 'advanced';
  language?: string;
  tags?: string[];
  modules: CourseModule[];
  status: 'draft' | 'published' | 'scheduled';
  scheduledAt?: string;
  seo?: {
    title?: string;
    description?: string;
    keywords?: string[];
  };
  createdAt: string;
  updatedAt: string;
}


