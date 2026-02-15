'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

interface Course {
    _id: string;
    title: string;
    slug: string;
    summary?: string;
    thumbnail?: string;
    level?: string;
    subject?: string;
    instructor?: string;
    rating?: number;
    enrollmentCount?: number;
    isNew?: boolean;
    isPopular?: boolean;
    isFeatured?: boolean;
}

interface EnhancedCourseCardProps {
    course: Course;
    showBadges?: boolean;
    showInstructor?: boolean;
    showStats?: boolean;
}

export function EnhancedCourseCard({
    course,
    showBadges = true,
    showInstructor = true,
    showStats = true
}: EnhancedCourseCardProps) {
    return (
        <Link href={`/courses/${course.slug}`} className="block group">
            <div className="course-card card-hover-lift bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 h-full">
                {/* Image with Overlay */}
                <div className="course-card-image relative h-48 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900">
                    {course.thumbnail ? (
                        <Image
                            src={course.thumbnail}
                            alt={course.title}
                            fill
                            className="object-cover"
                        />
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-6xl opacity-20">\ud83d\udcda</span>
                        </div>
                    )}

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    {/* Badges */}
                    {showBadges && (
                        <div className="absolute top-3 left-3 flex flex-wrap gap-2 z-10">
                            {course.isNew && <span className="badge-new">New</span>}
                            {course.isPopular && <span className="badge-popular">Popular</span>}
                            {course.isFeatured && <span className="badge-featured">Featured</span>}
                        </div>
                    )}

                    {/* Level Badge */}
                    {course.level && (
                        <div className="absolute top-3 right-3 z-10">
                            <Badge variant="secondary" className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm text-xs">
                                {course.level}
                            </Badge>
                        </div>
                    )}
                </div>

                {/* Content */}
                <CardContent className="p-5 space-y-3">
                    {/* Subject Tag */}
                    {course.subject && (
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-elite-accent-cyan uppercase tracking-wider">
                                {course.subject}
                            </span>
                        </div>
                    )}

                    {/* Title */}
                    <h3 className="font-bold text-lg text-slate-900 dark:text-white line-clamp-2 group-hover:text-elite-accent-cyan transition-colors">
                        {course.title}
                    </h3>

                    {/* Summary */}
                    {course.summary && (
                        <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                            {course.summary}
                        </p>
                    )}

                    {/* Instructor */}
                    {showInstructor && course.instructor && (
                        <div className="flex items-center gap-2 pt-2">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-elite-accent-cyan to-elite-accent-purple flex items-center justify-center text-white text-xs font-bold">
                                {course.instructor.charAt(0).toUpperCase()}
                            </div>
                            <span className="text-xs text-slate-600 dark:text-slate-400">
                                {course.instructor}
                            </span>
                        </div>
                    )}

                    {/* Stats */}
                    {showStats && (
                        <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                            {course.rating && (
                                <div className="flex items-center gap-1">
                                    <span className="text-yellow-500">\u2b50</span>
                                    <span className="text-sm font-semibold text-slate-900 dark:text-white">
                                        {course.rating.toFixed(1)}
                                    </span>
                                </div>
                            )}
                            {course.enrollmentCount && (
                                <div className="text-xs text-slate-500">
                                    {course.enrollmentCount.toLocaleString()} enrolled
                                </div>
                            )}
                        </div>
                    )}
                </CardContent>
            </div>
        </Link>
    );
}
