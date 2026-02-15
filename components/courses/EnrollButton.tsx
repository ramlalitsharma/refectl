'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';

interface EnrollButtonProps {
    courseId: string;
    slug: string;
    price: number;
    currency?: string;
    userId: string | null;
    isEnrolled: boolean;
    className?: string;
    size?: 'default' | 'sm' | 'lg' | 'icon';
}

export function EnrollButton({
    courseId,
    slug,
    price,
    currency = 'USD',
    userId,
    isEnrolled,
    className,
    size = 'lg'
}: EnrollButtonProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    // 1. Not Logged In
    if (!userId) {
        return (
            <Button
                asChild
                className={`w-full bg-teal-600 hover:bg-teal-700 font-bold ${className}`}
                size={size}
            >
                <Link href={`/sign-in?redirect_url=${encodeURIComponent(`/courses/${slug}`)}`}>
                    {price > 0 ? `Enroll for ${currency === 'USD' ? '$' : currency}${price}` : 'Enroll for Free'}
                </Link>
            </Button>
        );
    }

    // 2. Already Enrolled
    if (isEnrolled) {
        // We assume the parent component handles the "Continue Learning" link logic if it knows the first lesson.
        // However, if this button is used in a context where we just want to say "Enrolled", we can link to the course page root.
        // Or better, let the parent handle the "Continue" button and only use this for Enrollment action.
        // For now, let's render a disabled or "View Course" button if mistakenly used when enrolled.
        return (
            <Button
                className={`w-full bg-teal-600 hover:bg-teal-700 font-bold ${className}`}
                size={size}
                onClick={() => router.push(`/courses/${slug}`)}
            >
                Continue Learning
            </Button>
        );
    }

    const handleEnroll = async () => {
        try {
            setIsLoading(true);

            // Paid Course -> Checkout
            if (price > 0) {
                router.push(`/checkout?courseId=${courseId || slug}&amount=${price}`);
                return;
            }

            // Free Course -> Direct Enrollment
            const res = await fetch('/api/enrollments/enroll', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    courseId,
                    courseSlug: slug,
                }),
            });

            if (!res.ok) {
                throw new Error('Enrollment failed');
            }

            const data = await res.json();

            if (data.success) {
                router.refresh(); // Refresh server components to show course content
            }
        } catch (error) {
            console.error('Enrollment error:', error);
            alert('Failed to enroll. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Button
            className={`w-full bg-teal-600 hover:bg-teal-700 font-black uppercase tracking-widest text-[11px] shadow-lg shadow-teal-500/20 hover:shadow-teal-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 rounded-2xl py-7 ${className}`}
            size={size}
            onClick={handleEnroll}
            disabled={isLoading}
        >
            {isLoading ? (
                <div className="flex items-center gap-3">
                    <Loader2 className="w-5 h-5 animate-spin text-white/70" />
                    <span>Processing...</span>
                </div>
            ) : (
                <span className="flex items-center gap-2">
                    {price > 0
                        ? (
                            <>
                                <span className="opacity-70">Enroll for</span>
                                <span className="text-sm">{currency === 'USD' ? '$' : currency}{price}</span>
                            </>
                        )
                        : 'Begin for Free'
                    }
                    <span className="ml-2 opacity-40 group-hover:translate-x-1 transition-transform">→</span>
                </span>
            )}
        </Button>
    );
}
