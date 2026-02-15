import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { SiteBrand } from '@/components/layout/SiteBrand';
import { getLatestKeywords } from '@/lib/seo';
import { StartPracticeButton } from '@/components/exams/StartPracticeButton';
import { Progress } from '@/components/ui/Progress';

interface ExamPageProps {
  params: Promise<{ examType?: string }>;
}

const examDetails: Record<string, any> = {
  sat: {
    name: 'SAT',
    fullName: 'Scholastic Assessment Test',
    description: 'Standardized test for college admissions',
    duration: 180,
    sections: ['Reading', 'Writing', 'Math (No Calculator)', 'Math (Calculator)'],
    scoringRange: '400-1600',
    subjects: ['Math', 'Reading', 'Writing'],
  },
  act: {
    name: 'ACT',
    fullName: 'American College Testing',
    description: 'College entrance examination',
    duration: 175,
    sections: ['English', 'Math', 'Reading', 'Science'],
    scoringRange: '1-36',
    subjects: ['English', 'Math', 'Reading', 'Science'],
  },
  gre: {
    name: 'GRE',
    fullName: 'Graduate Record Examination',
    description: 'Graduate school admissions test',
    duration: 195,
    sections: ['Verbal Reasoning', 'Quantitative Reasoning', 'Analytical Writing'],
    scoringRange: '260-340',
    subjects: ['Verbal', 'Quantitative', 'Writing'],
  },
  gmat: {
    name: 'GMAT',
    fullName: 'Graduate Management Admission Test',
    description: 'Business school admissions test',
    duration: 187,
    sections: ['Quantitative', 'Verbal', 'Integrated Reasoning', 'Analytical Writing'],
    scoringRange: '200-800',
    subjects: ['Quantitative', 'Verbal', 'IR', 'AWA'],
  },
  ielts: {
    name: 'IELTS',
    fullName: 'International English Language Testing System',
    description: 'English proficiency test',
    duration: 165,
    sections: ['Listening', 'Reading', 'Writing', 'Speaking'],
    scoringRange: '0-9',
    subjects: ['Listening', 'Reading', 'Writing', 'Speaking'],
  },
  toefl: {
    name: 'TOEFL',
    fullName: 'Test of English as a Foreign Language',
    description: 'English proficiency test',
    duration: 200,
    sections: ['Reading', 'Listening', 'Speaking', 'Writing'],
    scoringRange: '0-120',
    subjects: ['Reading', 'Listening', 'Speaking', 'Writing'],
  },
  // India
  'jee-main': { name: 'JEE Main', fullName: 'Joint Entrance Examination (Main)', description: 'Engineering entrance exam (India)', duration: 180, sections: ['Physics', 'Chemistry', 'Mathematics'], scoringRange: 'NTA Score', subjects: ['PCM'] },
  'jee-advanced': { name: 'JEE Advanced', fullName: 'Joint Entrance Examination (Advanced)', description: 'IIT entrance exam (India)', duration: 180, sections: ['Paper 1', 'Paper 2'], scoringRange: 'Scaled', subjects: ['PCM'] },
  'neet': { name: 'NEET', fullName: 'National Eligibility cum Entrance Test', description: 'Medical entrance exam (India)', duration: 200, sections: ['Physics', 'Chemistry', 'Biology'], scoringRange: '720', subjects: ['PCB'] },
  'gate': { name: 'GATE', fullName: 'Graduate Aptitude Test in Engineering', description: 'Postgraduate engineering exam (India)', duration: 180, sections: ['General Aptitude', 'Subject'], scoringRange: '0-1000', subjects: ['Engineering Disciplines'] },
  'upsc-cse': { name: 'UPSC CSE', fullName: 'Civil Services Examination', description: 'Government services exam (India)', duration: 0, sections: ['Prelims', 'Mains', 'Interview'], scoringRange: 'Scaled', subjects: ['GS', 'Optional'] },
  'ssc-cgl': { name: 'SSC CGL', fullName: 'Staff Selection Commission - CGL', description: 'Government recruitment exam', duration: 0, sections: ['Tier I', 'Tier II', 'Tier III', 'Tier IV'], scoringRange: 'Scaled', subjects: ['Quant', 'Reasoning', 'English', 'GA'] },
  'ibps-po': { name: 'IBPS PO', fullName: 'Institute of Banking Personnel Selection', description: 'Banking recruitment exam', duration: 0, sections: ['Prelims', 'Mains', 'Interview'], scoringRange: 'Scaled', subjects: ['Quant', 'Reasoning', 'English'] },
  'cat': { name: 'CAT', fullName: 'Common Admission Test', description: 'MBA entrance exam (India)', duration: 120, sections: ['VARC', 'DILR', 'QA'], scoringRange: 'Scaled', subjects: ['MBA'] },
  'cuet': { name: 'CUET', fullName: 'Common University Entrance Test', description: 'Undergraduate admissions (India)', duration: 0, sections: ['Language', 'Domain', 'General'], scoringRange: 'Scaled', subjects: ['Multiple'] },
  'clat': { name: 'CLAT', fullName: 'Common Law Admission Test', description: 'Law entrance exam (India)', duration: 120, sections: ['English', 'Current Affairs', 'Legal', 'Logical', 'Quant'], scoringRange: '0-150', subjects: ['Law'] },
  // Nepal
  'see': { name: 'SEE', fullName: 'Secondary Education Examination', description: 'National exam (Nepal)', duration: 0, sections: ['Multiple Subjects'], scoringRange: 'Grade', subjects: ['General'] },
  'neb-grade-12': { name: 'NEB Grade 12', fullName: 'National Examinations Board - Grade 12', description: 'National higher secondary exam (Nepal)', duration: 0, sections: ['Multiple Subjects'], scoringRange: 'Grade', subjects: ['General'] },
  'ioe': { name: 'IOE Entrance', fullName: 'IOE BE Entrance', description: 'Engineering entrance (Nepal)', duration: 120, sections: ['Physics', 'Chemistry', 'Mathematics', 'English'], scoringRange: 'Percentile', subjects: ['PCM'] },
  'ku-entrance': { name: 'KU Entrance', fullName: 'Kathmandu University Entrance', description: 'University entrance (Nepal)', duration: 0, sections: ['Varies'], scoringRange: 'Percentile', subjects: ['Multiple'] },
  'mecce': { name: 'MECEE', fullName: 'Medical Education Commission - Entrance', description: 'Medical entrance (Nepal)', duration: 0, sections: ['Physics', 'Chemistry', 'Biology', 'English'], scoringRange: 'Percentile', subjects: ['PCB'] },
};

