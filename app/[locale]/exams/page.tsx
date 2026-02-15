import { auth } from '@clerk/nextjs/server';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { SiteBrand } from '@/components/layout/SiteBrand';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { CategoryNavigation } from '@/components/layout/CategoryNavigation';
import { getLatestKeywords } from '@/lib/seo';
import { getDatabase } from '@/lib/mongodb';
import type { ReactNode } from 'react';
import { BookOpen, Briefcase, ChartColumn, FileText, Globe2, GraduationCap, HeartPulse, MessageCircle, Scale, Target, Zap } from 'lucide-react';

const exams = [
  {
    id: 'sat',
    name: 'SAT',
    fullName: 'Scholastic Assessment Test',
    description: 'Standardized test for college admissions in the US',
    duration: '3 hours',
    scoring: '400-1600',
    sections: 4,
    icon: '🎓',
  },
  {
    id: 'act',
    name: 'ACT',
    fullName: 'American College Testing',
    description: 'College entrance examination',
    duration: '2h 55m',
    scoring: '1-36',
    sections: 4,
    icon: '📝',
  },
  {
    id: 'gre',
    name: 'GRE',
    fullName: 'Graduate Record Examination',
    description: 'Graduate school admissions test',
    duration: '3h 45m',
    scoring: '260-340',
    sections: 3,
    icon: '🎯',
  },
  {
    id: 'gmat',
    name: 'GMAT',
    fullName: 'Graduate Management Admission Test',
    description: 'Business school admissions test',
    duration: '3h 7m',
    scoring: '200-800',
    sections: 4,
    icon: '💼',
  },
  {
    id: 'ielts',
    name: 'IELTS',
    fullName: 'International English Language Testing System',
    description: 'English proficiency test for study/work abroad',
    duration: '2h 45m',
    scoring: '0-9',
    sections: 4,
    icon: '🌍',
  },
  {
    id: 'toefl',
    name: 'TOEFL',
    fullName: 'Test of English as a Foreign Language',
    description: 'English proficiency test',
    duration: '3h 20m',
    scoring: '0-120',
    sections: 4,
    icon: '🗣️',
  },
  {
    id: 'mcat',
    name: 'MCAT',
    fullName: 'Medical College Admission Test',
    description: 'Medical school admissions test',
    duration: '7h 30m',
    scoring: '472-528',
    sections: 4,
    icon: '⚕️',
  },
  {
    id: 'lsat',
    name: 'LSAT',
    fullName: 'Law School Admission Test',
    description: 'Law school admissions test',
    duration: '3h 30m',
    scoring: '120-180',
    sections: 5,
    icon: '⚖️',
  },
  // India
  { id: 'jee-main', name: 'JEE Main', fullName: 'Joint Entrance Examination (Main)', description: 'Engineering entrance exam (India)', duration: '3h', scoring: 'NTA Score', sections: 3, icon: '🇮🇳' },
  { id: 'jee-advanced', name: 'JEE Advanced', fullName: 'Joint Entrance Examination (Advanced)', description: 'IIT entrance exam (India)', duration: '3h', scoring: 'Normalized', sections: 2, icon: '🇮🇳' },
  { id: 'neet', name: 'NEET', fullName: 'National Eligibility cum Entrance Test', description: 'Medical entrance exam (India)', duration: '3h 20m', scoring: '720', sections: 1, icon: '🇮🇳' },
  { id: 'gate', name: 'GATE', fullName: 'Graduate Aptitude Test in Engineering', description: 'Postgraduate engineering exam (India)', duration: '3h', scoring: '0-1000', sections: 1, icon: '🇮🇳' },
  { id: 'upsc-cse', name: 'UPSC CSE', fullName: 'Civil Services Examination', description: 'Government services exam (India)', duration: 'Varies', scoring: 'Scaled', sections: 3, icon: '🇮🇳' },
  { id: 'ssc-cgl', name: 'SSC CGL', fullName: 'Staff Selection Commission - CGL', description: 'Government recruitment exam', duration: 'Varies', scoring: 'Tiered', sections: 4, icon: '🇮🇳' },
  { id: 'ibps-po', name: 'IBPS PO', fullName: 'Institute of Banking Personnel Selection', description: 'Banking recruitment exam', duration: 'Varies', scoring: 'Tiered', sections: 3, icon: '🇮🇳' },
  { id: 'cat', name: 'CAT', fullName: 'Common Admission Test', description: 'MBA entrance exam (India)', duration: '2h', scoring: 'Scaled', sections: 3, icon: '🇮🇳' },
  { id: 'cuet', name: 'CUET', fullName: 'Common University Entrance Test', description: 'Undergraduate admissions (India)', duration: 'Varies', scoring: 'Scaled', sections: 3, icon: '🇮🇳' },
  { id: 'clat', name: 'CLAT', fullName: 'Common Law Admission Test', description: 'Law entrance exam (India)', duration: '2h', scoring: '0-150', sections: 5, icon: '🇮🇳' },
  // Nepal
  { id: 'see', name: 'SEE', fullName: 'Secondary Education Examination', description: 'National exam (Nepal)', duration: 'Varies', scoring: 'Grade', sections: 6, icon: '🇳🇵' },
  { id: 'neb-grade-12', name: 'NEB Grade 12', fullName: 'National Examinations Board - Grade 12', description: 'National higher secondary exam (Nepal)', duration: 'Varies', scoring: 'Grade', sections: 6, icon: '🇳🇵' },
  { id: 'ioe', name: 'IOE Entrance', fullName: 'IOE BE Entrance', description: 'Engineering entrance (Nepal)', duration: '2h', scoring: 'Percentile', sections: 1, icon: '🇳🇵' },
  { id: 'ku-entrance', name: 'KU Entrance', fullName: 'Kathmandu University Entrance', description: 'University entrance (Nepal)', duration: 'Varies', scoring: 'Percentile', sections: 1, icon: '🇳🇵' },
  { id: 'mecce', name: 'MECEE', fullName: 'Medical Education Commission - Entrance Exam', description: 'Medical entrance (Nepal)', duration: 'Varies', scoring: 'Percentile', sections: 1, icon: '🇳🇵' },
];

