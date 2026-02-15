import { Link } from '@/lib/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Newspaper, FileText, Video, PenTool, LayoutDashboard, Database, Activity, Target, Book, GraduationCap, Brain, Play, CalendarDays } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { FadeIn } from '@/components/ui/Motion';

export default async function StudioPage() {
  const t = await getTranslations('Admin');

  const tools = [
    {
      title: 'Intelligence Studio',
      description: 'Manage news articles, announcements, and global intelligence nodes.',
      icon: Newspaper,
      href: '/admin/studio/news',
      color: 'text-elite-accent-cyan border-elite-accent-cyan/20 bg-elite-accent-cyan/10',
      action: 'Enter Newsroom'
    },
    {
      title: 'Event Command',
      description: 'Create special event banners with global or country-specific visibility.',
      icon: CalendarDays,
      href: '/admin/studio/events',
      color: 'text-amber-300 border-amber-300/20 bg-amber-300/10',
      action: 'Manage Events'
    },
    {
      title: 'Knowledge Base',
      description: 'Synchronize blog posts and share vertical insights with the network.',
      icon: PenTool,
      href: '/admin/studio/blogs',
      color: 'text-elite-accent-purple border-elite-accent-purple/20 bg-elite-accent-purple/10',
      action: 'Manage Insights'
    },
    {
      title: 'Curriculum Hub',
      description: 'Engineers comprehensive courses, modules, and intellectual paths.',
      icon: GraduationCap,
      href: '/admin/studio/courses',
      color: 'text-emerald-400 border-emerald-400/20 bg-emerald-400/10',
      action: 'Design Paths'
    },
    {
      title: 'Ebook Studio',
      description: 'Create and distribute interactive digital texts and research papers.',
      icon: Book,
      href: '/admin/studio/ebooks',
      color: 'text-amber-400 border-amber-400/20 bg-amber-400/10',
      action: 'Publish Texts'
    },
    {
      title: 'Neural Archives',
      description: 'Manage quiz repositories, question banks, and assessment logic.',
      icon: Database,
      href: '/admin/questions',
      color: 'text-blue-400 border-blue-400/20 bg-blue-400/10',
      action: 'Configure Logic'
    },
    {
      title: 'Flashcard Forge',
      description: 'Design spaced-repetition memory modules and neural decks.',
      icon: Brain,
      href: '/admin/studio/flashcards',
      color: 'text-pink-400 border-pink-400/20 bg-pink-400/10',
      action: 'Forge Decks'
    },
    {
      title: 'Media Vault',
      description: 'Manage centralized video assets, streaming, and VOD delivery.',
      icon: Play,
      href: '/admin/videos',
      color: 'text-indigo-400 border-indigo-400/20 bg-indigo-400/10',
      action: 'Access Vault'
    },
    {
      title: 'Network Pulse',
      description: 'Real-time telemetry of user engagement and system throughput.',
      icon: Activity,
      href: '/admin/analytics',
      color: 'text-orange-400 border-orange-400/20 bg-orange-400/10',
      action: 'View Pulse'
    },
    {
      title: 'Mission Control',
      description: 'Global system configuration and cross-node administration.',
      icon: LayoutDashboard,
      href: '/admin/dashboard',
      color: 'text-slate-400 border-white/10 bg-white/5',
      action: 'System Root'
    },
  ];

  return (
    <div className="min-h-screen bg-elite-bg text-slate-100 p-12 space-y-16">
      <div className="flex flex-col gap-4 max-w-2xl">
        <FadeIn>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/5 bg-white/5 px-4 py-1.5 backdrop-blur-xl">
            <Target size={12} className="text-elite-accent-cyan" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-elite-accent-cyan">Central Command</span>
          </div>
        </FadeIn>
        <FadeIn delay={0.1}>
          <h1 className="text-5xl font-black text-white tracking-tighter uppercase leading-none">Content <span className="text-gradient-cyan">Studio</span> V2.0</h1>
        </FadeIn>
        <FadeIn delay={0.2}>
          <p className="text-slate-400 font-medium text-lg leading-relaxed">
            Welcome to the command interface. Deploy global intelligence, curricular paths, and manage the platform infrastructure from a single immersive portal.
          </p>
        </FadeIn>
      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-8">
        {tools.map((tool, index) => (
          <FadeIn key={tool.title} delay={index * 0.05 + 0.3}>
            <Card className="glass-card-premium border-white/5 rounded-[2.5rem] group hover:border-elite-accent-cyan/20 transition-all duration-500 relative overflow-hidden h-full flex flex-col">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
              <CardHeader className="p-10 space-y-6 flex-1">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border ${tool.color} group-hover:scale-110 transition-transform duration-500`}>
                  <tool.icon className="w-6 h-6" />
                </div>
                <div className="space-y-2">
                  <CardTitle className="text-2xl font-black text-white tracking-tight uppercase group-hover:text-elite-accent-cyan transition-colors">{tool.title}</CardTitle>
                  <CardDescription className="text-slate-500 font-medium leading-relaxed">{tool.description}</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="p-10 pt-0">
                <Link href={tool.href}>
                  <Button className="w-full h-14 rounded-2xl border border-white/10 bg-white/5 text-white font-black uppercase text-[10px] tracking-[0.3em] group-hover:bg-elite-accent-cyan group-hover:text-black group-hover:border-transparent transition-all duration-500">
                    {tool.action}
                    <span className="ml-3 group-hover:translate-x-2 transition-transform">→</span>
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </FadeIn>
        ))}
      </div>
    </div>
  );
}
