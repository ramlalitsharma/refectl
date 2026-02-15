'use client';

import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Link } from '@/lib/navigation';
import { CalendarDays, Edit3, Flag, Globe2, GripVertical, CheckSquare } from 'lucide-react';
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  arrayMove,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

type EventItem = {
  _id: string;
  title: string;
  summary?: string;
  slug: string;
  scope: 'global' | 'country';
  country?: string;
  status: 'draft' | 'published';
  priority?: number;
  startsAt?: string;
  endsAt?: string;
};

function liveState(event: EventItem): 'draft' | 'scheduled' | 'live' | 'ended' {
  if ((event.status || 'draft') !== 'published') return 'draft';
  const now = Date.now();
  const start = event.startsAt ? new Date(event.startsAt).getTime() : null;
  const end = event.endsAt ? new Date(event.endsAt).getTime() : null;
  if (start && now < start) return 'scheduled';
  if (end && now > end) return 'ended';
  return 'live';
}

function Row({
  event,
  selected,
  onToggle,
}: {
  event: EventItem;
  selected: boolean;
  onToggle: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: event._id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const state = liveState(event);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`glass-card-premium rounded-3xl border p-5 space-y-4 ${
        isDragging ? 'border-elite-accent-cyan/40 bg-white/10' : 'border-white/10'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <button
            type="button"
            onClick={() => onToggle(event._id)}
            className={`mt-1 w-4 h-4 rounded border ${selected ? 'bg-elite-accent-cyan border-elite-accent-cyan' : 'border-white/30'}`}
            aria-label="Select event"
          />
          <button
            type="button"
            {...attributes}
            {...listeners}
            className="mt-1 text-slate-500 hover:text-elite-accent-cyan"
            aria-label="Drag to reorder"
          >
            <GripVertical size={16} />
          </button>
          <div className="min-w-0">
            <h2 className="text-lg font-black text-white line-clamp-2">{event.title}</h2>
            <p className="text-sm text-slate-400 line-clamp-2 mt-1">{event.summary}</p>
          </div>
        </div>
        <span
          className={`text-[9px] uppercase font-black tracking-widest px-2 py-1 rounded-lg border ${
            state === 'live'
              ? 'text-emerald-300 border-emerald-400/30'
              : state === 'scheduled'
                ? 'text-blue-300 border-blue-400/30'
                : state === 'ended'
                  ? 'text-slate-300 border-slate-400/30'
                  : 'text-amber-300 border-amber-400/30'
          }`}
        >
          {state}
        </span>
      </div>

      <div className="flex items-center gap-3 text-xs text-slate-400 uppercase tracking-widest">
        <span className="inline-flex items-center gap-1">
          {event.scope === 'global' ? <Globe2 size={12} /> : <Flag size={12} />}
          {event.scope === 'global' ? 'Global' : event.country || 'Country'}
        </span>
        <span className="inline-flex items-center gap-1">
          <CalendarDays size={12} />
          Priority {event.priority || 0}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <Link href={`/admin/studio/events/edit/${event._id}`} className="flex-1">
          <Button variant="ghost" className="w-full border border-white/10 bg-white/5 text-slate-200 hover:bg-white/10">
            <Edit3 className="w-4 h-4 mr-2" />
            Edit
          </Button>
        </Link>
        <Link href={`/news/events/${event.slug}`} target="_blank" className="flex-1">
          <Button variant="ghost" className="w-full border border-white/10 bg-white/5 text-slate-200 hover:bg-white/10">
            Preview
          </Button>
        </Link>
      </div>
    </div>
  );
}

export function EventsStudioBoard({ initialEvents }: { initialEvents: EventItem[] }) {
  const [events, setEvents] = useState<EventItem[]>(initialEvents);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [savingOrder, setSavingOrder] = useState(false);
  const [bulkBusy, setBulkBusy] = useState(false);
  const [bulkCountry, setBulkCountry] = useState('Nepal');
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  const ids = useMemo(() => events.map((e) => e._id), [events]);
  const selectedList = useMemo(() => Array.from(selectedIds), [selectedIds]);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === events.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(events.map((e) => e._id)));
    }
  };

  const saveOrder = async (next: EventItem[]) => {
    try {
      setSavingOrder(true);
      const res = await fetch('/api/admin/events/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: next.map((e) => e._id) }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data?.error || 'Failed to save order');
      }
    } catch (err: any) {
      alert(err?.message || 'Failed to save order');
    } finally {
      setSavingOrder(false);
    }
  };

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = events.findIndex((e) => e._id === active.id);
    const newIndex = events.findIndex((e) => e._id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;

    const next = arrayMove(events, oldIndex, newIndex);
    setEvents(next);
    void saveOrder(next);
  };

  const runBulk = async (action: 'publish' | 'pause' | 'delete' | 'set-country' | 'set-global') => {
    if (!selectedList.length) return;
    try {
      setBulkBusy(true);
      const res = await fetch('/api/admin/events/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ids: selectedList,
          action,
          country: action === 'set-country' ? bulkCountry : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Bulk action failed');

      if (action === 'delete') {
        setEvents((prev) => prev.filter((e) => !selectedIds.has(e._id)));
      } else if (action === 'publish') {
        setEvents((prev) => prev.map((e) => (selectedIds.has(e._id) ? { ...e, status: 'published' } : e)));
      } else if (action === 'pause') {
        setEvents((prev) => prev.map((e) => (selectedIds.has(e._id) ? { ...e, status: 'draft' } : e)));
      } else if (action === 'set-country') {
        setEvents((prev) =>
          prev.map((e) => (selectedIds.has(e._id) ? { ...e, scope: 'country', country: bulkCountry } : e))
        );
      } else if (action === 'set-global') {
        setEvents((prev) =>
          prev.map((e) => (selectedIds.has(e._id) ? { ...e, scope: 'global', country: undefined } : e))
        );
      }
      setSelectedIds(new Set());
    } catch (err: any) {
      alert(err?.message || 'Bulk action failed');
    } finally {
      setBulkBusy(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-500">
        Drag cards to reorder visibility priority {savingOrder ? '(saving...)' : ''}
      </div>

      <div className="glass-card-premium rounded-2xl border border-white/10 p-3 flex flex-wrap items-center gap-2">
        <Button type="button" variant="ghost" onClick={toggleSelectAll} className="border border-white/10 bg-white/5 text-slate-200">
          <CheckSquare className="w-4 h-4 mr-2" />
          {selectedIds.size === events.length ? 'Clear All' : 'Select All'}
        </Button>
        <span className="text-xs text-slate-400 uppercase tracking-widest font-black">
          Selected: {selectedIds.size}
        </span>
        <Button type="button" disabled={bulkBusy || !selectedList.length} onClick={() => runBulk('publish')} className="bg-emerald-500/20 text-emerald-200 border border-emerald-400/30">
          Publish
        </Button>
        <Button type="button" disabled={bulkBusy || !selectedList.length} onClick={() => runBulk('pause')} className="bg-amber-500/20 text-amber-200 border border-amber-400/30">
          Pause
        </Button>
        <Button type="button" disabled={bulkBusy || !selectedList.length} onClick={() => runBulk('set-global')} className="bg-blue-500/20 text-blue-200 border border-blue-400/30">
          Set Global
        </Button>
        <select
          value={bulkCountry}
          onChange={(e) => setBulkCountry(e.target.value)}
          className="h-10 bg-white/5 border border-white/10 rounded-xl px-3 text-slate-100"
        >
          {['Nepal', 'USA', 'India', 'UK', 'Australia', 'Japan', 'China'].map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <Button type="button" disabled={bulkBusy || !selectedList.length} onClick={() => runBulk('set-country')} className="bg-indigo-500/20 text-indigo-200 border border-indigo-400/30">
          Set Country
        </Button>
        <Button type="button" disabled={bulkBusy || !selectedList.length} onClick={() => runBulk('delete')} className="bg-red-500/20 text-red-200 border border-red-400/30">
          Delete
        </Button>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={ids} strategy={verticalListSortingStrategy}>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {events.map((event) => (
              <Row key={event._id} event={event} selected={selectedIds.has(event._id)} onToggle={toggleSelect} />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
