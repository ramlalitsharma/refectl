'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SignedIn, SignedOut, UserButton, SignInButton } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import { SiteBrand } from './SiteBrand';
import { Button } from '@/components/ui/Button';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { GlobalSearch } from '@/components/search/GlobalSearch';
import { NotificationBell } from '@/components/notifications/NotificationBell';

const navLinks = [
  { href: '/courses', label: 'Courses' },
  { href: '/subjects', label: 'Subjects' },
  { href: '/exams', label: 'Exams' },
  { href: '/preparations', label: 'Preparations' },
  { href: '/exams?type=international', label: 'International' },
  { href: '/blog', label: 'Blog' },
];

export function Navbar() {
  const pathname = usePathname();
  const [allowAdmin, setAllowAdmin] = useState(false);

  useEffect(() => {
    let mounted = true;
    fetch('/api/admin/status')
      .then((res) => res.json())
      .then((data) => {
        if (mounted) setAllowAdmin(data?.isAdmin === true);
      })
      .catch(() => setAllowAdmin(false));
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <header className="bg-[#0f766e] text-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <SiteBrand />
            <nav className="hidden md:flex items-center gap-4 text-sm font-medium">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`transition-colors hover:text-white/80 ${
                    pathname?.startsWith(link.href.split('?')[0])
                      ? 'text-white'
                      : 'text-white/80'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            {allowAdmin && (
              <span className="hidden md:inline-flex items-center gap-1 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-white">
                🛡️ Admin
              </span>
            )}
            <ThemeToggle />
            <SignedIn>
              <NotificationBell />
              <Link href="/my-learning">
                <Button variant="outline" size="sm" className="border-white text-white">
                  My Learning
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="outline" size="sm" className="border-white text-white">
                  Dashboard
                </Button>
              </Link>
              {allowAdmin && (
                <Link href="/admin">
                  <Button variant="outline" size="sm" className="border-white text-white">
                    Admin Console
                  </Button>
                </Link>
              )}
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
            <SignedOut>
              <SignInButton mode="modal">
                <Button variant="outline" size="sm" className="border-white text-white">
                  Sign In
                </Button>
              </SignInButton>
              <SignInButton mode="modal">
                <Button size="sm" className="bg-white text-[#0f766e]">
                  Get Started
                </Button>
              </SignInButton>
            </SignedOut>
          </div>
        </div>

        <div className="md:hidden flex flex-wrap gap-3 text-sm font-medium">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`transition-colors hover:text-white/80 ${
                pathname?.startsWith(link.href.split('?')[0]) ? 'text-white' : 'text-white/70'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="bg-white rounded-2xl px-4 py-2 text-slate-600">
          <GlobalSearch />
        </div>
      </div>
    </header>
  );
}

