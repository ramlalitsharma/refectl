'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { useSearchParams } from 'next/navigation';

interface BlogSummary {
  id: string;
  slug?: string;
  title: string;
  status: string;
  createdAt?: string;
  heroImage?: string;
  authorName?: string;
  isSystem?: boolean;
}

interface BlogDashboardProps {
  blogs: BlogSummary[];
}

export function BlogDashboard({ blogs }: BlogDashboardProps) {
  const [search, setSearch] = useState('');
  const searchParams = useSearchParams();
  
  const filteredBlogs = blogs.filter(b => 
    b.title.toLowerCase().includes(search.toLowerCase())
  );

  const stats = [
    { label: 'Total Posts', value: blogs.length, icon: 'description' },
    { label: 'Drafts', value: blogs.filter(b => b.status === 'draft').length, icon: 'edit_note' },
    { label: 'Published', value: blogs.filter(b => b.status === 'published').length, icon: 'check_circle' },
    { label: 'AI Assisted', value: Math.floor(blogs.length * 0.8), icon: 'smart_toy', color: 'text-studio-primary' },
  ];

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Header */}
      <header className="h-16 flex items-center justify-between px-8 border-b border-studio-border bg-studio-bg/50 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-8 flex-1">
          <div className="flex items-center gap-1 bg-studio-surface border border-studio-border p-1 rounded-xl">
            <Link 
              href="/admin/studio/blogs" 
              className={`px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${!searchParams.get('status') ? 'bg-studio-primary text-white' : 'text-studio-muted hover:text-studio-text'}`}
            >
              All
            </Link>
            <Link 
              href="/admin/studio/blogs?status=published" 
              className={`px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${searchParams.get('status') === 'published' ? 'bg-studio-primary text-white' : 'text-studio-muted hover:text-studio-text'}`}
            >
              Published
            </Link>
            <Link 
              href="/admin/studio/blogs?status=draft" 
              className={`px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${searchParams.get('status') === 'draft' ? 'bg-studio-primary text-white' : 'text-studio-muted hover:text-studio-text'}`}
            >
              Drafts
            </Link>
          </div>

          <div className="relative flex-1 max-w-md">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-studio-muted text-[18px]">search</span>
            <input 
              type="text" 
              placeholder="Search posts..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-studio-surface border border-studio-border rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-studio-primary transition-colors"
            />
          </div>
        </div>

        <Link 
          href="/admin/studio/blogs/new"
          className="bg-studio-primary hover:bg-studio-primary/90 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 shadow-lg shadow-studio-primary/20 transition-all hover:scale-[1.02]"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          New Post
        </Link>
      </header>

      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-studio-surface border border-studio-border p-4 rounded-xl flex items-center gap-4 hover:border-studio-border/80 transition-colors">
              <div className={`w-10 h-10 rounded-lg bg-studio-surface-hover flex items-center justify-center ${stat.color || 'text-studio-muted'}`}>
                <span className="material-symbols-outlined text-[20px]">{stat.icon}</span>
              </div>
              <div>
                <div className="text-[10px] font-bold text-studio-muted uppercase tracking-wider">{stat.label}</div>
                <div className="text-xl font-bold text-studio-text">{stat.value}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBlogs.map((blog) => (
            <div 
              key={blog.id} 
              className="bg-studio-surface border border-studio-border rounded-xl overflow-hidden hover:border-studio-primary/50 transition-all group relative flex flex-col"
            >
              <div className="relative aspect-video bg-studio-surface-hover overflow-hidden cursor-pointer" onClick={() => window.location.href = `/admin/studio/blogs/${blog.slug}`}>
                {blog.heroImage ? (
                  <img 
                    src={blog.heroImage} 
                    alt={blog.title} 
                    className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-studio-muted opacity-20 group-hover:opacity-40 transition-opacity">
                    <span className="material-symbols-outlined text-[48px]">image</span>
                  </div>
                )}
                
                <div className="absolute top-3 left-3 px-2 py-1 bg-studio-bg/80 backdrop-blur rounded text-[10px] font-bold text-studio-text uppercase tracking-widest border border-studio-border">
                  {blog.status}
                </div>
                
                <div className="absolute top-3 right-3 flex flex-col gap-1 items-end">
                  {blog.isSystem ? (
                    <div className="px-2 py-1 bg-amber-500/20 backdrop-blur rounded text-[9px] font-bold text-amber-500 border border-amber-500/30 flex items-center gap-1 shadow-lg shadow-amber-500/10">
                      <span className="material-symbols-outlined text-[10px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                      MOTA CEO
                    </div>
                  ) : (
                    <div className="px-2 py-1 bg-studio-primary/20 backdrop-blur rounded text-[9px] font-bold text-studio-primary border border-studio-primary/30 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[10px]" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                      AI GEN
                    </div>
                  )}
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col gap-3 relative">
                <div className="flex justify-between items-start gap-4">
                  <Link href={`/admin/studio/blogs/${blog.slug}`} className="text-base font-semibold text-studio-text line-clamp-2 leading-tight group-hover:text-studio-primary transition-colors flex-1">
                    {blog.title}
                  </Link>
                  <div className="relative group/menu">
                    <button 
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                      className="text-studio-muted hover:text-studio-text p-1 rounded-md hover:bg-studio-surface-hover transition-colors"
                    >
                      <span className="material-symbols-outlined text-[20px]">more_vert</span>
                    </button>
                    {/* Action Menu */}
                    <div className="absolute right-0 top-full mt-1 w-40 bg-studio-surface border border-studio-border rounded-xl shadow-2xl opacity-0 invisible group-hover/menu:opacity-100 group-hover/menu:visible transition-all z-30 overflow-hidden">
                      <Link href={`/admin/studio/blogs/${blog.slug}`} className="flex items-center gap-2 px-4 py-2.5 text-[10px] font-bold text-studio-text hover:bg-studio-surface-hover transition-colors uppercase tracking-widest">
                        <span className="material-symbols-outlined text-[16px]">edit</span> Edit Post
                      </Link>
                      <Link href={`/en/blog/${blog.slug}`} target="_blank" className="flex items-center gap-2 px-4 py-2.5 text-[10px] font-bold text-studio-text hover:bg-studio-surface-hover transition-colors border-t border-studio-border uppercase tracking-widest">
                        <span className="material-symbols-outlined text-[16px]">visibility</span> View Live
                      </Link>
                      <button 
                        onClick={async (e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          if (confirm('Are you sure you want to delete this post?')) {
                            const res = await fetch(`/api/admin/blogs/${blog.slug}`, { method: 'DELETE' });
                            if (res.ok) window.location.reload();
                          }
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-[10px] font-bold text-red-400 hover:bg-red-500/10 transition-colors border-t border-studio-border uppercase tracking-widest"
                      >
                        <span className="material-symbols-outlined text-[16px]">delete</span> Delete
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="mt-auto flex items-center justify-between pt-3 border-t border-studio-border/50">
                  <div className="flex items-center gap-2">
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${blog.isSystem ? 'bg-amber-500/10 border-amber-500/30' : 'bg-studio-surface-hover border-studio-border'}`}>
                      <span className={`material-symbols-outlined text-[12px] ${blog.isSystem ? 'text-amber-500' : 'text-studio-muted'}`}>
                        {blog.isSystem ? 'token' : 'person'}
                      </span>
                    </div>
                    <span className={`text-[11px] font-medium ${blog.isSystem ? 'text-amber-500/80' : 'text-studio-muted'}`}>
                      {blog.authorName || 'Author'}
                    </span>
                  </div>
                  <span className="text-[11px] text-studio-muted">
                    {blog.createdAt ? formatDistanceToNow(new Date(blog.createdAt), { addSuffix: true }) : 'Recently'}
                  </span>
                </div>
              </div>
            </div>
          ))}
          
          {/* New Post Placeholder */}
          <Link 
            href="/admin/studio/blogs/new"
            className="border-2 border-dashed border-studio-border rounded-xl p-8 flex flex-col items-center justify-center gap-4 hover:border-studio-primary/50 hover:bg-studio-primary/5 transition-all group"
          >
            <div className="w-12 h-12 rounded-full bg-studio-surface border border-studio-border flex items-center justify-center group-hover:bg-studio-primary group-hover:border-studio-primary transition-all">
              <span className="material-symbols-outlined text-studio-muted group-hover:text-white transition-colors">add</span>
            </div>
            <div className="text-center">
              <div className="text-sm font-bold text-studio-text">Create New Post</div>
              <div className="text-xs text-studio-muted">Start from scratch or use AI</div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
