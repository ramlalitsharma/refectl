import { ObjectId } from 'mongodb';

export interface DiscussionPost {
  _id?: ObjectId;
  id?: string;
  courseId?: string;
  lessonId?: string;
  subjectId?: string;
  title: string;
  content: string;
  authorId: string;
  authorName?: string;
  authorAvatar?: string;
  tags?: string[];
  isPinned?: boolean;
  isLocked?: boolean;
  views: number;
  upvotes: number;
  downvotes: number;
  replies: DiscussionReply[];
  replyCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface DiscussionReply {
  _id?: ObjectId;
  id?: string;
  postId: string;
  content: string;
  authorId: string;
  authorName?: string;
  authorAvatar?: string;
  parentReplyId?: string; // For nested replies
  upvotes: number;
  downvotes: number;
  isAccepted?: boolean; // For marking as best answer
  createdAt: Date;
  updatedAt: Date;
}

export function serializeDiscussionPost(post: DiscussionPost & { _id?: any }): DiscussionPost {
  return {
    id: post._id ? String(post._id) : post.id,
    courseId: post.courseId,
    lessonId: post.lessonId,
    subjectId: post.subjectId,
    title: post.title,
    content: post.content,
    authorId: post.authorId,
    authorName: post.authorName,
    authorAvatar: post.authorAvatar,
    tags: post.tags || [],
    isPinned: post.isPinned || false,
    isLocked: post.isLocked || false,
    views: post.views || 0,
    upvotes: post.upvotes || 0,
    downvotes: post.downvotes || 0,
    replies: (post.replies || []).map(serializeDiscussionReply),
    replyCount: post.replyCount || post.replies?.length || 0,
    createdAt: post.createdAt instanceof Date ? post.createdAt : new Date(post.createdAt),
    updatedAt: post.updatedAt instanceof Date ? post.updatedAt : new Date(post.updatedAt),
  };
}

export function serializeDiscussionReply(reply: DiscussionReply & { _id?: any }): DiscussionReply {
  return {
    id: reply._id ? String(reply._id) : reply.id,
    postId: reply.postId,
    content: reply.content,
    authorId: reply.authorId,
    authorName: reply.authorName,
    authorAvatar: reply.authorAvatar,
    parentReplyId: reply.parentReplyId,
    upvotes: reply.upvotes || 0,
    downvotes: reply.downvotes || 0,
    isAccepted: reply.isAccepted || false,
    createdAt: reply.createdAt instanceof Date ? reply.createdAt : new Date(reply.createdAt),
    updatedAt: reply.updatedAt instanceof Date ? reply.updatedAt : new Date(reply.updatedAt),
  };
}

