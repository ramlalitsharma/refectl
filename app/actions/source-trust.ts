'use server';

import { requireContentWriter } from '@/lib/admin-check';
import { addSourceHost, removeSourceHost } from '@/lib/source-trust-store';
import { revalidatePath } from 'next/cache';

export async function addTrustedSourceAction(formData: FormData) {
  await requireContentWriter();
  const input = String(formData.get('host') || '').trim();
  if (!input) return { error: 'Missing host' };
  const { auth } = await import('@clerk/nextjs/server');
  const { userId } = await auth();
  const res = await addSourceHost('trusted', input, userId || undefined);
  revalidatePath('/admin/studio/news/source-trust');
  return res;
}

export async function removeTrustedSourceAction(formData: FormData) {
  await requireContentWriter();
  const input = String(formData.get('host') || '').trim();
  if (!input) return { error: 'Missing host' };
  const res = await removeSourceHost('trusted', input);
  revalidatePath('/admin/studio/news/source-trust');
  return res;
}

export async function addBlockedSourceAction(formData: FormData) {
  await requireContentWriter();
  const input = String(formData.get('host') || '').trim();
  if (!input) return { error: 'Missing host' };
  const { auth } = await import('@clerk/nextjs/server');
  const { userId } = await auth();
  const res = await addSourceHost('blocked', input, userId || undefined);
  revalidatePath('/admin/studio/news/source-trust');
  return res;
}

export async function removeBlockedSourceAction(formData: FormData) {
  await requireContentWriter();
  const input = String(formData.get('host') || '').trim();
  if (!input) return { error: 'Missing host' };
  const res = await removeSourceHost('blocked', input);
  revalidatePath('/admin/studio/news/source-trust');
  return res;
}
