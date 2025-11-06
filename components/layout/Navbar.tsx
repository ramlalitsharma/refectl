'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SignedIn, SignedOut, UserButton, SignInButton } from '@clerk/nextjs';
import { SiteBrand } from './SiteBrand';
import { Button } from '@/components/ui/Button';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { GlobalSearch } from '@/components/search/GlobalSearch';
import { NotificationBell } from '@/components/notifications/NotificationBell';

export function Navbar() {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin');

  return (
    <header className="bg-white dark:bg-gray-800 border-b sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <SiteBrand />
          
          <nav className="hidden md:flex items-center gap-6">
            <Link 
              href="/courses" 
              className={`text-sm font-medium transition-colors ${
                pathname === '/courses' 
                  ? 'text-blue-600 dark:text-blue-400' 
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Courses
            </Link>
            <Link 
              href="/subjects" 
              className={`text-sm font-medium transition-colors ${
                pathname?.startsWith('/subjects') 
                  ? 'text-blue-600 dark:text-blue-400' 
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Subjects
            </Link>
            <Link 
              href="/exams" 
              className={`text-sm font-medium transition-colors ${
                pathname?.startsWith('/exams') 
                  ? 'text-blue-600 dark:text-blue-400' 
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Exams
            </Link>
            <Link 
              href="/blog" 
              className={`text-sm font-medium transition-colors ${
                pathname?.startsWith('/blog') 
                  ? 'text-blue-600 dark:text-blue-400' 
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Blog
            </Link>
            <Link 
              href="/pricing" 
              className={`text-sm font-medium transition-colors ${
                pathname === '/pricing' 
                  ? 'text-blue-600 dark:text-blue-400' 
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Pricing
            </Link>
          </nav>

          <div className="flex items-center gap-4 flex-1 justify-end md:justify-center md:flex-none md:mx-8">
            <div className="hidden lg:block w-full max-w-md">
              <GlobalSearch />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <ThemeToggle />
            <SignedIn>
              <div className="flex items-center gap-3">
                <NotificationBell />
                <Link href="/my-learning">
                  <Button variant="outline" size="sm" className="hidden sm:inline-flex">
                    My Learning
                  </Button>
                </Link>
                <Link href="/dashboard">
                  <Button variant="outline" size="sm" className="hidden sm:inline-flex">
                    Dashboard
                  </Button>
                </Link>
                {isAdmin && (
                  <Link href="/admin">
                    <Button variant="outline" size="sm" className="hidden sm:inline-flex">
                      Admin
                    </Button>
                  </Link>
                )}
                <UserButton afterSignOutUrl="/" />
              </div>
            </SignedIn>
            <SignedOut>
              <SignInButton mode="modal">
                <Button variant="outline" size="sm">Sign In</Button>
              </SignInButton>
              <SignInButton mode="modal">
                <Button size="sm">Get Started</Button>
              </SignInButton>
            </SignedOut>
          </div>
        </div>
      </div>
    </header>
  );
}

