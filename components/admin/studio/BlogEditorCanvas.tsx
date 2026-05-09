'use client';

import React, { useState, useEffect } from 'react';
import { TipTapEditor } from '@/components/editor/TipTapEditor';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

interface BlogEditorCanvasProps {
  initialData?: any;
  slug?: string;
}

export function BlogEditorCanvas({ initialData, slug }: BlogEditorCanvasProps) {
  const router = useRouter();
  const [content, setContent] = useState(initialData?.content || '');
  const [title, setTitle] = useState(initialData?.title || '');
  const [saving, setSaving] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [aiChat, setAiChat] = useState<{ role: 'user' | 'ai'; text: string }[]>([
    { role: 'ai', text: 'Hello! I am your AI Co-Pilot. How can I help you with this post today?' }
  ]);
  const [message, setMessage] = useState('');

  const [metadata, setMetadata] = useState({
    excerpt: initialData?.excerpt || '',
    tags: initialData?.tags || '',
    category: initialData?.category || 'Tech',
    isTrending: initialData?.isTrending || false,
    coverImage: initialData?.heroImage || '',
  });

  const handleSave = async (status: string = 'draft') => {
    setSaving(true);
    try {
      const url = slug ? `/api/admin/blogs/${slug}` : '/api/admin/blogs';
      const method = slug ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          content,
          status,
          ...metadata,
        }),
      });

      if (!res.ok) throw new Error('Failed to save');
      
      toast.success(`Blog saved as ${status}`);
      if (!slug) {
        const data = await res.json();
        router.push(`/admin/studio/blogs/${data.blog.slug}`);
      }
    } catch (error) {
      toast.error('Error saving blog');
    } finally {
      setSaving(false);
    }
  };

  const sendMessage = async () => {
    if (!message.trim()) return;
    const userMsg = message;
    setAiChat(prev => [...prev, { role: 'user', text: userMsg }]);
    setMessage('');
    
    try {
      const res = await fetch('/api/admin/blogs/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'improve_markdown', 
          markdown: content,
          instruction: userMsg 
        }),
      });
      const data = await res.json();
      if (data.markdown) {
        setAiChat(prev => [...prev, { role: 'ai', text: "I've analyzed your request and improved the content. Would you like to apply these changes?" }]);
        // For now just show suggestion
      }
    } catch {
      setAiChat(prev => [...prev, { role: 'ai', text: "Sorry, I'm having trouble connecting right now." }]);
    }
  };

  return (
    <div className="flex flex-1 overflow-hidden h-full">
      {/* Canvas Area */}
      <div className="flex-1 flex flex-col h-full bg-studio-bg overflow-hidden relative">
        {/* Floating Toolbar Header */}
        <header className="absolute top-6 left-1/2 -translate-x-1/2 w-[90%] max-w-5xl h-14 bg-studio-surface/80 backdrop-blur-xl border border-studio-border rounded-2xl flex items-center justify-between px-6 z-20 shadow-2xl">
          <div className="flex items-center gap-4">
            <button onClick={() => router.push('/admin/studio/blogs')} className="text-studio-muted hover:text-studio-text transition-colors">
              <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            </button>
            <div className="h-4 w-px bg-studio-border" />
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-studio-success uppercase tracking-widest flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-studio-success animate-pulse" />
                Draft Saved
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="text-studio-muted hover:text-studio-text px-3 py-1.5 text-xs font-bold transition-colors uppercase tracking-widest">
              Preview
            </button>
            <button 
              onClick={() => handleSave('draft')}
              disabled={saving}
              className="text-studio-text hover:bg-studio-surface-hover px-4 py-1.5 rounded-lg text-xs font-bold transition-all uppercase tracking-widest border border-studio-border"
            >
              {saving ? 'Saving...' : 'Save Draft'}
            </button>
            <button 
              onClick={() => setShowSettings(!showSettings)}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold border transition-all uppercase tracking-widest ${
                showSettings ? 'bg-studio-primary border-studio-primary text-white' : 'bg-studio-surface-hover text-studio-text border-studio-border hover:bg-studio-surface'
              }`}
            >
              Publishing Hub
            </button>
            <button 
              onClick={() => handleSave('published')}
              disabled={saving}
              className="bg-studio-primary hover:bg-studio-primary/90 text-white px-5 py-1.5 rounded-lg text-xs font-bold shadow-lg shadow-studio-primary/20 transition-all active:scale-95 disabled:opacity-50"
            >
              {saving ? 'Publishing...' : 'Publish'}
            </button>
          </div>
        </header>

        {/* The Writing Surface */}
        <div className="flex-1 overflow-y-auto pt-32 pb-20 px-8 custom-scrollbar">
          <div className="max-w-3xl mx-auto">
            {/* Title Input */}
            <textarea
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter title here..."
              rows={1}
              className="w-full bg-transparent text-5xl font-black text-studio-text placeholder:text-studio-muted focus:outline-none mb-8 leading-[1.1] resize-none overflow-hidden"
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = 'auto';
                target.style.height = target.scrollHeight + 'px';
              }}
            />

            {/* TipTap Editor integration */}
            <div className="prose-studio">
              <TipTapEditor
                value={content}
                onChange={setContent}
                disabled={false}
                placeholder="Start your story..."
              />
            </div>
          </div>
        </div>
      </div>

      {/* Settings Drawer (Publishing Hub) */}
      {showSettings && (
        <aside className="w-[380px] bg-studio-surface border-l border-studio-border flex flex-col shrink-0 h-full relative z-40 shadow-2xl overflow-y-auto custom-scrollbar">
          <div className="h-16 flex items-center justify-between px-8 border-b border-studio-border sticky top-0 bg-studio-surface/80 backdrop-blur-md z-10">
            <h2 className="text-sm font-bold text-studio-text tracking-widest uppercase">Publishing Hub</h2>
            <button onClick={() => setShowSettings(false)} className="text-studio-muted hover:text-studio-text">
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          <div className="p-8 space-y-8 flex-1">
            <section className="space-y-4">
              <h3 className="text-[10px] font-bold text-studio-muted uppercase tracking-widest">Metadata</h3>
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-studio-muted uppercase">Excerpt</label>
                  <textarea 
                    className="w-full bg-studio-surface-hover border border-studio-border rounded-xl p-3 text-xs text-studio-text focus:border-studio-primary outline-none transition-colors min-h-[100px]"
                    placeholder="Short description for SEO..."
                    value={metadata.excerpt}
                    onChange={e => setMetadata({...metadata, excerpt: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-studio-muted uppercase">Tags</label>
                  <input 
                    className="w-full bg-studio-surface-hover border border-studio-border rounded-xl p-3 text-xs text-studio-text focus:border-studio-primary outline-none transition-colors"
                    placeholder="ai, learning, future..."
                    value={metadata.tags}
                    onChange={e => setMetadata({...metadata, tags: e.target.value})}
                  />
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <h3 className="text-[10px] font-bold text-studio-muted uppercase tracking-widest">Featured Image</h3>
              <div className="aspect-video bg-studio-surface-hover border border-studio-border border-dashed rounded-2xl flex flex-col items-center justify-center gap-3 group hover:border-studio-primary/50 transition-all cursor-pointer overflow-hidden relative">
                {metadata.coverImage ? (
                  <img src={metadata.coverImage} className="w-full h-full object-cover" />
                ) : (
                  <>
                    <div className="w-10 h-10 rounded-full bg-studio-surface border border-studio-border flex items-center justify-center text-studio-muted group-hover:text-studio-primary transition-colors">
                      <span className="material-symbols-outlined">add_a_photo</span>
                    </div>
                    <span className="text-[10px] font-bold text-studio-muted uppercase tracking-widest">Upload Cover</span>
                  </>
                )}
                <input 
                  type="text" 
                  className="absolute inset-x-4 bottom-4 bg-studio-bg/80 backdrop-blur border border-studio-border rounded-lg p-2 text-[10px] text-studio-text focus:outline-none focus:border-studio-primary" 
                  placeholder="Paste image URL..."
                  value={metadata.coverImage}
                  onChange={e => setMetadata({...metadata, coverImage: e.target.value})}
                  onClick={e => e.stopPropagation()}
                />
              </div>
            </section>

            <section className="space-y-4">
              <h3 className="text-[10px] font-bold text-studio-muted uppercase tracking-widest">Promotion</h3>
              <div className="flex items-center justify-between bg-studio-surface-hover p-4 rounded-xl border border-studio-border">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-studio-primary">trending_up</span>
                  <span className="text-xs font-bold text-studio-text uppercase tracking-widest">Mark as Trending</span>
                </div>
                <button 
                  onClick={() => setMetadata({...metadata, isTrending: !metadata.isTrending})}
                  className={`w-10 h-5 rounded-full transition-colors relative ${metadata.isTrending ? 'bg-studio-primary' : 'bg-studio-border'}`}
                >
                  <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${metadata.isTrending ? 'right-1' : 'left-1'}`} />
                </button>
              </div>
            </section>
          </div>

          <div className="p-8 border-t border-studio-border bg-studio-surface/50">
            <button 
              onClick={async () => {
                if (!slug) return;
                if (confirm('Are you sure you want to permanently delete this post?')) {
                  const res = await fetch(`/api/admin/blogs/${slug}`, { method: 'DELETE' });
                  if (res.ok) {
                    toast.success('Post deleted');
                    router.push('/admin/studio/blogs');
                  } else {
                    toast.error('Failed to delete post');
                  }
                }
              }}
              className="w-full py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl text-xs font-bold transition-all uppercase tracking-widest border border-red-500/20 flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">delete</span>
              Delete Post
            </button>
          </div>
        </aside>
      )}

      {/* AI Sidebar */}
      {!showSettings && showSidebar && (
        <aside className="w-[340px] bg-studio-surface border-l border-studio-border flex flex-col shrink-0 h-full relative z-30 shadow-2xl">
          <div className="h-16 flex items-center justify-between px-6 border-b border-studio-border">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-studio-primary text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>smart_toy</span>
              <h2 className="text-sm font-bold text-studio-text tracking-tight">AI Co-Pilot</h2>
            </div>
            <button onClick={() => setShowSidebar(false)} className="text-studio-muted hover:text-studio-text">
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 custom-scrollbar">
            {aiChat.map((chat, i) => (
              <div key={i} className={`flex ${chat.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed ${
                  chat.role === 'user' 
                    ? 'bg-studio-primary text-white' 
                    : 'bg-studio-surface-hover text-studio-text border border-studio-border'
                }`}>
                  {chat.text}
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 border-t border-studio-border bg-studio-surface">
            <div className="bg-studio-surface-hover border border-studio-border rounded-xl p-2 flex flex-col gap-2 focus-within:border-studio-primary transition-colors">
              <textarea 
                placeholder="Ask AI to improve, rephrase, or suggest..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full bg-transparent text-xs text-studio-text placeholder:text-studio-muted resize-none focus:outline-none min-h-[60px] p-2"
              />
              <div className="flex items-center justify-between px-1 pb-1">
                <div className="flex gap-2">
                  <button className="text-studio-muted hover:text-studio-text">
                    <span className="material-symbols-outlined text-[16px]">image</span>
                  </button>
                  <button className="text-studio-muted hover:text-studio-text">
                    <span className="material-symbols-outlined text-[16px]">link</span>
                  </button>
                </div>
                <button 
                  onClick={sendMessage}
                  className="bg-studio-primary text-white p-1.5 rounded-lg hover:scale-105 transition-all shadow-md shadow-studio-primary/20"
                >
                  <span className="material-symbols-outlined text-[16px]">send</span>
                </button>
              </div>
            </div>
          </div>
        </aside>
      )}

      {/* Sidebar Toggle Button (when hidden) */}
      {!showSidebar && (
        <button 
          onClick={() => setShowSidebar(true)}
          className="absolute right-6 bottom-6 w-12 h-12 bg-studio-primary text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-all z-40"
        >
          <span className="material-symbols-outlined">smart_toy</span>
        </button>
      )}

      <style jsx global>{`
        .prose-studio .border {
          border: none !important;
        }
        .prose-studio .bg-white {
          background: transparent !important;
        }
        .prose-studio .bg-slate-50 {
          background: rgba(24, 24, 27, 0.5) !important;
          backdrop-filter: blur(10px);
          border-radius: 12px !important;
          border: 1px solid rgba(39, 39, 42, 0.5) !important;
          margin-bottom: 2rem;
          justify-content: center;
        }
        .prose-studio .ProseMirror {
          color: var(--studio-text-main);
          font-size: 1.125rem;
          line-height: 1.7;
          padding: 0 !important;
        }
        .prose-studio .ProseMirror p.is-editor-empty:first-child::before {
          color: var(--studio-text-muted) !important;
        }
        .prose-studio .text-blue-600 {
          color: var(--studio-primary) !important;
        }
        .prose-studio button {
          color: var(--studio-text-muted) !important;
        }
        .prose-studio button.bg-slate-900 {
          background: var(--studio-primary) !important;
          color: white !important;
        }
      `}</style>
    </div>
  );
}
