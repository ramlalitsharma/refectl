'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { JitsiClassroom } from './JitsiClassroom';

interface LiveClassroomProps {
  roomUrl: string;
  roomName: string;
  token?: string; // Optional for Jitsi (not needed)
  isInstructor?: boolean;
  onLeave?: () => void;
  provider?: 'jitsi' | 'daily'; // Default to Jitsi (free)
}

export function LiveClassroom({ 
  roomUrl, 
  roomName,
  token, 
  isInstructor = false, 
  onLeave,
  provider = 'jitsi' // Use Jitsi by default (free)
}: LiveClassroomProps) {
  // Use Jitsi by default (free), fallback to Daily.co if provider is specified
  if (provider === 'jitsi' || !provider) {
    return (
      <JitsiClassroom
        roomUrl={roomUrl}
        roomName={roomName}
        isModerator={isInstructor}
        onLeave={onLeave}
      />
    );
  }

  // Fallback to Daily.co if explicitly requested (requires API key)
  return (
    <Card className="w-full">
      <CardContent className="p-6 text-center">
        <p className="text-slate-600">
          Daily.co integration requires API key. Using free Jitsi Meet instead.
        </p>
      </CardContent>
    </Card>
  );
}

