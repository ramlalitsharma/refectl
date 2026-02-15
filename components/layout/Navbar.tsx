"use client";

import { createPortal } from "react-dom";

import { useSearchParams } from "next/navigation";
import { Link, useRouter, usePathname } from "@/lib/navigation";
import { useTranslations } from "next-intl";
import { SignedIn, SignedOut, UserButton, SignInButton } from "@clerk/nextjs";
import { useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  Book,
  BookOpen,
  LayoutDashboard,
  Library,
  Newspaper,
  PenSquare,
  ShoppingBag,
  Shield,
  Target,
  Users,
  Zap,
} from "lucide-react";
import { SiteBrand } from "./SiteBrand";
import { Button } from "@/components/ui/Button";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { GlobalSearch } from "@/components/search/GlobalSearch";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { ViewAsSwitcher } from "@/components/admin/ViewAsSwitcher";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import { getNavigationForRole, type UserRole } from "@/lib/navigation-config";

export function Navbar() {
  const t = useTranslations('Common');
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [isPro, setIsPro] = useState(false);
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [actionsOpen, setActionsOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDesktopDropdown, setOpenDesktopDropdown] = useState<number | null>(null);
  const [isCondensed, setIsCondensed] = useState(false);
  const [mounted, setMounted] = useState(false);
  const desktopNavRef = useRef<HTMLDivElement | null>(null);
  const hubRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let mounted = true;
    const controller = new AbortController();

    fetch("/api/admin/status", { signal: controller.signal })
      .then((res) => res.json())
      .then((data) => {
        if (!mounted) return;
        setIsSuperAdmin(Boolean(data?.isSuperAdmin || data?.role === "superadmin"));
        setIsPro(Boolean(data?.isPro));

        // Set user role
        if (data?.role && ['superadmin', 'admin', 'teacher', 'content_writer', 'news_writer', 'student', 'user', 'guest'].includes(data.role)) {
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
      controller.abort();
    };
  }, [pathname]);

  const viewAsRole: UserRole | null = (() => {
    const p = searchParams?.get('viewAs');
    return p && ['admin', 'teacher', 'student', 'news_writer', 'guest'].includes(p) ? (p as UserRole) : null;
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
    setTimeout(() => setMounted(true), 0);
  }, []);

  useEffect(() => {
    const onClickAway = (event: MouseEvent) => {
      const target = event.target as Node;
      if (hubRef.current && !hubRef.current.contains(target)) {
        setActionsOpen(false);
      }
      if (desktopNavRef.current && !desktopNavRef.current.contains(target)) {
        setOpenDesktopDropdown(null);
      }
    };

    const onEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setActionsOpen(false);
        setMobileOpen(false);
        setOpenDesktopDropdown(null);
      }
    };

    document.addEventListener("mousedown", onClickAway);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onClickAway);
      document.removeEventListener("keydown", onEsc);
    };
  }, []);

  useEffect(() => {
    const onScroll = () => {
      setIsCondensed(window.scrollY > 20);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`sticky top-0 z-[1000] bg-elite-bg/90 dark:bg-elite-bg/95 backdrop-blur-2xl backdrop-saturate-150 border-b border-white/5 dark:border-white/[0.06] transition-all duration-300 supports-[backdrop-filter]:bg-elite-bg/80 ${isCondensed ? "shadow-xl" : "shadow-2xl"}`}>
      {!isOnline && (
        <div className="bg-red-500 text-white text-xs font-medium py-1.5 px-4 text-center">
          <AlertTriangle className="inline-block h-3.5 w-3.5 mr-1 align-[-2px]" />
          You appear to be offline.
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
        <div className="bg-elite-accent-cyan text-black text-[11px] font-black uppercase tracking-[0.2em] py-1.5 px-4 text-center">
          Monitoring Protocol: Active Viewing as {viewAsRole} •
          <Link href="/admin/super" className="underline ml-2 hover:text-white transition-colors">
            Terminate Session
          </Link>
        </div>
      )}
      <div className={`w-full max-w-[1920px] mx-auto px-3 sm:px-4 md:px-6 lg:px-8 overflow-visible transition-all duration-300 ease-out ${isCondensed ? "py-1.5" : "py-2.5"}`}>
        <div className="flex items-center justify-between gap-3 sm:gap-4 min-w-0">
          {/* Left: Brand + Nav */}
          <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
            <SiteBrand className="shrink-0" />
            <nav ref={desktopNavRef} className="hidden lg:flex items-center flex-nowrap gap-0.5 2xl:gap-1 flex-1 min-w-0 text-[11px] xl:text-xs font-black uppercase tracking-[0.08em] xl:tracking-[0.12em] py-0.5">
              {navConfig.primaryLinks.map((item, idx) => {
                // Check if this is a dropdown menu
                if ('items' in item) {
                  const dropdown = item as import('@/lib/navigation-config').NavDropdown;
                  const isOpen = openDesktopDropdown === idx;
                  return (
                    <div
                      key={idx}
                      className="relative group shrink-0"
                      onMouseEnter={() => setOpenDesktopDropdown(idx)}
                      onMouseLeave={() => setOpenDesktopDropdown((current) => (current === idx ? null : current))}
                    >
                      <button
                        type="button"
                        className="px-2.5 xl:px-4 py-2 rounded-xl transition-all duration-200 ease-out hover:bg-white/5 hover:-translate-y-[1px] text-slate-400 hover:text-white flex items-center gap-1.5 xl:gap-2"
                        aria-haspopup="true"
                        aria-expanded={isOpen}
                        aria-controls={`desktop-nav-dropdown-${idx}`}
                        onFocus={() => setOpenDesktopDropdown(idx)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            setOpenDesktopDropdown((current) => (current === idx ? null : idx));
                          }
                          if (e.key === "ArrowDown") {
                            e.preventDefault();
                            setOpenDesktopDropdown(idx);
                          }
                          if (e.key === "Escape") {
                            setOpenDesktopDropdown(null);
                          }
                        }}
                      >
                        {dropdown.icon && <span className="text-sm">{dropdown.icon}</span>}
                        <span>{dropdown.label}</span>
                        <span className="text-[10px] opacity-30 transition-transform duration-200 group-hover:rotate-180">▼</span>
                      </button>
                      {/* Dropdown Menu */}
                      <div
                        id={`desktop-nav-dropdown-${idx}`}
                        className={`absolute left-0 top-full mt-2 w-64 transition-all duration-200 ease-out z-[1001] ${
                          isOpen
                            ? "opacity-100 visible translate-y-0"
                            : "opacity-0 invisible translate-y-2 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0"
                        }`}
                      >
                        <div className="glass-card-premium rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
                          {dropdown.items.map((subItem) => {
                            const isActive = pathname?.startsWith(subItem.href.split("?")[0]);
                            return (
                              <Link
                                key={subItem.href}
                                href={subItem.href}
                                className={`block px-5 py-3 hover:bg-white/5 transition-all duration-200 ease-out flex items-center gap-3 ${isActive ? 'bg-elite-accent-cyan/10 font-black text-elite-accent-cyan' : 'text-slate-400 hover:text-white'
                                  }`}
                                onClick={() => setOpenDesktopDropdown(null)}
                                onKeyDown={(e) => {
                                  if (e.key === "Escape") {
                                    setOpenDesktopDropdown(null);
                                  }
                                }}
                              >
                                {subItem.icon && <span className="text-base grayscale group-hover:grayscale-0">{subItem.icon}</span>}
                                <span>{subItem.label}</span>
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
                    className={`relative shrink-0 px-2.5 lg:px-3 xl:px-3.5 2xl:px-4 py-2 rounded-xl transition-all duration-200 ease-out hover:-translate-y-[1px] flex items-center gap-1.5 xl:gap-2 whitespace-nowrap ${isActive ? "bg-white/5 text-white border border-white/10" : "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent"
                      }`}
                    title={link.label}
                  >
                    {link.icon && <span className="text-sm">{link.icon}</span>}
                    <span>{link.label}</span>
                    {link.badge && (
                      <span className="ml-1 text-[9px] xl:text-[10px] bg-elite-accent-cyan/20 text-elite-accent-cyan px-1.5 xl:px-2 py-0.5 rounded-full font-black">
                        {link.badge}
                      </span>
                    )}
                    {isActive && (
                      <span className="absolute left-2 right-2 -bottom-[1px] h-[2px] rounded-full bg-elite-accent-cyan/80" />
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right: Search, Actions, Auth */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Desktop Search */}
            <div className="hidden md:block shrink-0">
              <GlobalSearch />
            </div>

            <button
              type="button"
              aria-label="Open menu"
              aria-expanded={mobileOpen}
              className="lg:hidden touch-target inline-flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 active:bg-white/30 transition-all duration-200 p-2.5 sm:p-3 shrink-0"
              onClick={() => setMobileOpen((v) => !v)}
            >
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>

            {showViewAs && (
              <div className="hidden 2xl:flex items-center gap-2 shrink-0">
                <ViewAsSwitcher
                  currentRole={userRole || 'student'}
                  isSuperAdmin={isSuperAdmin}
                />

                {navConfig.showAdminBadge && (
                  <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest border transition-all ${effectiveRole === 'superadmin' ? 'bg-elite-accent-purple/20 text-elite-accent-purple border-elite-accent-purple/30 glow-purple' :
                    effectiveRole === 'admin' ? 'bg-elite-accent-cyan/20 text-elite-accent-cyan border-elite-accent-cyan/30 glow-cyan' :
                      effectiveRole === 'teacher' ? 'bg-elite-accent-emerald/20 text-elite-accent-emerald border-elite-accent-emerald/30 glow-emerald' :
                        'bg-white/5 text-white/50 border-white/10'
                    }`}>
                    <span className="relative flex h-1.5 w-1.5 mr-1">
                      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${effectiveRole === 'superadmin' ? 'bg-elite-accent-purple' : effectiveRole === 'admin' ? 'bg-elite-accent-cyan' : 'bg-elite-accent-emerald'}`}></span>
                      <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${effectiveRole === 'superadmin' ? 'bg-elite-accent-purple' : effectiveRole === 'admin' ? 'bg-elite-accent-cyan' : 'bg-elite-accent-emerald'}`}></span>
                    </span>
                    {effectiveRole} node
                  </span>
                )}
              </div>
            )}

            {/* Refectl Hub - Unified Dropdown */}
            <div ref={hubRef} className="relative hidden xl:block z-[1002] shrink-0">
              <button
                type="button"
                onClick={() => setActionsOpen((v) => !v)}
                aria-expanded={actionsOpen}
                className="flex items-center gap-2 px-3 xl:px-4 2xl:px-5 py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 transition-all duration-200 ease-out text-white border border-white/5 hover:border-elite-accent-cyan/30 hover:shadow-lg hover:shadow-elite-accent-cyan/10 hover:-translate-y-[1px] active:scale-95 group"
                aria-label="Refectl Hub"
                title="Refectl Hub"
              >
                <Zap className="h-4 w-4 text-elite-accent-cyan group-hover:scale-110 transition-transform duration-500 shrink-0" />
                <span className="hidden 2xl:inline text-[11px] font-black uppercase tracking-[0.16em]">Relay Hub</span>
                <span className={`text-[10px] opacity-30 transition-transform duration-200 ${actionsOpen ? 'rotate-180' : ''}`}>▼</span>
              </button>

              {actionsOpen && (
                <div
                  className="fixed mt-6 w-96 rounded-[2.5rem] bg-white/90 dark:bg-elite-bg/95 text-slate-900 dark:text-white shadow-[0_30px_100px_-15px_rgba(0,0,0,0.1)] dark:shadow-[0_30px_100px_-15px_rgba(0,0,0,0.8)] border border-slate-200 dark:border-white/10 z-[9999] animate-in fade-in zoom-in-95 slide-in-from-top-2 duration-300 backdrop-blur-3xl ring-1 ring-black/5 dark:ring-white/5 max-h-[85vh] overflow-y-auto custom-scrollbar"
                  style={{
                    right: 'max(1rem, calc((100vw - 1280px) / 2 + 1rem))',
                    top: isCondensed ? '4rem' : '4.5rem'
                  }}
                >
                  {!userRole ? (
                    <div className="px-4 py-8 text-center">
                      <div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                      <p className="text-xs text-slate-500 font-medium">Loading your Hub...</p>
                    </div>
                  ) : (
                    <div className="flex flex-col">
                      {/* 🚀 Creation Studio Section */}
                      <div className="p-6 border-b border-white/5 bg-white/5">
                        <div className="flex items-center justify-between px-2 mb-4">
                          <span className="text-[11px] uppercase font-black text-slate-500 tracking-[0.35em]">Creation Studio</span>
                        </div>
                        <div className="grid gap-2">
                          {(effectiveRole === 'teacher' || effectiveRole === 'admin' || effectiveRole === 'superadmin') && (
                            <Link href="/admin/studio/courses" className="flex items-center gap-4 px-4 py-3 rounded-2xl hover:bg-white/5 border border-transparent hover:border-white/10 transition-all group" onClick={() => setActionsOpen(false)}>
                              <div className="w-10 h-10 rounded-xl bg-elite-accent-cyan/10 flex items-center justify-center text-lg group-hover:scale-110 transition-transform">
                                <BookOpen className="h-5 w-5 text-elite-accent-cyan" />
                              </div>
                              <div className="flex flex-col">
                                <span className="text-[11px] font-black uppercase tracking-widest text-white">Course Architect</span>
                                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-tight">Design new curricula</span>
                              </div>
                            </Link>
                          )}
                          {(effectiveRole === 'content_writer' || effectiveRole === 'news_writer' || effectiveRole === 'admin' || effectiveRole === 'superadmin') && (
                            <Link href="/admin/studio/news" className="flex items-center gap-4 px-4 py-3 rounded-2xl hover:bg-slate-100 dark:hover:bg-white/5 border border-transparent hover:border-slate-200 dark:hover:border-white/10 transition-all group" onClick={() => setActionsOpen(false)}>
                              <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center text-lg group-hover:scale-110 transition-transform">
                                <Newspaper className="h-5 w-5 text-red-500" />
                              </div>
                              <div className="flex flex-col">
                                <span className="text-[11px] font-black uppercase tracking-widest text-red-600 dark:text-red-500">Elite Bulletin</span>
                                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-tight">Global newsroom desk</span>
                              </div>
                            </Link>
                          )}
                          <Link href="/admin/studio/blogs" className="flex items-center gap-4 px-4 py-3 rounded-2xl hover:bg-slate-100 dark:hover:bg-white/5 border border-transparent hover:border-slate-200 dark:hover:border-white/10 transition-all group" onClick={() => setActionsOpen(false)}>
                            <div className="w-10 h-10 rounded-xl bg-elite-accent-purple/10 flex items-center justify-center text-lg group-hover:scale-110 transition-transform">
                              <PenSquare className="h-5 w-5 text-elite-accent-purple" />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[11px] font-black uppercase tracking-widest text-elite-accent-purple">Blog Studio</span>
                              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-tight">Share your thoughts</span>
                            </div>
                          </Link>
                          {(effectiveRole === 'superadmin' || effectiveRole === 'admin' || effectiveRole === 'teacher' || effectiveRole === 'news_writer') && (
                            <Link href="/admin/studio/ebooks" className="flex items-center gap-4 px-4 py-3 rounded-2xl hover:bg-slate-100 dark:hover:bg-white/5 border border-transparent hover:border-slate-200 dark:hover:border-white/10 transition-all group" onClick={() => setActionsOpen(false)}>
                              <div className="w-10 h-10 rounded-xl bg-elite-accent-emerald/10 flex items-center justify-center text-lg group-hover:scale-110 transition-transform">
                                <Book className="h-5 w-5 text-elite-accent-emerald" />
                              </div>
                              <div className="flex flex-col">
                                <span className="text-[11px] font-black uppercase tracking-widest text-elite-accent-emerald">Ebook Studio</span>
                                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-tight">Create rich resources</span>
                              </div>
                            </Link>
                          )}
                        </div>
                      </div>

                      {/* 🛒 Elite Marketplace Section */}
                      <div className="p-6 border-b border-white/5">
                        <div className="flex items-center justify-between px-2 mb-4">
                          <span className="text-[11px] uppercase font-black text-slate-500 tracking-[0.35em]">Elite Marketplace</span>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <Link href="/shop" className="flex flex-col gap-2 p-4 rounded-3xl bg-white/5 hover:bg-elite-accent-cyan/10 border border-white/5 hover:border-elite-accent-cyan/30 transition-all group" onClick={() => setActionsOpen(false)}>
                            <ShoppingBag className="h-6 w-6 text-elite-accent-cyan group-hover:scale-110 transition-transform" />
                            <div className="flex flex-col">
                              <span className="text-[10px] font-black uppercase tracking-widest text-white">Forge Shop</span>
                              <span className="text-[10px] text-slate-500 uppercase font-bold">Premium Software</span>
                            </div>
                          </Link>
                          <Link href="/ebooks" className="flex flex-col gap-2 p-4 rounded-3xl bg-white/5 hover:bg-elite-accent-emerald/10 border border-white/5 hover:border-elite-accent-emerald/30 transition-all group" onClick={() => setActionsOpen(false)}>
                            <Library className="h-6 w-6 text-elite-accent-emerald group-hover:scale-110 transition-transform" />
                            <div className="flex flex-col">
                              <span className="text-[10px] font-black uppercase tracking-widest text-white">Resources</span>
                              <span className="text-[10px] text-slate-500 uppercase font-bold">Digital Assets</span>
                            </div>
                          </Link>
                        </div>
                      </div>

                      {/* ⚙️ Preferences Section */}
                      <div className="p-6 border-b border-white/5">
                        <div className="px-2 mb-4 text-[11px] uppercase font-black text-slate-500 tracking-[0.35em]">Preferences</div>
                        <div className="flex items-center justify-between gap-4 px-2">
                          <div className="flex-1">
                            <LanguageSwitcher />
                          </div>
                          <div className="flex-shrink-0">
                            <ThemeToggle />
                          </div>
                        </div>
                      </div>

                      {/* 🔔 Notifications Section */}
                      <div className="p-6 border-b border-white/5 bg-white/5">
                        <div className="px-2 mb-4 flex items-center justify-between">
                          <span className="text-[11px] uppercase font-black text-slate-500 tracking-[0.35em]">Intelligence Alerts</span>
                          <NotificationBell />
                        </div>
                      </div>

                      {/* 👤 My Account Section */}
                      <div className="p-6 bg-elite-accent-cyan/5">
                        <div className="px-2 mb-4 text-[11px] uppercase font-black text-slate-500 tracking-[0.35em]">My Account</div>
                        <div className="grid gap-2">
                          {effectiveRole === 'superadmin' && (
                            <Link href="/admin/super" className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-elite-accent-purple text-black hover:bg-white transition-all text-xs font-black uppercase tracking-widest shadow-xl shadow-elite-accent-purple/20 mb-2" onClick={() => setActionsOpen(false)}>
                              <Shield className="h-4 w-4" />
                              Command Console
                            </Link>
                          )}
                          <Link href="/dashboard" className="flex items-center gap-4 px-4 py-3 rounded-2xl hover:bg-white/5 border border-transparent hover:border-white/10 transition-all group" onClick={() => setActionsOpen(false)}>
                            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-lg group-hover:rotate-12 transition-transform">
                              <LayoutDashboard className="h-5 w-5 text-white" />
                            </div>
                            <span className="text-[11px] font-black uppercase tracking-widest text-white">Universal Dashboard</span>
                          </Link>
                        </div>
                        <div className="mt-6 flex items-center justify-between px-5 py-4 bg-white/5 rounded-3xl border border-white/10 shadow-inner">
                          <div className="flex items-center gap-4">
                            <UserButton afterSignOutUrl="/" />
                            <div className="flex flex-col">
                              <span className="text-[11px] font-black text-white uppercase tracking-tight">Active Node</span>
                              <span className="text-[10px] text-elite-accent-cyan font-black uppercase tracking-[0.18em]">{effectiveRole}</span>
                            </div>
                          </div>
                          {!isPro && !isSuperAdmin && (
                            <Link href="/pricing" onClick={() => setActionsOpen(false)}>
                              <button className="text-[11px] font-black text-black bg-elite-accent-cyan px-3 py-1.5 rounded-xl hover:scale-105 transition-transform uppercase tracking-widest shadow-lg shadow-elite-accent-cyan/20">
                                Evolve
                              </button>
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="hidden xl:flex items-center gap-2">
              {/* Individual items removed as they are now in the Hub */}
            </div>
            {mounted && (
              <SignedIn>
                {!isPro && !isSuperAdmin && userRole !== 'admin' && userRole !== 'teacher' && (
                  <Link href="/pricing" className="shrink-0">
                    <Button
                      size="sm"
                      className="bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-white font-bold border-0 shadow-lg animate-pulse whitespace-nowrap hidden xl:flex items-center gap-1.5"
                    >
                      <span className="text-sm">👑 Upgrade to Pro</span>
                    </Button>
                  </Link>
                )}
                <div className="hidden xl:flex items-center ml-2">
                  <UserButton afterSignOutUrl="/" />
                </div>
              </SignedIn>
            )}
            <SignedOut>
              <div className="hidden lg:flex items-center gap-2 shrink-0">
                <SignInButton mode="modal">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-slate-600 dark:text-white hover:bg-slate-50 dark:hover:bg-white/10 whitespace-nowrap hidden xl:flex"
                  >
                    {t('login')}
                  </Button>
                </SignInButton>
                <SignInButton mode="modal">
                  <Button variant="outline" size="sm" className="whitespace-nowrap xl:hidden border-slate-200 dark:border-white text-slate-600 dark:text-white hover:bg-slate-50 dark:hover:bg-white/10">
                    {t('login')}
                  </Button>
                </SignInButton>
                <SignInButton mode="modal">
                  <Button variant="inverse" size="sm" className="whitespace-nowrap bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-white/90">
                    {t('signup')}
                  </Button>
                </SignInButton>
              </div>
            </SignedOut>
          </div>
        </div>


        {mounted && mobileOpen && createPortal(
          <div
            className="lg:hidden fixed inset-0 z-[2000] bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          >
            <div
              className="absolute top-0 right-0 w-full max-w-sm h-full bg-elite-bg text-white shadow-2xl flex flex-col border-l border-white/5 animate-in slide-in-from-right duration-300"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 sm:p-6 border-b border-white/5 shrink-0">
                <span className="text-xs font-black uppercase tracking-[0.3em] text-slate-500">Menu</span>
                <button
                  className="touch-target text-white bg-white/5 rounded-xl flex items-center justify-center hover:bg-white/10 active:bg-white/15 transition-all"
                  onClick={() => setMobileOpen(false)}
                  aria-label="Close menu"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6 space-y-6">
                  {/* Primary Navigation */}
                <div className="space-y-2 rounded-2xl border border-white/10 bg-white/[0.03] p-2">
                  <div className="px-3 py-2 text-slate-500 text-[11px] font-black uppercase tracking-[0.22em]">Navigate</div>
                  {navConfig.primaryLinks.map((item, idx) => {
                    // Check if this is a dropdown menu
                    if ('items' in item) {
                      const dropdown = item as import('@/lib/navigation-config').NavDropdown;
                      return (
                        <div key={idx} className="space-y-1">
                          <div className="px-3 py-2 text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wide flex items-center gap-2">
                            {dropdown.icon && <span className="text-base">{dropdown.icon}</span>}
                            {dropdown.label}
                          </div>
                          {dropdown.items.map((subItem) => {
                            const isActive = pathname?.startsWith(subItem.href.split("?")[0]);
                            return (
                              <Link
                                key={subItem.href}
                                href={subItem.href}
                                className={`touch-target pl-6 pr-3 py-3 rounded-xl flex items-center gap-3 transition-all ${isActive
                                  ? 'bg-white/10 font-black text-white border border-elite-accent-cyan/30'
                                  : 'text-slate-400 hover:text-white hover:bg-white/5 active:bg-white/10'
                                  }`}
                                onClick={() => setMobileOpen(false)}
                              >
                                {subItem.icon && <span className="text-lg">{subItem.icon}</span>}
                                <span className="text-sm font-medium">{subItem.label}</span>
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
                        className={`touch-target px-4 py-3 rounded-xl flex items-center gap-3 transition-all ${isActive
                          ? 'bg-white/10 font-black text-white border border-elite-accent-cyan/30'
                          : 'text-slate-400 hover:text-white hover:bg-white/5 active:bg-white/10'
                          }`}
                        onClick={() => setMobileOpen(false)}
                      >
                        {link.icon && <span className="text-lg">{link.icon}</span>}
                        <span className="text-sm font-medium uppercase tracking-wider">{link.label}</span>
                        {link.badge && (
                          <span className="ml-auto text-[11px] bg-elite-accent-cyan/20 text-elite-accent-cyan px-2 py-0.5 rounded-full font-black">
                            {link.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>

                {/* Relay Hub shortcut - shown when desktop Hub is hidden */}
                <div className="xl:hidden pt-4 border-t border-white/5 rounded-2xl border border-white/10 bg-white/[0.03] p-2">
                  <div className="text-xs font-semibold text-slate-500 mb-3 px-3 uppercase tracking-wide">Hub</div>
                  <Link
                    href="/dashboard"
                    className="touch-target px-4 py-3 rounded-xl hover:bg-white/5 active:bg-white/10 flex items-center gap-3 text-slate-300 transition-all"
                    onClick={() => setMobileOpen(false)}
                  >
                    <Zap className="h-5 w-5 text-elite-accent-cyan" />
                    <span className="text-sm">Relay Hub / Dashboard</span>
                  </Link>
                  <Link
                    href="/shop"
                    className="touch-target px-4 py-3 rounded-xl hover:bg-white/5 active:bg-white/10 flex items-center gap-3 text-slate-300 transition-all"
                    onClick={() => setMobileOpen(false)}
                  >
                    <ShoppingBag className="h-5 w-5 text-elite-accent-cyan" />
                    <span className="text-sm">Forge Shop</span>
                  </Link>
                </div>

                {/* Actions Section */}
                {(effectiveRole === 'superadmin' || effectiveRole === 'admin' || effectiveRole === 'teacher' || effectiveRole === 'student' || effectiveRole === 'content_writer' || effectiveRole === 'news_writer' || effectiveRole === 'guest') && (
                  <div className="pt-4 border-t border-white/5 rounded-2xl border border-white/10 bg-white/[0.03] p-2">
                    <div className="text-xs font-semibold text-slate-500 mb-3 px-3 uppercase tracking-wide">Quick Actions</div>
                    <div className="space-y-1">
                      {(effectiveRole === 'superadmin' || effectiveRole === 'admin' || effectiveRole === 'teacher') && (
                        <Link
                          href="/admin/studio/courses"
                          className="touch-target px-4 py-3 rounded-xl hover:bg-white/5 active:bg-white/10 flex items-center gap-3 text-slate-300 transition-all"
                          onClick={() => setMobileOpen(false)}
                        >
                          <BookOpen className="h-5 w-5 text-elite-accent-cyan" />
                          <span className="text-sm">Create Course</span>
                        </Link>
                      )}
                      {(effectiveRole === 'superadmin' || effectiveRole === 'admin' || effectiveRole === 'content_writer') && (
                        <Link
                          href="/admin/studio/news"
                          className="touch-target px-4 py-3 rounded-xl hover:bg-white/5 active:bg-white/10 flex items-center gap-3 text-slate-300 transition-all"
                          onClick={() => setMobileOpen(false)}
                        >
                          <Newspaper className="h-5 w-5 text-red-500" />
                          <span className="text-sm">Terai Times Studio</span>
                        </Link>
                      )}
                      <Link
                        href="/admin/studio/blogs"
                        className="touch-target px-4 py-3 rounded-xl hover:bg-white/5 active:bg-white/10 flex items-center gap-3 text-slate-300 transition-all"
                        onClick={() => setMobileOpen(false)}
                      >
                        <PenSquare className="h-5 w-5 text-elite-accent-purple" />
                        <span className="text-sm">Write Blog</span>
                      </Link>
                      {effectiveRole === 'student' && (
                        <Link
                          href="/admin/studio/practice"
                          className="touch-target px-4 py-3 rounded-xl hover:bg-white/5 active:bg-white/10 flex items-center gap-3 text-slate-300 transition-all"
                          onClick={() => setMobileOpen(false)}
                        >
                          <Target className="h-5 w-5 text-emerald-400" />
                          <span className="text-sm">Self Practice</span>
                        </Link>
                      )}
                      {(effectiveRole === 'superadmin' || effectiveRole === 'admin') && (
                        <Link
                          href="/admin/users"
                          className="touch-target px-4 py-3 rounded-xl hover:bg-white/5 active:bg-white/10 flex items-center gap-3 text-slate-300 transition-all"
                          onClick={() => setMobileOpen(false)}
                        >
                          <Users className="h-5 w-5 text-slate-300" />
                          <span className="text-sm">Manage Users</span>
                        </Link>
                      )}
                    </div>
                  </div>
                )}
                {/* Mobile Auth Buttons */}
                <div className="pt-6 mt-6 border-t border-white/5 rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                  <SignedOut>
                    <div className="grid grid-cols-2 gap-3">
                      <SignInButton mode="modal">
                        <Button
                          variant="outline"
                          className="w-full justify-center border-slate-200 dark:border-white text-slate-600 dark:text-white hover:bg-slate-50 dark:hover:bg-white/10"
                        >
                          {t('login')}
                        </Button>
                      </SignInButton>
                      <SignInButton mode="modal">
                        <Button
                          variant="inverse"
                          className="w-full justify-center bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-white/90"
                        >
                          {t('signup')}
                        </Button>
                      </SignInButton>
                    </div>
                  </SignedOut>
                  <SignedIn>
                    <div className="flex items-center gap-3 px-2">
                      <UserButton afterSignOutUrl="/" />
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-white">My Account</span>
                        <span className="text-xs text-slate-400">Manage your profile</span>
                      </div>
                    </div>
                  </SignedIn>
                </div>
              </div>
            </div>
          </div>
          , document.body)}

        {/* Mobile Search (Row 2) - below main navbar on small screens */}
        <div className="md:hidden mt-2 -mx-1 px-1">
          <div className="glass-card-premium rounded-2xl border-white/10 shadow-xl overflow-hidden">
            <GlobalSearch />
          </div>
        </div>
      </div>
    </header >
  );
}
