/**
 * Mux Video Integration
 * Handles video upload, encoding, and delivery
 */

export interface MuxUploadResponse {
  uploadId: string;
  uploadUrl: string;
  assetId?: string;
}

export interface MuxAsset {
  id: string;
  status: 'preparing' | 'ready' | 'errored';
  playbackIds: Array<{ id: string; policy: 'public' | 'signed' }>;
  duration?: number;
  mp4Support?: 'none' | 'standard';
}

/**
 * Create a direct upload URL for Mux
 */
export async function createMuxUpload(): Promise<MuxUploadResponse> {
  if (!process.env.MUX_TOKEN_ID || !process.env.MUX_TOKEN_SECRET) {
    throw new Error('MUX_TOKEN_ID and MUX_TOKEN_SECRET must be set in environment variables');
  }

  const auth = Buffer.from(`${process.env.MUX_TOKEN_ID}:${process.env.MUX_TOKEN_SECRET}`).toString('base64');

  const response = await fetch('https://api.mux.com/video/v1/uploads', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      new_asset_settings: {
        playback_policy: ['public'],
        mp4_support: 'standard',
      },
      cors_origin: process.env.NEXT_PUBLIC_APP_URL || '*',
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Mux upload creation failed: ${error}`);
  }

  const data = await response.json();
  return {
    uploadId: data.data.id,
    uploadUrl: data.data.url,
  };
}

/**
 * Get Mux asset details
 */
export async function getMuxAsset(assetId: string): Promise<MuxAsset> {
  if (!process.env.MUX_TOKEN_ID || !process.env.MUX_TOKEN_SECRET) {
    throw new Error('MUX_TOKEN_ID and MUX_TOKEN_SECRET must be set');
  }

  const auth = Buffer.from(`${process.env.MUX_TOKEN_ID}:${process.env.MUX_TOKEN_SECRET}`).toString('base64');

  const response = await fetch(`https://api.mux.com/video/v1/assets/${assetId}`, {
    headers: {
      'Authorization': `Basic ${auth}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to get Mux asset: ${response.statusText}`);
  }

  const data = await response.json();
  return data.data;
}

/**
 * Get playback URL for a Mux asset
 */
export function getMuxPlaybackUrl(playbackId: string, signed: boolean = false): string {
  if (signed) {
    // For signed URLs, you'd need to generate a JWT token
    // For now, return public URL
    return `https://stream.mux.com/${playbackId}.m3u8`;
  }
  return `https://stream.mux.com/${playbackId}.m3u8`;
}

