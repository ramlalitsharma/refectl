'use client';

import { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';

interface MuxVideoPlayerProps {
  playbackId: string;
  title?: string;
  autoplay?: boolean;
  controls?: boolean;
  onProgress?: (currentTime: number, duration: number) => void;
  onEnded?: () => void;
  provider?: 'self-hosted' | 'mux'; // Default to self-hosted (free)
  baseUrl?: string;
}

export function MuxVideoPlayer({
  playbackId,
  title,
  autoplay = false,
  controls = true,
  onProgress,
  onEnded,
  provider = 'self-hosted',
  baseUrl,
}: MuxVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !playbackId) return;

    // Use self-hosted HLS URL (free) or Mux URL (if provider is mux)
    const hlsUrl = provider === 'mux'
      ? `https://stream.mux.com/${playbackId}.m3u8`
      : baseUrl
      ? `${baseUrl}/${playbackId}/playlist.m3u8`
      : `/videos/${playbackId}/playlist.m3u8`;

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: false,
      });

      hls.loadSource(hlsUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setIsLoading(false);
        if (autoplay) {
          video.play().catch((e) => console.error('Autoplay failed:', e));
        }
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              hls.recoverMediaError();
              break;
            default:
              hls.destroy();
              setError('Failed to load video');
              break;
          }
        }
      });

      // Progress tracking
      const handleTimeUpdate = () => {
        if (onProgress && video.duration) {
          onProgress(video.currentTime, video.duration);
        }
      };

      video.addEventListener('timeupdate', handleTimeUpdate);
      video.addEventListener('ended', () => {
        if (onEnded) onEnded();
      });

      return () => {
        hls.destroy();
        video.removeEventListener('timeupdate', handleTimeUpdate);
      };
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Native HLS support (Safari)
      video.src = hlsUrl;
      setIsLoading(false);
      if (autoplay) {
        video.play().catch((e) => console.error('Autoplay failed:', e));
      }
    } else {
      setError('HLS is not supported in this browser');
    }
  }, [playbackId, autoplay, onProgress, onEnded]);

  if (error) {
    return (
      <div className="aspect-video bg-gray-900 rounded-lg flex items-center justify-center">
        <div className="text-center text-white">
          <p className="text-lg mb-2">⚠️</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
          <div className="text-center text-white">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p>Loading video...</p>
          </div>
        </div>
      )}
      <video
        ref={videoRef}
        className="w-full h-full"
        controls={controls}
        playsInline
        title={title}
      />
    </div>
  );
}

