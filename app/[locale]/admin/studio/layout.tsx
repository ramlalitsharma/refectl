'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function StudioLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const menuItems = [
    { label: 'All Posts', icon: 'description', href: '/admin/studio/blogs', active: pathname.includes('/blogs') },
    { label: 'Drafts', icon: 'draft', href: '/admin/studio/blogs?status=draft', active: false },
    { label: 'Published', icon: 'check_circle', href: '/admin/studio/blogs?status=published', active: false },
    { label: 'Analytics', icon: 'analytics', href: '/admin/studio/analytics', active: pathname.includes('/analytics') },
  ];

  const tools = [
    { label: 'AI Co-Pilot', icon: 'smart_toy', href: '/admin/studio/ai' },
    { label: 'Asset Library', icon: 'folder_open', href: '/admin/studio/assets' },
    { label: 'Settings', icon: 'settings', href: '/admin/studio/settings' },
  ];

  return (
    <div className="dark min-h-screen bg-studio-bg flex text-studio-text antialiased selection:bg-studio-primary/30">
      {/* Sidebar */}
      <aside className="w-[240px] bg-studio-surface border-r border-studio-border flex flex-col shrink-0 h-screen sticky top-0">
        <div className="h-16 flex items-center px-6 border-b border-studio-border gap-3">
          <div className="w-8 h-8 rounded-lg bg-studio-primary flex items-center justify-center shadow-lg shadow-studio-primary/20">
            <span className="material-symbols-outlined text-white text-[20px]">bolt</span>
          </div>
          <h1 className="text-studio-text text-base font-semibold tracking-tight">Refectl Studio</h1>
        </div>

        <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
          <div className="text-[10px] font-bold text-studio-muted uppercase tracking-wider px-3 mb-2 opacity-50">Content</div>
          {menuItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-200 group ${
                item.active 
                  ? 'bg-studio-surface-hover text-studio-text' 
                  : 'text-studio-muted hover:bg-studio-surface-hover hover:text-studio-text'
              }`}
            >
              <span className={`material-symbols-outlined text-[20px] transition-colors ${
                item.active ? 'text-studio-primary' : 'text-studio-muted group-hover:text-studio-text'
              }`} style={{ fontVariationSettings: item.active ? "'FILL' 1" : "''" }}>
                {item.icon}
              </span>
              <span className="text-sm font-medium">{item.label}</span>
              {item.label === 'Drafts' && (
                <span className="ml-auto text-[10px] bg-studio-border px-1.5 py-0.5 rounded text-studio-muted">4</span>
              )}
            </Link>
          ))}

          <div className="text-[10px] font-bold text-studio-muted uppercase tracking-wider px-3 mt-6 mb-2 opacity-50">Tools</div>
          {tools.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2 rounded-md text-studio-muted hover:bg-studio-surface-hover hover:text-studio-text transition-all duration-200 group"
            >
              <span className="material-symbols-outlined text-[20px] transition-colors group-hover:text-studio-text">
                {item.icon}
              </span>
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-studio-border">
          <div className="bg-studio-surface-hover/50 rounded-xl p-4 border border-studio-border/50">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-studio-primary to-indigo-400 flex items-center justify-center text-[10px] font-bold text-white">
                AI
              </div>
              <div>
                <div className="text-xs font-semibold text-studio-text">Pro Plan</div>
                <div className="text-[10px] text-studio-muted">84% tokens used</div>
              </div>
            </div>
            <div className="w-full h-1 bg-studio-border rounded-full overflow-hidden">
              <div className="h-full bg-studio-primary w-[84%]" />
            </div>
            <button className="w-full mt-4 py-2 text-[11px] font-bold text-studio-text border border-studio-border rounded-lg hover:bg-studio-surface transition-colors">
              Upgrade Storage
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-studio-bg noise-texture">
        {children}
      </main>
    </div>
  );
}
