import { SignedIn, SignedOut, SignInButton } from '@clerk/nextjs';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { getDatabase } from '@/lib/mongodb';

interface Course {
  _id: string;
  slug: string;
  title: string;
  summary?: string;
  subject?: string;
  level?: string;
  price?: number;
  thumbnail?: string;
  tags?: string[];
}

const formatPrice = (price?: number) => {
  if (price === undefined || price === null) return 'Free';
  if (price === 0) return 'Free';
  return `$${price.toLocaleString()}`;
};

const contactInfo = [
  { icon: '✉️', label: 'Email', value: 'support@adaptiq.com' },
  { icon: '☎️', label: 'Phone', value: '+1 (555) 123-4567' },
  { icon: '📍', label: 'Location', value: '88 Innovation Drive, San Francisco, CA' },
];

export async function generateMetadata() {
  const { getLatestKeywords } = await import('@/lib/seo');
  const kws = await getLatestKeywords();
  return {
    title: 'AdaptIQ - Grow Your Skills, Build Your Future',
    description:
      'Discover trending courses, live classes, and online batches on AdaptIQ. Start learning with AI-powered personalization today.',
    keywords: kws.length ? kws : undefined,
  };
}

export default async function Home() {
  const db = await getDatabase();

  const rawCourses = await db
    .collection('courses')
    .find({ status: { $ne: 'draft' } })
    .sort({ createdAt: -1 })
    .limit(12)
    .toArray();

  const courses = (rawCourses as any[]).map((course) => ({
    ...course,
    _id: String(course._id),
    slug: course.slug || String(course._id),
    tags: Array.isArray(course.tags) ? course.tags : [],
  })) as Course[];

  const pickByTags = (tags: string[], fallbackCount: number) => {
    const filtered = courses.filter((course) =>
      course.tags?.some((tag) => tags.includes(tag.toLowerCase())),
    );
    if (filtered.length >= fallbackCount) return filtered.slice(0, fallbackCount);
    if (courses.length === 0) return [];
    return courses.slice(0, fallbackCount);
  };

  const trending = pickByTags(['trending', 'featured', 'popular'], 6);
  const liveClasses = pickByTags(['live', 'webinar', 'bootcamp'], 4);
  const batches = pickByTags(['batch', 'cohort', 'program'], 4);
  const categories = Array.from(new Set(courses.map((c) => c.subject).filter(Boolean)));

  return (
    <div className="bg-[#f4f6f9] text-slate-900">
      <div className="container mx-auto px-4 py-12">
        {/* Hero */}
        <section className="grid gap-6 lg:grid-cols-[minmax(0,0.75fr),minmax(0,1fr)] items-center mb-12">
          <Card className="shadow-xl border-none">
            <CardContent className="space-y-6 pt-8 pb-10">
              <div className="max-w-xl space-y-4">
                <h1 className="text-3xl md:text-4xl font-bold text-slate-900">
                  Grow Your Skills,
                  <span className="text-emerald-600"> Build Your Future.</span>
                </h1>
                <p className="text-slate-600 text-base md:text-lg">
                  Discover online courses and live batches designed to help you reach your goals.
                  Start learning with AdaptIQ&apos;s AI-powered personalization.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <SignedOut>
                  <SignInButton mode="modal">
                    <Button className="px-6">Get Started</Button>
                  </SignInButton>
                </SignedOut>
                <SignedIn>
                  <Link href="/dashboard">
                    <Button className="px-6">Go to Dashboard</Button>
                  </Link>
                </SignedIn>
                <Link href="/courses">
                  <Button variant="outline" className="px-6">
                    Demo Tour
                  </Button>
                </Link>
              </div>
              <div className="rounded-2xl bg-slate-100 px-4 py-4 flex flex-col md:flex-row md:items-center gap-3">
                <select className="w-full md:w-auto rounded-lg border border-slate-300 px-3 py-2 text-sm">
                  <option value="">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="What are you looking for?"
                  className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
                <Button className="px-6">Search</Button>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-xl border-none">
            <CardContent className="p-0">
              <img
                src="https://images.unsplash.com/photo-1553877522-43269d4ea984?auto=format&fit=crop&w=900&q=80"
                alt="Learning"
                className="h-full w-full rounded-3xl object-cover"
              />
            </CardContent>
          </Card>
        </section>

        {/* Trending Courses */}
        <section className="mb-16">
          <div className="rounded-3xl bg-teal-600 px-6 py-4 text-white font-semibold text-lg uppercase tracking-wide inline-block">
            Trending Courses
          </div>
          {trending.length === 0 ? (
            <Card className="mt-6 border-dashed border-2 border-teal-200 bg-white/70">
              <CardContent className="py-12 text-center text-sm text-slate-500">
                Publish a course with the tag <strong>"trending"</strong> to showcase it here.
              </CardContent>
            </Card>
          ) : (
            <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {trending.map((course) => (
                <Card key={course._id} className="overflow-hidden shadow-md">
                  <CardContent className="p-0">
                    <div className="h-40 w-full overflow-hidden">
                      <img
                        src={
                          course.thumbnail ||
                          'https://images.unsplash.com/photo-1550439062-609e1531270e?auto=format&fit=crop&w=800&q=80'
                        }
                        alt={course.title}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="space-y-3 p-5">
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span>{course.subject || 'General'}</span>
                        <span>{course.level ? course.level.toUpperCase() : 'All levels'}</span>
                      </div>
                      <h3 className="text-lg font-semibold text-slate-900 line-clamp-2">
                        {course.title}
                      </h3>
                      <p className="text-sm text-slate-500 line-clamp-2">
                        {course.summary || 'Learn with interactive lessons, quizzes, and real projects.'}
                      </p>
                      <div className="flex items-center justify-between pt-2">
                        <span className="text-lg font-semibold text-emerald-600">
                          {formatPrice(course.price)}
                        </span>
                        <Link href={`/courses/${course.slug}`}>
                          <Button size="sm" className="px-4">
                            View Details
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          <div className="mt-6 text-center">
            <Link href="/courses">
              <Button variant="outline" className="px-10">
                View All
              </Button>
            </Link>
          </div>
        </section>

        {/* Live Classes */}
        <section className="mb-16">
          <div className="rounded-3xl bg-teal-600 px-6 py-4 text-white font-semibold text-lg uppercase tracking-wide inline-block">
            Live Classes
          </div>
          {liveClasses.length === 0 ? (
            <Card className="mt-6 border-dashed border-2 border-teal-200 bg-white/70">
              <CardContent className="py-12 text-center text-sm text-slate-500">
                Tag a course with <strong>"live"</strong> or <strong>"webinar"</strong> to feature it in Live Classes.
              </CardContent>
            </Card>
          ) : (
            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {liveClasses.map((cls, idx) => (
                <Card key={`${cls._id}-live-${idx}`} className="shadow">
                  <CardContent className="p-5 space-y-3">
                    <div className="flex items-center gap-3">
                      <span className="rounded-md bg-red-600 px-2 py-1 text-xs text-white">LIVE</span>
                      <span className="text-xs text-slate-500">Starts in 02 : 30 : 45</span>
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900">{cls.title}</h3>
                    <p className="text-sm text-slate-500 line-clamp-2">
                      {cls.summary || 'Join the live session to learn with instructors in real time.'}
                    </p>
                    <Button className="w-full">Join Now</Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          <div className="mt-6 text-center">
            <Button variant="outline" className="px-10">
              View All
            </Button>
          </div>
        </section>

        {/* Online Batches */}
        <section className="mb-16">
          <div className="rounded-3xl bg-teal-600 px-6 py-4 text-white font-semibold text-lg uppercase tracking-wide inline-block">
            Online Batches
          </div>
          {batches.length === 0 ? (
            <Card className="mt-6 border-dashed border-2 border-teal-200 bg-white/70">
              <CardContent className="py-12 text-center text-sm text-slate-500">
                Add the tag <strong>"batch"</strong> or <strong>"cohort"</strong> to a course to promote it here.
              </CardContent>
            </Card>
          ) : (
            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {batches.map((batch, idx) => (
                <Card key={`${batch._id}-batch-${idx}`} className="shadow">
                  <CardContent className="space-y-3 p-5">
                    <h3 className="text-lg font-semibold text-slate-900 line-clamp-1">
                      {batch.title}
                    </h3>
                    <div className="grid grid-cols-2 gap-2 text-xs text-slate-500">
                      <div>
                        <p className="font-semibold text-slate-600">Start Date</p>
                        <p>01 Jan 2025</p>
                      </div>
                      <div>
                        <p className="font-semibold text-slate-600">Duration</p>
                        <p>12 Weeks</p>
                      </div>
                      <div>
                        <p className="font-semibold text-slate-600">Seats Left</p>
                        <p>{80 - idx * 10} seats</p>
                      </div>
                      <div>
                        <p className="font-semibold text-slate-600">Level</p>
                        <p>{batch.level || 'All levels'}</p>
                      </div>
                    </div>
                    <Button variant="outline" className="w-full">
                      View Details
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          <div className="mt-6 text-center">
            <Button variant="outline" className="px-10">
              View All
            </Button>
          </div>
        </section>

        {/* Contact */}
        <section className="mb-20">
          <div className="rounded-3xl bg-teal-600 px-6 py-4 text-white font-semibold text-lg uppercase tracking-wide inline-block">
            Contact Us
          </div>
          <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,0.8fr),minmax(0,1.2fr)]">
            <Card className="shadow-md border-none bg-slate-900 text-white">
              <CardContent className="space-y-6 p-6">
                {contactInfo.map((info) => (
                  <div key={info.label} className="flex items-start gap-3">
                    <span className="text-lg">{info.icon}</span>
                    <div>
                      <p className="text-sm uppercase tracking-wide text-slate-300">{info.label}</p>
                      <p className="text-base font-semibold">{info.value}</p>
                    </div>
                  </div>
                ))}
                <div className="rounded-xl bg-slate-800 p-4 text-sm leading-relaxed">
                  <h4 className="mb-2 font-semibold">Here&apos;s What Happens Next</h4>
                  <p>Step 1: We listen to your goals and challenges.</p>
                  <p>Step 2: We connect within one business day.</p>
                  <p>Step 3: We deliver a tailored learning plan.</p>
                </div>
              </CardContent>
            </Card>
            <Card className="shadow-md border-none">
              <CardContent className="p-6 space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <input className="rounded-lg border border-slate-300 px-3 py-2" placeholder="First Name" />
                  <input className="rounded-lg border border-slate-300 px-3 py-2" placeholder="Last Name" />
                </div>
                <input className="rounded-lg border border-slate-300 px-3 py-2 w-full" placeholder="Email" />
                <input className="rounded-lg border border-slate-300 px-3 py-2 w-full" placeholder="Subject" />
                <textarea
                  className="rounded-lg border border-slate-300 px-3 py-2 w-full"
                  rows={4}
                  placeholder="Write your message or feedback here..."
                />
                <Button className="w-full">Submit</Button>
                <p className="text-xs text-slate-500 text-center">
                  By contacting us, you agree to our Terms & Conditions.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </div>
  );
}
