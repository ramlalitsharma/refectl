'use client';

import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { VideoPlayer } from './VideoPlayer';
import { WishlistButton } from './WishlistButton';

type EnrollmentStatus = 'pending' | 'approved' | 'waitlisted' | 'rejected' | 'completed';

interface Lesson {
  id: string;
  title: string;
  content?: string;
  videoUrl?: string;
  videoId?: string;
  videoProvider?: string;
}

interface Module {
  id: string;
  title: string;
  lessons?: Lesson[];
}

interface CoursePreviewProps {
  course: {
    _id?: string;
    slug: string;
    title: string;
    summary?: string;
    subject?: string;
    level?: string;
    modules?: Module[];
    price?: { amount?: number; currency?: string };
    id?: string;
  };
  isEnrolled?: boolean;
  isAuthenticated?: boolean;
  initialEnrollmentStatus?: EnrollmentStatus;
}

export function CoursePreview({
  course,
  isEnrolled = false,
  isAuthenticated = false,
  initialEnrollmentStatus,
}: CoursePreviewProps) {
  const [previewModule, setPreviewModule] = useState(course.modules?.[0]);
  const [previewLesson, setPreviewLesson] = useState(previewModule?.lessons?.[0]);
  const [status, setStatus] = useState<EnrollmentStatus | undefined>(initialEnrollmentStatus);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setStatus(initialEnrollmentStatus);
  }, [initialEnrollmentStatus]);

  useEffect(() => {
    if (!previewModule && course.modules?.length) {
      setPreviewModule(course.modules[0]);
    }
  }, [course.modules, previewModule]);

  useEffect(() => {
    if (!previewLesson && previewModule?.lessons?.length) {
      setPreviewLesson(previewModule.lessons[0]);
    }
  }, [previewLesson, previewModule]);

  const totalLessons = useMemo(
    () => course.modules?.reduce((n: number, m: Module) => n + (m.lessons?.length || 0), 0) || 0,
    [course.modules]
  );

  if (isEnrolled) {
    return null;
  }

  const courseId = course._id || course.slug;
  const signInRedirect = `/sign-in?redirect_url=${encodeURIComponent(`/courses/${course.slug}`)}`;

  const handleEnrollment = async () => {
    setError(null);

    if (!courseId) {
      setError('Missing course identifier.');
      return;
    }

    if (!isAuthenticated) {
      window.location.href = signInRedirect;
      return;
    }

    if (status === 'approved' || status === 'completed') {
      window.location.href = `/courses/${course.slug}`;
      return;
    }

    if (status === 'pending' || status === 'waitlisted') {
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Use smart enrollment API that handles free/paid courses
      const res = await fetch('/api/enrollments/enroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId, courseSlug: course.slug }),
      });
      
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Unable to enroll');
      }

      if (data.enrolled) {
        // Free course - enrolled directly
        setStatus('approved');
        // Redirect to course after a moment
        setTimeout(() => {
          window.location.href = `/courses/${course.slug}`;
        }, 1000);
      } else if (data.requiresPayment) {
        // Paid course - redirect to payment
        window.location.href = data.paymentUrl || `/checkout?courseId=${courseId}&amount=${data.amount}`;
      } else {
        setStatus(data.status || 'pending');
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg || 'Failed to enroll. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const buttonLabel = (() => {
    if (!isAuthenticated) return 'Sign in to Enroll';
    switch (status) {
      case 'approved':
        return 'Start Learning';
      case 'completed':
        return 'Review Course';
      case 'pending':
        return 'Awaiting Approval';
      case 'waitlisted':
        return 'Waitlisted';
      case 'rejected':
        return isSubmitting ? 'Submitting...' : 'Request Again';
      default:
        return isSubmitting ? 'Submitting...' : 'Enroll Now to Continue';
    }
  })();

  const buttonDisabled =
    isSubmitting ||
    status === 'pending' ||
    status === 'waitlisted' ||
    (status === 'approved' && isSubmitting) ||
    (status === 'completed' && isSubmitting);

  return (
    <Card className="mb-8 border-2 border-blue-200 dark:border-blue-800">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <span className="text-2xl">👁️</span>
            Course Preview
          </CardTitle>
          <span className="text-sm text-gray-600 dark:text-gray-400 bg-blue-100 dark:bg-blue-900 px-3 py-1 rounded-full">
            Free Preview
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Preview this course with free access to the first lesson. Enroll to access all content.
          </p>
          
          {previewModule && (
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Preview Module</label>
              <select
                value={previewModule.id}
                onChange={(e) => {
                  const mod = course.modules?.find((m) => m.id === e.target.value);
                  setPreviewModule(mod);
                  setPreviewLesson(mod?.lessons?.[0]);
                }}
                className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {course.modules?.slice(0, 1).map((m) => (
                  <option key={m.id} value={m.id}>{m.title}</option>
                ))}
              </select>
            </div>
          )}

          {previewLesson && (
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Preview Lesson</label>
              <select
                value={previewLesson.id}
                onChange={(e) => {
                  const lesson = previewModule?.lessons?.find((l) => l.id === e.target.value);
                  setPreviewLesson(lesson);
                }}
                className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {previewModule?.lessons?.slice(0, 1).map((l) => (
                  <option key={l.id} value={l.id}>{l.title}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {previewLesson && (
          <div className="space-y-4">
            {previewLesson.videoUrl || previewLesson.videoId ? (
              <VideoPlayer
                videoUrl={previewLesson.videoUrl}
                videoId={previewLesson.videoId}
                title={previewLesson.title}
                provider={previewLesson.videoProvider || 'youtube'}
              />
            ) : (
              <div className="aspect-video bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <div className="text-4xl mb-2">📹</div>
                  <p>Video preview not available</p>
                </div>
              </div>
            )}

            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">{previewLesson.title}</h4>
              {previewLesson.content && (
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
                  {previewLesson.content.slice(0, 200)}...
                </p>
              )}
            </div>

            <div className="pt-4 border-t space-y-3">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                This is a preview. Enroll to access all {totalLessons} lessons.
              </p>
              {error && <p className="text-sm text-red-600">{error}</p>}
              {course.price?.amount > 0 && (
                <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 mb-3">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-700 font-medium">Course Price</span>
                    <span className="text-xl font-bold text-teal-600">
                      {course.price.currency === 'USD' ? '$' : course.price.currency}{course.price.amount}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Payment required to enroll</p>
                </div>
              )}
              {!course.price?.amount && (
                <div className="rounded-lg bg-green-50 border border-green-200 p-3 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-green-700 font-medium">✓ Free Course</span>
                    <span className="text-xs text-green-600">Enroll instantly</span>
                  </div>
                </div>
              )}
              <div className="space-y-2">
                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleEnrollment}
                  disabled={buttonDisabled}
                  variant={status === 'approved' ? 'default' : undefined}
                >
                  {buttonLabel}
                </Button>
                {isAuthenticated && course.id && (
                  <WishlistButton courseId={course.id} className="w-full" />
                )}
              </div>
              {!isAuthenticated && (
                <p className="text-xs text-gray-500">
                  You&apos;ll need to sign in to request enrollment.
                </p>
              )}
              {status === 'pending' && (
                <p className="text-xs text-blue-600">
                  Your enrollment request has been received. We&apos;ll notify you when it&apos;s approved.
                </p>
              )}
              {status === 'waitlisted' && (
                <p className="text-xs text-amber-600">
                  You are currently waitlisted. We&apos;ll notify you if a seat opens up.
                </p>
              )}
              {status === 'rejected' && (
                <p className="text-xs text-red-600">
                  Your previous request was declined. You can submit another request if something has changed.
                </p>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

