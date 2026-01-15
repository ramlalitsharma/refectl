'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { CourseOutlineEditor } from '@/components/admin/CourseOutlineEditor';
import { ImageUploader } from '@/components/admin/ImageUploader';
import { CourseModeSelector } from '@/components/admin/CourseModeSelector';

interface Course {
    _id: string;
    type: 'video-course' | 'live-course';
    mode?: 'curriculum' | 'professional';
    title: string;
    slug: string;
    description: string;
    thumbnail?: string;
    categoryId?: string;
    status: 'draft' | 'published';
    units: any[];
    createdAt: string;
    totalLessons?: number;
    totalSessions?: number;
    defaultLiveRoomId?: string;
    price?: number;
    currency?: string;
    isPaid?: boolean;
    paymentType?: 'free' | 'paid' | 'premium';
}

export function UnifiedContentStudio() {
    const [activeTab, setActiveTab] = useState<'video' | 'live'>('video');
    const [view, setView] = useState<'list' | 'create' | 'edit'>('list');
    const [courses, setCourses] = useState<Course[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingCourse, setEditingCourse] = useState<Course | null>(null);
    const [showCreateCategory, setShowCreateCategory] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [creatingCategory, setCreatingCategory] = useState(false);
    const [showModeSelector, setShowModeSelector] = useState(false);
    const [selectedMode, setSelectedMode] = useState<'curriculum' | 'professional'>('curriculum');

    // Course form state
    const [courseForm, setCourseForm] = useState({
        title: '',
        description: '',
        thumbnail: '',
        categoryId: '',
        mode: 'curriculum' as 'curriculum' | 'professional',
        seo: {
            title: '',
            description: '',
            keywords: [] as string[],
        },
        slug: '',
        defaultLiveRoomId: '' as string | undefined,
        price: 0,
        currency: 'USD',
    });
    const [units, setUnits] = useState<any[]>([]);

    useEffect(() => {
        loadCourses();
        loadCategories();
    }, [activeTab]);

    const loadCourses = async () => {
        try {
            setLoading(true);
            const endpoint = activeTab === 'video'
                ? '/api/admin/video-courses'
                : '/api/admin/live-courses';
            const res = await fetch(endpoint);
            const data = await res.json();
            setCourses(data.courses || []);
        } catch (error) {
            console.error('Failed to load courses:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadCategories = async () => {
        try {
            const res = await fetch('/api/categories');
            const data = await res.json();
            setCategories(data.categories || []);
        } catch (error) {
            console.error('Failed to load categories:', error);
        }
    };

    const handleCreateCategory = async () => {
        if (!newCategoryName.trim()) return;

        try {
            setCreatingCategory(true);
            const res = await fetch('/api/categories', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: newCategoryName.trim(),
                    slug: newCategoryName.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-')
                }),
            });

            if (res.ok) {
                const data = await res.json();
                await loadCategories();
                setCourseForm({ ...courseForm, categoryId: data.category._id });
                setShowCreateCategory(false);
                setNewCategoryName('');
            }
        } catch (error) {
            console.error('Failed to create category:', error);
        } finally {
            setCreatingCategory(false);
        }
    };

    const handleGenerateSEO = async () => {
        if (!courseForm.title) {
            alert('Please enter a course title first');
            return;
        }

        const btn = document.getElementById('seo-gen-btn') as HTMLButtonElement;
        if (btn && btn.innerHTML !== '✨ Generating...') {
            const originalText = btn.innerHTML;
            btn.disabled = true;
            btn.innerHTML = '✨ Generating...';

            try {
                const res = await fetch('/api/admin/courses/generate-seo', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        title: courseForm.title,
                        description: courseForm.description
                    })
                });

                if (!res.ok) throw new Error('Generation failed');

                const data = await res.json();

                setCourseForm(prev => ({
                    ...prev,
                    description: data.description,
                    slug: data.slug,
                    seo: {
                        title: data.title,
                        description: data.description,
                        keywords: data.keywords || []
                    }
                }));

            } catch (err) {
                console.error(err);
                alert('Failed to generate SEO');
            } finally {
                btn.disabled = false;
                btn.innerHTML = originalText;
            }
        }
    };

    const handleMagicFill = async () => {
        if (!courseForm.title) {
            alert('Please enter a course title first');
            return;
        }

        const btn = document.getElementById('magic-fill-btn') as HTMLButtonElement;
        if (btn) {
            const originalText = btn.innerHTML;
            btn.innerHTML = '🔮 Magic Filling...';
            btn.disabled = true;

            try {
                const res = await fetch('/api/admin/courses/magic-fill', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ title: courseForm.title })
                });

                if (!res.ok) throw new Error('Magic fill failed');

                const data = await res.json();

                setCourseForm(prev => ({
                    ...prev,
                    description: data.description || prev.description,
                    slug: data.seo?.slug || prev.slug,
                    categoryId: categories.find(c => c.name === data.category)?._id || prev.categoryId,
                    seo: {
                        title: data.seo?.title || prev.seo.title,
                        description: data.seo?.description || prev.seo.description,
                        keywords: data.seo?.keywords || prev.seo.keywords
                    }
                }));

                // If we get unit structure we could use it, but for now just metadata

            } catch (err) {
                console.error(err);
                alert('Failed to Magic Fill');
            } finally {
                btn.innerHTML = originalText;
                btn.disabled = false;
            }
        }
    };

    const handleGenerateThumbnail = async () => {
        if (!courseForm.title) {
            alert('Please enter a course title first');
            return;
        }

        const btn = document.getElementById('gen-thumb-btn') as HTMLButtonElement;
        if (btn) {
            const originalText = btn.innerHTML;
            btn.innerHTML = '🎨 Painting...';
            btn.disabled = true;

            try {
                const res = await fetch('/api/admin/courses/generate-thumbnail', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        title: courseForm.title,
                        description: courseForm.description
                    })
                });

                if (!res.ok) throw new Error('Thumbnail generation failed');

                const data = await res.json();
                if (data.url) {
                    setCourseForm(prev => ({ ...prev, thumbnail: data.url }));
                }

            } catch (err) {
                console.error(err);
                alert('Failed to generate thumbnail');
            } finally {
                btn.innerHTML = originalText;
                btn.disabled = false;
            }
        }
    };

    const handleGenerateCurriculum = async () => {
        if (!courseForm.title) {
            alert('Please enter a course title first');
            return;
        }

        if (units.length > 0 && !confirm('This will replace your current curriculum. Are you sure?')) {
            return;
        }

        const btn = document.getElementById('gen-curr-btn') as HTMLButtonElement;
        if (btn) {
            const originalText = btn.innerHTML;
            btn.innerHTML = '✨ Designing...';
            btn.disabled = true;

            try {
                const res = await fetch('/api/admin/courses/generate-curriculum', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        title: courseForm.title,
                        description: courseForm.description,
                        mode: courseForm.mode,
                        courseType: activeTab,
                        defaultLiveRoomId: courseForm.defaultLiveRoomId,
                        unitsCount: 6,
                        lessonsPerChapter: 4
                    })
                });

                if (!res.ok) throw new Error('Curriculum generation failed');

                const data = await res.json();
                if (data.units) {
                    setUnits(data.units);
                }

            } catch (err) {
                console.error(err);
                alert('Failed to generate curriculum');
            } finally {
                btn.innerHTML = originalText;
                btn.disabled = false;
            }
        }
    };

    const handleCreateCourse = () => {
        setShowModeSelector(true);
    };

    const handleModeSelected = (mode: 'curriculum' | 'professional') => {
        setSelectedMode(mode);
        setShowModeSelector(false);
        setView('create');
        setEditingCourse(null);
        setCourseForm({
            title: '',
            description: '',
            thumbnail: '',
            categoryId: '',
            mode: mode,
            seo: { title: '', description: '', keywords: [] },
            slug: '',
            defaultLiveRoomId: '',
            price: 0,
            currency: 'USD',
        });
        setUnits([
            {
                title: mode === 'curriculum' ? 'Unit 1: Introduction' : 'Skill 1: Fundamentals',
                chapters: [
                    {
                        title: mode === 'curriculum' ? 'Chapter 1: Getting Started' : 'Project 1: First Build',
                        lessons: [
                            {
                                title: activeTab === 'video' ? 'Welcome Video' : 'First Live Session',
                                contentType: activeTab === 'video' ? 'video' : 'live',
                                videoUrl: '',
                                content: ''
                            }
                        ]
                    }
                ]
            }
        ]);
    };

    const handleEditCourse = (course: Course) => {
        setView('edit');
        setEditingCourse(course);
        setCourseForm({
            title: course.title,
            description: course.description,
            thumbnail: course.thumbnail || '',
            categoryId: course.categoryId || '',
            mode: course.mode || 'curriculum',
            seo: (course as any).seo || { title: '', description: '', keywords: [] },
            slug: course.slug || '',
            defaultLiveRoomId: course.defaultLiveRoomId || '',
            price: course.price || 0,
            currency: course.currency || 'USD',
        });
        setUnits(course.units || []);
    };

    const handleSaveCourse = async (status: 'draft' | 'published' = 'draft') => {
        try {
            const payload = {
                ...courseForm,
                units,
                status,
                type: activeTab === 'video' ? 'video-course' : 'live-course',
                isPaid: courseForm.price > 0,
                paymentType: courseForm.price === 0 ? 'free' : 'paid',
                ...courseForm, // This will now include seo and slug, and price/currency
            };

            const endpoint = activeTab === 'video'
                ? '/api/admin/video-courses'
                : '/api/admin/live-courses';

            const url = editingCourse
                ? `${endpoint}/${editingCourse._id}`
                : endpoint;

            const method = editingCourse ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                await loadCourses();
                setView('list');
            }
        } catch (error) {
            console.error('Failed to save course:', error);
        }
    };

    const handleCreateDefaultRoom = async () => {
        try {
            const name = courseForm.title ? `${courseForm.title} Live Room` : 'Default Live Room';
            const res = await fetch('/api/live/rooms', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name,
                    contentType: 'live',
                    courseId: editingCourse?._id || undefined
                })
            });
            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                alert(data.error || 'Failed to create default room');
                return;
            }
            const data = await res.json();
            const roomId = data.room?.roomId;
            if (!roomId) return;
            setCourseForm(prev => ({ ...prev, defaultLiveRoomId: roomId }));

            // Auto-fill roomId to all live lessons
            const newUnits = (units || []).map((u: any) => ({
                ...u,
                chapters: (u.chapters || []).map((c: any) => ({
                    ...c,
                    lessons: (c.lessons || []).map((l: any) =>
                        l.contentType === 'live'
                            ? { ...l, liveRoomId: roomId }
                            : l
                    )
                }))
            }));
            setUnits(newUnits);

            if (editingCourse?._id) {
                await fetch(`/api/admin/live-courses/${editingCourse._id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ defaultLiveRoomId: roomId, units: newUnits })
                });
                await loadCourses();
            }
        } catch (e) {
            console.error('Default room creation failed:', e);
            alert('Default room creation failed');
        }
    };

    const handleEndLiveCourse = async (courseId: string) => {
        if (!confirm('Are you sure you want to end this live course? It will be moved to Video Courses.')) return;

        try {
            const res = await fetch(`/api/admin/live-courses/${courseId}/end`, {
                method: 'POST',
            });

            if (res.ok) {
                await loadCourses();
            } else {
                const data = await res.json();
                alert(data.error || 'Failed to end live course');
            }
        } catch (error) {
            console.error('Failed to end live course:', error);
            alert('Failed to end live course');
        }
    };

    const handleDeleteCourse = async (courseId: string) => {
        if (!confirm('Are you sure you want to delete this course?')) return;

        try {
            const endpoint = activeTab === 'video'
                ? `/api/admin/video-courses/${courseId}`
                : `/api/admin/live-courses/${courseId}`;

            const res = await fetch(endpoint, {
                method: 'DELETE',
            });

            if (res.ok) {
                await loadCourses();
            }
        } catch (error) {
            console.error('Failed to delete course:', error);
        }
    };

    const filteredCourses = courses.filter(c => c.type === `${activeTab}-course`);

    if (view === 'create' || view === 'edit') {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <h2 className="text-2xl font-black text-slate-900">
                                {view === 'create' ? 'Create' : 'Edit'} {activeTab === 'video' ? 'Video' : 'Live'} Course
                            </h2>
                            <Badge
                                variant={courseForm.mode === 'curriculum' ? 'default' : 'secondary'}
                                className={courseForm.mode === 'curriculum' ? 'bg-blue-500' : 'bg-indigo-500'}
                            >
                                {courseForm.mode === 'curriculum' ? '📚 Curriculum-Based' : '💼 Professional'}
                            </Badge>
                        </div>
                        <p className="text-slate-500">
                            {courseForm.mode === 'curriculum'
                                ? 'Build your structured curriculum'
                                : 'Create skills-focused professional training'}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" onClick={() => setView('list')}>
                            ← Back to Courses
                        </Button>
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Left: Course Metadata */}
                    <Card className="lg:col-span-1">
                        <CardContent className="p-6 space-y-4">
                            <h3 className="font-bold text-slate-900">Course Details</h3>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Course Title</label>
                                <Input
                                    value={courseForm.title}
                                    onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                                    placeholder={`e.g., ${activeTab === 'video' ? 'Complete Python Masterclass' : 'Live Python Bootcamp'}`}
                                />
                                <div className="mt-2 flex justify-end">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        id="magic-fill-btn"
                                        onClick={handleMagicFill}
                                        className="text-xs border-indigo-200 text-indigo-700 bg-indigo-50 hover:bg-indigo-100"
                                    >
                                        🔮 AI Magic Fill (Details & SEO)
                                    </Button>
                                </div>
                                {activeTab === 'live' && (
                                    <div className="mt-3 flex items-center justify-between">
                                        <div className="text-xs text-slate-500">
                                            Room: {courseForm.defaultLiveRoomId ? 'Created and Ready' : 'Not created'}
                                        </div>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={handleCreateDefaultRoom}
                                            className="text-xs"
                                        >
                                            {courseForm.defaultLiveRoomId ? 'Room Created and Ready' : 'Create Default Room'}
                                        </Button>
                                    </div>
                                )}
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="block text-sm font-medium text-slate-700">Description</label>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        className="h-6 text-xs text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
                                        onClick={handleGenerateSEO}
                                        id="seo-gen-btn"
                                    >
                                        ✨ Auto-Generate SEO
                                    </Button>
                                </div>

                                <textarea
                                    value={courseForm.description}
                                    onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                                    placeholder="What will students learn?"
                                    rows={4}
                                    className="w-full rounded-lg border border-slate-200 px-3 py-2"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Category</label>
                                <div className="space-y-2">
                                    <select
                                        value={courseForm.categoryId}
                                        onChange={(e) => setCourseForm({ ...courseForm, categoryId: e.target.value })}
                                        className="w-full rounded-lg border border-slate-200 px-3 py-2"
                                    >
                                        <option value="">Select Category</option>
                                        {categories.map(cat => (
                                            <option key={cat._id} value={cat._id}>{cat.name}</option>
                                        ))}
                                    </select>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        className="w-full"
                                        onClick={() => setShowCreateCategory(true)}
                                    >
                                        + Create New Category
                                    </Button>
                                </div>
                            </div>

                            {/* Category Creation Modal */}
                            {showCreateCategory && (
                                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                                    <Card className="w-full max-w-md mx-4">
                                        <CardContent className="p-6">
                                            <h3 className="text-lg font-bold text-slate-900 mb-4">Create New Category</h3>
                                            <div className="space-y-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-slate-700 mb-2">Category Name</label>
                                                    <Input
                                                        value={newCategoryName}
                                                        onChange={(e) => setNewCategoryName(e.target.value)}
                                                        placeholder="e.g., Programming, Design, Business"
                                                        onKeyPress={(e) => e.key === 'Enter' && handleCreateCategory()}
                                                    />
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button
                                                        onClick={handleCreateCategory}
                                                        disabled={creatingCategory || !newCategoryName.trim()}
                                                        className="flex-1"
                                                    >
                                                        {creatingCategory ? 'Creating...' : 'Create Category'}
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        onClick={() => {
                                                            setShowCreateCategory(false);
                                                            setNewCategoryName('');
                                                        }}
                                                        disabled={creatingCategory}
                                                    >
                                                        Cancel
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            )}

                            <div>
                                <ImageUploader
                                    value={courseForm.thumbnail}
                                    onChange={(url) => setCourseForm({ ...courseForm, thumbnail: url })}
                                    label="Course Thumbnail"
                                />
                                <div className="mt-2 flex justify-end">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        id="gen-thumb-btn"
                                        onClick={handleGenerateThumbnail}
                                        className="text-xs border-purple-200 text-purple-700 bg-purple-50 hover:bg-purple-100"
                                    >
                                        🎨 Generate with DALL·E
                                    </Button>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-slate-100">
                                <h4 className="font-bold text-slate-900 mb-4">SEO Settings</h4>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-medium text-slate-500 mb-1">Meta Title</label>
                                        <Input
                                            value={courseForm.seo?.title || ''}
                                            onChange={(e) => setCourseForm({
                                                ...courseForm,
                                                seo: { ...courseForm.seo, title: e.target.value }
                                            })}
                                            placeholder="SEO Optimized Title"
                                            className="h-8 text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-500 mb-1">Meta Description</label>
                                        <textarea
                                            value={courseForm.seo?.description || ''}
                                            onChange={(e) => setCourseForm({
                                                ...courseForm,
                                                seo: { ...courseForm.seo, description: e.target.value }
                                            })}
                                            placeholder="SEO Description"
                                            rows={3}
                                            className="w-full text-sm rounded-lg border border-slate-200 px-3 py-2"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-500 mb-1">Keywords</label>
                                        <Input
                                            value={courseForm.seo?.keywords?.join(', ') || ''}
                                            onChange={(e) => setCourseForm({
                                                ...courseForm,
                                                seo: { ...courseForm.seo, keywords: e.target.value.split(',').map(s => s.trim()) }
                                            })}
                                            placeholder="React, NextJS, Web Development..."
                                            className="h-8 text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-500 mb-1">Slug (URL)</label>
                                        <Input
                                            value={courseForm.slug || ''}
                                            onChange={(e) => setCourseForm({ ...courseForm, slug: e.target.value })}
                                            placeholder="course-url-slug"
                                            className="h-8 text-sm font-mono text-slate-600"
                                        />
                                    </div>

                                    <div className="pt-2 border-t border-slate-100 mt-2">
                                        <label className="block text-xs font-medium text-slate-700 mb-2 font-bold">Pricing</label>
                                        <div className="flex gap-2">
                                            <select
                                                value={courseForm.currency}
                                                onChange={(e) => setCourseForm({ ...courseForm, currency: e.target.value })}
                                                className="w-20 rounded-md border border-slate-200 px-2 py-1 text-[10px]"
                                            >
                                                <option value="USD">USD</option>
                                                <option value="EUR">EUR</option>
                                                <option value="INR">INR</option>
                                                <option value="GBP">GBP</option>
                                            </select>
                                            <Input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={courseForm.price}
                                                onChange={(e) => setCourseForm({ ...courseForm, price: parseFloat(e.target.value) || 0 })}
                                                placeholder="0.00"
                                                className="h-7 text-xs flex-1"
                                            />
                                        </div>
                                        <p className="text-[10px] text-slate-500 mt-1">
                                            {courseForm.price === 0 ? '✓ Free for students' : `💰 Paid: ${courseForm.currency} ${courseForm.price.toFixed(2)}`}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 space-y-2">
                                <Button
                                    className="w-full"
                                    onClick={() => handleSaveCourse('draft')}
                                >
                                    Save as Draft
                                </Button>
                                <Button
                                    className="w-full"
                                    variant="outline"
                                    onClick={() => handleSaveCourse('published')}
                                >
                                    Publish Course
                                </Button>
                                {editingCourse && (
                                    <Button
                                        className="w-full"
                                        variant="outline"
                                        onClick={() => handleSaveCourse(editingCourse.status)}
                                    >
                                        Update
                                    </Button>
                                )}
                            </div>
                        </CardContent>
                    </Card >

                    {/* Center: Curriculum Builder */}
                    < Card className="lg:col-span-2" >
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold text-slate-900">Curriculum</h3>
                                <div className="flex gap-2">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        id="gen-curr-btn"
                                        onClick={handleGenerateCurriculum}
                                        className="text-indigo-600 border-indigo-200 bg-indigo-50 hover:bg-indigo-100"
                                    >
                                        ✨ AI Curriculum Designer
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => setUnits([...units, { title: 'New Unit', chapters: [] }])}
                                    >
                                        + Add Unit
                                    </Button>
                                </div>
                            </div>

                            <CourseOutlineEditor
                                units={units}
                                onChange={setUnits}
                                courseType={activeTab}
                                mode={courseForm.mode}
                                courseTitle={courseForm.title}
                                defaultLiveRoomId={courseForm.defaultLiveRoomId}
                                courseId={editingCourse?._id}
                            />
                        </CardContent>
                    </Card >
                </div >
            </div >
        );
    }

    return (
        <div className="space-y-8">
            {/* Header with Tabs */}
            <div className="flex items-center justify-between">
                <div>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-slate-900">Content Studio</h1>
                            <p className="text-slate-500">Create and manage video and live courses</p>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-2xl w-fit">
                        <button
                            onClick={() => { setActiveTab('video'); setView('list'); }}
                            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'video'
                                ? 'bg-white text-blue-600 shadow-sm'
                                : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            📹 Video Courses
                        </button>
                        <button
                            onClick={() => { setActiveTab('live'); setView('list'); }}
                            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'live'
                                ? 'bg-white text-indigo-600 shadow-sm'
                                : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            🎥 Live Courses
                        </button>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button onClick={handleCreateCourse} className="rounded-2xl px-6 py-6 font-bold">
                        + Create {activeTab === 'video' ? 'Video' : 'Live'} Course
                    </Button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="text-sm text-slate-500">Total Courses</div>
                        <div className="text-2xl font-black text-slate-900">{filteredCourses.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="text-sm text-slate-500">Published</div>
                        <div className="text-2xl font-black text-emerald-600">
                            {filteredCourses.filter(c => c.status === 'published').length}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="text-sm text-slate-500">Drafts</div>
                        <div className="text-2xl font-black text-amber-600">
                            {filteredCourses.filter(c => c.status === 'draft').length}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="text-sm text-slate-500">
                            {activeTab === 'video' ? 'Total Lessons' : 'Total Sessions'}
                        </div>
                        <div className="text-2xl font-black text-blue-600">
                            {filteredCourses.reduce((acc, c) => acc + (c.totalLessons || c.totalSessions || 0), 0)}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Course List */}
            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : filteredCourses.length === 0 ? (
                <Card>
                    <CardContent className="p-12 text-center">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">
                            No {activeTab} courses yet
                        </h3>
                        <p className="text-slate-500 mb-4">
                            Create your first {activeTab} course to get started
                        </p>
                        <Button onClick={handleCreateCourse}>
                            + Create {activeTab === 'video' ? 'Video' : 'Live'} Course
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredCourses.map((course) => (
                        <Card key={course._id} className="group hover:shadow-lg transition-shadow">
                            <CardContent className="p-0">
                                <div className="aspect-video bg-gradient-to-br from-blue-500 to-indigo-600 rounded-t-2xl relative overflow-hidden">
                                    {course.thumbnail ? (
                                        <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="flex items-center justify-center h-full">
                                            <span className="text-6xl">{activeTab === 'video' ? '📹' : '🎥'}</span>
                                        </div>
                                    )}
                                    <Badge
                                        variant={course.status === 'published' ? 'success' : 'default'}
                                        className="absolute top-3 right-3"
                                    >
                                        {course.status}
                                    </Badge>
                                    <Badge
                                        className="absolute top-3 left-3 bg-black/60 text-white"
                                    >
                                        {activeTab === 'video' ? 'VIDEO' : 'LIVE'}
                                    </Badge>
                                </div>
                                <div className="p-4">
                                    <h3 className="font-bold text-slate-900 mb-2 line-clamp-2">{course.title}</h3>
                                    <p className="text-sm text-slate-500 mb-4 line-clamp-2">{course.description}</p>
                                    <div className="flex items-center gap-4 text-xs text-slate-400 mb-4">
                                        <span>{course.units?.length || 0} Units</span>
                                        <span>•</span>
                                        <span>{course.totalLessons || course.totalSessions || 0} {activeTab === 'video' ? 'Lessons' : 'Sessions'}</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="h-6 text-xs text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
                                            onClick={handleGenerateSEO}
                                            id="seo-gen-btn"
                                        >
                                            ✨ Auto-Generate SEO
                                        </Button>
                                    </div>
                                    <div className="flex gap-2">
                                        {activeTab === 'live' && (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="text-amber-600 border-amber-200 hover:bg-amber-50"
                                                onClick={() => handleEndLiveCourse(course._id)}
                                            >
                                                🏁 End Live Course
                                            </Button>
                                        )}
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="flex-1"
                                            onClick={() => handleEditCourse(course)}
                                        >
                                            Edit
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => handleDeleteCourse(course._id)}
                                        >
                                            Delete
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Course Mode Selector Modal */}
            {showModeSelector && (
                <CourseModeSelector
                    onSelect={handleModeSelected}
                    onCancel={() => setShowModeSelector(false)}
                />
            )}
        </div>
    );
}
