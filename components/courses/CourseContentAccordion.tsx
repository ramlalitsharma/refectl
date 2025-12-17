'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Progress } from '@/components/ui/Progress';
import { ChevronDown, ChevronUp, Lock } from 'lucide-react';

interface Lesson {
    id: string;
    title: string;
    slug: string;
    content?: string;
}

interface Module {
    id: string;
    title: string;
    lessons: Lesson[];
}

interface CourseContentAccordionProps {
    modules: Module[];
    slug: string;
    userId: string | null;
    completedLessonIds: string[];
}

export function CourseContentAccordion({ modules, slug, userId, completedLessonIds }: CourseContentAccordionProps) {
    // Initialize with the first module open
    const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set([modules[0]?.id]));

    const toggleModule = (moduleId: string) => {
        const newExpanded = new Set(expandedModules);
        if (newExpanded.has(moduleId)) {
            newExpanded.delete(moduleId);
        } else {
            newExpanded.add(moduleId);
        }
        setExpandedModules(newExpanded);
    };

    const completedSet = new Set(completedLessonIds);

    return (
        <div className="space-y-4">
            {modules.map((module) => {
                const moduleLessons = module.lessons || [];
                const completedInModule = moduleLessons.filter((l) =>
                    completedSet.has(l.id)
                ).length;
                const moduleProgress = moduleLessons.length > 0
                    ? Math.round((completedInModule / moduleLessons.length) * 100)
                    : 0;
                const isModuleCompleted = moduleLessons.length > 0 && completedInModule === moduleLessons.length;
                const isExpanded = expandedModules.has(module.id);

                return (
                    <div key={module.id} className={`border rounded-xl overflow-hidden shadow-sm transition-all duration-200 ${isModuleCompleted ? 'border-green-200 dark:border-green-800' : 'border-slate-200 dark:border-slate-700'} bg-white dark:bg-slate-800`}>
                        {/* Accordion Header */}
                        <div
                            className={`p-4 cursor-pointer transition-colors flex items-center justify-between ${isModuleCompleted
                                    ? 'bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30'
                                    : 'bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800'
                                }`}
                            onClick={() => toggleModule(module.id)}
                        >
                            <div className="flex-1">
                                <div className="flex items-center gap-3">
                                    <h3 className={`font-semibold ${isModuleCompleted ? 'text-green-800 dark:text-green-300' : 'text-slate-900 dark:text-white'}`}>
                                        {module.title}
                                    </h3>
                                    {isModuleCompleted ? (
                                        <span className="text-xs font-medium  text-green-700 bg-green-200 dark:bg-green-900/50 dark:text-green-300 px-2 py-0.5 rounded-full flex items-center gap-1">
                                            ✓ Completed
                                        </span>
                                    ) : (
                                        <span className="text-xs text-slate-500 bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded-full">
                                            {moduleLessons.length} lessons
                                        </span>
                                    )}
                                </div>
                                {userId && moduleLessons.length > 0 && (
                                    <div className="mt-2 flex items-center gap-3 w-full max-w-xs">
                                        <Progress value={moduleProgress} color="green" className="h-1.5" />
                                        <span className="text-xs text-slate-500 whitespace-nowrap">
                                            {completedInModule}/{moduleLessons.length}
                                        </span>
                                    </div>
                                )}
                            </div>
                            <div className={isModuleCompleted ? 'text-green-600 dark:text-green-400' : 'text-slate-400'}>
                                {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                            </div>
                        </div>

                        {/* Accordion Content */}
                        {isExpanded && (
                            <div className={`border-t ${isModuleCompleted ? 'border-green-100 dark:border-green-800' : 'border-slate-100 dark:border-slate-700'}`}>
                                <ol className={`divide-y ${isModuleCompleted ? 'divide-green-100 dark:divide-green-800' : 'divide-slate-100 dark:divide-slate-700'}`}>
                                    {moduleLessons.map((lesson, lidx) => {
                                        const isCompleted = completedSet.has(lesson.id);
                                        return (
                                            <li key={lesson.id} className={`transition-colors ${isCompleted ? 'bg-green-50/50 dark:bg-green-900/10 hover:bg-green-100/50 dark:hover:bg-green-900/20' : 'hover:bg-slate-50 dark:hover:bg-slate-700/50'}`}>
                                                <Link
                                                    href={`/courses/${slug}/${lesson.slug}`}
                                                    className="flex items-start gap-3 p-4 w-full"
                                                >
                                                    <div className="mt-0.5 flex-shrink-0">
                                                        {isCompleted ? (
                                                            <div className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center shadow-sm">
                                                                <span className="text-sm font-bold">✓</span>
                                                            </div>
                                                        ) : (
                                                            <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-xs font-medium">
                                                                {lidx + 1}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className={`font-medium truncate pr-4 ${isCompleted ? 'text-green-800 dark:text-green-300' : 'text-slate-700 dark:text-slate-200'}`}>
                                                            {lesson.title}
                                                        </h4>
                                                        {lesson.content && (
                                                            <p className={`text-xs mt-0.5 line-clamp-1 ${isCompleted ? 'text-green-600/80 dark:text-green-400/70' : 'text-slate-500'}`}>
                                                                {lesson.content.slice(0, 100)}...
                                                            </p>
                                                        )}
                                                    </div>
                                                    {!userId && (
                                                        <Lock className="w-4 h-4 text-slate-400" />
                                                    )}
                                                </Link>
                                            </li>
                                        );
                                    })}
                                    {moduleLessons.length === 0 && (
                                        <li className="p-4 text-center text-sm text-slate-500 italic">No lessons in this module yet.</li>
                                    )}
                                </ol>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
