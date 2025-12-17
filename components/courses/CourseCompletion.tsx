'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

interface CourseCompletionProps {
  courseSlug: string;
  courseTitle: string;
}

export function CourseCompletion({ courseSlug, courseTitle }: CourseCompletionProps) {
  const [completing, setCompleting] = useState(false);
  const [certificateId, setCertificateId] = useState<string | null>(null);

  const handleComplete = async () => {
    setCompleting(true);
    try {
      const res = await fetch(`/api/courses/${courseSlug}/complete`, {
        method: 'POST',
      });
      const data = await res.json();
      if (data.success && data.certificateId) {
        setCertificateId(data.certificateId);
      } else {
        alert('Failed to complete course');
      }
    } catch (e) {
      console.error('Completion error:', e);
      alert('Failed to complete course');
    } finally {
      setCompleting(false);
    }
  };

  if (certificateId) {
    return (
      <Card className="border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-400">
            <span className="text-3xl">🎉</span>
            Course Completed!
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Congratulations! You&apos;ve successfully completed <strong>{courseTitle}</strong>.
          </p>
          <div className="flex gap-3">
            <Link href={`/certificates/${certificateId}`}>
              <Button className="bg-green-600 hover:bg-green-700">
                View Certificate
              </Button>
            </Link>
            <Link href={`/certificates/pdf/${certificateId}`}>
              <Button variant="outline">
                Download PDF
              </Button>
            </Link>
            <Link href="/my-learning">
              <Button variant="outline">
                My Learning
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Complete Course</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Have you completed all lessons and quizzes? Mark this course as complete to earn your certificate.
        </p>
        <Button onClick={handleComplete} disabled={completing} size="lg" className="w-full">
          {completing ? 'Completing...' : 'Mark as Complete & Get Certificate'}
        </Button>
      </CardContent>
    </Card>
  );
}