const renderExamIcon = (icon: string, className = 'h-10 w-10') => {
  const map: Record<string, ReactNode> = {
    '🎓': <GraduationCap className={className} />,
    '📝': <FileText className={className} />,
    '🎯': <Target className={className} />,
    '💼': <Briefcase className={className} />,
    '🌍': <Globe2 className={className} />,
    '🗣️': <MessageCircle className={className} />,
    '⚕️': <HeartPulse className={className} />,
    '⚖️': <Scale className={className} />,
  };
  return map[icon] ?? <span className="text-4xl">{icon}</span>;
};

export default async function ExamsPage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const { userId } = await auth();
  const params = await searchParams;

  if (!userId) {
    redirect('/sign-in');
  }

  // Fetch exams from database
  let dbExams: any[] = [];
  try {
    const db = await getDatabase();
    dbExams = await db
      .collection('examTemplates')
      .find({ visibility: { $in: ['public', undefined] } })
      .sort({ createdAt: -1 })
      .limit(100)
      .toArray();
  } catch (error) {
    console.error('Exams fetch error:', error);
  }

  // Combine database exams with hardcoded exam list
  const allExams = [
    ...exams.map((exam) => ({
      id: exam.id,
      name: exam.name,
      fullName: exam.fullName,
      description: exam.description,
      duration: exam.duration,
      scoring: exam.scoring,
      sections: exam.sections,
      icon: exam.icon,
      category: exam.id.includes('sat') || exam.id.includes('act') || exam.id.includes('gre') || exam.id.includes('gmat') || exam.id.includes('ielts') || exam.id.includes('toefl') || exam.id.includes('mcat') || exam.id.includes('lsat')
        ? 'International'
        : exam.id.includes('see') || exam.id.includes('neb') || exam.id.includes('ioe') || exam.id.includes('ku') || exam.id.includes('mecce')
          ? 'Nepal'
          : 'India',
    })),
    ...dbExams.map((exam: any) => ({
      id: exam.examType || String(exam._id),
      name: exam.name,
      fullName: exam.name,
      description: exam.description || '',
      duration: `${Math.floor((exam.durationMinutes || 60) / 60)}h ${(exam.durationMinutes || 60) % 60}m`,
      scoring: exam.totalMarks ? `0-${exam.totalMarks}` : 'Varies',
      sections: exam.sections?.length || 1,
      icon: '📝',
      category: exam.category || 'General',
    })),
  ];

  // Group exams by category
  const categoryBuckets = new Map<string, typeof allExams>();
  allExams.forEach((exam) => {
    const category = exam.category || 'General';
    if (!categoryBuckets.has(category)) {
      categoryBuckets.set(category, []);
    }
    categoryBuckets.get(category)!.push(exam);
  });

  // Get all categories with counts
  const categories = Array.from(categoryBuckets.keys()).sort();
  const categoryList = categories.map((cat) => ({
    name: cat,
    slug: cat.toLowerCase().replace(/\s+/g, '-'),
    count: categoryBuckets.get(cat)?.length || 0,
  }));

  // Filter exams by selected category
  const selectedCategory = params?.category;
  const filteredExams = selectedCategory
    ? categoryBuckets.get(selectedCategory) || []
    : allExams;

  return (
    <div className="min-h-screen bg-[#f4f6f9]">
      <main className="container mx-auto px-4 py-8 space-y-8">
        <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Exams' }]} className="mb-4" />

        <Card className="border-none shadow-2xl bg-gradient-to-br from-blue-600 via-indigo-500 to-purple-600 text-white">
          <CardContent className="p-10">
            <div className="space-y-5">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1 text-sm font-semibold uppercase tracking-wide">
                <FileText className="h-4 w-4" /> Exam Preparation
              </span>
              <h1 className="text-3xl md:text-4xl font-semibold leading-tight">
                {selectedCategory ? `${selectedCategory} Exams` : 'Prepare for Your Exams'}
              </h1>
              <p className="text-white/80 text-base md:text-lg max-w-2xl">
                {selectedCategory
                  ? `Explore ${filteredExams.length} ${selectedCategory.toLowerCase()} exam preparation resources.`
                  : 'Get personalized practice tests, study plans, and performance tracking for major standardized tests.'}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg bg-white">
          <CardContent className="p-6 space-y-4">
            <div className="flex flex-col gap-2">
              <h2 className="text-lg font-semibold text-slate-900">Browse by Category</h2>
              <p className="text-sm text-slate-500">
                Filter exams by category to find the preparation resources you need.
              </p>
            </div>
            <CategoryNavigation
              categories={categoryList}
              currentCategory={selectedCategory}
              basePath="/exams"
            />
          </CardContent>
        </Card>

        {selectedCategory && (
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-slate-900">{selectedCategory} Exams</h2>
              <p className="text-sm text-slate-500 mt-1">
                {filteredExams.length} {filteredExams.length === 1 ? 'exam' : 'exams'} available
              </p>
            </div>
            <Link href="/exams">
              <Button variant="outline" size="sm">View All Categories</Button>
            </Link>
          </div>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredExams.map((exam) => (
            <Link key={exam.id} href={`/exams/${exam.id}`}>
              <Card className="h-full hover:shadow-lg transition-all border-none shadow-md">
                <CardHeader>
                  <div className="flex items-start justify-between mb-3">
                    <div className="text-5xl">{renderExamIcon(exam.icon)}</div>
                    <Badge variant="warning" size="sm">Test Prep</Badge>
                  </div>
                  <CardTitle className="text-xl">{exam.name}</CardTitle>
                  <p className="text-sm text-gray-500 mt-1">{exam.fullName}</p>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">{exam.description}</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Duration:</span>
                      <span className="font-medium">{exam.duration}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Scoring:</span>
                      <span className="font-medium">{exam.scoring}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Sections:</span>
                      <span className="font-medium">{exam.sections}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <div className="mt-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 text-white">
          <h3 className="text-2xl font-bold mb-4">Why Use Refectl for Exam Prep?</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <div className="mb-2"><Target className="h-7 w-7" /></div>
              <h4 className="font-semibold mb-2">Targeted Practice</h4>
              <p className="text-blue-100 text-sm">
                Focus on your weak areas with AI-powered recommendations
              </p>
            </div>
            <div>
              <div className="mb-2"><ChartColumn className="h-7 w-7" /></div>
              <h4 className="font-semibold mb-2">Score Prediction</h4>
              <p className="text-blue-100 text-sm">
                Get accurate score predictions using ML models
              </p>
            </div>
            <div>
              <div className="mb-2"><Zap className="h-7 w-7" /></div>
              <h4 className="font-semibold mb-2">Adaptive Learning</h4>
              <p className="text-blue-100 text-sm">
                Questions adjust to your level for optimal practice
              </p>
            </div>
          </div>
        </div>

        {/* Guides & Resources */}
        <div className="mt-10">
          <h3 className="text-xl font-semibold mb-4">Guides & Resources</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link href="/blog">
              <Card hover>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><BookOpen className="h-5 w-5" />Exam Tips & Tutorials</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm">Timing strategies, section primers, and do/don’t lists</p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/preparations">
              <Card hover>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Target className="h-5 w-5" />Guided Preparations</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm">Step-by-step tracks with materials and adaptive quizzes</p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/subjects">
              <Card hover>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><BookOpen className="h-5 w-5" />Practice by Subject</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm">Drill topics and chapters aligned to each exam</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const kws = await getLatestKeywords();
  const { BRAND_NAME } = await import('@/lib/brand');
  return {
    title: `Exam Preparation | ${BRAND_NAME}`,
    description: 'Prepare for SAT, ACT, GRE, GMAT, IELTS and more with AI-adaptive practice and analytics.',
    keywords: kws.length ? kws : undefined,
    alternates: {
      canonical: `/${locale}/exams`,
    },
  };
}
