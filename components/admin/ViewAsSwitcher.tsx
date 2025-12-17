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
          className="flex items-center gap-2"
        >
          <span>👁️</span>
          <span>View As</span>
          <span className="text-xs">▼</span>
        </Button>

        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setIsOpen(false)}
            />
            <Card className="absolute top-full right-0 mt-2 z-20 min-w-[200px] shadow-lg">
              <CardContent className="p-2">
                <div className="space-y-1">
                  <button
                    onClick={() => handleViewAs('superadmin')}
                    className={`w-full text-left px-3 py-2 rounded text-sm text-slate-800 hover:bg-slate-100 ${!viewAs ? 'bg-slate-100 font-medium' : ''
                      }`}
                  >
                    🛡️ Super Admin
                  </button>
                  <button
                    onClick={() => handleViewAs('admin')}
                    className={`w-full text-left px-3 py-2 rounded text-sm text-slate-800 hover:bg-slate-100 ${viewAs === 'admin' ? 'bg-slate-100 font-medium' : ''
                      }`}
                  >
                    👨‍💼 Admin Dashboard
                  </button>
                  <button
                    onClick={() => handleViewAs('teacher')}
                    className={`w-full text-left px-3 py-2 rounded text-sm text-slate-800 hover:bg-slate-100 ${viewAs === 'teacher' ? 'bg-slate-100 font-medium' : ''
                      }`}
                  >
                    👨‍🏫 Teacher Dashboard
                  </button>
                  <button
                    onClick={() => handleViewAs('student')}
                    className={`w-full text-left px-3 py-2 rounded text-sm text-slate-800 hover:bg-slate-100 ${viewAs === 'student' ? 'bg-slate-100 font-medium' : ''
                      }`}
                  >
                    🎓 Student Dashboard
                  </button>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}

