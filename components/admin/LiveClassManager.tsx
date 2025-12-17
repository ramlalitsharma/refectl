'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import Link from 'next/link';

interface LiveRoom {
  id: string;
  roomId: string;
  roomName: string;
  roomUrl: string;
  courseId?: string;
  createdBy: string;
  createdAt: string;
  status: string;
  provider?: string;
  config: any;
}

interface LiveClassManagerProps {
  initialRooms: LiveRoom[];
}

export function LiveClassManager({ initialRooms }: LiveClassManagerProps) {
  const [rooms, setRooms] = useState(initialRooms);
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    courseId: '',
    maxParticipants: 50,
    enableRecording: true,
    enableScreenshare: true,
    enableChat: true,
    enableWhiteboard: true,
  });

  const handleCreateRoom = async () => {
    if (!formData.name.trim()) {
      alert('Room name is required');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/live/jitsi-rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          courseId: formData.courseId || undefined,
          isModerator: true,
          startWithAudioMuted: false,
          startWithVideoMuted: false,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create room');
      }

      // Add new room to list
      setRooms([{ ...data.room, id: data.room.id, createdAt: new Date().toISOString() }, ...rooms]);
      setShowCreateForm(false);
      setFormData({
        name: '',
        courseId: '',
        maxParticipants: 50,
        enableRecording: true,
        enableScreenshare: true,
        enableChat: true,
        enableWhiteboard: true,
      });
    } catch (error: any) {
      alert(error.message || 'Failed to create room');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Live Classrooms</CardTitle>
            <Button
              onClick={() => setShowCreateForm(!showCreateForm)}
              variant="inverse"
            >
              {showCreateForm ? 'Cancel' : '+ Create Room'}
            </Button>
          </div>
        </CardHeader>
        {showCreateForm && (
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Room Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Python Basics - Live Session"
                className="w-full rounded-lg border border-slate-300 px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Course ID (optional)
              </label>
              <input
                type="text"
                value={formData.courseId}
                onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                placeholder="Link to a course"
                className="w-full rounded-lg border border-slate-300 px-3 py-2"
              />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Max Participants
                </label>
                <input
                  type="number"
                  value={formData.maxParticipants}
                  onChange={(e) => setFormData({ ...formData, maxParticipants: parseInt(e.target.value) || 50 })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2"
                  min="1"
                  max="1000"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.enableRecording}
                  onChange={(e) => setFormData({ ...formData, enableRecording: e.target.checked })}
                />
                <span className="text-sm">Enable Recording</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.enableScreenshare}
                  onChange={(e) => setFormData({ ...formData, enableScreenshare: e.target.checked })}
                />
                <span className="text-sm">Enable Screen Sharing</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.enableChat}
                  onChange={(e) => setFormData({ ...formData, enableChat: e.target.checked })}
                />
                <span className="text-sm">Enable Chat</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.enableWhiteboard}
                  onChange={(e) => setFormData({ ...formData, enableWhiteboard: e.target.checked })}
                />
                <span className="text-sm">Enable Whiteboard</span>
              </label>
            </div>
            <Button
              onClick={handleCreateRoom}
              disabled={loading}
              variant="inverse"
              className="w-full"
            >
              {loading ? 'Creating...' : 'Create Room'}
            </Button>
          </CardContent>
        )}
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {rooms.map((room, index) => (
          <Card key={room.id || `room-${index}`} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg">{room.roomName}</CardTitle>
                <Badge variant={room.status === 'active' ? 'success' : 'info'}>
                  {room.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm text-slate-600">
                <p>Provider: {room.provider === 'jitsi' ? 'Jitsi Meet (Free)' : 'Daily.co'}</p>
                <p className="text-xs text-slate-500 mt-1">
                  Created: {new Date(room.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex gap-2">
                <Link href={`/live/${room.roomId}`} className="flex-1">
                  <Button variant="inverse" size="sm" className="w-full">
                    Join Room
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigator.clipboard.writeText(room.roomUrl)}
                >
                  Copy Link
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {rooms.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-slate-600">No live rooms created yet. Create your first room to get started.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
