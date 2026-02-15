'use client';

import { ReactNode } from 'react';

interface LoadingSkeletonProps {
    variant?: 'text' | 'title' | 'avatar' | 'card' | 'image';
    className?: string;
    count?: number;
}

export function LoadingSkeleton({ variant = 'text', className = '', count = 1 }: LoadingSkeletonProps) {
    const skeletons = Array.from({ length: count });

    const getVariantClass = () => {
        switch (variant) {
            case 'title':
                return 'skeleton-title';
            case 'avatar':
                return 'skeleton-avatar';
            case 'text':
                return 'skeleton-text';
            case 'card':
                return 'h-64 w-full';
            case 'image':
                return 'h-48 w-full';
            default:
                return 'skeleton-text';
        }
    };

    return (
        <>
            {skeletons.map((_, index) => (
                <div key={index} className={`skeleton ${getVariantClass()} ${className}`} />
            ))}
        </>
    );
}

interface CourseCardSkeletonProps {
    count?: number;
}

export function CourseCardSkeleton({ count = 3 }: CourseCardSkeletonProps) {
    const skeletons = Array.from({ length: count });

    return (
        <>
            {skeletons.map((_, index) => (
                <div key={index} className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                    <LoadingSkeleton variant="image" className="rounded-none" />
                    <div className="p-4 space-y-3">
                        <LoadingSkeleton variant="title" />
                        <LoadingSkeleton variant="text" count={2} />
                        <div className="flex items-center gap-2">
                            <LoadingSkeleton variant="avatar" className="w-8 h-8" />
                            <LoadingSkeleton variant="text" className="w-24" />
                        </div>
                    </div>
                </div>
            ))}
        </>
    );
}

interface EmptyStateProps {
    icon?: ReactNode;
    title: string;
    description: string;
    action?: ReactNode;
    className?: string;
}

export function EmptyState({ icon, title, description, action, className = '' }: EmptyStateProps) {
    return (
        <div className={`text-center py-12 px-4 ${className}`}>
            {icon && (
                <div className="mb-4 flex justify-center bounce-in">
                    {icon}
                </div>
            )}
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">{title}</h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-md mx-auto">{description}</p>
            {action && <div className="flex justify-center">{action}</div>}
        </div>
    );
}

interface BadgeProps {
    variant: 'new' | 'popular' | 'featured';
    children: ReactNode;
    className?: string;
}

export function Badge({ variant, children, className = '' }: BadgeProps) {
    const variantClass = variant === 'new' ? 'badge-new' : variant === 'popular' ? 'badge-popular' : 'badge-featured';

    return (
        <span className={`${variantClass} ${className}`}>
            {children}
        </span>
    );
}

interface ProgressRingProps {
    progress: number;
    size?: number;
    strokeWidth?: number;
    className?: string;
}

export function ProgressRing({ progress, size = 60, strokeWidth = 4, className = '' }: ProgressRingProps) {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (progress / 100) * circumference;

    return (
        <div className={`relative inline-flex items-center justify-center ${className}`}>
            <svg width={size} height={size} className="progress-ring">
                <circle
                    className="text-slate-200 dark:text-slate-700"
                    strokeWidth={strokeWidth}
                    stroke="currentColor"
                    fill="transparent"
                    r={radius}
                    cx={size / 2}
                    cy={size / 2}
                />
                <circle
                    className="progress-ring-circle text-elite-accent-cyan"
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r={radius}
                    cx={size / 2}
                    cy={size / 2}
                />
            </svg>
            <span className="absolute text-xs font-bold text-slate-900 dark:text-white">
                {Math.round(progress)}%
            </span>
        </div>
    );
}

interface TooltipProps {
    content: string;
    children: ReactNode;
    className?: string;
}

export function Tooltip({ content, children, className = '' }: TooltipProps) {
    return (
        <div className={`tooltip ${className}`} data-tooltip={content}>
            {children}
        </div>
    );
}

interface FloatingActionButtonProps {
    onClick: () => void;
    icon: ReactNode;
    label?: string;
    className?: string;
}

export function FloatingActionButton({ onClick, icon, label, className = '' }: FloatingActionButtonProps) {
    return (
        <button
            onClick={onClick}
            className={`fixed bottom-8 right-8 w-14 h-14 bg-elite-accent-cyan hover:bg-elite-accent-purple text-white rounded-full shadow-2xl btn-lift flex items-center justify-center z-50 transition-colors duration-300 ${className}`}
            aria-label={label || 'Action button'}
        >
            {icon}
        </button>
    );
}

interface ScrollIndicatorProps {
    className?: string;
}

export function ScrollIndicator({ className = '' }: ScrollIndicatorProps) {
    return <div className={`scroll-indicator ${className}`} />;
}
