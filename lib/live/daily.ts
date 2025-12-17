/**
 * Daily.co Live Classroom Integration
 * Handles live video rooms, recordings, and classroom features
 */

export interface DailyRoom {
  id: string;
  name: string;
  url: string;
  config: {
    max_participants?: number;
    enable_recording?: boolean;
    enable_screenshare?: boolean;
    enable_chat?: boolean;
    enable_whiteboard?: boolean;
    start_video_off?: boolean;
    start_audio_off?: boolean;
  };
  created_at?: string;
}

export interface DailyToken {
  token: string;
  room: string;
  exp: number;
}

/**
 * Create a Daily.co room for live classes
 */
export async function createDailyRoom(config: {
  name: string;
  maxParticipants?: number;
  enableRecording?: boolean;
  enableScreenshare?: boolean;
  enableChat?: boolean;
  enableWhiteboard?: boolean;
  isOwner?: boolean;
}): Promise<DailyRoom> {
  if (!process.env.DAILY_API_KEY) {
    throw new Error('DAILY_API_KEY must be set in environment variables');
  }

  const response = await fetch('https://api.daily.co/v1/rooms', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.DAILY_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: config.name,
      privacy: 'private',
      properties: {
        max_participants: config.maxParticipants || 50,
        enable_recording: config.enableRecording !== false,
        enable_screenshare: config.enableScreenshare !== false,
        enable_chat: config.enableChat !== false,
        enable_whiteboard: config.enableWhiteboard !== false,
        start_video_off: false,
        start_audio_off: false,
        owner_only_broadcast: config.isOwner || false,
      },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Daily room creation failed: ${error}`);
  }

  const data = await response.json();
  return {
    id: data.id,
    name: data.name,
    url: data.url,
    config: data.config || {},
    created_at: data.created_at,
  };
}

/**
 * Generate a Daily.co token for room access
 */
export async function createDailyToken(roomName: string, userId: string, isOwner: boolean = false): Promise<DailyToken> {
  if (!process.env.DAILY_API_KEY) {
    throw new Error('DAILY_API_KEY must be set');
  }

  const response = await fetch('https://api.daily.co/v1/meeting-tokens', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.DAILY_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      properties: {
        room_name: roomName,
        is_owner: isOwner,
        user_id: userId,
        exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24, // 24 hours
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to create Daily token: ${response.statusText}`);
  }

  const data = await response.json();
  return {
    token: data.token,
    room: roomName,
    exp: data.properties.exp,
  };
}

/**
 * Get room details
 */
export async function getDailyRoom(roomName: string): Promise<DailyRoom> {
  if (!process.env.DAILY_API_KEY) {
    throw new Error('DAILY_API_KEY must be set');
  }

  const response = await fetch(`https://api.daily.co/v1/rooms/${roomName}`, {
    headers: {
      'Authorization': `Bearer ${process.env.DAILY_API_KEY}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to get Daily room: ${response.statusText}`);
  }

  const data = await response.json();
  return {
    id: data.id,
    name: data.name,
    url: data.url,
    config: data.config || {},
    created_at: data.created_at,
  };
}

/**
 * Delete a Daily.co room
 */
export async function deleteDailyRoom(roomName: string): Promise<void> {
  if (!process.env.DAILY_API_KEY) {
    throw new Error('DAILY_API_KEY must be set');
  }

  const response = await fetch(`https://api.daily.co/v1/rooms/${roomName}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${process.env.DAILY_API_KEY}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to delete Daily room: ${response.statusText}`);
  }
}

