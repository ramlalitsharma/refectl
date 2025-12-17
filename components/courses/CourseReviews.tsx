'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface Review {
  _id?: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

interface CourseReviewsProps {
  courseSlug: string;
  initialReviews: {
    reviews: Review[];
    stats: {
      average: string;
      total: number;
      byRating?: Record<number, number>;
    };
  };
}

export function CourseReviews({ courseSlug, initialReviews }: CourseReviewsProps) {
  const [reviews, setReviews] = useState(initialReviews.reviews);
  const [stats, setStats] = useState(initialReviews.stats);
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refreshReviews = async () => {
    const refreshRes = await fetch(`/api/courses/${courseSlug}/reviews`);
    if (refreshRes.ok) {
      const refreshed = await refreshRes.json();
      setReviews(refreshed.reviews);
      setStats(refreshed.stats);
    }
  };

  const submitReview = async () => {
    if (!rating) return;
    setSubmitting(true);
    setFeedback(null);
    setError(null);
    try {
      const res = await fetch(`/api/courses/${courseSlug}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, comment }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit review');
      }
      await refreshReviews();
      setShowForm(false);
      setComment('');
      setRating(5);
      setFeedback(data.message || 'Review submitted for moderation.');
    } catch (e) {
      console.error('Review submit error:', e);
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg || 'Unable to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Student Reviews</CardTitle>
            {stats.average && (
              <div className="flex items-center gap-2 mt-2">
                <span className="text-3xl font-bold">{stats.average}</span>
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <span key={i} className={i <= Math.round(parseFloat(stats.average)) ? 'text-yellow-400' : 'text-gray-300'}>
                      ⭐
                    </span>
                  ))}
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-400">({stats.total} reviews)</span>
              </div>
            )}
          </div>
          <Button onClick={() => setShowForm(!showForm)} size="sm">
            {showForm ? 'Cancel' : 'Write Review'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {feedback && (
          <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
            {feedback}
          </div>
        )}
        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}
        {showForm && (
          <div className="mb-6 p-4 border rounded-lg space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Rating</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setRating(i)}
                    className={`text-3xl ${i <= rating ? 'text-yellow-400' : 'text-gray-300'} hover:scale-110 transition-transform`}
                  >
                    ⭐
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Your Review</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your experience with this course..."
                className="w-full border rounded-lg px-3 py-2 min-h-[100px] focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <Button onClick={submitReview} disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit Review'}
            </Button>
          </div>
        )}

        <div className="space-y-4">
          {reviews.length === 0 ? (
            <p className="text-gray-600 dark:text-gray-400 text-center py-8">No reviews yet. Be the first to review!</p>
          ) : (
            reviews.map((review: Review) => (
              <div key={review._id} className="border-b pb-4 last:border-0">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="font-medium">{review.userName}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <span key={i} className={i <= review.rating ? 'text-yellow-400' : 'text-gray-300'}>
                            ⭐
                          </span>
                        ))}
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                {review.comment && (
                  <p className="text-gray-700 dark:text-gray-300 mt-2">{review.comment}</p>
                )}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}

