'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { MarkdownEditor } from '@/components/editor/MarkdownEditor';

interface DiscussionReply {
  id: string;
  content: string;
  authorId: string;
  authorName?: string;
  authorAvatar?: string;
  upvotes: number;
  downvotes: number;
  isAccepted?: boolean;
  createdAt: string;
}

interface DiscussionPost {
  id: string;
  title: string;
  content: string;
  authorId: string;
  authorName?: string;
  authorAvatar?: string;
  tags?: string[];
  isPinned?: boolean;
  views: number;
  upvotes: number;
  downvotes: number;
  replies: DiscussionReply[];
  replyCount: number;
  createdAt: string;
}

interface DiscussionDetailProps {
  post: DiscussionPost;
  currentUserId?: string;
}

export function DiscussionDetail({ post: initialPost, currentUserId }: DiscussionDetailProps) {
  const [post, setPost] = useState(initialPost);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [loading, setLoading] = useState(false);

  const handleReply = async () => {
    if (!replyContent.trim()) {
      alert('Reply content is required');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/discussions/${post.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: replyContent }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to post reply');
      }

      // Reload post to get updated replies
      const postRes = await fetch(`/api/discussions/${post.id}`);
      const postData = await postRes.json();
      if (postRes.ok) {
        setPost(postData.post);
      }

      setReplyContent('');
      setShowReplyForm(false);
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      alert(msg || 'Failed to post reply');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                {post.isPinned && (
                  <Badge variant="warning" className="text-xs">📌 Pinned</Badge>
                )}
                <CardTitle className="text-2xl">{post.title}</CardTitle>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-500">
                <span>{post.authorName || 'Anonymous'}</span>
                <span>•</span>
                <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                <span>•</span>
                <span>{post.views} views</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm">👍 {post.upvotes}</Button>
              <Button variant="ghost" size="sm">👎 {post.downvotes}</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="prose max-w-none mb-4">
            <div className="whitespace-pre-wrap text-slate-700">{post.content}</div>
          </div>
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag, idx) => (
                <Badge key={idx} variant="info" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">
          {post.replyCount} {post.replyCount === 1 ? 'Reply' : 'Replies'}
        </h3>
        {currentUserId && (
          <Button onClick={() => setShowReplyForm(!showReplyForm)} variant="inverse">
            {showReplyForm ? 'Cancel' : '+ Add Reply'}
          </Button>
        )}
      </div>

      {showReplyForm && (
        <Card>
          <CardHeader>
            <CardTitle>Post a Reply</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <MarkdownEditor
              value={replyContent}
              onChange={setReplyContent}
              placeholder="Write your reply..."
              height={200}
            />
            <Button onClick={handleReply} disabled={loading} variant="inverse" className="w-full">
              {loading ? 'Posting...' : 'Post Reply'}
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {post.replies.map((reply) => (
          <Card key={reply.id} className={reply.isAccepted ? 'border-2 border-emerald-500' : ''}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  {reply.isAccepted && (
                    <Badge variant="success" className="text-xs">✓ Accepted Answer</Badge>
                  )}
                  <span className="font-medium text-sm">{reply.authorName || 'Anonymous'}</span>
                  <span className="text-xs text-slate-500">
                    {new Date(reply.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm">👍 {reply.upvotes}</Button>
                  <Button variant="ghost" size="sm">👎 {reply.downvotes}</Button>
                </div>
              </div>
              <div className="prose max-w-none">
                <div className="whitespace-pre-wrap text-slate-700">{reply.content}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {post.replies.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-slate-600">No replies yet. Be the first to respond!</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

