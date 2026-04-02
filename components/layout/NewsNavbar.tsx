"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "@/lib/navigation";
import { SignedIn, SignedOut, SignInButton, UserButton, useUser } from "@clerk/nextjs";
import {
  Book,
  BookOpen,
  ChevronDown,
  LayoutDashboard,
  Library,
  Newspaper,
  PenSquare,
  Search,
  Shield,
  ShoppingBag,
  Zap,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { GlobalSearch } from "@/components/search/GlobalSearch";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import { Button } from "@/components/ui/Button";
import { Trophy } from "lucide-react";

type NavLabels = {
  home: string;
  world: string;
  more: string;
};

type UserRole =
  | "superadmin"
  | "admin"
  | "teacher"
  | "content_writer"
  | "news_writer"
  | "student"
  | "user"
  | "guest";

const LABELS_BY_LOCALE: Record<string, NavLabels> = {
  en: { home: "Home", world: "World", more: "More" },
  hi: { home: "होम", world: "विश्व", more: "और" },
  ne: { home: "होम", world: "विश्व", more: "थप" },
  ja: { home: "ホーム", world: "世界", more: "その他" },
  zh: { home: "首页", world: "国际", more: "更多" },
  fr: { home: "Accueil", world: "Monde", more: "Plus" },
  de: { home: "Start", world: "Welt", more: "Mehr" },
  ar: { home: "الرئيسية", world: "العالم", more: "المزيد" },
};

const LOCALE_BY_COUNTRY: Record<string, string> = {
  Nepal: "ne-NP",
  India: "hi-IN",
  USA: "en-US",
  UK: "en-GB",
  Australia: "en-AU",
  Japan: "ja-JP",
  China: "zh-CN",
  France: "fr-FR",
  Germany: "de-DE",
  UAE: "ar-AE",
  Global: "en-US",
  All: "en-US",
};

function resolveLocale(country: string): string {
  if (country && LOCALE_BY_COUNTRY[country]) return LOCALE_BY_COUNTRY[country];
  if (typeof navigator !== "undefined" && navigator.language) return navigator.language;
  return "en-US";
}

function baseLocale(locale: string): string {
  return locale.split("-")[0].toLowerCase();
}

function buildNewsHref(category: string, country: string): string {
  const params = new URLSearchParams();
  if (category && category !== "All") params.set("category", category);
  if (country && country !== "All") params.set("country", country);
  const query = params.toString();
  return query ? `/news?${query}` : "/news";
}

export function NewsNavbar() {
  const searchParams = useSearchParams();
  const { user } = useUser();

  const [mounted, setMounted] = useState(false);
  const [actionsOpen, setActionsOpen] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [isPro, setIsPro] = useState(false);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [availableCountries, setAvailableCountries] = useState<string[]>(["All", "Global"]);
  const [availableCategories, setAvailableCategories] = useState<string[]>(["World", "Politics", "Business"]);
  const hubRef = useRef<HTMLDivElement | null>(null);

  const currentCategory = searchParams.get("category") || "All";
  const currentCountry = searchParams.get("country") || "All";
  const locale = useMemo(() => resolveLocale(currentCountry), [currentCountry]);
  const labels = useMemo(() => LABELS_BY_LOCALE[baseLocale(locale)] || LABELS_BY_LOCALE.en, [locale]);
  const effectiveRole = userRole || "user";

  const activeName = user?.fullName || [user?.firstName, user?.lastName].filter(Boolean).join(" ") || "User";
  const activeEmail = user?.primaryEmailAddress?.emailAddress || "No email";

  useEffect(() => {
    setTimeout(() => setMounted(true), 0);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/admin/status", { signal: controller.signal })
      .then((res) => res.json())
      .then((data) => {
        setIsSuperAdmin(Boolean(data?.isSuperAdmin || data?.role === "superadmin"));
        setIsPro(Boolean(data?.isPro));
        if (data?.role && ["superadmin", "admin", "teacher", "content_writer", "news_writer", "student", "user", "guest"].includes(data.role)) {
          setUserRole(data.role as UserRole);
        } else {
          setUserRole("user");
        }
      })
      .catch(() => {
        setIsSuperAdmin(false);
        setIsPro(false);
        setUserRole("user");
      });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/public/news?facets=1", { signal: controller.signal })
      .then((res) => res.json())
      .then((data) => {
        const countries = Array.isArray(data?.countries) ? data.countries.filter(Boolean) : [];
        const categories = Array.isArray(data?.categories) ? data.categories.filter(Boolean) : [];
        if (countries.length) setAvailableCountries(countries);
        if (categories.length) setAvailableCategories(categories);
      })
      .catch(() => {
        setAvailableCountries((prev) => (prev.length ? prev : ["All", "Global", "USA", "India", "Nepal"]));
        setAvailableCategories((prev) => (prev.length ? prev : ["World", "Politics", "Business"]));
      });

    return () => controller.abort();
  }, []);

  useEffect(() => {
    const onClickAway = (event: MouseEvent) => {
      const target = event.target as Node;
      if (hubRef.current && !hubRef.current.contains(target)) {
        setActionsOpen(false);
      }
    };
    const onEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setActionsOpen(false);
      }
    };

    document.addEventListener("mousedown", onClickAway);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onClickAway);
      document.removeEventListener("keydown", onEsc);
    };
  }, []);

  const coreCategories = [{ value: "Home", label: labels.home }];

  const moreCategories = useMemo(() => {
    const blocked = new Set(["All", "Home", "World"]);
    const base = availableCategories.filter((category) => !blocked.has(category));
    if (currentCategory !== "All" && !blocked.has(currentCategory) && !base.includes(currentCategory)) {
      return [currentCategory, ...base];
    }
    return base;
  }, [availableCategories, currentCategory]);

  const countries = useMemo(() => {
    const withAll = availableCountries.includes("All") ? availableCountries : ["All", ...availableCountries];
    return Array.from(new Set(withAll.filter(Boolean)));
  }, [availableCountries]);

  return (
    <header className="relative z-40 bg-white border-b border-gray-200 dark:border-gray-800 dark:bg-[#111111] font-sans">
      <div className="w-full max-w-none px-4 md:px-8 py-0 flex items-center justify-between min-h-[64px]">
        <div className="flex items-center gap-8 h-full">
          <Link href="/news" className="flex items-center group py-4">
            <div className="text-[1.8rem] md:text-[2.2rem] font-black tracking-tighter leading-none text-[#f08821] font-serif transition-transform duration-500 group-hover:scale-[1.02] flex items-center gap-2">
              <span className="w-8 h-8 rounded-full border-[3px] border-dotted border-[#f08821] flex items-center justify-center -mr-1">
                <div className="w-4 h-4 rounded-full bg-[#f08821]" />
              </span>
              Terai Times
            </div>
          </Link>

          <nav className="hidden md:flex items-center h-full pt-1">
            <ul className="flex items-center h-full text-[14px] font-bold text-[#333333] dark:text-gray-300">
              {coreCategories.map((item) => {
                const isHome = item.value === "Home";
                const href = isHome ? buildNewsHref("All", currentCountry) : buildNewsHref(item.value, currentCountry);
                const isActive = (item.value === "Home" && currentCategory === "All") || item.value === currentCategory;
                return (
                  <li key={item.value} className="h-full flex items-center">
                    <Link
                      href={href}
                      className={`h-full flex items-center px-4 hover:text-[#f08821] transition-colors ${isActive ? "text-[#f08821] border-b-[3px] border-[#f08821]" : "border-b-[3px] border-transparent"}`}
                      style={{ marginBottom: "-1px" }}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}

              {/* IPL LIVE SPECIAL LINK */}
              <li className="h-full flex items-center">
                <Link
                  href={buildNewsHref("IPL-Live", currentCountry)}
                  className={`h-full flex items-center px-4 gap-2 transition-all group ${currentCategory === 'IPL-Live' ? 'text-orange-500 border-b-[3px] border-orange-500 bg-orange-500/5' : 'text-[#333333] dark:text-gray-300 hover:text-orange-500 border-b-[3px] border-transparent'}`}
                  style={{ marginBottom: "-1px" }}
                >
                  <Trophy size={14} className={`${currentCategory === 'IPL-Live' ? 'text-orange-500' : 'text-slate-400 group-hover:text-orange-500'} transition-colors`} />
                  <span className="font-black uppercase tracking-widest text-[11px]">IPL Live</span>
                  <span className="flex h-1.5 w-1.5 rounded-full bg-orange-500 animate-pulse shadow-[0_0_8px_rgba(249,115,22,0.8)]" />
                </Link>
              </li>

              <li className="relative group/world h-full flex items-center">
                <button
                  className={`flex items-center gap-1 px-4 h-full hover:text-[#f08821] transition-colors border-b-[3px] ${currentCountry !== "All" ? "text-[#f08821] border-[#f08821]" : "border-transparent"}`}
                  style={{ marginBottom: "-1px" }}
                >
                  {labels.world} <ChevronDown size={14} className="mt-0.5" />
                </button>
                <div className="absolute top-full left-0 mt-0 w-56 max-h-[360px] overflow-y-auto bg-white dark:bg-[#111111] border border-gray-200 dark:border-gray-800 shadow-xl py-2 opacity-0 invisible group-hover/world:opacity-100 group-hover/world:visible transition-all z-[110]">
                  {countries.map((country) => (
                    <Link
                      key={country}
                      href={buildNewsHref(currentCategory, country)}
                      className={`block px-5 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-900 hover:text-[#f08821] transition-colors text-[13px] ${currentCountry === country ? "text-[#f08821] font-bold" : ""}`}
                    >
                      {country}
                    </Link>
                  ))}
                </div>
              </li>

              <li className="relative group/more h-full flex items-center">
                <button
                  className={`flex items-center gap-1 px-4 h-full hover:text-[#f08821] transition-colors border-b-[3px] ${moreCategories.includes(currentCategory) ? "text-[#f08821] border-[#f08821]" : "border-transparent"}`}
                  style={{ marginBottom: "-1px" }}
                >
                  {labels.more} <ChevronDown size={14} className="mt-0.5" />
                </button>
                <div className="absolute top-full left-0 mt-0 w-56 max-h-[360px] overflow-y-auto bg-white dark:bg-[#111111] border border-gray-200 dark:border-gray-800 shadow-xl py-2 opacity-0 invisible group-hover/more:opacity-100 group-hover/more:visible transition-all z-[110]">
                  {moreCategories.map((category) => (
                    <Link
                      key={category}
                      href={buildNewsHref(category, currentCountry)}
                      className={`block px-5 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-900 hover:text-[#f08821] transition-colors text-[13px] ${currentCategory === category ? "text-[#f08821] font-bold" : ""}`}
                    >
                      {category}
                    </Link>
                  ))}
                  {!moreCategories.length ? <div className="px-5 py-3 text-[12px] text-gray-500">No categories yet</div> : null}
                </div>
              </li>
            </ul>
          </nav>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <div className="hidden md:block shrink-0">
            <GlobalSearch />
          </div>

          <div ref={hubRef} className="relative hidden xl:block z-[1002] shrink-0">
            <button
              type="button"
              onClick={() => setActionsOpen((v) => !v)}
              aria-expanded={actionsOpen}
              className="flex items-center gap-2 px-3 xl:px-4 2xl:px-5 py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 transition-all duration-200 ease-out text-slate-900 dark:text-white border border-gray-300 dark:border-white/10 hover:border-elite-accent-cyan/30 hover:shadow-lg hover:shadow-elite-accent-cyan/10 hover:-translate-y-[1px] active:scale-95 group"
              aria-label="Refectl Hub"
              title="Refectl Hub"
            >
              <Zap className="h-4 w-4 text-elite-accent-cyan group-hover:scale-110 transition-transform duration-500 shrink-0" />
              <span className="hidden 2xl:inline text-[11px] font-black uppercase tracking-[0.16em]">Relay Hub</span>
              <span className={`text-[10px] opacity-40 transition-transform duration-200 ${actionsOpen ? "rotate-180" : ""}`}>▼</span>
            </button>

            {actionsOpen ? (
              <div className="absolute right-0 mt-3 w-96 rounded-[2rem] bg-white/95 dark:bg-elite-bg/95 text-slate-900 dark:text-white shadow-[0_30px_100px_-15px_rgba(0,0,0,0.1)] dark:shadow-[0_30px_100px_-15px_rgba(0,0,0,0.8)] border border-slate-200 dark:border-white/10 z-[9999] backdrop-blur-3xl ring-1 ring-black/5 dark:ring-white/5 max-h-[85vh] overflow-y-auto custom-scrollbar">
                {!userRole ? (
                  <div className="px-4 py-8 text-center">
                    <div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                    <p className="text-xs text-slate-500 font-medium">Loading your Hub...</p>
                  </div>
                ) : (
                  <div className="flex flex-col">
                    <div className="p-6 border-b border-white/5 bg-white/5">
                      <div className="flex items-center justify-between px-2 mb-4">
                        <span className="text-[11px] uppercase font-black text-slate-500 tracking-[0.35em]">Creation Studio</span>
                      </div>
                      <div className="grid gap-2">
                        {(effectiveRole === "teacher" || effectiveRole === "admin" || effectiveRole === "superadmin") && (
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
                        {(effectiveRole === "content_writer" || effectiveRole === "news_writer" || effectiveRole === "admin" || effectiveRole === "superadmin") && (
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
                        {(effectiveRole === "superadmin" || effectiveRole === "admin" || effectiveRole === "teacher" || effectiveRole === "news_writer") && (
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

                    <div className="p-6 border-b border-white/5 bg-white/5">
                      <div className="px-2 mb-4 flex items-center justify-between">
                        <span className="text-[11px] uppercase font-black text-slate-500 tracking-[0.35em]">Intelligence Alerts</span>
                        <NotificationBell />
                      </div>
                    </div>

                    <div className="p-6 bg-elite-accent-cyan/5">
                      <div className="px-2 mb-4 text-[11px] uppercase font-black text-slate-500 tracking-[0.35em]">My Account</div>
                      <div className="grid gap-2">
                        {effectiveRole === "superadmin" && (
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
                        <Link href="/admin/studio/news" className="flex items-center gap-4 px-4 py-3 rounded-2xl hover:bg-white/5 border border-transparent hover:border-white/10 transition-all group" onClick={() => setActionsOpen(false)}>
                          <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center text-lg group-hover:rotate-12 transition-transform">
                            <Newspaper className="h-5 w-5 text-red-500" />
                          </div>
                          <span className="text-[11px] font-black uppercase tracking-widest text-white">Newsroom</span>
                        </Link>
                      </div>
                      <div className="mt-6 flex items-center justify-between px-5 py-4 bg-white/5 rounded-3xl border border-white/10 shadow-inner">
                        <div className="flex items-center gap-4">
                          <UserButton afterSignOutUrl="/" />
                          <div className="flex flex-col min-w-0">
                            <span className="text-[11px] font-black text-white uppercase tracking-tight truncate">{activeName}</span>
                            <span className="text-[10px] text-elite-accent-cyan font-black uppercase tracking-[0.18em] truncate">{activeEmail}</span>
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
            ) : null}
          </div>

          {mounted && (
            <SignedIn>
              {!isPro && !isSuperAdmin && userRole !== "admin" && userRole !== "teacher" && (
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

          {mounted && (
            <SignedOut>
              <div className="hidden lg:flex items-center gap-2 shrink-0">
                <SignInButton mode="modal">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-slate-600 dark:text-white hover:bg-slate-50 dark:hover:bg-white/10 whitespace-nowrap hidden xl:flex"
                  >
                    Sign In
                  </Button>
                </SignInButton>
                <SignInButton mode="modal">
                  <Button variant="outline" size="sm" className="whitespace-nowrap xl:hidden border-slate-200 dark:border-white text-slate-600 dark:text-white hover:bg-slate-50 dark:hover:bg-white/10">
                    Sign In
                  </Button>
                </SignInButton>
                <SignInButton mode="modal">
                  <Button variant="inverse" size="sm" className="whitespace-nowrap bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-white/90">
                    Get Started
                  </Button>
                </SignInButton>
              </div>
            </SignedOut>
          )}

          <button
            type="button"
            aria-label="Open search"
            onClick={() => {
              const btn = document.querySelector<HTMLButtonElement>('[aria-label="Search site"]');
              btn?.click();
            }}
            className="md:hidden inline-flex items-center justify-center p-2 text-[#333333] dark:text-gray-300 hover:text-[#f08821] transition-colors"
          >
            <Search size={20} />
          </button>
        </div>
      </div>

      <div className="md:hidden mt-2 px-3">
        <div className="glass-card-premium rounded-2xl border-white/10 shadow-xl overflow-hidden">
          <GlobalSearch />
        </div>
      </div>

      <div className="md:hidden w-full overflow-x-auto no-scrollbar border-t border-gray-200 dark:border-gray-800 mt-2">
        <ul className="flex items-center text-[13px] font-bold text-[#333333] dark:text-gray-300 px-2 py-2 w-max">
          <li>
            <Link href={buildNewsHref("All", currentCountry)} className={`px-3 py-1 block ${currentCategory === "All" ? "text-[#f08821]" : ""}`}>
              {labels.home}
            </Link>
          </li>
          <li>
            <Link href={buildNewsHref(currentCategory, "All")} className={`px-3 py-1 block ${currentCountry === "All" ? "" : "text-[#f08821]"}`}>
              {labels.world}
            </Link>
          </li>
        </ul>
      </div>
    </header>
  );
}
