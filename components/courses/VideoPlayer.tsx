'use client';

 
import { MuxVideoPlayer } from '@/components/video/MuxVideoPlayer';

interface VideoPlayerProps {
  videoUrl?: string;
  videoId?: string;
  title?: string;
  provider?: 'youtube' | 'vimeo' | 'direct' | 'self-hosted' | 'hls';
  playbackId?: string; // For self-hosted HLS videos
}

export function VideoPlayer({ videoUrl, videoId, title, provider = 'youtube', playbackId }: VideoPlayerProps) {

  if (!videoUrl && !videoId) {
    return (
      <div className="aspect-video bg-gray-900 rounded-lg flex items-center justify-center">
        <div className="text-center text-gray-400">
          <div className="text-4xl mb-2">📹</div>
          <p>No video available</p>
        </div>
      </div>
    );
  }

  if (provider === 'youtube' && videoId) {
    return (
      <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden">
        <iframe
          src={`https://www.youtube.com/embed/${videoId}?rel=0`}
          title={title}
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          onError={() => {}}
        />
      </div>
    );
  }

  if (provider === 'vimeo' && videoId) {
    return (
      <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden">
        <iframe
          src={`https://player.vimeo.com/video/${videoId}`}
          title={title}
          className="w-full h-full"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          onError={() => {}}
        />
      </div>
    );
  }

  // Self-hosted HLS video
  if (provider === 'self-hosted' || provider === 'hls') {
    return (
      <MuxVideoPlayer
        playbackId={playbackId || videoId || ''}
        title={title}
        provider="self-hosted"
        baseUrl={process.env.NEXT_PUBLIC_VIDEO_BASE_URL}
      />
    );
  }

  if (videoUrl) {
    return (
      <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden">
        <video
          src={videoUrl}
          controls
          className="w-full h-full"
          onError={() => {}}
        >
          Your browser does not support the video tag.
        </video>
      </div>
    );
  }

  return null;
}
