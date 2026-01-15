'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { useRouter } from 'next/navigation';
import { CourseOutlineEditor } from '@/components/admin/CourseOutlineEditor';
import { ImageUploader } from '@/components/admin/ImageUploader';

interface VideoCourse {
    _id: string;
    title: string;
    slug: string;
    description: string;
    thumbnail?: string;
    categoryId?: string;
    status: 'draft' | 'published';
    units: any[];
    createdAt: string;
    totalLessons?: number;
    totalDuration?: number;
    price?: number;
    currency?: string;
    isPaid?: boolean;
    paymentType?: 'free' | 'paid' | 'premium';
}

export function VideoCourseStudio() {
    const router = useRouter();
    const [view, setView] = useState<'list' | 'create' | 'edit'>('list');
    const [courses, setCourses] = useState<VideoCourse[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingCourse, setEditingCourse] = useState<VideoCourse | null>(null);

    // Course form state
    const [courseForm, setCourseForm] = useState({
        title: '',
        description: '',
        thumbnail: '',
        categoryId: '',
        price: 0,
        currency: 'USD',
    });
    const [units, setUnits] = useState<any[]>([
        {
            title: 'Introduction',
            chapters: [
                {
                    title: 'Getting Started',
                    lessons: [
                        { title: 'Welcome Video', contentType: 'video', videoUrl: '', content: '' }
                    ]
                }
            ]
        }
    ]);

    useEffect(() => {
        loadCourses();
        loadCategories();
    }, []);

    const loadCourses = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/admin/video-courses');
            const data = await res.json();
            setCourses(data.courses || []);
        } catch (error) {
            console.error('Failed to load video courses:', error);
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

    const handleCreateCourse = () => {
        setView('create');
        setEditingCourse(null);
        setCourseForm({ title: '', description: '', thumbnail: '', categoryId: '', price: 0, currency: 'USD' });
        setUnits([
            {
                title: 'Introduction',
                chapters: [
                    {
                        title: 'Getting Started',
                        lessons: [
                            { title: 'Welcome Video', contentType: 'video', videoUrl: '', content: '' }
                        ]
                    }
                ]
            }
        ]);
    };

    const handleEditCourse = (course: VideoCourse) => {
        setView('edit');
        setEditingCourse(course);
        setCourseForm({
            title: course.title,
            description: course.description,
            thumbnail: course.thumbnail || '',
            categoryId: course.categoryId || '',
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
                type: 'video-course',
                isPaid: courseForm.price > 0,
                paymentType: courseForm.price === 0 ? 'free' : 'paid',
            };

            const url = editingCourse
                ? `/api/admin/video-courses/${editingCourse._id}`
                : '/api/admin/video-courses';

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

    const handleDeleteCourse = async (courseId: string) => {
        if (!confirm('Are you sure you want to delete this video course?')) return;

        try {
            const res = await fetch(`/api/admin/video-courses/${courseId}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                await loadCourses();
            }
        } catch (error) {
            console.error('Failed to delete course:', error);
        }
    };

    if (view === 'create' || view === 'edit') {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-black text-slate-900">
                            {view === 'create' ? 'Create Video Course' : 'Edit Video Course'}
                        </h2>
                        <p className="text-slate-500">Build your structured video curriculum</p>
                    </div>
                    <Button variant="outline" onClick={() => setView('list')}>
                        ← Back to Courses
                    </Button>
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
                                    placeholder="e.g., Complete Python Masterclass"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
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
                            </div>

                            <div>
                                <ImageUploader
                                    value={courseForm.thumbnail}
                                    onChange={(url) => setCourseForm({ ...courseForm, thumbnail: url })}
                                    label="Course Thumbnail"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Course Price
                                </label>
                                <div className="flex gap-2">
                                    <select
                                        value={courseForm.currency}
                                        onChange={(e) => setCourseForm({ ...courseForm, currency: e.target.value })}
                                        className="w-24 rounded-lg border border-slate-200 px-3 py-2 text-sm"
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
                                        className="flex-1"
                                    />
                                </div>
                                <p className="text-xs text-slate-500 mt-1">
                                    {courseForm.price === 0 ? '✓ Free course' : `💰 Paid course - ${courseForm.currency} ${courseForm.price.toFixed(2)}`}
                                </p>
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
                            </div>
                        </CardContent>
                    </Card>

                    {/* Center: Curriculum Builder */}
                    <Card className="lg:col-span-2">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold text-slate-900">Curriculum</h3>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setUnits([...units, { title: 'New Unit', chapters: [] }])}
                                >
                                    + Add Unit
                                </Button>
                            </div>

                            <CourseOutlineEditor
                                units={units}
                                onChange={setUnits}
                            />
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-slate-900">Video Course Studio</h1>
                            <p className="text-slate-500">Create and manage professional video courses</p>
                        </div>
                    </div>
                </div>
                <Button onClick={handleCreateCourse} className="rounded-2xl px-6 py-6 font-bold">
                    + Create Video Course
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="text-sm text-slate-500">Total Courses</div>
                        <div className="text-2xl font-black text-slate-900">{courses.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="text-sm text-slate-500">Published</div>
                        <div className="text-2xl font-black text-emerald-600">
                            {courses.filter(c => c.status === 'published').length}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="text-sm text-slate-500">Drafts</div>
                        <div className="text-2xl font-black text-amber-600">
                            {courses.filter(c => c.status === 'draft').length}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="text-sm text-slate-500">Total Lessons</div>
                        <div className="text-2xl font-black text-blue-600">
                            {courses.reduce((acc, c) => acc + (c.totalLessons || 0), 0)}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Course List */}
            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : courses.length === 0 ? (
                <Card>
                    <CardContent className="p-12 text-center">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">No video courses yet</h3>
                        <p className="text-slate-500 mb-4">Create your first video course to get started</p>
                        <Button onClick={handleCreateCourse}>+ Create Video Course</Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {courses.map((course) => (
                        <Card key={course._id} className="group hover:shadow-lg transition-shadow">
                            <CardContent className="p-0">
                                <div className="aspect-video bg-gradient-to-br from-blue-500 to-indigo-600 rounded-t-2xl relative overflow-hidden">
                                    {course.thumbnail ? (
                                        <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="flex items-center justify-center h-full">
                                            <svg className="w-16 h-16 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                    )}
                                    <Badge
                                        variant={course.status === 'published' ? 'success' : 'default'}
                                        className="absolute top-3 right-3"
                                    >
                                        {course.status}
                                    </Badge>
                                </div>
                                <div className="p-4">
                                    <h3 className="font-bold text-slate-900 mb-2 line-clamp-2">{course.title}</h3>
                                    <p className="text-sm text-slate-500 mb-4 line-clamp-2">{course.description}</p>
                                    <div className="flex items-center gap-4 text-xs text-slate-400 mb-4">
                                        <span>{course.units?.length || 0} Units</span>
                                        <span>•</span>
                                        <span>{course.totalLessons || 0} Lessons</span>
                                    </div>
                                    <div className="flex gap-2">
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
        </div>
    );
}
