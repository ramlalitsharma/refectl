'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

interface Course {
  id: string;
  slug: string;
  title: string;
  thumbnail?: string;
  summary?: string;
  price?: { amount?: number; currency?: string } | number;
  createdAt?: string;
  tags?: string[];
}

interface CourseSliderProps {
  courses: Course[];
}

const NEW_THRESHOLD_DAYS = 7;
const NEW_THRESHOLD_MS = NEW_THRESHOLD_DAYS * 24 * 60 * 60 * 1000;

const getBadges = (tags: string[] = [], createdAt?: string) => {
  const badges: string[] = [];
  if (tags.some((tag) => tag.toLowerCase() === 'trending')) badges.push('Trending');
  if (createdAt) {
    const created = new Date(createdAt).getTime();
    if (!Number.isNaN(created) && Date.now() - created < NEW_THRESHOLD_MS) {
      badges.push('New');
    }
  }
  return badges;
};

const formatPrice = (price?: { amount?: number; currency?: string } | number) => {
  if (price === undefined || price === null) return 'Free';
  if (typeof price === 'number') {
    if (price === 0) return 'Free';
    return `$${price.toLocaleString()}`;
  }
  const amount = price.amount ?? 0;
  if (amount === 0) return 'Free';
  const currency = price.currency || 'USD';
  return `${currency.toUpperCase()} ${amount.toLocaleString()}`;
};

export function CourseSlider({ courses }: CourseSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Auto-advance slider
  useEffect(() => {
    if (!isAutoPlaying || courses.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % courses.length);
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, [isAutoPlaying, courses.length]);

  if (courses.length === 0) {
    return null;
  }

  const currentCourse = courses[currentIndex];
  const badges = getBadges(currentCourse.tags, currentCourse.createdAt);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
    // Resume auto-play after 10 seconds
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + courses.length) % courses.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % courses.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  return (
    <div className="relative w-full">
      <Card className="overflow-hidden border-none shadow-xl">
        <CardContent className="p-0">
          <Link href={`/courses/${currentCourse.slug}`} className="block group">
            <div className="relative h-96 w-full overflow-hidden bg-gradient-to-br from-teal-500 to-emerald-500">
              {currentCourse.thumbnail ? (
                <Image
                  src={currentCourse.thumbnail}
                  alt={currentCourse.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  priority
                />
              ) : (
                <div className="h-full w-full bg-gradient-to-br from-teal-500 via-emerald-500 to-teal-600 flex items-center justify-center">
                  <div className="text-white text-6xl">📚</div>
                </div>
              )}
              
              {/* Overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
              
              {/* Badges */}
              {badges.length > 0 && (
                <div className="absolute top-4 right-4 flex gap-2 z-10">
                  {badges.map((badge) => (
                    <Badge
                      key={badge}
                      variant={badge === 'New' ? 'success' : 'info'}
                      className="text-sm shadow-lg"
                    >
                      {badge}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Course Info */}
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white z-10">
                <h3 className="text-3xl font-bold mb-2 line-clamp-2">{currentCourse.title}</h3>
                {currentCourse.summary && (
                  <p className="text-white/90 text-lg mb-3 line-clamp-2">{currentCourse.summary}</p>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-semibold text-teal-300">
                    {formatPrice(currentCourse.price)}
                  </span>
                  <span className="text-sm text-white/80">
                    {currentIndex + 1} / {courses.length}
                  </span>
                </div>
              </div>
            </div>
          </Link>
        </CardContent>
      </Card>

      {/* Navigation Arrows */}
      {courses.length > 1 && (
        <>
          <button
            onClick={(e) => {
              e.preventDefault();
              goToPrevious();
            }}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/90 hover:bg-white text-slate-800 rounded-full p-3 shadow-lg transition-all hover:scale-110"
            aria-label="Previous course"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              goToNext();
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/90 hover:bg-white text-slate-800 rounded-full p-3 shadow-lg transition-all hover:scale-110"
            aria-label="Next course"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}

      {/* Dots Indicator */}
      {courses.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {courses.map((_, index) => (
            <button
              key={index}
              onClick={(e) => {
                e.preventDefault();
                goToSlide(index);
              }}
              className={`h-2 rounded-full transition-all ${
                index === currentIndex
                  ? 'w-8 bg-white'
                  : 'w-2 bg-white/50 hover:bg-white/75'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Thumbnail Strip */}
      {courses.length > 1 && (
        <div className="mt-4 flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {courses.map((course, index) => (
            <button
              key={course.id}
              onClick={() => goToSlide(index)}
              className={`flex-shrink-0 relative w-24 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                index === currentIndex
                  ? 'border-teal-500 scale-105 shadow-lg'
                  : 'border-transparent opacity-60 hover:opacity-100 hover:scale-105'
              }`}
            >
              {course.thumbnail ? (
                <Image
                  src={course.thumbnail}
                  alt={course.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="h-full w-full bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center text-white text-xl">
                  📚
                </div>
              )}
              {index === currentIndex && (
                <div className="absolute inset-0 bg-teal-500/20 border-2 border-teal-500 rounded-lg" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

