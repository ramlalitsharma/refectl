'use client';

import { useState, useEffect, useRef } from 'react';
import Hls from 'hls.js';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';

interface EnhancedVideoPlayerProps {
  playbackId: string;
  title?: string;
  autoplay?: boolean;
  onProgress?: (currentTime: number, duration: number) => void;
  onEnded?: () => void;
  onWatchTime?: (watchTime: number) => void;
  subtitles?: Array<{ language: string; url: string; label: string }>;
  allowNotes?: boolean;
}

export function EnhancedVideoPlayer({
  playbackId,
  title,
  autoplay = false,
  onProgress,
  onEnded,
  onWatchTime,
  subtitles = [],
  allowNotes = true,
}: EnhancedVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showControls, setShowControls] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [selectedSubtitle, setSelectedSubtitle] = useState<string | null>(null);
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [watchTime, setWatchTime] = useState(0);
  const lastWatchTimeUpdate = useRef(0);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !playbackId) return;

    // Use self-hosted HLS URL (free)
    const baseUrl = process.env.NEXT_PUBLIC_VIDEO_BASE_URL || '/videos';
    const hlsUrl = `${baseUrl}/${playbackId}/playlist.m3u8`;

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
        const current = video.currentTime;
        const dur = video.duration;
        setCurrentTime(current);
        setDuration(dur);

        if (onProgress) {
          onProgress(current, dur);
        }

        // Track watch time (update every 5 seconds)
        if (current - lastWatchTimeUpdate.current >= 5) {
          setWatchTime((prev) => {
            const newWatchTime = prev + (current - lastWatchTimeUpdate.current);
            lastWatchTimeUpdate.current = current;
            if (onWatchTime) {
              onWatchTime(newWatchTime);
            }
            return newWatchTime;
          });
        }
      };

      video.addEventListener('timeupdate', handleTimeUpdate);
      video.addEventListener('loadedmetadata', () => {
        setDuration(video.duration);
      });
      video.addEventListener('ended', () => {
        if (onEnded) onEnded();
      });

      return () => {
        hls.destroy();
        video.removeEventListener('timeupdate', handleTimeUpdate);
      };
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = hlsUrl;
      setIsLoading(false);
      if (autoplay) {
        video.play().catch((e) => console.error('Autoplay failed:', e));
      }
    } else {
      setError('HLS is not supported in this browser');
    }
  }, [playbackId, autoplay, onProgress, onEnded, onWatchTime]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  useEffect(() => {
    if (videoRef.current && selectedSubtitle) {
      const subtitle = subtitles.find((s) => s.language === selectedSubtitle);
      if (subtitle) {
        // Add subtitle track
        const track = document.createElement('track');
        track.kind = 'subtitles';
        track.src = subtitle.url;
        track.srclang = subtitle.language;
        track.label = subtitle.label;
        track.default = true;
        videoRef.current.appendChild(track);
      }
    }
  }, [selectedSubtitle, subtitles]);

  const handleSaveNote = async () => {
    if (!noteText.trim() || !videoRef.current) return;

    try {
      await fetch('/api/video/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playbackId,
          timestamp: videoRef.current.currentTime,
          note: noteText.trim(),
        }),
      });

      setNoteText('');
      setShowNoteForm(false);
    } catch (error) {
      console.error('Failed to save note:', error);
    }
  };

  const speedOptions = [0.5, 0.75, 1, 1.25, 1.5, 2];

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
    <div className="relative aspect-video bg-black rounded-lg overflow-hidden group">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900 z-10">
          <div className="text-center text-white">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p>Loading video...</p>
          </div>
        </div>
      )}

      <video
        ref={videoRef}
        className="w-full h-full"
        controls
        playsInline
        title={title}
      />

      {/* Custom Controls Overlay */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="flex items-center gap-4 text-white">
          {/* Speed Control */}
          <div className="flex items-center gap-2">
            <span className="text-sm">Speed:</span>
            <select
              value={playbackRate}
              onChange={(e) => setPlaybackRate(parseFloat(e.target.value))}
              className="bg-black/50 text-white rounded px-2 py-1 text-sm"
            >
              {speedOptions.map((speed) => (
                <option key={speed} value={speed}>
                  {speed}x
                </option>
              ))}
            </select>
          </div>

          {/* Subtitle Control */}
          {subtitles.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm">Subtitles:</span>
              <select
                value={selectedSubtitle || ''}
                onChange={(e) => setSelectedSubtitle(e.target.value || null)}
                className="bg-black/50 text-white rounded px-2 py-1 text-sm"
              >
                <option value="">Off</option>
                {subtitles.map((sub) => (
                  <option key={sub.language} value={sub.language}>
                    {sub.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Note Button */}
          {allowNotes && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowNoteForm(!showNoteForm)}
              className="text-white hover:bg-white/20"
            >
              📝 Note
            </Button>
          )}

          {/* Watch Time */}
          <div className="ml-auto text-sm">
            {Math.floor(watchTime / 60)}:{(Math.floor(watchTime % 60)).toString().padStart(2, '0')} watched
          </div>
        </div>
      </div>

      {/* Note Form */}
      {showNoteForm && (
        <Card className="absolute top-4 right-4 w-80 z-20">
          <CardContent className="p-4 space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">Note at {Math.floor(currentTime / 60)}:{(Math.floor(currentTime % 60)).toString().padStart(2, '0')}</label>
              <textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Add a note..."
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                rows={3}
              />
            </div>
            <div className="flex gap-2">
              <Button variant="inverse" size="sm" onClick={handleSaveNote}>
                Save
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowNoteForm(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

