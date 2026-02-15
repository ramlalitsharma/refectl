'use client';

import React, { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { MessageSquare, Loader2, Info } from 'lucide-react';
import { CommentItem } from '@/components/blog/CommentItem';
import { CommentForm } from '@/components/blog/CommentForm';

export function CommentsGate({ slug }: { slug: string }) {
  const { user, isLoaded } = useUser();
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchComments = React.useCallback(async () => {
    try {
      const res = await fetch(`/api/public/news/${slug}/comments`);
      const data = await res.json();
      setComments(data.comments || []);
    } catch {
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handlePostComment = async (content: string, parentId: string | null = null) => {
    if (!user) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/public/news/${slug}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, parentId }),
      });
      if (res.ok) {
        await fetchComments();
      } else {
        const errorData = await res.json();
        alert(errorData.error || 'Failed to post comment. Please try again.');
      }
    } catch {
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      const res = await fetch(`/api/public/news/${slug}/comments?commentId=${commentId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setComments(prev => removeCommentRecursive(prev, commentId));
      }
    } catch {
    }
  };

  const removeCommentRecursive = (list: any[], id: string): any[] => {
    return list
      .filter(c => c._id !== id)
      .map(c => ({
        ...c,
        replies: c.replies ? removeCommentRecursive(c.replies, id) : [],
      }));
  };

  const totalComments = (list: any[]): number => {
    return list.reduce((acc, c) => acc + 1 + (c.replies ? totalComments(c.replies) : 0), 0);
  };

  return (
    <section className="mt-16 max-w-4xl mx-auto px-1 pb-20 border-t border-slate-200 pt-12">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-100 text-blue-700">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900 tracking-tight">Comments</h3>
            <p className="text-[12px] text-slate-500 font-medium">{totalComments(comments)} contributions</p>
          </div>
        </div>
        {!user && isLoaded && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-lg text-[10px] text-amber-700 uppercase tracking-widest font-bold">
            <Info className="w-3 h-3" /> Login to reply
          </div>
        )}
      </div>

      {user ? (
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
          <CommentForm onSubmit={(content) => handlePostComment(content)} isSubmitting={isSubmitting} />
        </div>
      ) : (
        <div className="p-8 rounded-2xl bg-slate-50 border border-dashed border-slate-300 text-center space-y-3">
          <p className="text-sm text-slate-600 font-medium leading-relaxed">Join the discussion and share your perspective.</p>
          <button
            onClick={() => (window.location.href = `/sign-in?redirect_url=${window.location.pathname}`)}
            className="px-6 py-2 bg-indigo-50 border border-indigo-200 text-indigo-700 text-sm font-bold rounded-full hover:bg-indigo-100 transition-all"
          >
            Sign In to Comment
          </button>
        </div>
      )}

      <div className="mt-8">
        <div className="space-y-1">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 opacity-70">
              <Loader2 className="w-6 h-6 animate-spin text-indigo-600 mb-3" />
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em]">Retrieving feed...</p>
            </div>
          ) : comments.length === 0 ? (
            <div className="py-16 text-center opacity-60">
              <div className="text-3xl mb-3">💬</div>
              <p className="text-slate-600 text-sm font-medium">Be the first to share your thoughts.</p>
            </div>
          ) : (
            comments.map((comment) => (
              <CommentItem
                key={comment._id}
                comment={comment}
                onReply={handlePostComment}
                onDelete={handleDeleteComment}
                currentUserId={user?.id || null}
              />
            ))
          )}
        </div>
      </div>
    </section>
  );
}
