'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { VideoPlayer } from './VideoPlayer';
import Link from 'next/link';

interface CoursePreviewProps {
  course: any;
  isEnrolled?: boolean;
}

export function CoursePreview({ course, isEnrolled = false }: CoursePreviewProps) {
  const [previewModule, setPreviewModule] = useState(course.modules?.[0]);
  const [previewLesson, setPreviewLesson] = useState(previewModule?.lessons?.[0]);

  if (isEnrolled) {
    return null; // Don't show preview if enrolled
  }

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
                  const module = course.modules?.find((m: any) => m.id === e.target.value);
                  setPreviewModule(module);
                  setPreviewLesson(module?.lessons?.[0]);
                }}
                className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {course.modules?.slice(0, 1).map((m: any) => (
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
                  const lesson = previewModule?.lessons?.find((l: any) => l.id === e.target.value);
                  setPreviewLesson(lesson);
                }}
                className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {previewModule?.lessons?.slice(0, 1).map((l: any) => (
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

            <div className="pt-4 border-t">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                This is a preview. Enroll to access all {course.modules?.reduce((n: number, m: any) => n + (m.lessons?.length || 0), 0) || 0} lessons.
              </p>
              <Button className="w-full" size="lg">
                Enroll Now to Continue
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

