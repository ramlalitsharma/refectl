'use client';

import { motion } from 'framer-motion';

interface CircularProgressProps {
    value: number; // 0-100
    size?: number; // diameter in pixels
    strokeWidth?: number;
    color?: 'blue' | 'green' | 'purple' | 'orange' | 'teal';
    label?: string;
    showPercentage?: boolean;
    className?: string;
}

const colorMap = {
    blue: {
        stroke: '#3b82f6',
        bg: '#dbeafe',
        text: '#1e40af',
    },
    green: {
        stroke: '#10b981',
        bg: '#d1fae5',
        text: '#065f46',
    },
    purple: {
        stroke: '#a855f7',
        bg: '#f3e8ff',
        text: '#6b21a8',
    },
    orange: {
        stroke: '#f97316',
        bg: '#fed7aa',
        text: '#9a3412',
    },
    teal: {
        stroke: '#14b8a6',
        bg: '#ccfbf1',
        text: '#115e59',
    },
};

export function CircularProgress({
    value,
    size = 120,
    strokeWidth = 8,
    color = 'teal',
    label,
    showPercentage = true,
    className = '',
}: CircularProgressProps) {
    const normalizedValue = Math.min(100, Math.max(0, value));
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (normalizedValue / 100) * circumference;

    const colors = colorMap[color];

    return (
        <div className={`inline-flex flex-col items-center gap-2 ${className}`}>
            <div className="relative" style={{ width: size, height: size }}>
                <svg
                    width={size}
                    height={size}
                    className="transform -rotate-90"
                >
                    {/* Background circle */}
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        stroke={colors.bg}
                        strokeWidth={strokeWidth}
                        fill="none"
                    />
                    {/* Progress circle */}
                    <motion.circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        stroke={colors.stroke}
                        strokeWidth={strokeWidth}
                        fill="none"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        initial={{ strokeDashoffset: circumference }}
                        animate={{ strokeDashoffset: offset }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                    />
                </svg>

                {/* Center text */}
                {showPercentage && (
                    <div
                        className="absolute inset-0 flex items-center justify-center"
                        style={{ color: colors.text }}
                    >
                        <motion.span
                            className="text-2xl font-bold"
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.5, duration: 0.3 }}
                        >
                            {Math.round(normalizedValue)}%
                        </motion.span>
                    </div>
                )}
            </div>

            {label && (
                <span className="text-sm font-medium text-slate-700">{label}</span>
            )}
        </div>
    );
}
