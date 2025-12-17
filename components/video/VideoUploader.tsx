'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Progress } from '@/components/ui/Progress';

interface VideoUploaderProps {
  onUploadComplete?: (uploadId: string, assetId?: string) => void;
  onError?: (error: string) => void;
  maxSizeMB?: number;
  acceptedFormats?: string[];
}

export function VideoUploader({
  onUploadComplete,
  onError,
  maxSizeMB = 500,
  acceptedFormats = ['video/mp4', 'video/webm', 'video/quicktime'],
}: VideoUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadId, setUploadId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!acceptedFormats.includes(file.type)) {
      onError?.(`Invalid file type. Accepted formats: ${acceptedFormats.join(', ')}`);
      return;
    }

    // Validate file size
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxSizeMB) {
      onError?.(`File size exceeds ${maxSizeMB}MB limit`);
      return;
    }

    await uploadVideo(file);
  };

  const uploadVideo = async (file: File) => {
    try {
      setUploading(true);
      setProgress(0);

      // Step 1: Create video record (for free self-hosted solution)
      // For free solution, upload file to your server and convert to HLS
      const videoId = `video_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      
      const uploadRes = await fetch('/api/video/upload-free', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: file.name,
          videoId,
          provider: 'self-hosted',
        }),
      });

      if (!uploadRes.ok) {
        throw new Error('Failed to create video record');
      }

      const { video } = await uploadRes.json();
      setUploadId(video.videoId);

      // Step 2: For free solution, you would upload to your server
      // This is a placeholder - actual upload should be to your server/CDN
      // Then convert to HLS format using ffmpeg
      const formData = new FormData();
      formData.append('video', file);
      formData.append('videoId', videoId);

      const xhr = new XMLHttpRequest();

      return new Promise<void>((resolve, reject) => {
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const percentComplete = (e.loaded / e.total) * 100;
            setProgress(percentComplete);
          }
        });

        xhr.addEventListener('load', () => {
          if (xhr.status === 200 || xhr.status === 201) {
            setUploading(false);
            setProgress(100);
            onUploadComplete?.(videoId);
            resolve();
          } else {
            const error = `Upload failed: ${xhr.statusText}`;
            setUploading(false);
            onError?.(error);
            reject(new Error(error));
          }
        });

        xhr.addEventListener('error', () => {
          const error = 'Upload failed. Please upload video to your server and convert to HLS format.';
          setUploading(false);
          onError?.(error);
          reject(new Error(error));
        });

        // Upload to your server endpoint
        xhr.open('POST', '/api/video/upload-file');
        xhr.send(formData);
      });
    } catch (error: any) {
      setUploading(false);
      onError?.(error.message || 'Upload failed');
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-2">Upload Video (Free Self-Hosted)</h3>
            <p className="text-sm text-slate-600">
              Upload a video file (max {maxSizeMB}MB). Supported formats: MP4, WebM, MOV
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Note: Videos will be self-hosted. Convert to HLS format using ffmpeg for best playback.
            </p>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept={acceptedFormats.join(',')}
            onChange={handleFileSelect}
            className="hidden"
            disabled={uploading}
          />

          {uploading ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Uploading...</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} />
              {uploadId && (
                <p className="text-xs text-slate-500">Upload ID: {uploadId}</p>
              )}
            </div>
          ) : (
            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="inverse"
              className="w-full"
            >
              Select Video File
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