export default async function ExamPage({ params }: ExamPageProps) {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  const resolved = await params;
  const examTypeParam = resolved?.examType ?? 'sat';
  const examType = String(examTypeParam).toLowerCase();
  const exam = examDetails[examType] || examDetails.sat;

  return (
    <div className="min-h-screen bg-gray-50">


      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>{exam.fullName}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">{exam.description}</p>
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <div className="text-sm text-gray-500">Duration</div>
                    <div className="font-semibold">{exam.duration} minutes</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Scoring Range</div>
                    <div className="font-semibold">{exam.scoringRange}</div>
                  </div>
                </div>
                <div className="mb-4">
                  <div className="text-sm font-medium text-gray-700 mb-2">Sections</div>
                  <div className="flex flex-wrap gap-2">
                    {exam.sections.map((section: string) => (
                      <Badge key={section} variant="info" size="sm">
                        {section}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <div>
              <h3 className="text-xl font-semibold mb-4">Your Progress</h3>
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    {exam.sections.map((section: string, idx: number) => (
                      <div key={section}>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700">{section}</span>
                          <span className="text-sm text-gray-500">
                            0%
                          </span>
                        </div>
                        <Progress
                          value={0}
                          color={idx % 2 === 0 ? 'blue' : 'purple'}
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <StartPracticeButton subjectName={exam.name} levelName="Intermediate" />
                <Button variant="outline" className="w-full">
                  View Study Plan
                </Button>
                <Button variant="outline" className="w-full">
                  Section Practice
                </Button>
                <Button variant="outline" className="w-full">
                  Review Weak Areas
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Preparation Tips</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>✓ Practice daily for better results</li>
                  <li>✓ Focus on your weak sections</li>
                  <li>✓ Take full-length practice tests</li>
                  <li>✓ Review mistakes thoroughly</li>
                  <li>✓ Track your progress over time</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

export async function generateMetadata({ params }: { params: Promise<{ examType?: string }> }): Promise<import('next').Metadata> {
  const { examType } = await params;
  const type = String(examType || 'sat').toUpperCase();
  const kws = await getLatestKeywords();
  return {
    title: `${type} Preparation | Refectl`,
    description: `AI-adaptive prep for ${type}. Section practice, score tracking, and personalized recommendations.`,
    keywords: kws.length ? kws : undefined,
  };
}
