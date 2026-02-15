import { getDatabase } from '@/lib/mongodb';

export type NewsAuthorProfile = {
  authorId: string;
  name: string;
  email?: string;
  role?: string;
  bio?: string;
  profilePicture?: string;
};

function fallbackAuthorLabel(authorId?: string) {
  if (!authorId) return 'Unknown Desk';
  if (authorId === 'system') return 'System Desk';
  return `Desk ${authorId.slice(0, 6).toUpperCase()}`;
}

export async function getNewsAuthorsByIds(authorIds: string[]): Promise<Map<string, NewsAuthorProfile>> {
  const map = new Map<string, NewsAuthorProfile>();
  const ids = Array.from(new Set(authorIds.filter(Boolean)));
  if (!ids.length) return map;

  try {
    const db = await getDatabase();
    const users = await db
      .collection('users')
      .find({ clerkId: { $in: ids } })
      .project({ clerkId: 1, name: 1, firstName: 1, lastName: 1, email: 1, role: 1, bio: 1, profilePicture: 1 })
      .toArray();

    for (const user of users as any[]) {
      const authorId = user.clerkId;
      if (!authorId) continue;
      const name =
        user.name ||
        `${user.firstName || ''} ${user.lastName || ''}`.trim() ||
        user.email ||
        fallbackAuthorLabel(authorId);

      map.set(authorId, {
        authorId,
        name,
        email: user.email,
        role: user.role,
        bio: user.bio,
        profilePicture: user.profilePicture,
      });
    }
  } catch {
    // Optional enrichment only.
  }

  for (const authorId of ids) {
    if (!map.has(authorId)) {
      map.set(authorId, { authorId, name: fallbackAuthorLabel(authorId) });
    }
  }

  return map;
}

export async function getNewsAuthorById(authorId: string): Promise<NewsAuthorProfile> {
  const map = await getNewsAuthorsByIds([authorId]);
  return map.get(authorId) || { authorId, name: fallbackAuthorLabel(authorId) };
}
