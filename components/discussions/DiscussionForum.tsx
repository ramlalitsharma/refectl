'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { MarkdownEditor } from '@/components/editor/MarkdownEditor';
import Link from 'next/link';

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
  replyCount: number;
  createdAt: string;
  courseId?: string;
  lessonId?: string;
}

interface DiscussionForumProps {
  courseId?: string;
  lessonId?: string;
  subjectId?: string;
  initialPosts?: DiscussionPost[];
}

export function DiscussionForum({ courseId, lessonId, subjectId, initialPosts = [] }: DiscussionForumProps) {
  const [posts, setPosts] = useState<DiscussionPost[]>(initialPosts);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newPost, setNewPost] = useState({ title: '', content: '', tags: '' });

  const loadPosts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (courseId) params.append('courseId', courseId);
      if (lessonId) params.append('lessonId', lessonId);
      if (subjectId) params.append('subjectId', subjectId);

      const res = await fetch(`/api/discussions?${params.toString()}`);
      const data = await res.json();
      if (res.ok) {
        setPosts(data.posts || []);
      }
    } catch (error) {
      console.error('Failed to load posts:', error);
    } finally {
      setLoading(false);
    }
  }, [courseId, lessonId, subjectId]);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  const handleCreatePost = async () => {
    if (!newPost.title.trim() || !newPost.content.trim()) {
      alert('Title and content are required');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/discussions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newPost.title,
          content: newPost.content,
          courseId,
          lessonId,
          subjectId,
          tags: newPost.tags.split(',').map((t) => t.trim()).filter(Boolean),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create post');
      }

      setPosts([data.post, ...posts]);
      setShowCreateForm(false);
      setNewPost({ title: '', content: '', tags: '' });
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      alert(msg || 'Failed to create discussion post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Discussions</h2>
          <p className="text-sm text-slate-600 mt-1">Ask questions and share knowledge</p>
        </div>
        <Button onClick={() => setShowCreateForm(!showCreateForm)} variant="inverse">
          {showCreateForm ? 'Cancel' : '+ New Post'}
        </Button>
      </div>

      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Discussion</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Title *
              </label>
              <input
                type="text"
                value={newPost.title}
                onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                placeholder="What's your question or topic?"
                className="w-full rounded-lg border border-slate-300 px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Content *
              </label>
              <MarkdownEditor
                value={newPost.content}
                onChange={(value) => setNewPost({ ...newPost, content: value })}
                placeholder="Describe your question or topic in detail..."
                height={200}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Tags (comma-separated)
              </label>
              <input
                type="text"
                value={newPost.tags}
                onChange={(e) => setNewPost({ ...newPost, tags: e.target.value })}
                placeholder="help, question, discussion"
                className="w-full rounded-lg border border-slate-300 px-3 py-2"
              />
            </div>
            <Button onClick={handleCreatePost} disabled={loading} variant="inverse" className="w-full">
              {loading ? 'Posting...' : 'Post Discussion'}
            </Button>
          </CardContent>
        </Card>
      )}

      {loading && posts.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
            <p className="mt-4 text-slate-600">Loading discussions...</p>
          </CardContent>
        </Card>
      ) : posts.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-slate-600">No discussions yet. Be the first to start a conversation!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <Card key={post.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {post.isPinned && (
                        <Badge variant="warning" className="text-xs">📌 Pinned</Badge>
                      )}
                      <Link href={`/discussions/${post.id}`}>
                        <CardTitle className="text-lg hover:text-teal-600 transition-colors cursor-pointer">
                          {post.title}
                        </CardTitle>
                      </Link>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span>{post.authorName || 'Anonymous'}</span>
                      <span>•</span>
                      <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                      <span>•</span>
                      <span>{post.views} views</span>
                      <span>•</span>
                      <span>{post.replyCount} {post.replyCount === 1 ? 'reply' : 'replies'}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-600">👍 {post.upvotes}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-700 line-clamp-3 mb-3">{post.content}</p>
                {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((tag, idx) => (
                      <Badge key={idx} variant="info" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
                <Link href={`/discussions/${post.id}`}>
                  <Button variant="ghost" size="sm" className="mt-3">
                    View Discussion →
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

