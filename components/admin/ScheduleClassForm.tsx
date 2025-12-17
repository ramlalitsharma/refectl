'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';

interface ScheduleClassFormProps {
  courses: Array<{ id: string; title: string; slug: string }>;
}

export function ScheduleClassForm({ courses }: ScheduleClassFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    roomName: '',
    courseId: '',
    scheduledStartTime: '',
    scheduledEndTime: '',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    description: '',
    isRecurring: false,
    recurrencePattern: 'weekly',
    maxParticipants: 50,
    enableRecording: true,
    enableScreenshare: true,
    enableChat: true,
    enableWhiteboard: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/live/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          scheduledStartTime: new Date(formData.scheduledStartTime).toISOString(),
          scheduledEndTime: formData.scheduledEndTime
            ? new Date(formData.scheduledEndTime).toISOString()
            : undefined,
          courseId: formData.courseId || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to schedule class');
      }

      alert('Class scheduled successfully!');
      // Reset form
      setFormData({
        roomName: '',
        courseId: '',
        scheduledStartTime: '',
        scheduledEndTime: '',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        description: '',
        isRecurring: false,
        recurrencePattern: 'weekly',
        maxParticipants: 50,
        enableRecording: true,
        enableScreenshare: true,
        enableChat: true,
        enableWhiteboard: false,
      });
    } catch (error: any) {
      alert(error.message || 'Failed to schedule class');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Class Name *
        </label>
        <input
          type="text"
          required
          value={formData.roomName}
          onChange={(e) => setFormData({ ...formData, roomName: e.target.value })}
          placeholder="e.g., Python Basics - Live Session"
          className="w-full rounded-lg border border-slate-300 px-3 py-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Link to Course (optional)
        </label>
        <select
          value={formData.courseId}
          onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
          className="w-full rounded-lg border border-slate-300 px-3 py-2"
        >
          <option value="">No course link</option>
          {courses.map((course) => (
            <option key={course.id} value={course.id}>
              {course.title}
            </option>
          ))}
        </select>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Start Time *
          </label>
          <input
            type="datetime-local"
            required
            value={formData.scheduledStartTime}
            onChange={(e) => setFormData({ ...formData, scheduledStartTime: e.target.value })}
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            End Time
          </label>
          <input
            type="datetime-local"
            value={formData.scheduledEndTime}
            onChange={(e) => setFormData({ ...formData, scheduledEndTime: e.target.value })}
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Description
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Class description..."
          className="w-full rounded-lg border border-slate-300 px-3 py-2 min-h-[80px]"
        />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Max Participants
          </label>
          <input
            type="number"
            min="1"
            max="1000"
            value={formData.maxParticipants}
            onChange={(e) =>
              setFormData({ ...formData, maxParticipants: parseInt(e.target.value) || 50 })
            }
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Timezone
          </label>
          <input
            type="text"
            value={formData.timezone}
            onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
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
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={formData.isRecurring}
            onChange={(e) => setFormData({ ...formData, isRecurring: e.target.checked })}
          />
          <span className="text-sm">Recurring Class</span>
        </label>
      </div>

      {formData.isRecurring && (
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Recurrence Pattern
          </label>
          <select
            value={formData.recurrencePattern}
            onChange={(e) => setFormData({ ...formData, recurrencePattern: e.target.value })}
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>
      )}

      <Button type="submit" variant="inverse" className="w-full" disabled={loading}>
        {loading ? 'Scheduling...' : 'Schedule Class'}
      </Button>
    </form>
  );
}

