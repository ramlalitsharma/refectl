import Link from 'next/link';
import { getDatabase } from '@/lib/mongodb';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

export const dynamic = 'force-dynamic';

type SearchParams = {
  q?: string;
  category?: string;
  subject?: string;
};

type CourseItem = {
  id: string;
  title: string;
  slug: string;
  summary?: string;
  subject?: string;
  level?: string;
  updatedAt?: string;
};

type BlogItem = {
  id: string;
  title: string;
  slug?: string;
  description?: string;
  updatedAt?: string;
};

type SubjectItem = {
  id: string;
  name: string;
  slug: string;
  category: string;
};

type SubjectDoc = {
  _id: unknown;
  name: string;
  slug?: string;
  category?: string;
};

type CourseDoc = {
  _id: unknown;
  title?: string;
  slug?: string;
  summary?: string;
  subject?: string;
  level?: string;
  updatedAt?: string | Date;
  status?: string;
  tags?: string[];
};

type BlogDoc = {
  _id: unknown;
  title?: string;
  slug?: string;
  description?: string;
  updatedAt?: string | Date;
};

export default async function SearchPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const q = (params.q || '').trim();
  const category = (params.category || '').trim();
  const subject = (params.subject || '').trim();

  const db = await getDatabase();

  let subjectsRaw: SubjectDoc[] = [];
  let coursesRaw: CourseDoc[] = [];
  let blogsRaw: BlogDoc[] = [];

  try {
    subjectsRaw = (await db.collection('subjects').find({}).toArray()) as SubjectDoc[];
    coursesRaw = (await db.collection('courses').find({ status: 'published' }).sort({ updatedAt: -1 }).limit(400).toArray()) as CourseDoc[];
    blogsRaw = (await db.collection('blogs').find({}).sort({ updatedAt: -1 }).limit(200).toArray()) as BlogDoc[];
  } catch {
    subjectsRaw = [];
    coursesRaw = [];
    blogsRaw = [];
  }

  const subjects: SubjectItem[] = subjectsRaw.map((s: SubjectDoc) => ({
    id: String(s._id),
    name: s.name,
    slug: s.slug || String(s._id),
    category: s.category || 'General',
  }));

  const subjectBySlug = new Map(subjects.map((s) => [s.slug.toLowerCase(), s]));
  const subjectByName = new Map(subjects.map((s) => [s.name.toLowerCase(), s]));

  const qRegex = q ? new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') : null;

  const courses: CourseItem[] = coursesRaw
    .filter((c: CourseDoc) => {
      if (subject) {
        const subj = subjectBySlug.get(subject.toLowerCase()) || subjectByName.get(subject.toLowerCase());
        if (subj) {
          const courseSubject = (c.subject || '').toLowerCase();
          const matchSubject = courseSubject === subj.slug.toLowerCase() || courseSubject === subj.name.toLowerCase();
          if (!matchSubject) return false;
        }
      }
      if (category) {
        const courseSubject = (c.subject || '').toLowerCase();
        const subj = subjectBySlug.get(courseSubject) || subjectByName.get(courseSubject);
        if (!subj || subj.category !== category) return false;
      }
      if (qRegex) {
        const text = `${c.title || ''}\n${c.summary || ''}\n${Array.isArray(c.tags) ? c.tags.join(' ') : ''}`;
        if (!qRegex.test(text)) return false;
      }
      return true;
    })
    .slice(0, 60)
    .map((c: CourseDoc) => ({
      id: String(c._id),
      title: c.title || 'Untitled Course',
      slug: c.slug || String(c._id),
      summary: c.summary || '',
      subject: c.subject || '',
      level: c.level || '',
      updatedAt: c.updatedAt instanceof Date ? c.updatedAt.toISOString() : c.updatedAt,
    }));

  const blogs: BlogItem[] = blogsRaw
    .filter((b: BlogDoc) => {
      if (qRegex) {
        const text = `${b.title || ''}\n${b.description || ''}`;
        if (!qRegex.test(text)) return false;
      }
      return true;
    })
    .slice(0, 40)
    .map((b: BlogDoc) => ({
      id: String(b._id),
      title: b.title || 'Untitled Blog',
      slug: b.slug || String(b._id),
      description: b.description || '',
      updatedAt: b.updatedAt instanceof Date ? b.updatedAt.toISOString() : b.updatedAt,
    }));

  const categoryNames = Array.from(new Set(subjects.map((s) => s.category)));
  const selectedSubjectName = subject ? (subjectBySlug.get(subject.toLowerCase())?.name || subjectByName.get(subject.toLowerCase())?.name) : '';

  const clearHrefBase = '/search' + (q ? `?q=${encodeURIComponent(q)}` : '');

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b bg-white sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 space-y-3">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold text-slate-900">Search Results</h1>
            <Link href="/">
              <Button variant="outline" size="sm">Home</Button>
            </Link>
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            {q && (
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700 border border-slate-200">Query: {q}</span>
            )}
            {category && (
              <Link href={clearHrefBase}>
                <span className="cursor-pointer rounded-full bg-teal-100 px-3 py-1 text-xs text-teal-700 border border-teal-200">{category} ×</span>
              </Link>
            )}
            {subject && (
              <Link href={clearHrefBase + (category ? `&category=${encodeURIComponent(category)}` : '')}>
                <span className="cursor-pointer rounded-full bg-blue-100 px-3 py-1 text-xs text-blue-700 border border-blue-200">{selectedSubjectName || subject} ×</span>
              </Link>
            )}
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-xs text-slate-600 font-medium self-center">Quick filters:</span>
            {categoryNames.map((cat) => (
              <Link key={cat} href={`/search?${q ? `q=${encodeURIComponent(q)}&` : ''}category=${encodeURIComponent(cat)}${subject ? `&subject=${encodeURIComponent(subject)}` : ''}`}>
                <span className={`text-xs px-2 py-1 rounded-full border ${category === cat ? 'bg-teal-50 border-teal-300 text-teal-700' : 'bg-white border-slate-200 text-slate-700'} hover:bg-teal-50 hover:border-teal-300 hover:text-teal-700 transition-colors`}>{cat}</span>
              </Link>
            ))}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-10">
        {(courses.length + blogs.length) === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <h2 className="text-xl font-semibold text-slate-900 mb-2">No results found</h2>
              <p className="text-slate-600">Try adjusting your search terms or browse all courses and blogs.</p>
              <div className="mt-4 flex gap-2 justify-center">
                <Link href="/courses"><Button size="sm">Browse Courses</Button></Link>
                <Link href="/blogs"><Button size="sm" variant="outline">Browse Blogs</Button></Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            {courses.length > 0 && (
              <section className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-slate-900">Courses</h2>
                  <span className="text-xs text-slate-600">{courses.length} results</span>
                </div>
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {courses.map((c) => (
                    <Card key={c.id} hover className="bg-white">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">{c.title}</CardTitle>
                        <p className="text-xs text-slate-500">{c.subject || 'General'} {c.level ? `• ${c.level}` : ''}</p>
                      </CardHeader>
                      <CardContent className="text-sm text-slate-700">
                        <p className="line-clamp-2 mb-3">{c.summary || ''}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex gap-2">
                            {c.subject && <Badge variant="info" className="text-xs">{c.subject}</Badge>}
                            {c.level && <Badge variant="default" className="text-xs">{c.level}</Badge>}
                          </div>
                          <Link href={`/courses/${c.slug}`} className="text-blue-600 hover:text-blue-700 text-xs font-medium">View →</Link>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            )}

            {blogs.length > 0 && (
              <section className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-slate-900">Blogs</h2>
                  <span className="text-xs text-slate-600">{blogs.length} results</span>
                </div>
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {blogs.map((b) => (
                    <Card key={b.id} hover className="bg-white">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">{b.title}</CardTitle>
                      </CardHeader>
                      <CardContent className="text-sm text-slate-700">
                        <p className="line-clamp-3 mb-3">{b.description || ''}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex gap-2">
                            <Badge variant="default" className="text-xs">Article</Badge>
                          </div>
                          <Link href={`/blogs/${b.slug || b.id}`} className="text-blue-600 hover:text-blue-700 text-xs font-medium">View →</Link>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </main>
    </div>
  );
}
