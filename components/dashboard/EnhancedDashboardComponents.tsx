'use client';

import { ReactNode } from 'react';
import { ProgressRing, AnimatedCounter, PulsingDot } from '@/components/ui/AdvancedEffects';

interface DashboardWidgetProps {
    title: string;
    subtitle?: string;
    icon?: ReactNode;
    children: ReactNode;
    action?: ReactNode;
    className?: string;
    variant?: 'default' | 'gradient' | 'glass';
}

export function DashboardWidget({
    title,
    subtitle,
    icon,
    children,
    action,
    className = '',
    variant = 'default',
}: DashboardWidgetProps) {
    const variants = {
        default: 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800',
        gradient: 'bg-gradient-to-br from-elite-accent-cyan/10 to-elite-accent-purple/10 border border-white/10',
        glass: 'glass-card-premium border-white/10',
    };

    return (
        <div className={`${variants[variant]} rounded-2xl p-6 card-hover-lift ${className}`}>
            <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-3">
                    {icon && (
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-elite-accent-cyan to-elite-accent-purple flex items-center justify-center text-white text-xl">
                            {icon}
                        </div>
                    )}
                    <div>
                        <h3 className="font-black text-lg text-slate-900 dark:text-white">{title}</h3>
                        {subtitle && (
                            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
                                {subtitle}
                            </p>
                        )}
                    </div>
                </div>
                {action}
            </div>
            {children}
        </div>
    );
}

interface StatCardProps {
    label: string;
    value: number | string;
    change?: number;
    icon?: ReactNode;
    trend?: 'up' | 'down' | 'neutral';
    animated?: boolean;
    suffix?: string;
    prefix?: string;
    className?: string;
}

export function StatCard({
    label,
    value,
    change,
    icon,
    trend = 'neutral',
    animated = true,
    suffix = '',
    prefix = '',
    className = '',
}: StatCardProps) {
    const trendColors = {
        up: 'text-emerald-500',
        down: 'text-red-500',
        neutral: 'text-slate-500',
    };

    const trendIcons = {
        up: '↗',
        down: '↘',
        neutral: '→',
    };

    return (
        <div className={`glass-card-premium p-6 rounded-2xl border-white/10 card-hover-lift ${className}`}>
            <div className="flex items-start justify-between mb-4">
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    {label}
                </p>
                {icon && (
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-elite-accent-cyan/20 to-elite-accent-purple/20 flex items-center justify-center text-elite-accent-cyan">
                        {icon}
                    </div>
                )}
            </div>
            <div className="flex items-end gap-2">
                {animated && typeof value === 'number' ? (
                    <AnimatedCounter
                        from={0}
                        to={value}
                        prefix={prefix}
                        suffix={suffix}
                        className="text-3xl font-black text-slate-900 dark:text-white"
                    />
                ) : (
                    <span className="text-3xl font-black text-slate-900 dark:text-white">
                        {prefix}{value}{suffix}
                    </span>
                )}
                {change !== undefined && (
                    <span className={`text-sm font-bold ${trendColors[trend]} flex items-center gap-1`}>
                        <span>{trendIcons[trend]}</span>
                        <span>{Math.abs(change)}%</span>
                    </span>
                )}
            </div>
        </div>
    );
}

interface ActivityFeedItemProps {
    icon: ReactNode;
    title: string;
    description: string;
    time: string;
    status?: 'success' | 'warning' | 'error' | 'info';
}

export function ActivityFeedItem({ icon, title, description, time, status = 'info' }: ActivityFeedItemProps) {
    const statusColors = {
        success: 'bg-emerald-500',
        warning: 'bg-amber-500',
        error: 'bg-red-500',
        info: 'bg-blue-500',
    };

    return (
        <div className="flex items-start gap-4 p-4 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
            <div className={`w-10 h-10 rounded-full ${statusColors[status]} flex items-center justify-center text-white shrink-0`}>
                {icon}
            </div>
            <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-900 dark:text-white">{title}</p>
                <p className="text-sm text-slate-600 dark:text-slate-400 truncate">{description}</p>
                <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">{time}</p>
            </div>
        </div>
    );
}

interface QuickActionButtonProps {
    icon: ReactNode;
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary';
    className?: string;
}

export function QuickActionButton({
    icon,
    label,
    onClick,
    variant = 'secondary',
    className = '',
}: QuickActionButtonProps) {
    const variants = {
        primary: 'bg-gradient-to-br from-elite-accent-cyan to-elite-accent-purple text-white hover:shadow-lg hover:shadow-elite-accent-cyan/30',
        secondary: 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-700',
    };

    return (
        <button
            onClick={onClick}
            className={`${variants[variant]} p-4 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col items-center gap-2 transition-all btn-lift ripple-effect ${className}`}
        >
            <div className="text-3xl">{icon}</div>
            <span className="text-sm font-semibold">{label}</span>
        </button>
    );
}

interface ProgressCardProps {
    title: string;
    current: number;
    total: number;
    icon?: ReactNode;
    color?: string;
    className?: string;
}

export function ProgressCard({
    title,
    current,
    total,
    icon,
    color = 'bg-elite-accent-cyan',
    className = '',
}: ProgressCardProps) {
    const percentage = (current / total) * 100;

    return (
        <div className={`glass-card-premium p-6 rounded-2xl border-white/10 ${className}`}>
            <div className="flex items-center justify-between mb-4">
                <h4 className="font-bold text-slate-900 dark:text-white">{title}</h4>
                {icon}
            </div>
            <div className="flex items-center gap-4">
                <ProgressRing progress={percentage} size={60} strokeWidth={6} />
                <div>
                    <p className="text-2xl font-black text-slate-900 dark:text-white">
                        {current}/{total}
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Completed</p>
                </div>
            </div>
        </div>
    );
}

interface LeaderboardItemProps {
    rank: number;
    name: string;
    score: number;
    avatar?: string;
    isCurrentUser?: boolean;
}

export function LeaderboardItem({ rank, name, score, avatar, isCurrentUser = false }: LeaderboardItemProps) {
    const rankColors = {
        1: 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-white',
        2: 'bg-gradient-to-br from-slate-300 to-slate-500 text-white',
        3: 'bg-gradient-to-br from-amber-600 to-amber-800 text-white',
    };

    return (
        <div
            className={`flex items-center gap-4 p-4 rounded-xl transition-all ${isCurrentUser
                    ? 'bg-elite-accent-cyan/10 border-2 border-elite-accent-cyan'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
        >
            <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-black ${rank <= 3 ? rankColors[rank as 1 | 2 | 3] : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
            >
                {rank}
            </div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-elite-accent-cyan to-elite-accent-purple flex items-center justify-center text-white font-bold shrink-0">
                {avatar ? (
                    <img src={avatar} alt={name} className="w-full h-full rounded-full object-cover" />
                ) : (
                    name.charAt(0).toUpperCase()
                )}
            </div>
            <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-900 dark:text-white truncate">{name}</p>
            </div>
            <div className="text-right">
                <p className="text-lg font-black text-elite-accent-cyan">{score.toLocaleString()}</p>
                <p className="text-xs text-slate-500">XP</p>
            </div>
        </div>
    );
}
