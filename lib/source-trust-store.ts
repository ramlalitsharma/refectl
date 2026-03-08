import { getDatabase } from '@/lib/mongodb';

export type SourceListKind = 'trusted' | 'blocked';

type SourceRecord = {
  host: string;
  createdAt: Date;
  createdBy?: string;
  kind: SourceListKind;
};

function normalizeHost(input: string): string | null {
  const raw = input.trim().toLowerCase();
  if (!raw) return null;
  if (raw.startsWith('http://') || raw.startsWith('https://')) {
    try {
      const host = new URL(raw).hostname.replace(/^www\./, '');
      return host;
    } catch {
      return null;
    }
  }
  return raw.replace(/^www\./, '');
}

async function getCollection() {
  try {
    const db = await getDatabase();
    return db.collection<SourceRecord>('news_source_lists');
  } catch (error) {
    console.warn('Source trust store unavailable:', error);
    return null;
  }
}

export async function getSourceHosts(kind: SourceListKind): Promise<string[]> {
  const collection = await getCollection();
  if (!collection) return [];
  const records = await collection.find({ kind }).toArray();
  return records.map((r) => r.host);
}

export async function addSourceHost(kind: SourceListKind, input: string, createdBy?: string) {
  const host = normalizeHost(input);
  if (!host) return { error: 'Invalid host' };

  const collection = await getCollection();
  if (!collection) return { error: 'Storage unavailable' };

  await collection.updateOne(
    { host, kind },
    { $setOnInsert: { host, kind, createdAt: new Date(), createdBy } },
    { upsert: true }
  );

  return { ok: true, host };
}

export async function removeSourceHost(kind: SourceListKind, input: string) {
  const host = normalizeHost(input);
  if (!host) return { error: 'Invalid host' };

  const collection = await getCollection();
  if (!collection) return { error: 'Storage unavailable' };

  await collection.deleteOne({ host, kind });
  return { ok: true, host };
}

export function parseHost(input: string): string | null {
  return normalizeHost(input);
}
