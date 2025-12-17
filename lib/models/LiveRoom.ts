// Live Room Model - Enhanced schema for live classes

import { ObjectId } from 'mongodb';

export interface LiveRoom {
  _id?: ObjectId;
  roomId: string;                    // Unique room identifier
  roomName: string;                  // Display name
  roomUrl: string;                    // Jitsi room URL
  provider: 'jitsi' | 'daily';       // Video provider
  courseId?: string;                  // Linked course ID
  createdBy: string;                 // Creator user ID
  status: 'scheduled' | 'active' | 'ended' | 'cancelled';
  
  // Scheduling
  scheduledStartTime?: Date;          // When class is scheduled to start
  scheduledEndTime?: Date;            // When class is scheduled to end
  actualStartTime?: Date;             // When class actually started
  actualEndTime?: Date;               // When class actually ended
  timezone?: string;                  // Timezone (e.g., 'America/New_York')
  isRecurring?: boolean;              // Is this a recurring class?
  recurrencePattern?: string;         // 'daily', 'weekly', 'monthly'
  
  // Settings (from form)
  maxParticipants?: number;           // Maximum participants
  enableRecording?: boolean;          // Allow recording
  enableScreenshare?: boolean;         // Allow screen sharing
  enableChat?: boolean;                // Enable chat
  enableWhiteboard?: boolean;          // Enable whiteboard
  enableWaitingRoom?: boolean;        // Enable waiting room
  enableBreakoutRooms?: boolean;       // Enable breakout rooms
  
  // Configuration
  config: {
    startWithAudioMuted?: boolean;
    startWithVideoMuted?: boolean;
    enableWelcomePage?: boolean;
    enableClosePage?: boolean;
    [key: string]: any;
  };
  
  // Metadata
  description?: string;                // Class description
  tags?: string[];                     // Tags for search
  thumbnail?: string;                  // Thumbnail image URL
  
  // Statistics
  totalParticipants?: number;         // Total unique participants
  peakParticipants?: number;          // Peak concurrent participants
  averageDuration?: number;            // Average participant duration (minutes)
  
  createdAt: Date;
  updatedAt: Date;
}

export interface LiveClassAttendance {
  _id?: ObjectId;
  roomId: string;                      // Live room ID
  userId: string;                      // User ID
  userName?: string;                   // User display name
  joinedAt: Date;                      // When user joined
  leftAt?: Date;                       // When user left
  duration?: number;                   // Duration in seconds
  wasPresent?: boolean;                // Marked as present by instructor
  notes?: string;                      // Instructor notes
  createdAt: Date;
}

export interface LiveClassRecording {
  _id?: ObjectId;
  roomId: string;                      // Live room ID
  recordingId: string;                 // Jitsi recording ID
  recordingUrl?: string;               // Recording playback URL
  recordingType: 'local' | 'jibri';    // Recording type
  duration?: number;                   // Recording duration (seconds)
  fileSize?: number;                   // File size in bytes
  status: 'processing' | 'ready' | 'failed';
  thumbnail?: string;                  // Recording thumbnail
  transcript?: string;                 // Auto-generated transcript
  createdAt: Date;
  processedAt?: Date;
}

export function createLiveRoom(data: {
  roomId: string;
  roomName: string;
  roomUrl: string;
  createdBy: string;
  provider?: 'jitsi' | 'daily';
  courseId?: string;
  scheduledStartTime?: Date;
  scheduledEndTime?: Date;
  maxParticipants?: number;
  enableRecording?: boolean;
  enableScreenshare?: boolean;
  enableChat?: boolean;
  enableWhiteboard?: boolean;
  config?: any;
}): LiveRoom {
  const now = new Date();
  return {
    roomId: data.roomId,
    roomName: data.roomName,
    roomUrl: data.roomUrl,
    provider: data.provider || 'jitsi',
    createdBy: data.createdBy,
    courseId: data.courseId,
    status: 'scheduled',
    scheduledStartTime: data.scheduledStartTime,
    scheduledEndTime: data.scheduledEndTime,
    maxParticipants: data.maxParticipants || 50,
    enableRecording: data.enableRecording ?? true,
    enableScreenshare: data.enableScreenshare ?? true,
    enableChat: data.enableChat ?? true,
    enableWhiteboard: data.enableWhiteboard ?? false,
    enableWaitingRoom: false,
    enableBreakoutRooms: false,
    config: data.config || {},
    totalParticipants: 0,
    peakParticipants: 0,
    createdAt: now,
    updatedAt: now,
  };
}

