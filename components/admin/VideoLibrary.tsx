'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { VideoUploader } from '@/components/video/VideoUploader';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import Link from 'next/link';
import Image from 'next/image';

interface Video {
  id: string;
  title: string;
  description?: string;
  videoId: string;
  provider: string;
  status: string;
  fileSize?: number;
  duration?: number;
  thumbnailUrl?: string;
  createdAt: string;
  linkedCourses?: string[];
}

export function VideoLibrary() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [showUpload, setShowUpload] = useState(false);

  useEffect(() => {
    loadVideos();
  }, []);

  const loadVideos = async () => {
    try {
      const res = await fetch('/api/video/upload-free');
      const data = await res.json();
      if (res.ok) {
        setVideos(data.videos || []);
      }
    } catch (error) {
      console.error('Failed to load videos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadComplete = () => {
    setShowUpload(false);
    loadVideos();
  };

  const handleLinkToCourse = async (videoId: string) => {
    // Open course selection modal or redirect to course studio
    const courseId = prompt('Enter Course ID to link this video:');
    if (!courseId) return;

    try {
      const res = await fetch('/api/video/link-course', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoId, courseId }),
      });

      if (res.ok) {
        alert('Video linked to course successfully!');
        loadVideos();
      } else {
        const data = await res.json();
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      alert(`Failed to link video: ${msg}`);
    }
  };

  const handleDelete = async (videoId: string) => {
    if (!confirm('Are you sure you want to delete this video?')) return;

    try {
      const res = await fetch(`/api/video/${videoId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        loadVideos();
      }
    } catch (error) {
      console.error('Failed to delete video:', error);
    }
  };

  const filteredVideos = videos.filter((video) =>
    video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    video.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return <div className="text-center py-12">Loading videos...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <div className="flex-1 max-w-md">
          <Input
            type="text"
            placeholder="Search videos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="inverse" onClick={() => setShowUpload(!showUpload)}>
          {showUpload ? 'Cancel Upload' : '+ Upload Video'}
        </Button>
      </div>

      {/* Upload Section */}
      {showUpload && (
        <Card>
          <CardHeader>
            <CardTitle>Upload New Video</CardTitle>
          </CardHeader>
          <CardContent>
            <VideoUploader
              onUploadComplete={handleUploadComplete}
              onError={(error) => alert(`Upload error: ${error}`)}
            />
          </CardContent>
        </Card>
      )}

      {/* Video Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVideos.length === 0 ? (
          <div className="col-span-full text-center py-12 text-slate-500">
            {searchQuery ? 'No videos found' : 'No videos uploaded yet. Upload your first video!'}
          </div>
        ) : (
          filteredVideos.map((video) => (
            <Card key={video.id} className="overflow-hidden">
              <div className="aspect-video bg-slate-200 relative">
                {video.thumbnailUrl ? (
                  <Image
                    src={video.thumbnailUrl}
                    alt={video.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400">
                    <span className="text-4xl">📹</span>
                  </div>
                )}
                <Badge
                  className="absolute top-2 right-2"
                  variant={video.status === 'ready' ? 'success' : 'warning'}
                >
                  {video.status}
                </Badge>
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold text-slate-900 mb-1 truncate">{video.title}</h3>
                {video.description && (
                  <p className="text-sm text-slate-600 mb-2 line-clamp-2">{video.description}</p>
                )}
                <div className="flex items-center justify-between text-xs text-slate-500 mb-3">
                  <span>{video.fileSize ? `${(video.fileSize / 1024 / 1024).toFixed(1)} MB` : 'N/A'}</span>
                  <span>{new Date(video.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleLinkToCourse(video.videoId)}
                  >
                    Link to Course
                  </Button>
                  <Link href={`/admin/studio/courses?linkVideo=${video.videoId}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">
                      Use in Course
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(video.videoId)}
                  >
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

