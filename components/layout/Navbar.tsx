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
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [actionsOpen, setActionsOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    let mounted = true;

    fetch("/api/admin/status")
      .then((res) => res.json())
      .then((data) => {
        if (!mounted) return;
        setIsSuperAdmin(Boolean(data?.isSuperAdmin || data?.role === "superadmin"));

        // Set user role
        if (data?.role && ['superadmin', 'admin', 'teacher', 'student'].includes(data.role)) {
          setUserRole(data.role as UserRole);
        } else {
          setUserRole('student');
        }
      })
      .catch(() => {
        if (mounted) {
          setIsSuperAdmin(false);
          setUserRole('student');
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

  // Determine if we should show View As switcher
  const showViewAs = isSuperAdmin && !viewAsRole; // Only show when not already viewing as another role

  // Show banner when viewing as another role
  const isViewingAs = viewAsRole && viewAsRole !== userRole;

  return (
    <header className="sticky top-0 z-50 bg-teal-700/90 backdrop-blur supports-[backdrop-filter]:bg-teal-700/70 text-white shadow-md">
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
      <div className="container mx-auto px-4 py-3 flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <SiteBrand />
            <nav className="hidden md:flex items-center gap-2 text-sm font-medium">
              {navConfig.primaryLinks.map((link) => {
                const isActive = pathname?.startsWith(link.href.split("?")[0]);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-3 py-1.5 rounded-full transition-colors hover:bg-white/10 flex items-center gap-1 ${isActive ? "bg-white/15 text-white" : "text-white/80"
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

          {/* Desktop Search */}
          <div className="hidden lg:block flex-1 max-w-xl mx-4">
            <div className="bg-white/95 text-slate-600 rounded-2xl border border-white/40 shadow-sm h-10 flex items-center">
              <div className="w-full -mt-2"> {/* Adjust alignment for the specific Search component styles */}
                <GlobalSearch />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              aria-label="Open menu"
              className="md:hidden inline-flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 p-2"
              onClick={() => setMobileOpen((v) => !v)}
            >
              <span className="text-lg">☰</span>
            </button>
            {showViewAs && (
              <ViewAsSwitcher
                currentRole={userRole || 'student'}
                isSuperAdmin={isSuperAdmin}
              />
            )}
            {navConfig.showAdminBadge && (
              <span className="hidden md:inline-flex items-center gap-1 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-white">
                {isSuperAdmin ? "🛡️ Superadmin" : userRole === 'teacher' ? '👨‍🏫 Teacher' : "🛡️ Admin"}
              </span>
            )}
            {(isSuperAdmin || userRole === 'admin' || userRole === 'teacher') && (
              <div className="relative hidden md:block">
                <Button
                  variant="inverse"
                  size="sm"
                  onClick={() => setActionsOpen((v) => !v)}
                >
                  Create
                </Button>
                {actionsOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white text-slate-800 shadow-xl border z-50">
                    <Link href="/admin/studio/courses" className="block px-4 py-2 hover:bg-slate-50">📚 Create Course</Link>
                    <Link href="/admin/studio/blogs" className="block px-4 py-2 hover:bg-slate-50">📝 Write Blog</Link>
                    <Link href="/admin/studio/questions" className="block px-4 py-2 hover:bg-slate-50">❓ Create Quiz</Link>
                    <Link href="/admin/videos" className="block px-4 py-2 hover:bg-slate-50">🎥 Upload Video</Link>
                  </div>
                )}
              </div>
            )}
            <ThemeToggle />
            <SignedIn>
              <NotificationBell />
              {navConfig.consoleLink ? (
                <Link href={navConfig.consoleLink.href}>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-white text-white hover:bg-white/10"
                  >
                    {navConfig.consoleLink.label}
                  </Button>
                </Link>
              ) : (
                <Link href={navConfig.dashboardLink.href}>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-white text-white hover:bg-white/10"
                  >
                    {navConfig.dashboardLink.label}
                  </Button>
                </Link>
              )}
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
            <SignedOut>
              <SignInButton mode="modal">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-white text-white hover:bg-white/10"
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
          <div className="md:hidden fixed inset-0 z-[100] bg-teal-900/60 backdrop-blur">
            <div className="absolute top-0 right-0 w-80 max-w-[75vw] h-full bg-white text-slate-800 shadow-xl p-4 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="font-semibold">Menu</span>
                <button className="text-slate-600" onClick={() => setMobileOpen(false)}>✕</button>
              </div>
              <div className="flex flex-col gap-2">
                {navConfig.primaryLinks.map((link) => {
                  const isActive = pathname?.startsWith(link.href.split("?")[0]);
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`px-3 py-2 rounded-lg ${isActive ? 'bg-slate-100 font-semibold' : 'hover:bg-slate-50'}`}
                      onClick={() => setMobileOpen(false)}
                    >
                      {link.icon && <span className="mr-2">{link.icon}</span>}
                      {link.label}
                    </Link>
                  );
                })}
              </div>
              {(isSuperAdmin || userRole === 'admin' || userRole === 'teacher') && (
                <div className="mt-2 border-t pt-2">
                  <div className="text-xs font-semibold text-slate-500 mb-2">Create</div>
                  <div className="flex flex-col gap-2">
                    <Link href="/admin/studio/courses" className="px-3 py-2 rounded-lg hover:bg-slate-50" onClick={() => setMobileOpen(false)}>📚 Create Course</Link>
                    <Link href="/admin/studio/blogs" className="px-3 py-2 rounded-lg hover:bg-slate-50" onClick={() => setMobileOpen(false)}>📝 Write Blog</Link>
                    <Link href="/admin/studio/questions" className="px-3 py-2 rounded-lg hover:bg-slate-50" onClick={() => setMobileOpen(false)}>❓ Create Quiz</Link>
                    <Link href="/admin/videos" className="px-3 py-2 rounded-lg hover:bg-slate-50" onClick={() => setMobileOpen(false)}>🎥 Upload Video</Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Mobile/Tablet Search (Row 2) */}
        <div className="lg:hidden bg-white/95 text-slate-600 rounded-2xl border border-white/40 shadow-sm">
          <GlobalSearch />
        </div>
      </div>
    </header>
  );
}
