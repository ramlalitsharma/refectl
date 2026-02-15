'use client';

import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { motion } from 'framer-motion';
import { GraduationCap, Mic, Play, Target, Zap } from 'lucide-react';
import type { ReactNode } from 'react';

interface QuickAction {
    label: string;
    icon: ReactNode;
    href: string;
    color: 'cyan' | 'purple' | 'emerald' | 'blue' | 'orange';
    description?: string;
}

const colorMap = {
    cyan: "hover:border-elite-accent-cyan/40 bg-elite-accent-cyan/5 text-elite-accent-cyan",
    purple: "hover:border-elite-accent-purple/40 bg-elite-accent-purple/5 text-elite-accent-purple",
    emerald: "hover:border-elite-accent-emerald/40 bg-elite-accent-emerald/5 text-elite-accent-emerald",
    blue: "hover:border-blue-500/40 bg-blue-500/5 text-blue-400",
    orange: "hover:border-orange-500/40 bg-orange-500/5 text-orange-400",
};

const defaultActions: QuickAction[] = [
    {
        label: 'Intelligence Feed',
        icon: <Mic className="h-7 w-7" />,
        href: '/news',
        color: 'cyan',
        description: 'Read the latest updates',
    },
    {
        label: 'Take a Quiz',
        icon: <Target className="h-7 w-7" />,
        href: '/quiz',
        color: 'emerald',
        description: 'Test your knowledge',
    },
    {
        label: 'Skill Paths',
        icon: <GraduationCap className="h-7 w-7" />,
        href: '/courses',
        color: 'purple',
        description: 'Guided learning journeys',
    },
    {
        label: 'Refectl Hub',
        icon: <Zap className="h-7 w-7" />,
        href: '/dashboard',
        color: 'blue',
        description: 'Access all utilities',
    },
];

interface QuickActionsProps {
    actions?: QuickAction[];
    lastCourseSlug?: string | null;
}

export function QuickActions({ actions = defaultActions, lastCourseSlug }: QuickActionsProps) {
    return (
        <div className="space-y-6">
            <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 mb-4">
                Rapid Access
            </h2>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Resume Last Course (if available) */}
                {lastCourseSlug && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                        className="col-span-full"
                    >
                        <Link href={`/courses/${lastCourseSlug}`}>
                            <div className="glass-card-premium p-6 rounded-3xl border border-white/10 hover:border-elite-accent-cyan/30 transition-all duration-300 cursor-pointer group flex items-center justify-between">
                                <div className="flex items-center gap-6">
                                    <div className="w-14 h-14 rounded-2xl bg-elite-accent-cyan/10 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                                        <Play className="h-7 w-7 text-elite-accent-cyan" />
                                    </div>
                                    <div>
                                        <div className="font-black text-white text-lg">Continue Session</div>
                                        <div className="text-xs text-slate-500 font-medium">Pick up your last curricular module</div>
                                    </div>
                                </div>
                                <div className="hidden md:block px-6 py-2 rounded-full border border-white/10 text-xs font-black text-white group-hover:bg-white/5">
                                    RESUME →
                                </div>
                            </div>
                        </Link>
                    </motion.div>
                )}

                {/* Regular Quick Actions */}
                {actions.map((action, index) => (
                    <motion.div
                        key={action.label}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                        <Link href={action.href}>
                            <div
                                className={`glass-card-premium p-6 rounded-3xl border border-white/5 transition-all duration-300 cursor-pointer group ${colorMap[action.color]}`}
                            >
                                <div className="space-y-4">
                                    <div className="text-3xl group-hover:scale-110 transition-transform duration-500">
                                        {action.icon}
                                    </div>
                                    <div>
                                        <div className="font-black text-white text-sm group-hover:text-current transition-colors">{action.label}</div>
                                        {action.description && (
                                            <div className="text-[10px] text-slate-500 font-medium mt-1 leading-relaxed">{action.description}</div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </Link>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
