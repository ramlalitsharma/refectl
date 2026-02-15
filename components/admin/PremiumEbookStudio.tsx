'use client';

import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/Button';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus,
    Trash2,
    BookOpen,
    Library,
    Sparkles,
    Settings,
    Save,
    Rocket,
    Maximize2,
    Minimize2,
    ChevronRight,
    ChevronLeft,
    BarChart3,
    Target,
    Zap,
    FileText,
    Search,
    Download,
    Eye,
    Brain,
    TrendingUp,
    Clock,
    CheckCircle2,
    AlertCircle
} from 'lucide-react';
import PremiumRichTextEditor from './PremiumRichTextEditor';
import { Badge } from '@/components/ui/Badge';

interface EbookSummary {
    id: string;
    title: string;
    updatedAt?: string;
    status?: string;
}

interface EbookStudioProps {
    recentEbooks: EbookSummary[];
}

interface ChapterOutline {
    title: string;
    summary: string;
    keyTakeaways: string;
    resources: string;
    content?: string;
    status?: 'draft' | 'review' | 'final';
    wordCount?: number;
}

interface AIAction {
    type: 'continue' | 'expand' | 'rewrite' | 'summarize' | 'seo';
    label: string;
    icon: any;
    description: string;
}

export function PremiumEbookStudio({ recentEbooks }: EbookStudioProps) {
    // --- STATE ---
    const [form, setForm] = useState({
        title: '',
        subtitle: '',
        author: '',
        audience: '',
        tone: 'Professional and engaging',
        focus: '',
        chapters: 6,
        tags: '',
        releaseAt: '',
        genre: '',
        description: ''
    });

    const [activeEbookId, setActiveEbookId] = useState<string | null>(null);
    const [chapters, setChapters] = useState<ChapterOutline[]>([
        { title: 'Introduction', summary: '', keyTakeaways: '', resources: '', content: '', status: 'draft' }
    ]);

    const [activeChapterIndex, setActiveChapterIndex] = useState(0);
    const [showLibrary, setShowLibrary] = useState(false);
    const [isWriterMode, setIsWriterMode] = useState(false);
    const [allEbooks, setAllEbooks] = useState<any[]>([]);
    const [loadingLibrary, setLoadingLibrary] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [rightSidebarCollapsed, setRightSidebarCollapsed] = useState(false);

    const [previewing, setPreviewing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [seo, setSeo] = useState<any>(null);
    const [showSeoModal, setShowSeoModal] = useState(false);
    const [showAIPanel, setShowAIPanel] = useState(false);
    const [showAnalytics, setShowAnalytics] = useState(false);
    const [showSettings, setShowSettings] = useState(false);

    const activeChapter = chapters[activeChapterIndex] || chapters[0];
    const canSubmit = useMemo(() => form.title.trim().length > 0 && chapters.every((chapter) => chapter.title.trim()), [form.title, chapters]);

    // Calculate statistics
    const totalWords = useMemo(() => {
        return chapters.reduce((sum, ch) => sum + (ch.content?.split(/\s+/).filter(Boolean).length || 0), 0);
    }, [chapters]);

    const completedChapters = chapters.filter(ch => ch.status === 'final').length;
    const progress = chapters.length > 0 ? (completedChapters / chapters.length) * 100 : 0;

    // AI Actions
    const aiActions: AIAction[] = [
        { type: 'continue', label: 'Continue Writing', icon: Zap, description: 'AI continues from where you left off' },
        { type: 'expand', label: 'Expand Content', icon: TrendingUp, description: 'Elaborate and add more detail' },
        { type: 'rewrite', label: 'Rewrite', icon: FileText, description: 'Rewrite in different style' },
        { type: 'summarize', label: 'Summarize', icon: Brain, description: 'Create a concise summary' },
        { type: 'seo', label: 'Optimize SEO', icon: Search, description: 'Generate SEO metadata' },
    ];

    // --- LOAD LIBRARY ---
    useEffect(() => {
        if (showLibrary) {
            const fetchAll = async () => {
                setLoadingLibrary(true);
                try {
                    const res = await fetch('/api/admin/ebooks');
                    const data = await res.json();
                    if (res.ok) setAllEbooks(data);
                } catch (e) { console.error(e); }
                finally { setLoadingLibrary(false); }
            };
            fetchAll();
        }
    }, [showLibrary]);

    // --- LOAD EBOOK ---
    useEffect(() => {
        if (!activeEbookId) return;
        const loadEbook = async () => {
            setPreviewing(true);
            try {
                const res = await fetch(`/api/admin/ebooks/${activeEbookId}`);
                const data = await res.json();
                if (!res.ok) throw new Error(data.error || 'Failed to load book');

                setForm({
                    title: data.title || '',
                    subtitle: data.subtitle || '',
                    author: data.author || '',
                    audience: data.audience || '',
                    tone: data.tone || 'Professional and engaging',
                    focus: data.focus || '',
                    chapters: data.requestedChapters || 6,
                    tags: (data.tags || []).join(', '),
                    releaseAt: data.releaseAt || '',
                    genre: data.genre || '',
                    description: data.description || ''
                });

                const chaptersData = data.chapters?.chapters || (Array.isArray(data.chapters) ? data.chapters : []);
                const loadedChapters = chaptersData.map((c: any) => ({
                    title: c.title || 'Untitled Chapter',
                    summary: c.summary || '',
                    keyTakeaways: Array.isArray(c.keyTakeaways) ? c.keyTakeaways.map((k: string) => `• ${k}`).join('\\n') : (c.keyTakeaways || ''),
                    resources: Array.isArray(c.resources) ? c.resources.join('\\n') : (c.resources || ''),
                    content: c.content || '',
                    status: c.status || 'draft',
                    wordCount: c.content?.split(/\s+/).filter(Boolean).length || 0
                }));

                setChapters(loadedChapters.length ? loadedChapters : [{ title: 'Introduction', summary: '', keyTakeaways: '', resources: '', content: '', status: 'draft' }]);
                setSeo(data.seo || {});
                setActiveChapterIndex(0);
                setShowLibrary(false);
            } catch (err: any) {
                console.error('Load Error:', err);
                setError(err.message);
            } finally {
                setPreviewing(false);
            }
        };
        loadEbook();
    }, [activeEbookId]);

    // --- HANDLERS ---
    const addChapter = () => {
        setChapters([...chapters, { title: `Chapter ${chapters.length + 1}`, summary: '', keyTakeaways: '', resources: '', content: '', status: 'draft' }]);
        setActiveChapterIndex(chapters.length);
    };

    const deleteChapter = (index: number) => {
        if (chapters.length === 1) return;
        const newChapters = chapters.filter((_, i) => i !== index);
        setChapters(newChapters);
        setActiveChapterIndex(Math.max(0, index - 1));
    };

    const updateChapter = (index: number, field: keyof ChapterOutline, value: any) => {
        const newChapters = [...chapters];
        newChapters[index] = { ...newChapters[index], [field]: value };
        if (field === 'content') {
            newChapters[index].wordCount = value.split(/\s+/).filter(Boolean).length;
        }
        setChapters(newChapters);
        setSaving(true);
        setTimeout(() => setSaving(false), 1000);
    };

    const handleSubmit = async () => {
        if (!canSubmit) return;
        setSaving(true);
        setError(null);

        try {
            const payload = {
                ...form,
                tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
                chapters: { chapters },
                seo: seo || {},
                status: 'draft',
                authorId: 'current-user-id'
            };

            const url = activeEbookId ? `/api/admin/ebooks/${activeEbookId}` : '/api/admin/ebooks';
            const method = activeEbookId ? 'PATCH' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Save failed');

            if (!activeEbookId) setActiveEbookId(data.id);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleAIAction = async (action: string, selectedText: string = '') => {
        setPreviewing(true);
        setError(null);
        try {
            const res = await fetch('/api/admin/ebooks/ai-assist', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action,
                    selectedText,
                    chapterContent: activeChapter.content || '',
                    chapterTitle: activeChapter.title,
                    bookContext: {
                        title: form.title,
                        tone: form.tone,
                        audience: form.audience,
                        focus: form.focus
                    }
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'AI generation failed');

            if (action === 'seo') {
                setSeo(data.seo);
                setShowSeoModal(true);
            } else if (data.content) {
                // Append or replace content based on action
                const currentContent = activeChapter.content || '';
                const newContent = action === 'continue' ? currentContent + '\\n\\n' + data.content : data.content;
                updateChapter(activeChapterIndex, 'content', newContent);
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setPreviewing(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this book permanently?')) return;
        try {
            const res = await fetch(`/api/admin/ebooks/${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Delete failed');
            setAllEbooks(allEbooks.filter(e => e.id !== id));
            if (activeEbookId === id) {
                setActiveEbookId(null);
                setForm({ title: '', subtitle: '', author: '', audience: '', tone: 'Professional and engaging', focus: '', chapters: 6, tags: '', releaseAt: '', genre: '', description: '' });
                setChapters([{ title: 'Introduction', summary: '', keyTakeaways: '', resources: '', content: '', status: 'draft' }]);
            }
        } catch (err: any) {
            setError(err.message);
        }
    };

    const handlePublish = async () => {
        if (!activeEbookId) {
            await handleSubmit();
            return;
        }
        setSaving(true);
        try {
            const res = await fetch(`/api/admin/ebooks/${activeEbookId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'published' })
            });
            if (!res.ok) throw new Error('Publish failed');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    // --- RENDER LIBRARY ---
    if (showLibrary) {
        return (
            <div className="min-h-screen bg-background dark:bg-elite-bg text-foreground transition-colors duration-300">
                <div className="border-b border-border dark:border-white/10 bg-surface dark:bg-surface-2">
                    <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Library className="w-6 h-6 text-elite-accent-cyan" />
                            <h1 className="text-2xl font-bold">Your Library</h1>
                        </div>
                        <Button onClick={() => { setShowLibrary(false); setActiveEbookId(null); }} variant="outline">
                            <Plus className="w-4 h-4 mr-2" />
                            New Book
                        </Button>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-6 py-8">
                    {loadingLibrary ? (
                        <div className="text-center py-12 text-muted">Loading your library...</div>
                    ) : allEbooks.length === 0 ? (
                        <div className="text-center py-12">
                            <BookOpen className="w-16 h-16 mx-auto mb-4 text-muted opacity-50" />
                            <p className="text-muted mb-4">No books yet. Start writing your first masterpiece!</p>
                            <Button onClick={() => setShowLibrary(false)}>
                                <Plus className="w-4 h-4 mr-2" />
                                Create Your First Book
                            </Button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {allEbooks.map((ebook) => (
                                <motion.div
                                    key={ebook.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="glass-card-premium p-6 rounded-2xl cursor-pointer group hover:scale-105 transition-all"
                                    onClick={() => setActiveEbookId(ebook.id)}
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <BookOpen className="w-8 h-8 text-elite-accent-cyan" />
                                        <Badge variant={ebook.status === 'published' ? 'success' : 'default'}>
                                            {ebook.status || 'draft'}
                                        </Badge>
                                    </div>
                                    <h3 className="text-lg font-semibold mb-2 line-clamp-2">{ebook.title || 'Untitled Book'}</h3>
                                    <p className="text-sm text-muted mb-4">
                                        {new Date(ebook.updatedAt).toLocaleDateString()}
                                    </p>
                                    <div className="flex gap-2">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDelete(ebook.id);
                                            }}
                                        >
                                            <Trash2 className="w-3 h-3" />
                                        </Button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // --- RENDER MAIN STUDIO ---
    return (
        <div className="h-screen flex flex-col bg-background dark:bg-elite-bg text-foreground transition-colors duration-300">
            {/* Premium Top Bar */}
            <div className="border-b border-border dark:border-white/10 bg-surface dark:bg-surface-2 flex-shrink-0">
                <div className="px-6 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                        <Button variant="ghost" size="sm" onClick={() => setShowLibrary(true)} className="flex-shrink-0">
                            <Library className="w-4 h-4 mr-2" />
                            Library
                        </Button>
                        <input
                            type="text"
                            value={form.title}
                            onChange={(e) => setForm({ ...form, title: e.target.value })}
                            placeholder="Untitled Book"
                            className="text-xl font-bold bg-transparent border-none outline-none flex-1 min-w-0 placeholder:text-muted/40"
                        />
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                        <div className="text-sm text-muted flex items-center gap-4">
                            <span>{totalWords} words</span>
                            <span>{Math.round(progress)}% complete</span>
                        </div>
                        {saving && <span className="text-sm text-muted">Saving...</span>}
                        {!saving && activeEbookId && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                        <Button variant="ghost" size="sm" onClick={() => setShowAnalytics(!showAnalytics)}>
                            <BarChart3 className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setShowAIPanel(!showAIPanel)}>
                            <Sparkles className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setShowSettings(!showSettings)}>
                            <Settings className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setIsWriterMode(!isWriterMode)}>
                            {isWriterMode ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                        </Button>
                        <Button onClick={handleSubmit} disabled={!canSubmit || saving}>
                            <Save className="w-4 h-4 mr-2" />
                            Save
                        </Button>
                        <Button onClick={handlePublish} variant="primary">
                            <Rocket className="w-4 h-4 mr-2" />
                            Publish
                        </Button>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex overflow-hidden">
                {/* Left Sidebar - Chapters */}
                {!isWriterMode && (
                    <motion.div
                        initial={false}
                        animate={{ width: sidebarCollapsed ? 60 : 280 }}
                        className="border-r border-border dark:border-white/10 bg-surface dark:bg-surface-2 flex-shrink-0 flex flex-col"
                    >
                        <div className="p-4 border-b border-border dark:border-white/10 flex items-center justify-between">
                            {!sidebarCollapsed && <h2 className="font-semibold">Chapters</h2>}
                            <Button variant="ghost" size="sm" onClick={() => setSidebarCollapsed(!sidebarCollapsed)}>
                                {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                            </Button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-2">
                            {chapters.map((chapter, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className={`p-3 rounded-lg mb-2 cursor-pointer transition-all group ${index === activeChapterIndex
                                            ? 'bg-elite-accent-cyan/10 border border-elite-accent-cyan/30'
                                            : 'hover:bg-surface-3 dark:hover:bg-white/5'
                                        }`}
                                    onClick={() => setActiveChapterIndex(index)}
                                >
                                    {!sidebarCollapsed ? (
                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                <input
                                                    type="text"
                                                    value={chapter.title}
                                                    onChange={(e) => {
                                                        e.stopPropagation();
                                                        updateChapter(index, 'title', e.target.value);
                                                    }}
                                                    className="w-full bg-transparent border-none outline-none text-sm font-medium"
                                                    onClick={(e) => e.stopPropagation()}
                                                />
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        deleteChapter(index);
                                                    }}
                                                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <Trash2 className="w-3 h-3" />
                                                </Button>
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-muted">
                                                <span>{chapter.wordCount || 0} words</span>
                                                <Badge variant={chapter.status === 'final' ? 'success' : 'default'} className="text-xs">
                                                    {chapter.status}
                                                </Badge>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center text-xs font-bold">{index + 1}</div>
                                    )}
                                </motion.div>
                            ))}
                        </div>
                        {!sidebarCollapsed && (
                            <div className="p-4 border-t border-border dark:border-white/10">
                                <Button onClick={addChapter} variant="outline" className="w-full">
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add Chapter
                                </Button>
                            </div>
                        )}
                    </motion.div>
                )}

                {/* Center - Editor */}
                <div className="flex-1 flex flex-col overflow-hidden">
                    <div className="flex-1 overflow-y-auto">
                        <div className="max-w-4xl mx-auto px-8 py-8">
                            <PremiumRichTextEditor
                                content={activeChapter?.content || ''}
                                onChange={(html) => updateChapter(activeChapterIndex, 'content', html)}
                                onAiAction={(action, text) => handleAIAction(action, text)}
                                showWordCount={true}
                            />
                        </div>
                    </div>
                </div>

                {/* Right Sidebar - AI & Analytics */}
                {!isWriterMode && (showAIPanel || showAnalytics) && (
                    <motion.div
                        initial={false}
                        animate={{ width: rightSidebarCollapsed ? 60 : 320 }}
                        className="border-l border-border dark:border-white/10 bg-surface dark:bg-surface-2 flex-shrink-0 flex flex-col"
                    >
                        <div className="p-4 border-b border-border dark:border-white/10 flex items-center justify-between">
                            {!rightSidebarCollapsed && (
                                <h2 className="font-semibold">{showAIPanel ? 'AI Assistant' : 'Analytics'}</h2>
                            )}
                            <Button variant="ghost" size="sm" onClick={() => setRightSidebarCollapsed(!rightSidebarCollapsed)}>
                                {rightSidebarCollapsed ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                            </Button>
                        </div>

                        {!rightSidebarCollapsed && (
                            <div className="flex-1 overflow-y-auto p-4">
                                {showAIPanel && (
                                    <div className="space-y-3">
                                        <p className="text-sm text-muted mb-4">Select an AI action to enhance your writing:</p>
                                        {aiActions.map((action) => (
                                            <button
                                                key={action.type}
                                                onClick={() => handleAIAction(action.type)}
                                                disabled={previewing}
                                                className="w-full p-3 bg-surface-3 dark:bg-white/5 rounded-lg hover:bg-elite-accent-cyan/10 hover:border-elite-accent-cyan/30 border border-transparent transition-all text-left group"
                                            >
                                                <div className="flex items-start gap-3">
                                                    <action.icon className="w-5 h-5 text-elite-accent-cyan flex-shrink-0 mt-0.5" />
                                                    <div>
                                                        <div className="font-medium text-sm mb-1">{action.label}</div>
                                                        <div className="text-xs text-muted">{action.description}</div>
                                                    </div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {showAnalytics && (
                                    <div className="space-y-4">
                                        <div className="p-4 bg-surface-3 dark:bg-white/5 rounded-lg">
                                            <div className="text-sm text-muted mb-1">Total Words</div>
                                            <div className="text-2xl font-bold">{totalWords.toLocaleString()}</div>
                                        </div>
                                        <div className="p-4 bg-surface-3 dark:bg-white/5 rounded-lg">
                                            <div className="text-sm text-muted mb-1">Completion</div>
                                            <div className="text-2xl font-bold">{Math.round(progress)}%</div>
                                            <div className="w-full bg-surface-2 dark:bg-white/10 rounded-full h-2 mt-2">
                                                <div
                                                    className="bg-elite-accent-cyan rounded-full h-2 transition-all"
                                                    style={{ width: `${progress}%` }}
                                                />
                                            </div>
                                        </div>
                                        <div className="p-4 bg-surface-3 dark:bg-white/5 rounded-lg">
                                            <div className="text-sm text-muted mb-1">Chapters</div>
                                            <div className="text-2xl font-bold">{completedChapters}/{chapters.length}</div>
                                        </div>
                                        <div className="p-4 bg-surface-3 dark:bg-white/5 rounded-lg">
                                            <div className="text-sm text-muted mb-1">Reading Time</div>
                                            <div className="text-2xl font-bold">{Math.ceil(totalWords / 200)} min</div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </motion.div>
                )}
            </div>

            {/* Settings Modal */}
            <AnimatePresence>
                {showSettings && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                        onClick={() => setShowSettings(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-surface dark:bg-surface-2 rounded-2xl p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h2 className="text-2xl font-bold mb-6">Book Settings</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Subtitle</label>
                                    <input
                                        type="text"
                                        value={form.subtitle}
                                        onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                                        className="w-full px-4 py-2 bg-surface-3 dark:bg-white/5 border border-border dark:border-white/10 rounded-lg outline-none focus:border-elite-accent-cyan"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Author</label>
                                    <input
                                        type="text"
                                        value={form.author}
                                        onChange={(e) => setForm({ ...form, author: e.target.value })}
                                        className="w-full px-4 py-2 bg-surface-3 dark:bg-white/5 border border-border dark:border-white/10 rounded-lg outline-none focus:border-elite-accent-cyan"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Genre</label>
                                    <input
                                        type="text"
                                        value={form.genre}
                                        onChange={(e) => setForm({ ...form, genre: e.target.value })}
                                        className="w-full px-4 py-2 bg-surface-3 dark:bg-white/5 border border-border dark:border-white/10 rounded-lg outline-none focus:border-elite-accent-cyan"
                                        placeholder="Fiction, Non-fiction, Self-help, etc."
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Target Audience</label>
                                    <input
                                        type="text"
                                        value={form.audience}
                                        onChange={(e) => setForm({ ...form, audience: e.target.value })}
                                        className="w-full px-4 py-2 bg-surface-3 dark:bg-white/5 border border-border dark:border-white/10 rounded-lg outline-none focus:border-elite-accent-cyan"
                                        placeholder="e.g., Business professionals, Students"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Tone</label>
                                    <select
                                        value={form.tone}
                                        onChange={(e) => setForm({ ...form, tone: e.target.value })}
                                        className="w-full px-4 py-2 bg-surface-3 dark:bg-white/5 border border-border dark:border-white/10 rounded-lg outline-none focus:border-elite-accent-cyan"
                                    >
                                        <option>Professional and engaging</option>
                                        <option>Casual and friendly</option>
                                        <option>Academic and formal</option>
                                        <option>Creative and inspiring</option>
                                        <option>Technical and precise</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Description</label>
                                    <textarea
                                        value={form.description}
                                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                                        className="w-full px-4 py-2 bg-surface-3 dark:bg-white/5 border border-border dark:border-white/10 rounded-lg outline-none focus:border-elite-accent-cyan"
                                        rows={4}
                                        placeholder="Brief description of your book..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Tags (comma-separated)</label>
                                    <input
                                        type="text"
                                        value={form.tags}
                                        onChange={(e) => setForm({ ...form, tags: e.target.value })}
                                        className="w-full px-4 py-2 bg-surface-3 dark:bg-white/5 border border-border dark:border-white/10 rounded-lg outline-none focus:border-elite-accent-cyan"
                                        placeholder="business, productivity, leadership"
                                    />
                                </div>
                                <div className="flex gap-3 pt-4">
                                    <Button onClick={() => handleAIAction('seo')} disabled={previewing} variant="outline" className="flex-1">
                                        <Sparkles className="w-4 h-4 mr-2" />
                                        Generate SEO
                                    </Button>
                                    <Button onClick={() => setShowSettings(false)} className="flex-1">
                                        Done
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Error Toast */}
            <AnimatePresence>
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 50 }}
                        className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-red-500 text-white px-6 py-3 rounded-lg shadow-2xl z-50 flex items-center gap-2"
                    >
                        <AlertCircle className="w-4 h-4" />
                        {error}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
