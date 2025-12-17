'use client';

import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

interface EnrollmentHistoryEntry {
  status: string;
  changedAt: string;
  adminId?: string | null;
  note?: string | null;
}

interface EnrollmentItem {
  id?: string;
  userId: string;
  userName: string;
  userEmail: string;
  courseId: string;
  courseSlug: string;
  courseTitle: string;
  status: string;
  cohort?: string | null;
  waitlistPosition?: number | null;
  notes?: string | null;
  requestedAt: string;
  decidedAt?: string | null;
  adminId?: string | null;
  history?: EnrollmentHistoryEntry[];
}

interface EnrollmentManagerProps {
  initialEnrollments: EnrollmentItem[];
}

const statusLabel: Record<string, string> = {
  pending: 'Pending review',
  approved: 'Approved',
  waitlisted: 'Waitlisted',
  rejected: 'Rejected',
};

const statusBadgeVariant: Record<string, 'default' | 'success' | 'warning' | 'error' | 'info'> = {
  pending: 'info',
  approved: 'success',
  waitlisted: 'warning',
  rejected: 'error',
};

export function EnrollmentManager({ initialEnrollments }: EnrollmentManagerProps) {
  const [enrollments, setEnrollments] = useState(initialEnrollments);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'waitlisted' | 'rejected'>('all');
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (filter === 'all') return enrollments;
    return enrollments.filter((item) => item.status === filter);
  }, [enrollments, filter]);

  const updateEnrollment = async (
    enrollmentId: string,
    updates: { status?: string; cohort?: string | null; notes?: string | null; waitlistPosition?: number | null },
  ) => {
    // Accept both ObjectId format and composite keys
    if (!enrollmentId || enrollmentId.trim() === '') {
      alert('Enrollment identifier is missing. Please refresh the page and try again.');
      return;
    }
    
    setLoadingId(enrollmentId);
    try {
      const res = await fetch(`/api/admin/enrollments/${enrollmentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const errorMsg = data.error || 'Failed to update enrollment';
        // If enrollment not found, try to refresh the list
        if (data.error?.includes('not found')) {
          alert(`Enrollment not found. This may have been deleted. Please refresh the page.`);
          window.location.reload();
          return;
        }
        throw new Error(errorMsg);
      }
      const data = await res.json();
      const updated = data.enrollment;
      const matchId = (item: EnrollmentItem) =>
        item.id === enrollmentId || 
        String(item.id) === enrollmentId ||
        (!item.id && `${item.userId}:${item.courseId}` === enrollmentId);
      setEnrollments((prev) =>
        prev.map((item) =>
          matchId(item)
            ? {
                ...item,
                id: updated._id ? String(updated._id) : item.id,
                status: updated.status,
                cohort: updated.cohort || null,
                waitlistPosition: updated.waitlistPosition ?? null,
                notes: updated.notes || null,
                decidedAt: updated.decidedAt || null,
                adminId: updated.adminId || null,
                history: updated.history || item.history,
              }
            : item,
        ),
      );
    } catch (error: any) {
      console.error(error);
      alert(error.message || 'Something went wrong');
    } finally {
      setLoadingId(null);
    }
  };

  const handleStatusChange = (enrollmentId: string, status: 'approved' | 'waitlisted' | 'rejected') => {
    let payload: any = { status };
    if (status === 'waitlisted') {
      const position = prompt('Waitlist position (numeric):');
      payload.waitlistPosition = position ? Number(position) : null;
    }
    if (status === 'rejected') {
      const note = prompt('Optional rejection note:');
      payload.notes = note || null;
    }
    updateEnrollment(enrollmentId, payload);
  };

  const handleAssignCohort = (enrollmentId: string, currentCohort?: string | null) => {
    const value = prompt('Assign cohort label', currentCohort || 'Cohort A');
    if (value === null) return;
    updateEnrollment(enrollmentId, { cohort: value });
  };

  const handleClearWaitlist = (enrollmentId: string) => {
    updateEnrollment(enrollmentId, { waitlistPosition: null });
  };

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-lg">
        <CardContent className="p-6 flex flex-wrap items-center gap-3 justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Enrollment Queue</h2>
            <p className="text-sm text-slate-500">Filter and process enrollment requests from learners.</p>
          </div>
          <div className="flex flex-wrap gap-2 text-sm">
            {(['all', 'pending', 'approved', 'waitlisted', 'rejected'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`rounded-full px-3 py-1 font-medium transition ${
                  filter === status ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {status === 'all' ? 'All' : statusLabel[status]}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {filtered.length === 0 ? (
        <Card className="border border-dashed border-slate-300 bg-slate-50">
          <CardContent className="py-16 text-center text-slate-500">
            No enrollments to display for this filter.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filtered.map((item) => {
            const stableId = item.id || `${item.userId}:${item.courseId}`;
            const targetId = item.id || stableId;
            return (
            <Card key={stableId} className="border border-slate-200 bg-white shadow-sm">
              <CardContent className="space-y-4 p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="space-y-2">
                    <div className="text-sm uppercase tracking-wide text-slate-400">Learner</div>
                    <div className="text-lg font-semibold text-slate-900">{item.userName}</div>
                    <div className="text-sm text-slate-500">{item.userEmail}</div>
                    <div className="text-xs text-slate-400">Requested {new Date(item.requestedAt).toLocaleString()}</div>
                  </div>
                  <div className="space-y-2 text-right min-w-[180px]">
                    <div className="text-sm uppercase tracking-wide text-slate-400">Course</div>
                    <div className="text-lg font-semibold text-slate-900">{item.courseTitle}</div>
                    <Badge variant={statusBadgeVariant[item.status]}>{statusLabel[item.status]}</Badge>
                    {item.cohort && <div className="text-xs text-emerald-600">Cohort: {item.cohort}</div>}
                    {item.waitlistPosition !== null && item.waitlistPosition !== undefined && (
                      <div className="text-xs text-amber-600">Waitlist position: {item.waitlistPosition}</div>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="inverse"
                    size="sm"
                    disabled={loadingId === targetId || item.status === 'approved'}
                    onClick={() => handleStatusChange(targetId, 'approved')}
                  >
                    Approve
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={loadingId === targetId}
                    onClick={() => handleStatusChange(targetId, 'waitlisted')}
                  >
                    Waitlist
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={loadingId === targetId}
                    onClick={() => handleStatusChange(targetId, 'rejected')}
                  >
                    Reject
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={loadingId === targetId}
                    onClick={() => handleAssignCohort(targetId, item.cohort)}
                  >
                    Assign Cohort
                  </Button>
                  {item.waitlistPosition !== null && (
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={loadingId === targetId}
                      onClick={() => handleClearWaitlist(targetId)}
                    >
                      Clear Waitlist Slot
                    </Button>
                  )}
                </div>

                {item.notes && <div className="text-sm text-slate-500">Notes: {item.notes}</div>}

                {item.history && item.history.length > 0 && (
                  <div className="rounded-xl bg-slate-50 p-4 text-xs text-slate-500 space-y-2">
                    {item.history
                      .slice()
                      .reverse()
                      .map((entry, idx) => (
                        <div key={idx} className="flex justify-between">
                          <span>
                            {new Date(entry.changedAt).toLocaleString()} • {statusLabel[entry.status] || entry.status}
                            {entry.note ? ` — ${entry.note}` : ''}
                          </span>
                          {entry.adminId && <span className="text-slate-400">by {entry.adminId}</span>}
                        </div>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )})}
        </div>
      )}
    </div>
  );
}
