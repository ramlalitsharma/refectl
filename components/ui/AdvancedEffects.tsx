'use client';

import { useEffect, useState } from 'react';

interface ConfettiPiece {
    id: number;
    left: number;
    delay: number;
    duration: number;
    color: string;
}

export function Confetti({ duration = 3000 }: { duration?: number }) {
    const [pieces, setPieces] = useState<ConfettiPiece[]>([]);
    const [isActive, setIsActive] = useState(true);

    useEffect(() => {
        const colors = [
            'bg-elite-accent-cyan',
            'bg-elite-accent-purple',
            'bg-emerald-500',
            'bg-amber-500',
            'bg-pink-500',
            'bg-blue-500',
        ];

        const newPieces: ConfettiPiece[] = [];
        for (let i = 0; i < 50; i++) {
            newPieces.push({
                id: i,
                left: Math.random() * 100,
                delay: Math.random() * 0.5,
                duration: 2 + Math.random() * 1,
                color: colors[Math.floor(Math.random() * colors.length)],
            });
        }
        setPieces(newPieces);

        const timer = setTimeout(() => setIsActive(false), duration);
        return () => clearTimeout(timer);
    }, [duration]);

    if (!isActive) return null;

    return (
        <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
            {pieces.map((piece) => (
                <div
                    key={piece.id}
                    className={`confetti ${piece.color}`}
                    style={{
                        left: `${piece.left}%`,
                        animationDelay: `${piece.delay}s`,
                        animationDuration: `${piece.duration}s`,
                    }}
                />
            ))}
        </div>
    );
}

interface ParticleBackgroundProps {
    count?: number;
    color?: string;
    className?: string;
}

export function ParticleBackground({ count = 30, color = 'bg-elite-accent-cyan', className = '' }: ParticleBackgroundProps) {
    const particles = Array.from({ length: count }, (_, i) => ({
        id: i,
        size: 2 + Math.random() * 4,
        left: Math.random() * 100,
        top: Math.random() * 100,
        delay: Math.random() * 5,
        duration: 10 + Math.random() * 10,
    }));

    return (
        <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
            {particles.map((particle) => (
                <div
                    key={particle.id}
                    className={`absolute ${color} rounded-full opacity-20 animate-pulse`}
                    style={{
                        width: `${particle.size}px`,
                        height: `${particle.size}px`,
                        left: `${particle.left}%`,
                        top: `${particle.top}%`,
                        animationDelay: `${particle.delay}s`,
                        animationDuration: `${particle.duration}s`,
                    }}
                />
            ))}
        </div>
    );
}

interface ProgressBarProps {
    progress: number;
    showPercentage?: boolean;
    color?: string;
    height?: 'sm' | 'md' | 'lg';
    animated?: boolean;
    className?: string;
}

export function ProgressBar({
    progress,
    showPercentage = true,
    color = 'bg-elite-accent-cyan',
    height = 'md',
    animated = true,
    className = '',
}: ProgressBarProps) {
    const heights = {
        sm: 'h-2',
        md: 'h-3',
        lg: 'h-4',
    };

    return (
        <div className={`w-full ${className}`}>
            <div className={`relative ${heights[height]} bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden`}>
                <div
                    className={`${color} ${heights[height]} rounded-full transition-all duration-500 ease-out ${animated ? 'shimmer' : ''}`}
                    style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
                />
            </div>
            {showPercentage && (
                <div className="mt-2 text-sm font-semibold text-slate-600 dark:text-slate-400 text-right">
                    {Math.round(progress)}%
                </div>
            )}
        </div>
    );
}

interface CounterProps {
    from: number;
    to: number;
    duration?: number;
    suffix?: string;
    prefix?: string;
    className?: string;
}

export function AnimatedCounter({ from, to, duration = 2000, suffix = '', prefix = '', className = '' }: CounterProps) {
    const [count, setCount] = useState(from);

    useEffect(() => {
        const steps = 60;
        const increment = (to - from) / steps;
        const stepDuration = duration / steps;
        let current = from;
        let step = 0;

        const timer = setInterval(() => {
            step++;
            current += increment;
            if (step >= steps) {
                setCount(to);
                clearInterval(timer);
            } else {
                setCount(Math.round(current));
            }
        }, stepDuration);

        return () => clearInterval(timer);
    }, [from, to, duration]);

    return (
        <span className={className}>
            {prefix}{count.toLocaleString()}{suffix}
        </span>
    );
}

interface PulsingDotProps {
    color?: string;
    size?: 'sm' | 'md' | 'lg';
    label?: string;
    className?: string;
}

export function PulsingDot({ color = 'bg-emerald-500', size = 'md', label, className = '' }: PulsingDotProps) {
    const sizes = {
        sm: 'w-2 h-2',
        md: 'w-3 h-3',
        lg: 'w-4 h-4',
    };

    return (
        <div className={`flex items-center gap-2 ${className}`}>
            <span className="relative flex">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${color} opacity-75`} />
                <span className={`relative inline-flex rounded-full ${sizes[size]} ${color}`} />
            </span>
            {label && <span className="text-sm font-medium text-slate-600 dark:text-slate-400">{label}</span>}
        </div>
    );
}

interface GradientBorderCardProps {
    children: React.ReactNode;
    gradient?: string;
    borderWidth?: number;
    className?: string;
}

export function GradientBorderCard({
    children,
    gradient = 'from-elite-accent-cyan to-elite-accent-purple',
    borderWidth = 2,
    className = '',
}: GradientBorderCardProps) {
    return (
        <div className={`relative p-[${borderWidth}px] bg-gradient-to-r ${gradient} rounded-2xl ${className}`}>
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 h-full">
                {children}
            </div>
        </div>
    );
}

interface SpinnerProps {
    size?: 'sm' | 'md' | 'lg' | 'xl';
    color?: string;
    className?: string;
}

export function Spinner({ size = 'md', color = 'border-elite-accent-cyan', className = '' }: SpinnerProps) {
    const sizes = {
        sm: 'w-4 h-4 border-2',
        md: 'w-8 h-8 border-2',
        lg: 'w-12 h-12 border-3',
        xl: 'w-16 h-16 border-4',
    };

    return (
        <div className={`${sizes[size]} ${color} border-t-transparent rounded-full animate-spin ${className}`} />
    );
}
