import { ObjectId } from 'mongodb';
import { getDatabase } from '@/lib/mongodb';
import { NewsEvent, NewsEventMetric } from '@/lib/models/NewsEvent';

const COLLECTION = 'newsEvents';

function normalizeSlug(input: string) {
  return (input || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function parseMetrics(input: unknown): NewsEventMetric[] {
  if (Array.isArray(input)) {
    return input
      .map((item: any) => ({
        label: String(item?.label || '').trim(),
        value: String(item?.value || '').trim(),
        cta: String(item?.cta || '').trim() || undefined,
      }))
      .filter((m) => m.label && m.value);
  }
  return [];
}

function toMs(value?: string): number | null {
  if (!value) return null;
  const t = new Date(value).getTime();
  return Number.isNaN(t) ? null : t;
}

function isWithinSchedule(event: Partial<NewsEvent>, nowMs: number): boolean {
  const startMs = toMs(event.startsAt);
  const endMs = toMs(event.endsAt);
  if (startMs !== null && nowMs < startMs) return false;
  if (endMs !== null && nowMs > endMs) return false;
  return true;
}

export const NewsEventService = {
  async getAllEvents(): Promise<NewsEvent[]> {
    const db = await getDatabase();
    const events = await db
      .collection(COLLECTION)
      .find({})
      .sort({ updatedAt: -1 })
      .toArray();
    return events as any;
  },

  async getEventById(id: string): Promise<NewsEvent | null> {
    const db = await getDatabase();
    if (!ObjectId.isValid(id)) return null;
    const event = await db.collection(COLLECTION).findOne({ _id: new ObjectId(id) });
    return (event as any) || null;
  },

  async getEventBySlug(slug: string): Promise<NewsEvent | null> {
    const db = await getDatabase();
    const event = await db.collection(COLLECTION).findOne({ slug: normalizeSlug(slug), status: 'published' });
    if (!event) return null;
    const nowMs = Date.now();
    return isWithinSchedule(event as any, nowMs) ? (event as any) : null;
  },

  async getPublishedForNews(country: string = 'All', limit: number = 4): Promise<NewsEvent[]> {
    const db = await getDatabase();
    const query: any = { status: 'published' };
    if (country && country !== 'All') {
      query.$or = [{ scope: 'global' }, { scope: 'country', country }];
    } else {
      query.scope = 'global';
    }

    const events = await db
      .collection(COLLECTION)
      .find(query)
      .sort({ priority: -1, startsAt: -1, updatedAt: -1 })
      .limit(limit)
      .toArray();

    const nowMs = Date.now();
    return (events as any[]).filter((e) => isWithinSchedule(e, nowMs)) as any;
  },

  async getPublishedForHome(limit: number = 4): Promise<NewsEvent[]> {
    const db = await getDatabase();
    const events = await db
      .collection(COLLECTION)
      .find({ status: 'published' })
      .sort({ priority: -1, startsAt: -1, updatedAt: -1 })
      .limit(limit)
      .toArray();
    const nowMs = Date.now();
    return (events as any[]).filter((e) => isWithinSchedule(e, nowMs)) as any;
  },

  async upsertEvent(input: Partial<NewsEvent> & { createdBy: string }): Promise<NewsEvent> {
    const db = await getDatabase();
    const now = new Date().toISOString();
    const slug = normalizeSlug(input.slug || input.title || '');
    if (!slug) throw new Error('Slug/title is required');

    const payload: Partial<NewsEvent> = {
      slug,
      title: String(input.title || '').trim(),
      summary: String(input.summary || '').trim() || undefined,
      eventType: String(input.eventType || '').trim() || undefined,
      scope: (input.scope === 'country' ? 'country' : 'global'),
      country: input.scope === 'country' ? String(input.country || '').trim() : undefined,
      status: input.status === 'published' ? 'published' : 'draft',
      priority: Number.isFinite(Number(input.priority)) ? Number(input.priority) : 0,
      startsAt: input.startsAt || undefined,
      endsAt: input.endsAt || undefined,
      bannerLeftLabel: String(input.bannerLeftLabel || '').trim() || undefined,
      bannerLeftValue: String(input.bannerLeftValue || '').trim() || undefined,
      bannerRightLabel: String(input.bannerRightLabel || '').trim() || undefined,
      bannerRightValue: String(input.bannerRightValue || '').trim() || undefined,
      bannerCenterText: String(input.bannerCenterText || '').trim() || undefined,
      badgeText: String(input.badgeText || '').trim() || undefined,
      metrics: parseMetrics(input.metrics),
      metaTitle: String(input.metaTitle || '').trim() || undefined,
      metaDescription: String(input.metaDescription || '').trim() || undefined,
      updatedAt: now,
    };

    if (!payload.title) throw new Error('Title is required');
    if (payload.scope === 'country' && !payload.country) {
      throw new Error('Country is required for country events');
    }

    if (input._id) {
      const id = String(input._id);
      if (!ObjectId.isValid(id)) throw new Error('Invalid event id');
      await db.collection(COLLECTION).updateOne(
        { _id: new ObjectId(id) },
        { $set: payload }
      );
      const saved = await db.collection(COLLECTION).findOne({ _id: new ObjectId(id) });
      if (!saved) throw new Error('Event not found after update');
      return saved as any;
    }

    const created: NewsEvent = {
      ...(payload as NewsEvent),
      createdBy: input.createdBy,
      createdAt: now,
      updatedAt: now,
    };
    const res = await db.collection(COLLECTION).insertOne(created as any);
    const saved = await db.collection(COLLECTION).findOne({ _id: res.insertedId });
    if (!saved) throw new Error('Event not found after create');
    return saved as any;
  },

  async deleteEvent(id: string): Promise<void> {
    const db = await getDatabase();
    if (!ObjectId.isValid(id)) throw new Error('Invalid event id');
    await db.collection(COLLECTION).deleteOne({ _id: new ObjectId(id) });
  },

  async bulkUpdate(ids: string[], updates: Partial<NewsEvent>): Promise<number> {
    const db = await getDatabase();
    const objectIds = ids.filter((id) => ObjectId.isValid(id)).map((id) => new ObjectId(id));
    if (!objectIds.length) return 0;
    const now = new Date().toISOString();
    const { modifiedCount } = await db.collection(COLLECTION).updateMany(
      { _id: { $in: objectIds } },
      { $set: { ...updates, updatedAt: now } }
    );
    return modifiedCount;
  },

  async bulkDelete(ids: string[]): Promise<number> {
    const db = await getDatabase();
    const objectIds = ids.filter((id) => ObjectId.isValid(id)).map((id) => new ObjectId(id));
    if (!objectIds.length) return 0;
    const { deletedCount } = await db.collection(COLLECTION).deleteMany({ _id: { $in: objectIds } });
    return deletedCount || 0;
  },

  async setEventOrder(ids: string[]): Promise<void> {
    const db = await getDatabase();
    const cleanIds = ids.filter((id) => ObjectId.isValid(id));
    if (!cleanIds.length) return;

    await Promise.all(
      cleanIds.map((id, index) =>
        db.collection(COLLECTION).updateOne(
          { _id: new ObjectId(id) },
          { $set: { priority: cleanIds.length - index, updatedAt: new Date().toISOString() } }
        )
      )
    );
  },
};
