'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { StudentSidebar } from './StudentSidebar';
import { InstructorPanel } from './InstructorPanel';

interface JitsiClassroomProps {
  roomUrl: string;
  roomName: string;
  isModerator?: boolean;
  onLeave?: () => void;
  domain?: string;
}

declare global {
  interface Window {
    JitsiMeetExternalAPI: any;
  }
}

export function JitsiClassroom({
  roomUrl,
  roomName,
  isModerator = false,
  onLeave,
  domain = 'meet.jit.si',
}: JitsiClassroomProps) {
  const [isJoined, setIsJoined] = useState(false);
  const [participants, setParticipants] = useState(0);
  const [connectionQuality, setConnectionQuality] = useState<'good' | 'medium' | 'poor'>('good');
  const [showSidebar, setShowSidebar] = useState(false);
  const jitsiContainerRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<any>(null);

  useEffect(() => {
    // Load Jitsi Meet external API
    const script = document.createElement('script');
    script.src = `https://${domain}/external_api.js`;
    script.async = true;
    script.onload = () => {
      if (jitsiContainerRef.current && window.JitsiMeetExternalAPI) {
        const options = {
          roomName,
          parentNode: jitsiContainerRef.current,
          configOverwrite: {
            startWithAudioMuted: false,
            startWithVideoMuted: false,
            enableWelcomePage: false,
            enableClosePage: false,
          },
          interfaceConfigOverwrite: {
            TOOLBAR_BUTTONS: [
              'microphone',
              'camera',
              'closedcaptions',
              'desktop',
              'fullscreen',
              'fodeviceselection',
              'hangup',
              'chat',
              'recording',
              'livestreaming',
              'etherpad',
              'sharedvideo',
              'settings',
              'raisehand',
              'videoquality',
              'filmstrip',
              'invite',
              'feedback',
              'stats',
              'shortcuts',
              'tileview',
              'videobackgroundblur',
              'download',
              'help',
              'mute-everyone',
              'mute-video-everyone',
            ],
            SETTINGS_SECTIONS: ['devices', 'language', 'moderator', 'profile'],
            SHOW_JITSI_WATERMARK: false,
            SHOW_WATERMARK_FOR_GUESTS: false,
          },
          userInfo: {
            displayName: 'User',
          },
        };

        apiRef.current = new window.JitsiMeetExternalAPI(domain, options);

        // Event listeners
        apiRef.current.addEventListener('participantJoined', () => {
          setParticipants((prev) => prev + 1);
        });

        apiRef.current.addEventListener('participantLeft', () => {
          setParticipants((prev) => Math.max(0, prev - 1));
        });

        // Track connection quality
        apiRef.current.addEventListener('connectionQualityChanged', (event: any) => {
          if (event.participantId === apiRef.current.getMyUserId()) {
            const quality = event.connectionQuality;
            if (quality <= 2) {
              setConnectionQuality('poor');
            } else if (quality <= 4) {
              setConnectionQuality('medium');
            } else {
              setConnectionQuality('good');
            }
          }
        });

        apiRef.current.addEventListener('videoConferenceJoined', () => {
          setIsJoined(true);
          // Track attendance - user joined
          fetch('/api/live/attendance', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              roomId: roomName,
              action: 'join',
              userName: 'User', // TODO: Get from user profile
            }),
          }).catch((err) => console.error('Failed to track join:', err));
        });

        apiRef.current.addEventListener('readyToClose', () => {
          if (onLeave) {
            onLeave();
          }
        });
      }
    };
    document.body.appendChild(script);

    return () => {
      if (apiRef.current) {
        apiRef.current.dispose();
      }
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [roomName, domain, onLeave]);

  const handleLeave = () => {
    // Track attendance - user left
    if (isJoined) {
      fetch('/api/live/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId: roomName,
          action: 'leave',
        }),
      }).catch((err) => console.error('Failed to track leave:', err));
    }

    if (apiRef.current) {
      apiRef.current.executeCommand('hangup');
      apiRef.current.dispose();
      apiRef.current = null;
    }
    setIsJoined(false);
    if (onLeave) {
      onLeave();
    }
  };

  return (
    <div className="flex gap-4 h-full">
      <div className="flex-1">
        <Card className="w-full">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <CardTitle>Live Classroom (Jitsi Meet)</CardTitle>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-600">
                    {participants} {participants === 1 ? 'participant' : 'participants'}
                  </span>
                  <Badge
                    variant={
                      connectionQuality === 'good'
                        ? 'success'
                        : connectionQuality === 'medium'
                        ? 'warning'
                        : 'error'
                    }
                    className="text-xs"
                  >
                    {connectionQuality === 'good' ? '●' : connectionQuality === 'medium' ? '●' : '●'} {connectionQuality}
                  </Badge>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant={showSidebar ? 'inverse' : 'outline'}
                  size="sm"
                  onClick={() => setShowSidebar(!showSidebar)}
                >
                  {showSidebar ? 'Hide' : 'Show'} Tools
                </Button>
                <Button variant="outline" size="sm" onClick={handleLeave}>
                  Leave Room
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="relative w-full" style={{ paddingBottom: '56.25%', height: 0 }}>
              <div
                ref={jitsiContainerRef}
                className="absolute top-0 left-0 w-full h-full border-0 rounded-lg"
                style={{ minHeight: '500px' }}
              />
              {!isJoined && (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-100">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
                    <p className="text-slate-600">Joining classroom...</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {showSidebar && (
        <div className="w-80">
          {isModerator ? (
            <InstructorPanel roomId={roomName} jitsiApi={apiRef.current} />
          ) : (
            <StudentSidebar roomId={roomName} isInstructor={false} />
          )}
        </div>
      )}
    </div>
  );
}


