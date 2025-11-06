import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import React from 'react';

export const dynamic = 'force-dynamic';

export default async function AdminStudioPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-semibold">Admin Studio</h1>
          <div className="text-sm text-gray-600">Create courses and blogs (AI or manual)</div>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8 grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Create Course</CardTitle>
          </CardHeader>
          <CardContent>
            <CourseForm />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Create Blog</CardTitle>
          </CardHeader>
          <CardContent>
            <BlogForm />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
}
function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className="w-full border rounded-lg px-3 py-2 text-sm h-32 focus:outline-none focus:ring-2 focus:ring-blue-500" />
}

function CourseForm() {
  async function onSubmit(formData: FormData) {
    'use server';
    const mode = String(formData.get('mode') || 'ai') as 'ai'|'manual';
    const title = String(formData.get('title') || '');
    const subject = String(formData.get('subject') || '') || undefined;
    const level = String(formData.get('level') || '') as any || undefined;
    const outlineRaw = String(formData.get('outline') || '');
    const outline = outlineRaw ? JSON.parse(outlineRaw) : undefined;
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || ''}/api/admin/courses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode, title, subject, level, outline })
    });
    if (!res.ok) throw new Error('Failed to create course');
  }
  return (
    <form action={onSubmit} className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <label className="text-sm">Mode
          <select name="mode" className="w-full border rounded-lg px-3 py-2 text-sm">
            <option value="ai">AI</option>
            <option value="manual">Manual</option>
          </select>
        </label>
        <label className="text-sm">Level
          <select name="level" className="w-full border rounded-lg px-3 py-2 text-sm">
            <option value="">Auto</option>
            <option value="basic">Basic</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </label>
      </div>
      <Input name="title" placeholder="Course title" required />
      <Input name="subject" placeholder="Subject (optional)" />
      <Textarea name="outline" placeholder='Manual: {"modules":[{"title":"","lessons":[{"title":""}]}]}' />
      <Button type="submit">Create Course</Button>
    </form>
  );
}

function BlogForm() {
  async function onSubmit(formData: FormData) {
    'use server';
    const mode = String(formData.get('mode') || 'ai') as 'ai'|'manual';
    const title = String(formData.get('title') || '');
    const topic = String(formData.get('topic') || '');
    const markdown = String(formData.get('markdown') || '');
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || ''}/api/admin/blogs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode, title, topic, markdown })
    });
    if (!res.ok) throw new Error('Failed to create blog');
  }
  return (
    <form action={onSubmit} className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <label className="text-sm">Mode
          <select name="mode" className="w-full border rounded-lg px-3 py-2 text-sm">
            <option value="ai">AI</option>
            <option value="manual">Manual</option>
          </select>
        </label>
        <Input name="title" placeholder="Title (AI uses this if topic empty)" />
      </div>
      <Input name="topic" placeholder="AI Topic (optional)" />
      <Textarea name="markdown" placeholder="# Manual blog in Markdown" />
      <Button type="submit">Create Blog</Button>
    </form>
  );
}


