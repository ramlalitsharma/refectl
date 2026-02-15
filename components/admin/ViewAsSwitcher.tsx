'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import type { UserRole } from '@/lib/navigation-config';
import { Briefcase, Eye, GraduationCap, Mic, Shield, User, UserCheck } from 'lucide-react';

type ViewAsRole = UserRole | null;

interface ViewAsSwitcherProps {
  currentRole: string;
  isSuperAdmin: boolean;
}

export function ViewAsSwitcher({ currentRole, isSuperAdmin }: ViewAsSwitcherProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const viewAsParam = searchParams?.get('viewAs');
  const viewAs: ViewAsRole = viewAsParam && ['admin', 'teacher', 'student', 'news_writer', 'guest'].includes(viewAsParam) ? (viewAsParam as ViewAsRole) : null;
  const [isOpen, setIsOpen] = useState(false);

  if (!isSuperAdmin) {
    return null;
  }

  const handleViewAs = (role: ViewAsRole) => {
    setIsOpen(false);

    // Navigate to appropriate dashboard
    let targetUrl = '';

    switch (role) {
      case 'superadmin':
        targetUrl = '/admin/super';
        break;
      case 'admin':
        targetUrl = '/admin/dashboard';
        break;
      case 'teacher':
        targetUrl = '/teacher/dashboard';
        break;
      case 'student':
        targetUrl = '/dashboard';
        break;
      case 'news_writer':
        targetUrl = '/admin/studio/news';
        break;
      case 'guest':
        targetUrl = '/';
        break;
      default:
        targetUrl = '/admin/super';
    }

    // Add viewAs param to maintain context
    // The navbar will automatically update via useSearchParams hook
    if (role && role !== 'superadmin') {
      router.push(`${targetUrl}?viewAs=${role}`);
    } else {
      router.push(targetUrl);
    }
  };

  const getCurrentViewLabel = () => {
    if (!viewAs) return 'Super Admin';
    switch (viewAs) {
      case 'admin':
        return 'Viewing as Admin';
      case 'teacher':
        return 'Viewing as Teacher';
      case 'student':
        return 'Viewing as Student';
      case 'news_writer':
        return 'Viewing as News Writer';
      case 'guest':
        return 'Viewing as Guest';
      default:
        return 'Super Admin';
    }
  };

  return (
    <div className="relative">
      {/* View As Banner */}
      {viewAs && viewAs !== 'superadmin' && (
        <Card className="mb-4 border-amber-300 bg-amber-50">
          <CardContent className="py-3 px-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-amber-600" />
                <span className="text-sm font-medium text-amber-800">
                  {getCurrentViewLabel()}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleViewAs(null)}
                className="text-amber-700 hover:text-amber-900"
              >
                Exit View As
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* View As Dropdown */}
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 transition-all text-slate-700 dark:text-white"
          aria-label="View As"
          title="Switch View"
        >
          <Eye className="h-4 w-4" />
          <span className="text-sm font-bold">View</span>
          <span className={`text-[10px] transition-transform ${isOpen ? 'rotate-180' : ''}`}>▼</span>
        </button>

        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setIsOpen(false)}
            />
            <div className="absolute top-full right-0 mt-2 z-20 min-w-[220px] glass-card rounded-2xl p-2 shadow-2xl border-white/20 dark:border-white/5 animate-in fade-in zoom-in-95 duration-200">
              <div className="px-3 py-1.5 mb-1 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-white/5">
                Identity Selection
              </div>
              <div className="space-y-1">
                <button
                  onClick={() => handleViewAs('superadmin')}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-all ${!viewAs ? 'bg-purple-600 text-white font-bold shadow-lg shadow-purple-500/20' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                >
                  <Shield className="h-4 w-4" />
                  <div className="flex flex-col text-left">
                    <span className="font-bold">Super Admin</span>
                    {!viewAs && <span className="text-[8px] opacity-80 uppercase tracking-tight">Active View</span>}
                  </div>
                </button>
                <button
                  onClick={() => handleViewAs('admin')}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-all ${viewAs === 'admin' ? 'bg-blue-600 text-white font-bold shadow-lg shadow-blue-500/20' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                >
                  <Briefcase className="h-4 w-4" />
                  <div className="flex flex-col text-left">
                    <span className="font-bold">Admin Panel</span>
                    {viewAs === 'admin' && <span className="text-[8px] opacity-80 uppercase tracking-tight">Active View</span>}
                  </div>
                </button>
                <button
                  onClick={() => handleViewAs('teacher')}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-all ${viewAs === 'teacher' ? 'bg-emerald-600 text-white font-bold shadow-lg shadow-emerald-500/20' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                >
                  <UserCheck className="h-4 w-4" />
                  <div className="flex flex-col text-left">
                    <span className="font-bold">Teaching Hub</span>
                    {viewAs === 'teacher' && <span className="text-[8px] opacity-80 uppercase tracking-tight">Active View</span>}
                  </div>
                </button>
                <button
                  onClick={() => handleViewAs('news_writer')}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-all ${viewAs === 'news_writer' ? 'bg-red-600 text-white font-bold shadow-lg shadow-red-500/20' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                >
                  <Mic className="h-4 w-4" />
                  <div className="flex flex-col text-left">
                    <span className="font-bold">News Writer</span>
                    {viewAs === 'news_writer' && <span className="text-[8px] opacity-80 uppercase tracking-tight">Active View</span>}
                  </div>
                </button>
                <button
                  onClick={() => handleViewAs('student')}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-all ${viewAs === 'student' ? 'bg-teal-600 text-white font-bold shadow-lg shadow-teal-500/20' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                >
                  <GraduationCap className="h-4 w-4" />
                  <div className="flex flex-col text-left">
                    <span className="font-bold">Student View</span>
                    {viewAs === 'student' && <span className="text-[8px] opacity-80 uppercase tracking-tight">Active View</span>}
                  </div>
                </button>
                <button
                  onClick={() => handleViewAs('guest')}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-all ${viewAs === 'guest' ? 'bg-slate-500 text-white font-bold shadow-lg shadow-slate-400/20' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                >
                  <User className="h-4 w-4" />
                  <div className="flex flex-col text-left">
                    <span className="font-bold">Guest View</span>
                    {viewAs === 'guest' && <span className="text-[8px] opacity-80 uppercase tracking-tight">Active View</span>}
                  </div>
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div >
  );
}

