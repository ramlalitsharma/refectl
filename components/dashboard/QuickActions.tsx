'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { motion } from 'framer-motion';

interface QuickAction {
    label: string;
    icon: string;
    href: string;
    color: 'blue' | 'green' | 'purple' | 'orange' | 'teal';
    description?: string;
}

const colorClasses = {
    blue: 'bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200',
    green: 'bg-green-50 hover:bg-green-100 text-green-700 border-green-200',
    purple: 'bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-200',
    orange: 'bg-orange-50 hover:bg-orange-100 text-orange-700 border-orange-200',
    teal: 'bg-teal-50 hover:bg-teal-100 text-teal-700 border-teal-200',
};

const defaultActions: QuickAction[] = [
    {
        label: 'Browse Subjects',
        icon: '📚',
        href: '/subjects',
        color: 'blue',
        description: 'Explore all available topics',
    },
    {
        label: 'Take a Quiz',
        icon: '🎯',
        href: '/quiz',
        color: 'green',
        description: 'Test your knowledge',
    },
    {
        label: 'My Courses',
        icon: '🎓',
        href: '/my-learning',
        color: 'purple',
        description: 'Continue learning',
    },
    {
        label: 'Live Classes',
        icon: '📺',
        href: '/live',
        color: 'orange',
        description: 'Join live sessions',
    },
];

interface QuickActionsProps {
    actions?: QuickAction[];
    lastCourseSlug?: string | null;
}

export function QuickActions({ actions = defaultActions, lastCourseSlug }: QuickActionsProps) {
    return (
        <div className="space-y-4">
            <h2 className="text-lg font-semibold uppercase tracking-wide text-teal-700">
                Quick Actions
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {/* Resume Last Course (if available) */}
                {lastCourseSlug && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <Link href={`/courses/${lastCourseSlug}`}>
                            <Card className="border-2 border-amber-300 bg-gradient-to-br from-amber-50 to-orange-50 hover:shadow-lg transition-all duration-200 cursor-pointer group">
                                <div className="p-4 text-center space-y-2">
                                    <div className="text-3xl group-hover:scale-110 transition-transform">
                                        ▶️
                                    </div>
                                    <div className="font-semibold text-amber-900">Resume Course</div>
                                    <div className="text-xs text-amber-700">Pick up where you left off</div>
                                </div>
                            </Card>
                        </Link>
                    </motion.div>
                )}

                {/* Regular Quick Actions */}
                {actions.map((action, index) => (
                    <motion.div
                        key={action.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                        <Link href={action.href}>
                            <Card
                                className={`border-2 hover:shadow-lg transition-all duration-200 cursor-pointer group ${colorClasses[action.color]
                                    }`}
                            >
                                <div className="p-4 text-center space-y-2">
                                    <div className="text-3xl group-hover:scale-110 transition-transform">
                                        {action.icon}
                                    </div>
                                    <div className="font-semibold">{action.label}</div>
                                    {action.description && (
                                        <div className="text-xs opacity-75">{action.description}</div>
                                    )}
                                </div>
                            </Card>
                        </Link>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
