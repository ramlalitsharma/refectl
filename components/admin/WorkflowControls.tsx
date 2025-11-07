'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { WORKFLOW_STATUSES } from '@/lib/workflow-status';

interface WorkflowControlsProps {
  contentType: 'course' | 'blog';
  contentId: string;
  status: string;
  updatedAt?: string;
}

interface HistoryEntry {
  id?: string;
  version: number;
  status: string;
  changeNote?: string | null;
  changedBy: string;
  createdAt: string;
}

const STATUS_LABELS: Record<string, string> = {
  draft: 'Draft',
  in_review: 'In Review',
  approved: 'Approved',
  published: 'Published',
  archived: 'Archived',
};

export function WorkflowControls({ contentType, contentId, status, updatedAt }: WorkflowControlsProps) {
  const [currentStatus, setCurrentStatus] = useState(status || 'draft');
  const [loading, setLoading] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    setCurrentStatus(status || 'draft');
  }, [status]);

  const updateStatus = async (nextStatus: string) => {
    if (nextStatus === currentStatus) return;
    const note = prompt(`Add a note for changing status to "${STATUS_LABELS[nextStatus] || nextStatus}" (optional)`);
    setLoading(true);
    try {
      const res = await fetch('/api/admin/workflow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contentType, contentId, status: nextStatus, changeNote: note }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update status');
      setCurrentStatus(data.status);
      // refresh history next time it's opened
      setHistory([]);
    } catch (error: any) {
      console.error(error);
      alert(error.message || 'Unable to update status');
    } finally {
      setLoading(false);
    }
  };

  const loadHistory = async () => {
    if (historyLoading) return;
    setHistoryLoading(true);
    try {
      const params = new URLSearchParams({ contentType, contentId });
      const res = await fetch(`/api/admin/workflow/history?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch history');
      setHistory(data.history || []);
    } catch (error: any) {
      console.error(error);
      alert(error.message || 'Unable to load history');
    } finally {
      setHistoryLoading(false);
    }
  };

  const toggleHistory = () => {
    const next = !historyOpen;
    setHistoryOpen(next);
    if (next && history.length === 0) {
      loadHistory();
    }
  };

  const badgeVariant = currentStatus === 'published' ? 'success' : currentStatus === 'in_review' ? 'info' : currentStatus === 'archived' ? 'warning' : 'default';

  return (
    <div className="space-y-2 text-xs text-slate-500">
      <div className="flex flex-wrap items-center gap-2">
        <span>Workflow:</span>
        <Badge variant={badgeVariant as any}>{STATUS_LABELS[currentStatus] || currentStatus}</Badge>
        {updatedAt && <span>Updated {new Date(updatedAt).toLocaleString()}</span>}
      </div>
      <div className="flex flex-wrap gap-2">
        {WORKFLOW_STATUSES.map((value) => (
          <Button
            key={value}
            variant={value === currentStatus ? 'inverse' : 'outline'}
            size="sm"
            disabled={loading || value === currentStatus}
            onClick={() => updateStatus(value)}
          >
            {STATUS_LABELS[value] || value}
          </Button>
        ))}
        <Button variant={historyOpen ? 'inverse' : 'ghost'} size="sm" onClick={toggleHistory} disabled={historyLoading}>
          {historyOpen ? 'Hide history' : 'View history'}
        </Button>
      </div>
      {historyOpen && (
        <div className="space-y-2 rounded-lg border border-slate-200 bg-white p-3 text-xs text-slate-600">
          {historyLoading ? (
            <div>Loading history…</div>
          ) : history.length === 0 ? (
            <div>No history yet.</div>
          ) : (
            history.map((entry) => (
              <div key={entry.id || entry.version} className="border-b border-slate-100 pb-2 last:border-none last:pb-0">
                <div className="font-semibold text-slate-800">
                  v{entry.version} • {STATUS_LABELS[entry.status] || entry.status}
                </div>
                <div>{entry.changeNote || 'No note provided.'}</div>
                <div className="text-[10px] text-slate-400">
                  {new Date(entry.createdAt).toLocaleString()} • {entry.changedBy}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
