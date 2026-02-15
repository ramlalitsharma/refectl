import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ObjectId } from 'mongodb';
import * as motion from 'framer-motion/client';
import { auth, currentUser } from '@/lib/auth';
import { getDatabase } from '@/lib/mongodb';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ReferralDashboard } from '@/components/profile/ReferralDashboard';

export const dynamic = 'force-dynamic';

export default async function ProfilePage() {
  const { userId } = await auth();
  if (!userId) {
    redirect(`/sign-in?redirect_url=${encodeURIComponent('/profile')}`);
  }

  const [sessionUser, db] = await Promise.all([currentUser(), getDatabase()]);
  const [userDoc, enrollments, completions] = await Promise.all([
    db.collection('users').findOne({ clerkId: userId }),
    db.collection('enrollments').find({ userId }).sort({ updatedAt: -1 }).limit(20).toArray(),
    db.collection('courseCompletions').find({ userId }).toArray(),
  ]);

  const courseIds = Array.from(new Set(enrollments.map((enrollment: any) => enrollment.courseId).filter(Boolean)));
  const objectIds = courseIds.filter((id) => ObjectId.isValid(id)).map((id) => new ObjectId(id));

  const courses = courseIds.length
    ? await db
      .collection('courses')
      .find({
        $or: [
          ...(objectIds.length ? [{ _id: { $in: objectIds } }] : []),
          { slug: { $in: courseIds } },
        ],
      })
      .project({ title: 1, slug: 1, thumbnail: 1, level: 1, subject: 1 })
      .toArray()
    : [];

  const courseMap = new Map<string, any>();
  courses.forEach((course: any) => {
    if (course._id) courseMap.set(String(course._id), course);
    if (course.slug) courseMap.set(course.slug, course);
  });

  const completedIds = new Set(completions.map((completion: any) => completion.courseId));

  const stats = {
    totalEnrollments: enrollments.length,
    completedCourses: completedIds.size,
    inProgress: enrollments.filter((enrollment: any) => enrollment.status === 'approved').length,
    waitlisted: enrollments.filter((enrollment: any) => enrollment.status === 'waitlisted').length,
  };

  const profileName =
    sessionUser?.firstName || sessionUser?.lastName
      ? `${sessionUser?.firstName || ''} ${sessionUser?.lastName || ''}`.trim()
      : userDoc?.name || userDoc?.email || sessionUser?.email || 'Learner';

  const highlightEnrollments = enrollments.slice(0, 4).map((enrollment: any) => {
    const course = courseMap.get(enrollment.courseId) || courseMap.get(enrollment.courseSlug || '');
    return {
      id: enrollment._id ? String(enrollment._id) : `${enrollment.userId}:${enrollment.courseId}`,
      status: completedIds.has(enrollment.courseId) ? 'completed' : enrollment.status,
      progress: completedIds.has(enrollment.courseId) ? 100 : enrollment.progress || 0,
      courseTitle: course?.title || enrollment.courseTitle || 'Course',
      courseSlug: course?.slug || enrollment.courseSlug || enrollment.courseId,
      level: course?.level,
      subject: course?.subject,
    };
  });

  const roleBadge =
    (userDoc?.role as string) ||
    (userDoc?.isSuperAdmin ? 'Superadmin' : userDoc?.isAdmin ? 'Admin' : userDoc?.isTeacher ? 'Teacher' : 'Learner');

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] animate-pulse delay-700" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10 space-y-10">
        <div className="grid gap-8 lg:grid-cols-[2fr,1fr]">
          <Card className="border-0 shadow-2xl bg-gradient-to-br from-teal-600 via-emerald-600 to-teal-800 text-white overflow-hidden relative group">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
            <div className="absolute -right-20 -top-20 w-64 h-64 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000" />

            <CardContent className="p-8 sm:p-10 space-y-6 relative z-10">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
                <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-[2rem] bg-white text-teal-700 shadow-2xl flex items-center justify-center text-3xl font-black ring-4 ring-white/20">
                  {profileName.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/60 mb-1">Authenticated Learner</p>
                  <h1 className="text-3xl sm:text-5xl font-black tracking-tighter mb-4">{profileName}</h1>
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
                    <Badge variant="info" className="bg-white/20 backdrop-blur-md text-white border border-white/20 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">
                      {roleBadge}
                    </Badge>
                    {userDoc?.permissions?.includes('teacher:access') && (
                      <Badge variant="default" className="bg-emerald-400/20 backdrop-blur-md text-emerald-300 border border-emerald-400/30 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">
                        Creator mode
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <p className="text-white/80 text-sm sm:text-base font-medium leading-relaxed max-w-2xl">
                {userDoc?.headline || 'Your personalized intelligence hub for rapid knowledge acquisition and adaptive learning paths.'}
              </p>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link href="/dashboard" className="sm:flex-1">
                  <Button variant="inverse" className="w-full h-14 rounded-2xl bg-white text-teal-900 hover:bg-cyan-50 font-black uppercase tracking-widest text-xs shadow-xl transition-all hover:scale-[1.02] active:scale-95">
                    Executive Dashboard
                  </Button>
                </Link>
                <Link href="/my-learning" className="sm:flex-1">
                  <Button variant="ghost" className="w-full h-14 rounded-2xl border-2 border-white/20 text-white hover:bg-white/10 font-black uppercase tracking-widest text-xs transition-all">
                    Resume Growth
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/40 backdrop-blur-xl border border-white/10 shadow-2xl overflow-hidden rounded-[2.5rem]">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-black uppercase tracking-[0.3em] text-slate-500">Neural Analytics</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4 p-6">
              {[
                { label: 'Enrollments', value: stats.totalEnrollments, icon: '📚', color: 'text-blue-400' },
                { label: 'Active', value: stats.inProgress, icon: '🔥', color: 'text-orange-400' },
                { label: 'Mastered', value: stats.completedCourses, icon: '🏆', color: 'text-yellow-400' },
                { label: 'Queued', value: stats.waitlisted, icon: '⏳', color: 'text-teal-400' },
              ].map((stat) => (
                <div key={stat.label} className="bg-white/5 border border-white/5 rounded-2xl p-4 flex flex-col items-center justify-center text-center group hover:bg-white/10 transition-colors">
                  <span className="text-2xl mb-2">{stat.icon}</span>
                  <p className="text-2xl font-black text-white leading-none mb-1 group-hover:scale-110 transition-transform">{stat.value}</p>
                  <p className="text-[9px] font-black uppercase text-slate-500 tracking-widest">{stat.label}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Growth & Referrals */}
        <ReferralDashboard
          referralCode={userDoc?.referralCode || ''}
          referralCount={userDoc?.referralCount || 0}
        />

        <div className="grid gap-8 lg:grid-cols-[1.5fr,1fr]">
          <Card className="bg-slate-900/20 backdrop-blur-md border border-white/5 shadow-2xl rounded-[3rem] overflow-hidden">
            <CardHeader className="p-8 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl font-black text-white tracking-tight uppercase">Active Learning Registry</CardTitle>
                  <p className="text-xs font-black uppercase tracking-widest text-slate-500 mt-1">High Priority Directives</p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-teal-500/10 flex items-center justify-center text-teal-400">🔥</div>
              </div>
            </CardHeader>
            <CardContent className="p-8 pt-4 space-y-4">
              {highlightEnrollments.length === 0 ? (
                <div className="rounded-[2.5rem] border border-dashed border-white/10 p-12 text-center">
                  <div className="text-4xl mb-4">🚀</div>
                  <p className="text-slate-400 font-medium">No active directives found. Deploy new knowledge modules from the catalog.</p>
                </div>
              ) : (
                highlightEnrollments.map((item) => (
                  <Link key={item.id} href={`/courses/${item.courseSlug}`} className="group block">
                    <div className="rounded-[2.5rem] bg-white/[0.02] border border-white/5 p-6 hover:bg-white/[0.05] hover:border-teal-500/30 transition-all duration-300">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0 flex-1">
                          <p className="text-lg font-black text-white tracking-tight mb-1 group-hover:text-teal-400 transition-colors truncate">{item.courseTitle}</p>
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                            {item.subject || 'Core Discipline'} • {item.level || 'All levels'}
                          </p>
                        </div>
                        <Badge
                          variant={item.status === 'completed' ? 'success' : 'info'}
                          className="rounded-full px-4 py-1 text-[9px] font-black uppercase tracking-widest"
                        >
                          {item.status === 'completed' ? 'Mastered' : 'Operational'}
                        </Badge>
                      </div>
                      <div className="mt-5 relative h-2 rounded-full bg-white/5 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(100, item.progress || 0)}%` }}
                          transition={{ duration: 1.5, ease: "easeOut" }}
                          className="absolute inset-0 bg-gradient-to-r from-teal-500 to-emerald-400 rounded-full shadow-[0_0_10px_rgba(20,184,166,0.5)]"
                        />
                      </div>
                      <div className="mt-2 flex justify-between items-center">
                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-600">Sync Pipeline</span>
                        <span className="text-[10px] font-black text-teal-500">{item.progress || 0}%</span>
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </CardContent>
          </Card>

          <Card className="bg-slate-900/20 backdrop-blur-md border border-white/5 shadow-2xl rounded-[3rem] overflow-hidden">
            <CardHeader className="p-8 pb-4">
              <CardTitle className="text-xs font-black uppercase tracking-[0.4em] text-slate-500">Rapid Access Portals</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {[
                { title: 'Community Nexus', sub: 'Global knowledge exchange', icon: '🌐', href: '/forum' },
                { title: 'Live Simulation', sub: 'Real-time cohort synchronization', icon: '⚡', href: '/live' },
                { title: 'Priority Uplink', sub: 'Elite support frequency', icon: '📡', href: '/contact' },
                { title: 'Core Prefs', sub: 'Neural link configuration', icon: '⚙️', href: '/settings' },
              ].map((link) => (
                <Link key={link.title} href={link.href} className="block group">
                  <div className="rounded-3xl bg-white/[0.02] border border-white/5 p-5 hover:bg-teal-500/5 hover:border-teal-500/30 transition-all duration-300 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 group-hover:bg-teal-500/10 flex items-center justify-center text-xl transition-colors">{link.icon}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-black text-white uppercase tracking-tighter mb-0.5 group-hover:text-teal-400 transition-colors">{link.title}</p>
                      <p className="text-[10px] font-medium text-slate-500 truncate">{link.sub}</p>
                    </div>
                    <div className="text-slate-700 group-hover:text-teal-500 group-hover:translate-x-1 transition-all">→</div>
                  </div>
                </Link>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

