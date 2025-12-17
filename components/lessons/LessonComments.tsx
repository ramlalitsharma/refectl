'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useUser } from '@clerk/nextjs';

interface Comment {
  id: string;
  content: string;
  userName: string;
  userEmail: string;
  createdAt: string;
  type: 'comment' | 'qa';
  isResolved?: boolean;
  replies?: Comment[];
}

interface LessonCommentsProps {
  lessonId: string;
  type?: 'comment' | 'qa';
}

export function LessonComments({ lessonId, type = 'comment' }: LessonCommentsProps) {
  const { isSignedIn } = useUser();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (lessonId) {
      loadComments();
    }
  }, [lessonId, type]);

  const loadComments = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/lessons/${lessonId}/comments?type=${type}`);
      if (res.ok) {
        const data = await res.json();
        setComments(data.comments || []);
      }
    } catch (error) {
      console.error('Failed to load comments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !isSignedIn) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/lessons/${lessonId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: newComment,
          type,
          isQuestion: type === 'qa',
        }),
      });

      if (res.ok) {
        setNewComment('');
        loadComments();
      }
    } catch (error) {
      console.error('Failed to submit comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading comments...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{type === 'qa' ? 'Questions & Answers' : 'Comments'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isSignedIn && (
            <form onSubmit={handleSubmit} className="space-y-2">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder={type === 'qa' ? 'Ask a question...' : 'Add a comment...'}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                rows={3}
              />
              <Button type="submit" disabled={isSubmitting || !newComment.trim()}>
                {isSubmitting ? 'Posting...' : 'Post'}
              </Button>
            </form>
          )}

          <div className="space-y-4">
            {comments.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-4">
                No {type === 'qa' ? 'questions' : 'comments'} yet. Be the first to {type === 'qa' ? 'ask' : 'comment'}!
              </p>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="border-b border-slate-200 pb-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">{comment.userName}</span>
                        <span className="text-xs text-slate-500">
                          {new Date(comment.createdAt).toLocaleDateString()}
                        </span>
                        {comment.isResolved && type === 'qa' && (
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">
                            Resolved
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-700">{comment.content}</p>
                    </div>
                  </div>
                  {comment.replies && comment.replies.length > 0 && (
                    <div className="ml-8 mt-2 space-y-2">
                      {comment.replies.map((reply) => (
                        <div key={reply.id} className="border-l-2 border-slate-200 pl-3">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-xs">{reply.userName}</span>
                            <span className="text-xs text-slate-500">
                              {new Date(reply.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600">{reply.content}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

