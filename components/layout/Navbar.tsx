"use client";

import Link from "next/link";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { SignedIn, SignedOut, UserButton, SignInButton } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { SiteBrand } from "./SiteBrand";
import { Button } from "@/components/ui/Button";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { GlobalSearch } from "@/components/search/GlobalSearch";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { ViewAsSwitcher } from "@/components/admin/ViewAsSwitcher";
import { getNavigationForRole, type UserRole } from "@/lib/navigation-config";

export function Navbar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [isPro, setIsPro] = useState(false);
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [actionsOpen, setActionsOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    let mounted = true;

    fetch("/api/admin/status")
      .then((res) => res.json())
      .then((data) => {
        if (!mounted) return;
        setIsSuperAdmin(Boolean(data?.isSuperAdmin || data?.role === "superadmin"));
        setIsPro(Boolean(data?.isPro));

        // Set user role
        if (data?.role && ['superadmin', 'admin', 'teacher', 'student', 'user'].includes(data.role)) {
          setUserRole(data.role as UserRole);
        } else {
          setUserRole('user');
        }
      })
      .catch(() => {
        if (mounted) {
          setIsSuperAdmin(false);
          setIsPro(false);
          setUserRole('user');
        }
      });

    return () => {
      mounted = false;
    };
  }, [searchParams]);

  const viewAsRole: UserRole | null = (() => {
    const p = searchParams?.get('viewAs');
    return p && ['admin', 'teacher', 'student'].includes(p) ? (p as UserRole) : null;
  })();

  useEffect(() => {
    const update = () => setIsOnline(typeof navigator !== 'undefined' ? navigator.onLine : true);
    update();
    window.addEventListener('online', update);
    window.addEventListener('offline', update);
    return () => {
      window.removeEventListener('online', update);
      window.removeEventListener('offline', update);
    };
  }, []);

  useEffect(() => {
    if (!isOnline) {
      const path = pathname || '';
      if (!path.startsWith('/offline')) {
        try {
          sessionStorage.setItem('lastOnlinePath', path);
        } catch { }
        router.push('/offline');
      }
    }
  }, [isOnline, pathname, router]);

  const navConfig = getNavigationForRole(userRole, viewAsRole);

  const effectiveRole = viewAsRole || userRole || 'user';

  // Determine if we should show View As switcher
  const showViewAs = isSuperAdmin && !viewAsRole; // Only show when not already viewing as another role

  // Show banner when viewing as another role
  const isViewingAs = viewAsRole && viewAsRole !== userRole;

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="sticky top-0 z-[1000] glass-card text-slate-950 dark:text-white shadow-sm overflow-visible border-none">
      {!isOnline && (
        <div className="bg-red-500 text-white text-xs font-medium py-1.5 px-4 text-center">
          ⚠️ You appear to be offline.
          <button
            onClick={() => router.push('/offline')}
            className="ml-2 underline hover:text-white/90"
            title="View offline help"
          >
            View Help
          </button>
          <button
            onClick={() => typeof window !== 'undefined' && window.location.reload()}
            className="ml-2 underline hover:text-white/90"
            title="Retry connection"
          >
            Retry
          </button>
        </div>
      )}
      {isViewingAs && (
        <div className="bg-amber-500 text-amber-900 text-xs font-medium py-1.5 px-4 text-center">
          👁️ Viewing as {viewAsRole === 'admin' ? 'Admin' : viewAsRole === 'teacher' ? 'Teacher' : 'Student'} •
          <Link href="/admin/super" className="underline ml-1 hover:text-amber-950">
            Exit View As
          </Link>
        </div>
      )}
      <div className="container mx-auto px-4 py-3 flex flex-col gap-3 overflow-visible">
        <div className="flex items-center justify-between gap-2 overflow-visible">
          <div className="flex items-center gap-3">
            <SiteBrand />
            <nav className="hidden lg:flex items-center gap-0.5 text-sm font-medium">
              {navConfig.primaryLinks.map((item, idx) => {
                // Check if this is a dropdown menu
                if ('items' in item) {
                  const dropdown = item as import('@/lib/navigation-config').NavDropdown;
                  return (
                    <div key={idx} className="relative group">
                      <button
                        className="px-2 py-1.5 rounded-full transition-colors hover:bg-slate-200/50 dark:hover:bg-white/10 flex items-center gap-1 text-slate-700 dark:text-white/80 hover:text-slate-950 dark:hover:text-white text-sm font-bold"
                        aria-haspopup="true"
                        aria-expanded="false"
                      >
                        {dropdown.icon && <span>{dropdown.icon}</span>}
                        <span>{dropdown.label}</span>
                        <span className="text-xs transition-transform group-hover:rotate-180">▼</span>
                      </button>
                      {/* Dropdown Menu */}
                      <div className="absolute left-0 top-full mt-1 w-56 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-[1001]">
                        <div className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden backdrop-blur-sm">
                          {dropdown.items.map((subItem) => {
                            const isActive = pathname?.startsWith(subItem.href.split("?")[0]);
                            return (
                              <Link
                                key={subItem.href}
                                href={subItem.href}
                                className={`block px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-2 ${isActive ? 'bg-slate-100 dark:bg-slate-800 font-semibold text-teal-700 dark:text-teal-400' : ''
                                  }`}
                              >
                                {subItem.icon && <span className="text-base">{subItem.icon}</span>}
                                <span className="text-sm">{subItem.label}</span>
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  );
                }
                // Regular link
                const link = item as import('@/lib/navigation-config').NavLink;
                const isActive = pathname?.startsWith(link.href.split("?")[0]);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-2 py-1.5 rounded-full transition-colors hover:bg-slate-200/50 dark:hover:bg-white/10 flex items-center gap-1 whitespace-nowrap text-sm font-bold ${isActive ? "bg-slate-900/10 dark:bg-white/15 text-slate-950 dark:text-white" : "text-slate-700 dark:text-white/90 hover:text-slate-950 dark:hover:text-white"
                      }`}
                    title={link.label}
                  >
                    {link.icon && <span>{link.icon}</span>}
                    <span>{link.label}</span>
                    {link.badge && (
                      <span className="ml-1 text-xs bg-white/20 px-1.5 py-0.5 rounded">
                        {link.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Navigation Items and Search */}
          <div className="flex items-center gap-1.5 overflow-visible">
            {/* Desktop Search */}
            <div className="hidden md:block">
              <GlobalSearch />
            </div>

            <button
              aria-label="Open menu"
              className="lg:hidden inline-flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 p-2"
              onClick={() => setMobileOpen((v) => !v)}
            >
              <span className="text-lg text-white">☰</span>
            </button>

            {showViewAs && (
              <ViewAsSwitcher
                currentRole={userRole || 'student'}
                isSuperAdmin={isSuperAdmin}
              />
            )}
            {navConfig.showAdminBadge && (
              <span className={`hidden xl:inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-wider border ${effectiveRole === 'superadmin' ? 'bg-purple-100/10 text-purple-200 border-purple-400/30' :
                effectiveRole === 'admin' ? 'bg-blue-100/10 text-blue-200 border-blue-400/30' :
                  effectiveRole === 'teacher' ? 'bg-emerald-100/10 text-emerald-200 border-emerald-400/30' :
                    'bg-white/20 text-white border-white/30'
                }`}>
                {effectiveRole === 'superadmin' ? "🛡️ Super" : effectiveRole === 'admin' ? "🛡️ Admin" : effectiveRole === 'teacher' ? "👨‍🏫 Teacher" : effectiveRole}
              </span>
            )}

            {/* Actions Menu - Consolidated */}
            <div className="relative hidden lg:block z-[1002]">
              <button
                onClick={() => setActionsOpen((v) => !v)}
                className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 transition-colors text-slate-600 dark:text-white"
                aria-label="Actions"
              >
                <span className="text-lg">⚡</span>
              </button>
              {actionsOpen && (
                <div
                  className="fixed mt-12 w-64 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 shadow-2xl border border-slate-200 dark:border-slate-700 z-[9999] overflow-y-auto max-h-[85vh] custom-scrollbar animate-in fade-in zoom-in-95 duration-200"
                  style={{
                    right: 'max(1rem, calc((100vw - 1280px) / 2 + 1rem))',
                    top: '3.5rem'
                  }}
                >
                  {!userRole ? (
                    <div className="px-4 py-8 text-center">
                      <div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                      <p className="text-xs text-slate-500 font-medium">Loading your tools...</p>
                    </div>
                  ) : (
                    <div className="flex flex-col">
                      {/* Admin/Superadmin Specific */}
                      {(effectiveRole === 'superadmin' || effectiveRole === 'admin') && (
                        <div className="p-2 border-b dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/20">
                          <div className="px-3 py-1 text-[10px] uppercase font-bold text-slate-400 tracking-wider">Administration</div>
                          <Link href="/admin/users" className="block px-3 py-2 rounded-lg hover:bg-white dark:hover:bg-slate-700 shadow-sm border border-transparent hover:border-slate-200 dark:hover:border-slate-600 transition-all mb-1" onClick={() => setActionsOpen(false)}>👥 User Control</Link>
                          <Link href="/admin/enrollments" className="block px-3 py-2 rounded-lg hover:bg-white dark:hover:bg-slate-700 shadow-sm border border-transparent hover:border-slate-200 dark:hover:border-slate-600 transition-all" onClick={() => setActionsOpen(false)}>💳 Enrollment Ops</Link>
                        </div>
                      )}

                      {/* Content Creation tools - Available to Students (Blogs/Practice), Teacher, Admin */}
                      <div className="p-2 border-b dark:border-slate-700">
                        <div className="px-3 py-1 text-[10px] uppercase font-bold text-slate-400 tracking-wider">Creation Studio</div>

                        {/* Higher roles can create courses */}
                        {(effectiveRole === 'teacher' || effectiveRole === 'admin' || effectiveRole === 'superadmin') && (
                          <Link href="/admin/studio/courses" className="block px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors mb-1" onClick={() => setActionsOpen(false)}>📚 Create Course</Link>
                        )}

                        {/* Blogs are for everyone, Practice Quizzes are for students only */}
                        {(effectiveRole === 'student' || effectiveRole === 'teacher' || effectiveRole === 'admin' || effectiveRole === 'superadmin' || effectiveRole === 'user') && (
                          <Link href="/admin/studio/blogs" className="block px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors mb-1" onClick={() => setActionsOpen(false)}>📝 Write Blog</Link>
                        )}

                        {effectiveRole === 'student' && (
                          <Link href="/admin/studio/practice" className="block px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors mb-1" onClick={() => setActionsOpen(false)}>🎯 Self Practice Quiz</Link>
                        )}

                        {(effectiveRole !== 'user' && effectiveRole !== 'student') && (
                          <Link href="/admin/studio/questions?mode=quiz" className="block px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors" onClick={() => setActionsOpen(false)}>❓ Create Quiz Instance</Link>
                        )}
                      </div>

                      {/* Quick Navigation / Dashboards */}
                      <div className="p-2 bg-slate-50/30 dark:bg-slate-900/10">
                        <div className="px-3 py-1 text-[10px] uppercase font-bold text-slate-400 tracking-wider">Personal Dashboard</div>
                        {effectiveRole === 'superadmin' && (
                          <Link href="/admin/super" className="block px-3 py-2 rounded-lg bg-purple-500 text-white hover:bg-purple-600 shadow-sm transition-all mb-2 text-center text-xs font-bold" onClick={() => setActionsOpen(false)}>🛡️ SUPER ADMIN CONSOLE</Link>
                        )}
                        {(effectiveRole === 'admin' || effectiveRole === 'superadmin') && (
                          <Link href="/admin/dashboard" className="block px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 shadow-sm transition-all mb-1 text-center text-xs font-bold" onClick={() => setActionsOpen(false)}>📊 ADMIN DASHBOARD</Link>
                        )}
                        {effectiveRole === 'teacher' && (
                          <Link href="/teacher/dashboard" className="block px-3 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm transition-all mb-1 text-center text-xs font-bold" onClick={() => setActionsOpen(false)}>👨‍🏫 TEACHER DASHBOARD</Link>
                        )}
                        <Link href="/dashboard" className="block px-3 py-2 rounded-lg bg-teal-600 text-white hover:bg-teal-700 shadow-sm transition-all text-center text-xs font-bold" onClick={() => setActionsOpen(false)}>📊 MY DASHBOARD</Link>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="hidden xl:block">
              <ThemeToggle />
            </div>
            {mounted && (
              <SignedIn>
                {!isPro && !isSuperAdmin && userRole !== 'admin' && userRole !== 'teacher' && (
                  <Link href="/pricing" className="mr-2">
                    <Button
                      size="sm"
                      className="bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-white font-bold border-0 shadow-lg animate-pulse whitespace-nowrap hidden sm:flex items-center gap-1.5"
                    >
                      <span className="text-sm">👑 Upgrade to Pro</span>
                    </Button>
                  </Link>
                )}
                <div className="flex items-center gap-2" suppressHydrationWarning={true}>
                  <NotificationBell />
                  <UserButton afterSignOutUrl="/" />
                </div>
              </SignedIn>
            )}
            <SignedOut>
              <SignInButton mode="modal">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-slate-200 dark:border-white text-slate-600 dark:text-white hover:bg-slate-50 dark:hover:bg-white/10"
                >
                  Sign In
                </Button>
              </SignInButton>
              <SignInButton mode="modal">
                <Button variant="inverse" size="sm">
                  Get Started
                </Button>
              </SignInButton>
            </SignedOut>
          </div>
        </div>

        {mobileOpen && (
          <div className="lg:hidden fixed inset-0 z-[2000] bg-teal-900/60 backdrop-blur">
            <div className="absolute top-0 right-0 w-80 max-w-[75vw] h-full bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 shadow-xl p-4 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="font-semibold">Menu</span>
                <button className="text-slate-600 dark:text-slate-400" onClick={() => setMobileOpen(false)}>✕</button>
              </div>
              <div className="flex flex-col gap-2">
                {navConfig.primaryLinks.map((item, idx) => {
                  // Check if this is a dropdown menu
                  if ('items' in item) {
                    const dropdown = item as import('@/lib/navigation-config').NavDropdown;
                    return (
                      <div key={idx}>
                        <div className="px-3 py-2 text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wide flex items-center gap-2">
                          {dropdown.icon && <span>{dropdown.icon}</span>}
                          {dropdown.label}
                        </div>
                        {dropdown.items.map((subItem) => {
                          const isActive = pathname?.startsWith(subItem.href.split("?")[0]);
                          return (
                            <Link
                              key={subItem.href}
                              href={subItem.href}
                              className={`pl-6 pr-3 py-2 rounded-lg flex items-center gap-2 ${isActive ? 'bg-slate-100 dark:bg-slate-800 font-semibold' : 'hover:bg-slate-50 dark:hover:bg-slate-800'
                                }`}
                              onClick={() => setMobileOpen(false)}
                            >
                              {subItem.icon && <span className="text-base">{subItem.icon}</span>}
                              <span className="text-sm">{subItem.label}</span>
                            </Link>
                          );
                        })}
                      </div>
                    );
                  }

                  // Regular link
                  const link = item as import('@/lib/navigation-config').NavLink;
                  const isActive = pathname?.startsWith(link.href.split("?")[0]);
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`px-3 py-2 rounded-lg flex items-center gap-2 ${isActive ? 'bg-slate-100 dark:bg-slate-800 font-semibold' : 'hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                      onClick={() => setMobileOpen(false)}
                    >
                      {link.icon && <span className="mr-1">{link.icon}</span>}
                      {link.label}
                    </Link>
                  );
                })}
              </div>
              {(effectiveRole === 'superadmin' || effectiveRole === 'admin' || effectiveRole === 'teacher' || effectiveRole === 'student') && (
                <div className="mt-2 border-t pt-2">
                  <div className="text-xs font-semibold text-slate-500 mb-2">Actions</div>
                  <div className="flex flex-col gap-2">
                    {(effectiveRole === 'superadmin' || effectiveRole === 'admin' || effectiveRole === 'teacher') && (
                      <Link href="/admin/studio/courses" className="px-3 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800" onClick={() => setMobileOpen(false)}>📚 Create Course</Link>
                    )}
                    <Link href="/admin/studio/blogs" className="px-3 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800" onClick={() => setMobileOpen(false)}>📝 Write Blog</Link>
                    {effectiveRole === 'student' && (
                      <Link href="/admin/studio/practice" className="px-3 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800" onClick={() => setMobileOpen(false)}>🎯 Self Practice</Link>
                    )}
                    {(effectiveRole === 'superadmin' || effectiveRole === 'admin') && (
                      <Link href="/admin/users" className="px-3 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800" onClick={() => setMobileOpen(false)}>👥 Manage Users</Link>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Mobile/Tablet Search (Row 2) */}
        <div className="xl:hidden glass-effect rounded-2xl border-white/20 shadow-sm overflow-hidden">
          <GlobalSearch />
        </div>
      </div>
    </header >
  );
}
