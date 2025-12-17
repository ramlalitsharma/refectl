/**
 * Free/Open-Source Video Hosting
 * Uses YouTube API or self-hosted HLS for free video delivery
 */

export interface FreeVideoUploadResponse {
  videoId: string;
  uploadUrl?: string;
  provider: 'youtube' | 'self-hosted';
}

export interface FreeVideoAsset {
  id: string;
  provider: 'youtube' | 'self-hosted';
  status: 'processing' | 'ready' | 'errored';
  playbackUrl: string;
  thumbnailUrl?: string;
  duration?: number;
}

/**
 * Upload video to YouTube (free, requires YouTube API key)
 * Or use self-hosted HLS for completely free solution
 */
export async function uploadVideoToYouTube(
  file: File,
  title: string,
  description?: string
): Promise<FreeVideoUploadResponse> {
  // Note: YouTube API requires OAuth2 and is complex
  // For free solution, we'll use self-hosted HLS instead
  throw new Error('YouTube upload requires OAuth2 setup. Use self-hosted HLS for free solution.');
}

/**
 * Generate self-hosted HLS video URL
 * Videos should be uploaded to your server and converted to HLS format
 */
export function getSelfHostedVideoUrl(videoId: string, baseUrl?: string): string {
  const base = baseUrl || process.env.NEXT_PUBLIC_VIDEO_BASE_URL || '/videos';
  return `${base}/${videoId}/playlist.m3u8`;
}

/**
 * Get video thumbnail URL
 */
export function getVideoThumbnailUrl(videoId: string, provider: 'youtube' | 'self-hosted'): string {
  if (provider === 'youtube') {
    return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
  }
  const base = process.env.NEXT_PUBLIC_VIDEO_BASE_URL || '/videos';
  return `${base}/${videoId}/thumbnail.jpg`;
}

/**
 * Create video upload record (for self-hosted videos)
 * Actual upload should be done via direct file upload to your server
 */
export async function createVideoRecord(data: {
  title: string;
  description?: string;
  videoId: string;
  provider: 'youtube' | 'self-hosted';
  duration?: number;
}): Promise<FreeVideoAsset> {
  // This would typically save to database
  return {
    id: data.videoId,
    provider: data.provider,
    status: 'ready',
    playbackUrl: getSelfHostedVideoUrl(data.videoId),
    thumbnailUrl: getVideoThumbnailUrl(data.videoId, data.provider),
    duration: data.duration,
  };
}


