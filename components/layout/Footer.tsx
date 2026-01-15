import Link from 'next/link';
import { SiteBrand } from './SiteBrand';
import { BRAND_NAME } from '@/lib/brand';

const footerLinks = [
  {
    title: 'Platform',
    items: [
      { label: 'Courses', href: '/courses' },
      { label: 'Subjects', href: '/subjects' },
      { label: 'Exams', href: '/exams' },
      { label: 'Preparations', href: '/preparations' },
    ],
  },
  {
    title: 'Company',
    items: [
      { label: 'About', href: '/about' },
      { label: 'Blog', href: '/blog' },
      { label: 'Careers', href: '/careers' },
      { label: 'Contact', href: '/contact' },
    ],
  },
  {
    title: 'Support',
    items: [
      { label: 'Help Center', href: '/help' },
      { label: 'Pricing', href: '/pricing' },
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Terms', href: '/terms' },
    ],
  },
];

const socialLinks = [
  { label: 'LinkedIn', href: 'https://www.linkedin.com/company/adaptiq' },
  { label: 'Twitter', href: 'https://twitter.com/adaptiq' },
  { label: 'YouTube', href: 'https://www.youtube.com/@adaptiq' },
];

export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300">
      <div className="container mx-auto px-4 py-12 grid gap-10 lg:grid-cols-[minmax(0,1.2fr),minmax(0,1fr)]">
        <div className="space-y-4">
          <SiteBrand variant="light" />
          <p className="max-w-md text-sm text-slate-300">
            {BRAND_NAME} is the AI-native learning platform delivering adaptive learning paths, certification workflows, and real-time analytics for learners and administrators.
          </p>
          <div className="flex gap-4 text-sm">
            {socialLinks.map((link) => (
              <Link key={link.href} href={link.href} className="hover:text-white transition-colors">
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="grid gap-8 sm:grid-cols-3">
          {footerLinks.map((group) => (
            <div key={group.title} className="space-y-3 text-sm">
              <h3 className="font-semibold text-white">{group.title}</h3>
              <ul className="space-y-2">
                {group.items.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className="hover:text-white transition-colors">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-slate-800">
        <div className="container mx-auto px-4 py-6 text-xs text-slate-500 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} {BRAND_NAME}. All rights reserved.</p>
          <p className="text-slate-500">AI-powered adaptive learning infrastructure for next-generation education.</p>
        </div>
      </div>
    </footer>
  );
}
