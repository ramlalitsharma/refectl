'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

interface ParticipantManagementProps {
  roomId: string;
  jitsiApi: any;
}

export function ParticipantManagement({ roomId, jitsiApi }: ParticipantManagementProps) {
  const [participants, setParticipants] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchParticipants();
    }, 5000); // Refresh every 5 seconds

    fetchParticipants();
    return () => clearInterval(interval);
  }, [roomId]);

  const fetchParticipants = async () => {
    try {
      const res = await fetch(`/api/live/participants?roomId=${roomId}`);
      const data = await res.json();
      if (data.success) {
        setParticipants(data.data?.participants || []);
      }
    } catch (error) {
      console.error('Failed to fetch participants:', error);
    }
  };

  const handleMute = async (targetUserId: string, mute: boolean) => {
    setLoading(true);
    try {
      await fetch('/api/live/participants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: mute ? 'mute' : 'unmute',
          roomId,
          targetUserId,
        }),
      });

      // Execute via Jitsi API
      if (jitsiApi) {
        jitsiApi.executeCommand('muteEveryone', {});
      }

      fetchParticipants();
    } catch (error) {
      console.error('Failed to mute participant:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleKick = async (targetUserId: string) => {
    if (!confirm('Are you sure you want to remove this participant?')) return;

    setLoading(true);
    try {
      await fetch('/api/live/participants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'kick',
          roomId,
          targetUserId,
        }),
      });

      fetchParticipants();
    } catch (error) {
      console.error('Failed to kick participant:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Participants ({participants.length})</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 max-h-[400px] overflow-y-auto">
        {participants.map((participant) => (
          <div
            key={participant.userId}
            className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
          >
            <div className="flex items-center gap-3 flex-1">
              {participant.userAvatar ? (
                <img
                  src={participant.userAvatar}
                  alt={participant.userName}
                  className="w-8 h-8 rounded-full"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-teal-500 flex items-center justify-center text-white text-sm">
                  {participant.userName.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="flex-1">
                <p className="font-medium text-slate-900">{participant.userName}</p>
                <div className="flex gap-2 mt-1">
                  <Badge
                    variant={participant.role === 'instructor' ? 'success' : 'info'}
                    className="text-xs"
                  >
                    {participant.role}
                  </Badge>
                  {participant.isHandRaised && (
                    <Badge variant="warning" className="text-xs">
                      ✋ Hand Raised
                    </Badge>
                  )}
                  {participant.connectionQuality && (
                    <Badge
                      variant={
                        participant.connectionQuality === 'good'
                          ? 'success'
                          : participant.connectionQuality === 'medium'
                          ? 'warning'
                          : 'error'
                      }
                      className="text-xs"
                    >
                      {participant.connectionQuality}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            {participant.role !== 'instructor' && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleMute(participant.userId, !participant.isMuted)}
                  disabled={loading}
                >
                  {participant.isMuted ? '🔊' : '🔇'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleKick(participant.userId)}
                  disabled={loading}
                >
                  Remove
                </Button>
              </div>
            )}
          </div>
        ))}
        {participants.length === 0 && (
          <p className="text-sm text-slate-500 text-center py-4">No participants</p>
        )}
      </CardContent>
    </Card>
  );
}

