import { auth, currentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getDatabase } from '@/lib/mongodb';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Progress } from '@/components/ui/Progress';
import { CourseRecommendations } from '@/components/courses/CourseRecommendations';
import { BookOpen, Brain, CheckCircle2, GraduationCap } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function MyLearningPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  const user = await currentUser();
  const db = await getDatabase();

  const courseDocs = await db
    .collection('courses')
    .find({ status: 'published' })
    .limit(24)
    .toArray();
  const courses = courseDocs.map((course: any) => ({
    ...course,
    _id: String(course._id),
    slug: course.slug || String(course._id),
  }));

  const userProgress = await db.collection('userProgress').find({ userId }).toArray();
  const progress = userProgress.reduce((acc: Record<string, { completed: number; total: number; lastAccessed?: Date }>, p: any) => {
    const courseId = p.courseId || p.subject;
    if (!courseId) return acc;
    if (!acc[courseId]) acc[courseId] = { completed: 0, total: 0, lastAccessed: p.updatedAt || p.completedAt };
    acc[courseId].completed += 1;
    acc[courseId].total += 1;
    if (p.updatedAt && (!acc[courseId].lastAccessed || p.updatedAt > acc[courseId].lastAccessed!)) {
      acc[courseId].lastAccessed = p.updatedAt;
    }
    return acc;
  }, {});

  const completions = await db.collection('courseCompletions').find({ userId }).sort({ completedAt: -1 }).limit(6).toArray();

  const activeCourses = courses.filter((course) => progress[course._id]);
  const lessonsCompleted = Object.values(progress).reduce((sum, p) => sum + p.completed, 0);

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-[120px] animate-pulse delay-700" />
      </div>

      <div className="container mx-auto px-4 py-16 relative z-10 space-y-12">
        <header className="grid gap-8 lg:grid-cols-[minmax(0,1.2fr),minmax(0,0.8fr)] items-stretch">
          <Card className="border-none shadow-2xl bg-gradient-to-br from-indigo-600 via-teal-600 to-indigo-800 text-white overflow-hidden relative group">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
            <div className="absolute -right-32 -top-32 w-96 h-96 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000" />

            <CardContent className="space-y-6 p-10 relative z-10">
              <div className="text-[10px] font-black uppercase tracking-[0.4em] text-white/60">Registry Status: Operational</div>
              <h1 className="text-3xl sm:text-5xl font-black tracking-tighter max-w-2xl leading-[0.9]">
                Initiate Synchronous Learning, {user?.firstName?.toUpperCase() || 'AGENT'}.
              </h1>
              <p className="text-white/80 text-sm md:text-base font-medium max-w-xl leading-relaxed">
                Your neural links are stable. Access your active knowledge modules, claim verified achievements, and explore new disciplines.
              </p>
              <div className="flex flex-wrap gap-4 pt-4">
                <Link href="/courses">
                  <Button variant="inverse" className="px-10 h-14 rounded-2xl bg-white text-indigo-950 font-black uppercase tracking-widest text-[10px] shadow-xl hover:scale-[1.02] active:scale-95 transition-all">
                    Explore Catalog
                  </Button>
                </Link>
                <Link href="/dashboard">
                  <Button variant="ghost" className="px-10 h-14 rounded-2xl border-2 border-white/20 text-white hover:bg-white/10 font-black uppercase tracking-widest text-[10px] transition-all">
                    Status Dashboard
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/40 backdrop-blur-xl border border-white/10 shadow-2xl overflow-hidden rounded-[2.5rem]">
            <CardHeader className="pb-2">
              <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Growth Metrics</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4 p-8">
              {[
                { label: 'Modules', value: activeCourses.length, icon: '📚' },
                { label: 'Syncs', value: lessonsCompleted, icon: '🔥' },
                { label: 'Awards', value: completions.length, icon: '🏆' },
                { label: 'Fields', value: new Set(userProgress.map((p) => p.subject).filter(Boolean)).size, icon: '🧠' },
              ].map((stat) => (
                <div key={stat.label} className="bg-white/5 border border-white/5 rounded-2xl p-5 flex flex-col items-center justify-center text-center group hover:bg-white/10 transition-colors">
                  <span className="text-2xl mb-2">{stat.icon}</span>
                  <p className="text-2xl font-black text-white leading-none mb-1 group-hover:scale-110 transition-transform">{stat.value}</p>
                  <p className="text-[9px] font-black uppercase text-slate-500 tracking-widest">{stat.label}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </header>

        <section className="space-y-8">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <div className="space-y-1">
              <h2 className="text-2xl font-black text-white uppercase tracking-tight">Active Knowledge Modules</h2>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-teal-400">Current Synchronization Status</p>
            </div>
            <Link href="/courses">
              <Button className="rounded-xl border border-white/10 bg-white/5 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 px-8 h-10">Deploy New Modules</Button>
            </Link>
          </div>

          <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
            {activeCourses.length ? (
              activeCourses.map((course) => {
                const courseProgress = progress[course._id] || { completed: 0, total: 0 };
                const lessonCount = course.modules?.reduce((n: number, m: any) => n + (m.lessons?.length || 0), 0) || 0;
                const percent = lessonCount ? Math.round((courseProgress.completed / lessonCount) * 100) : 0;

                return (
                  <Card key={course._id} className="bg-slate-900/20 backdrop-blur-md border border-white/5 shadow-2xl rounded-[2.5rem] overflow-hidden group hover:border-teal-500/30 transition-all duration-300">
                    <CardContent className="p-8 space-y-6">
                      <div className="flex items-center justify-between">
                        <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">{course.subject || 'Core Discipline'}</div>
                        <div className="text-[9px] font-black uppercase bg-teal-500/10 text-teal-400 px-3 py-1 rounded-full border border-teal-500/20">
                          {percent === 100 ? 'Synchronized' : 'Active'}
                        </div>
                      </div>
                      <h3 className="text-xl font-black text-white leading-tight line-clamp-2 min-h-[3.5rem] group-hover:text-teal-400 transition-colors uppercase tracking-tight">{course.title}</h3>

                      <div className="space-y-4">
                        <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                          <span className="text-slate-500">Sync Progress</span>
                          <span className="text-teal-500">{percent}%</span>
                        </div>
                        <div className="relative h-2 rounded-full bg-white/5 overflow-hidden">
                          <div
                            className="absolute inset-0 bg-gradient-to-r from-teal-500 to-emerald-400 rounded-full shadow-[0_0_15px_rgba(20,184,166,0.3)] transition-all duration-1000"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>

                      <Button className="w-full h-12 rounded-2xl bg-white text-slate-950 font-black uppercase text-[10px] tracking-[0.2em] shadow-xl group-hover:bg-teal-400 transition-colors" asChild>
                        <Link href={`/courses/${course.slug}`}>Continue Sync</Link>
                      </Button>
                    </CardContent>
                  </Card>
                );
              })
            ) : (
              <div className="col-span-full rounded-[3rem] border-2 border-dashed border-white/5 p-20 text-center">
                <div className="text-5xl mb-6">🏜️</div>
                <h3 className="text-lg font-black text-white uppercase mb-2">Registry Empty</h3>
                <p className="text-slate-500 font-medium max-w-sm mx-auto">No knowledge modules detected in your local synchronization pipeline. Visit the catalog to begin initialization.</p>
              </div>
            )}
          </div>
        </section>

        <section className="space-y-8">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <div className="space-y-1">
              <h2 className="text-2xl font-black text-white uppercase tracking-tight">Verified Achievements</h2>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-500">Earned Neural Certifications</p>
            </div>
            <Link href="/courses">
              <Button className="rounded-xl border border-white/10 bg-white/5 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 px-8 h-10">Earn More Awards</Button>
            </Link>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {completions.length ? (
              completions.map((cert: any) => (
                <Card key={cert.certificateId} className="bg-slate-900/40 backdrop-blur-md border border-amber-500/20 shadow-2xl rounded-[2.5rem] overflow-hidden relative group">
                  <div className="absolute top-0 right-0 p-6 text-2xl text-amber-500/20 group-hover:text-amber-500/40 transition-colors">🎖️</div>
                  <CardContent className="p-8 space-y-6">
                    <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">
                      <span>Certification Issue</span>
                      <span>{new Date(cert.completedAt || cert.createdAt || new Date()).toLocaleDateString()}</span>
                    </div>
                    <h3 className="text-lg font-black text-white uppercase tracking-tight leading-tight line-clamp-2 min-h-[3rem]">{cert.courseName || 'Module Mastered'}</h3>
                    <div className="flex gap-3 pt-2">
                      <Link href={`/certificates/${cert.certificateId}`} className="flex-1">
                        <Button size="sm" className="w-full h-11 rounded-2xl bg-amber-500 text-slate-950 font-black uppercase text-[9px] tracking-widest shadow-lg shadow-amber-500/20 hover:bg-white transition-all">View</Button>
                      </Link>
                      <Link href={`/certificates/pdf/${cert.certificateId}`} className="flex-1">
                        <Button size="sm" variant="ghost" className="w-full h-11 rounded-2xl border border-white/10 text-white font-black uppercase text-[9px] tracking-widest hover:bg-white/5">Download</Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full rounded-[3.5rem] bg-amber-500/5 border border-dashed border-amber-500/20 p-16 text-center">
                <div className="text-5xl mb-4">🏆</div>
                <h3 className="text-xl font-black text-white uppercase mb-2">No Certifications Issued</h3>
                <p className="text-slate-500 font-medium max-w-sm mx-auto">Verified achievements occur upon 100% synchronization of course modules. Keep pushing.</p>
              </div>
            )}
          </div>
        </section>

        <section className="space-y-8 pt-8 border-t border-white/5">
          <div className="space-y-1">
            <h2 className="text-2xl font-black text-white uppercase tracking-tight">Expansion Directives</h2>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400">Recommended Intelligence Growth</p>
          </div>
          <div className="bg-slate-900/20 backdrop-blur-md rounded-[3rem] p-10 border border-white/5">
            <CourseRecommendations />
          </div>
        </section>
      </div>
    </div>
  );
}



