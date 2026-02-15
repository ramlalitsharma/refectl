'use client';

import { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { AlertTriangle, FileText } from 'lucide-react';
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
  chapters?: Array<{ title: string; time: number }>;
}

export const EnhancedVideoPlayer = forwardRef(({
  playbackId,
  title,
  autoplay = false,
  onProgress,
  onEnded,
  onWatchTime,
  subtitles = [],
  allowNotes = true,
  chapters = [],
}: EnhancedVideoPlayerProps, ref) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [playbackRate, setPlaybackRate] = useState(1);
  // const [showControls, setShowControls] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [selectedSubtitle, setSelectedSubtitle] = useState<string | null>(null);
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [watchTime, setWatchTime] = useState(0);
  const [showChapters, setShowChapters] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const lastWatchTimeUpdate = useRef(0);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !playbackId) return;

    // Use self-hosted HLS URL (free) or direct URL
    const isDirectUrl = playbackId.startsWith('http') || playbackId.startsWith('/');
    const hlsUrl = isDirectUrl
      ? playbackId
      : `${process.env.NEXT_PUBLIC_VIDEO_BASE_URL || '/videos'}/${playbackId}/playlist.m3u8`;

    if (hlsUrl.endsWith('.m3u8')) {
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
          setIsPlaying(false);
        });
        video.addEventListener('play', () => setIsPlaying(true));
        video.addEventListener('pause', () => setIsPlaying(false));

        return () => {
          hls.destroy();
          video.removeEventListener('timeupdate', handleTimeUpdate);
        };
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = hlsUrl;
        video.addEventListener('canplay', () => setIsLoading(false));
        if (autoplay) {
          video.play().catch((e) => console.error('Autoplay failed:', e));
        }
      } else {
        setTimeout(() => setError('HLS is not supported in this browser'), 0);
      }
    } else {
      // Direct video file (MP4, etc.)
      video.src = hlsUrl;
      video.addEventListener('loadedmetadata', () => {
        setIsLoading(false);
        setDuration(video.duration);
        if (autoplay) {
          video.play().catch((e) => console.error('Autoplay failed:', e));
        }
      });

      const handleTimeUpdate = () => {
        setCurrentTime(video.currentTime);
        setDuration(video.duration);
        if (onProgress) onProgress(video.currentTime, video.duration);
      };

      video.addEventListener('timeupdate', handleTimeUpdate);
      video.addEventListener('ended', () => {
        if (onEnded) onEnded();
        setIsPlaying(false);
      });
      video.addEventListener('play', () => setIsPlaying(true));
      video.addEventListener('pause', () => setIsPlaying(false));

      return () => {
        video.removeEventListener('timeupdate', handleTimeUpdate);
      };
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

  const togglePlay = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
      } else {
        videoRef.current.pause();
      }
    }
  };

  const seekTo = (time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
      setShowChapters(false);
    }
  };

  useImperativeHandle(ref, () => ({
    seekTo
  }));

  const sortedChapters = [...chapters].sort((a, b) => a.time - b.time);

  const speedOptions = [0.5, 0.75, 1, 1.25, 1.5, 2];

  if (error) {
        return (
          <div className="aspect-video bg-gray-900 rounded-lg flex items-center justify-center">
            <div className="text-center text-white">
              <div className="flex justify-center mb-2">
                <AlertTriangle className="h-6 w-6 text-red-400" />
              </div>
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
            className="w-full h-full cursor-pointer"
            onClick={togglePlay}
            playsInline
            title={title}
          />

          {/* Custom Controls Overlay */}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent pt-20 pb-4 px-4 opacity-0 group-hover:opacity-100 transition-all duration-300">

            {/* Progress Bar with Chapters */}
            <div className="relative group/progress mb-4 h-1.5 hover:h-2 transition-all cursor-pointer bg-white/20 rounded-full overflow-hidden" onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const pos = (e.clientX - rect.left) / rect.width;
              seekTo(pos * duration);
            }}>
              <div
                className="absolute top-0 left-0 h-full bg-teal-500 transition-all"
                style={{ width: `${(currentTime / duration) * 100}%` }}
              />
              {/* Chapter Markers */}
              {sortedChapters.map((chapter, idx) => (
                <div
                  key={idx}
                  className="absolute top-0 w-0.5 h-full bg-white/40 z-10"
                  style={{ left: `${(chapter.time / duration) * 100}%` }}
                  title={chapter.title}
                />
              ))}
            </div>

            <div className="flex items-center gap-4 text-white">
              <Button
                variant="ghost"
                size="sm"
                onClick={togglePlay}
                className="text-white hover:bg-white/20 p-1 h-8 w-8"
              >
                {isPlaying ? '⏸️' : '▶️'}
              </Button>

              <div className="text-xs font-mono">
                {Math.floor(currentTime / 60)}:{(Math.floor(currentTime % 60)).toString().padStart(2, '0')} /
                {Math.floor(duration / 60)}:{(Math.floor(duration % 60)).toString().padStart(2, '0')}
              </div>

              {/* Speed Control */}
              <div className="flex items-center gap-2 ml-4">
                <span className="text-[10px] uppercase font-bold text-white/60">Speed</span>
                <select
                  value={playbackRate}
                  onChange={(e) => setPlaybackRate(parseFloat(e.target.value))}
                  className="bg-black/50 text-white rounded px-2 py-1 text-xs border border-white/10"
                >
                  {speedOptions.map((speed) => (
                    <option key={speed} value={speed}>
                      {speed}x
                    </option>
                  ))}
                </select>
              </div>

              {/* Chapters Toggle */}
              {sortedChapters.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowChapters(!showChapters)}
                  className={`text-xs gap-1.5 ${showChapters ? 'bg-teal-500 text-white' : 'text-white hover:bg-white/20'}`}
                >
                  📑 Chapters
                </Button>
              )}

              {/* Subtitle Control */}
              {subtitles.length > 0 && (
                <select
                  value={selectedSubtitle || ''}
                  onChange={(e) => setSelectedSubtitle(e.target.value || null)}
                  className="bg-black/50 text-white rounded px-2 py-1 text-xs border border-white/10"
                >
                  <option value="">CC Off</option>
                  {subtitles.map((sub) => (
                    <option key={sub.language} value={sub.language}>
                      {sub.label}
                    </option>
                  ))}
                </select>
              )}

              {/* Note Button */}
              {allowNotes && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowNoteForm(!showNoteForm)}
                  className="text-white hover:bg-white/20 text-xs gap-1.5"
                >
                  <FileText className="h-4 w-4" />
                  <span>Note</span>
                </Button>
              )}

              {/* Watch Time */}
              <div className="ml-auto text-[10px] uppercase font-bold text-white/40">
                {Math.floor(watchTime / 60)}:{(Math.floor(watchTime % 60)).toString().padStart(2, '0')} watched
              </div>
            </div>
          </div>

          {/* Chapters Overlay Menu */}
          {showChapters && (
            <div className="absolute inset-y-0 right-0 w-64 bg-black/95 backdrop-blur-md border-l border-white/10 z-30 p-4 animate-in slide-in-from-right duration-300">
              <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-2">
                <h4 className="font-bold text-white text-sm">Course Chapters</h4>
                <button onClick={() => setShowChapters(false)} className="text-white/60 hover:text-white">✕</button>
              </div>
              <div className="space-y-1 overflow-y-auto max-h-[80%] custom-scrollbar">
                {sortedChapters.map((chapter, idx) => (
                  <button
                    key={idx}
                    onClick={() => seekTo(chapter.time)}
                    className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-all flex items-center justify-between group ${currentTime >= chapter.time && (idx === sortedChapters.length - 1 || currentTime < sortedChapters[idx + 1].time)
                      ? 'bg-teal-500 text-white'
                      : 'text-white/70 hover:bg-white/10 hover:text-white'
                      }`}
                  >
                    <span className="truncate pr-2">{chapter.title}</span>
                    <span className="text-[10px] font-mono opacity-60">
                      {Math.floor(chapter.time / 60)}:{(Math.floor(chapter.time % 60)).toString().padStart(2, '0')}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

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
    });

EnhancedVideoPlayer.displayName = 'EnhancedVideoPlayer';
