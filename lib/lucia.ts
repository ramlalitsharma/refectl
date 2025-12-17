import { cookies } from 'next/headers';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { getDatabase } from './mongodb';

const SESSION_COOKIE = 'adaptiq_session';
const SESSION_TTL_DAYS = 30;

export interface LuciaSession {
  token: string;
  userId: string;
  createdAt: Date;
  expiresAt: Date;
}

export async function luciaCreateUser(email: string, password: string, name?: string) {
  const db = await getDatabase();
  const users = db.collection('users');
  const existing = await users.findOne({ email: email.toLowerCase() });
  if (existing) throw new Error('Email already in use');
  const hash = await bcrypt.hash(password, 11);
  const now = new Date();
  const doc = {
    email: email.toLowerCase(),
    name: name || '',
    passwordHash: hash,
    subscriptionTier: 'free',
    createdAt: now,
    updatedAt: now,
    learningProgress: { totalQuizzesTaken: 0, averageScore: 0, masteryLevel: 0, knowledgeGaps: [] },
    preferences: { difficultyPreference: 'adaptive', language: 'en' },
  };
  const res = await users.insertOne(doc as any);
  return { id: String(res.insertedId), email: doc.email, name: doc.name };
}

export async function luciaSignIn(email: string, password: string) {
  const db = await getDatabase();
  const users = db.collection('users');
  const u: any = await users.findOne({ email: email.toLowerCase() });
  if (!u || !u.passwordHash) throw new Error('Invalid credentials');
  const ok = await bcrypt.compare(password, u.passwordHash);
  if (!ok) throw new Error('Invalid credentials');
  const session = await createSession(String(u._id));
  setSessionCookie(session.token, session.expiresAt);
  return { id: String(u._id), email: u.email, name: u.name };
}

export async function luciaSignOut() {
  const token = await getSessionToken();
  if (token) {
    const db = await getDatabase();
    await db.collection('sessions').deleteOne({ token });
  }
  clearSessionCookie();
}

export async function luciaCurrentUser() {
  const token = await getSessionToken();
  if (!token) return null;
  const db = await getDatabase();
  const sessions = db.collection('sessions');
  const s: any = await sessions.findOne({ token });
  if (!s) return null;
  if (new Date(s.expiresAt).getTime() < Date.now()) {
    await sessions.deleteOne({ token });
    clearSessionCookie();
    return null;
  }
  const user = await db.collection('users').findOne({ _id: s.userId ? s.userId : undefined });
  if (!user) return null;
  return { id: String(user._id), email: user.email, firstName: String(user.name || '').split(' ')[0] };
}

async function createSession(userId: string): Promise<LuciaSession> {
  const db = await getDatabase();
  const token = crypto.randomBytes(32).toString('hex');
  const now = new Date();
  const expiresAt = new Date(now.getTime() + SESSION_TTL_DAYS * 24 * 60 * 60 * 1000);
  const session: LuciaSession = { token, userId, createdAt: now, expiresAt };
  await db.collection('sessions').insertOne(session as any);
  return session;
}

async function getSessionToken() {
  const c = await cookies();
  return c.get(SESSION_COOKIE)?.value || null;
}

function isSecureContext() {
  if (typeof process !== 'undefined' && process.env.NODE_ENV === 'production') {
    return true;
  }
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || '';
  return baseUrl.startsWith('https://');
}

async function setSessionCookie(token: string, expires: Date) {
  const c = await cookies();
  c.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: isSecureContext(),
    sameSite: 'lax',
    path: '/',
    expires,
  });
}

async function clearSessionCookie() {
  const c = await cookies();
  c.set(SESSION_COOKIE, '', {
    httpOnly: true,
    secure: isSecureContext(),
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
}


