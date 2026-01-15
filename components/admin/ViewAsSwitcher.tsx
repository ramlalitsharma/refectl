'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import type { UserRole } from '@/lib/navigation-config';

type ViewAsRole = UserRole | null;

interface ViewAsSwitcherProps {
  currentRole: string;
  isSuperAdmin: boolean;
}

export function ViewAsSwitcher({ currentRole, isSuperAdmin }: ViewAsSwitcherProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const viewAsParam = searchParams?.get('viewAs');
  const viewAs: ViewAsRole = viewAsParam && ['admin', 'teacher', 'student'].includes(viewAsParam) ? (viewAsParam as ViewAsRole) : null;
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
    if (!viewAs) return currentRole === 'superadmin' ? 'Super Admin' : 'Super Admin';
    switch (viewAs) {
      case 'admin':
        return 'Viewing as Admin';
      case 'teacher':
        return 'Viewing as Teacher';
      case 'student':
        return 'Viewing as Student';
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
                <span className="text-amber-600">👁️</span>
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
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 border-slate-200 dark:border-white/20 bg-white/10 dark:bg-black/10 backdrop-blur-md rounded-xl font-bold text-slate-900 dark:text-white"
        >
          <span>👁️</span>
          <span className="hidden sm:inline">View As</span>
          <span className="text-xs transition-transform duration-200" style={{ transform: isOpen ? 'rotate(180deg)' : 'none' }}>▼</span>
        </Button>

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
                  className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-all ${!viewAs ? 'bg-indigo-500 text-white font-bold' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10'
                    }`}
                >
                  🛡️ Super Admin
                </button>
                <button
                  onClick={() => handleViewAs('admin')}
                  className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-all ${viewAs === 'admin' ? 'bg-indigo-500 text-white font-bold' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10'
                    }`}
                >
                  👨‍💼 Admin Dashboard
                </button>
                <button
                  onClick={() => handleViewAs('teacher')}
                  className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-all ${viewAs === 'teacher' ? 'bg-indigo-500 text-white font-bold' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10'
                    }`}
                >
                  👨‍🏫 Teacher Dashboard
                </button>
                <button
                  onClick={() => handleViewAs('student')}
                  className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-all ${viewAs === 'student' ? 'bg-indigo-500 text-white font-bold' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10'
                    }`}
                >
                  🎓 Student Dashboard
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div >
  );
}

