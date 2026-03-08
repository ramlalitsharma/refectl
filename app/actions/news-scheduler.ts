'use server';

import { requireContentWriter } from '@/lib/admin-check';
import { NewsAutomationService } from '@/lib/news-automation';
import { NewsWorkflowService } from '@/lib/news-workflow';
import { revalidatePath } from 'next/cache';

export async function runRoamingScrapeNowAction(formData: FormData) {
  await requireContentWriter();
  const count = Number(formData.get('count') || '1');
  const finalCount = Math.max(1, Math.min(6, count));
  const ingested = await NewsAutomationService.ingestRoamingGlobalNews(finalCount);
  revalidatePath('/admin/studio/news/scheduler');
  return { ok: true, ingested: ingested.length };
}

export async function runApprovalQueueNowAction() {
  await requireContentWriter();
  await NewsWorkflowService.processApprovalQueue();
  revalidatePath('/admin/studio/news/scheduler');
  return { ok: true };
}

export async function runMaintenanceNowAction() {
  await requireContentWriter();
  await NewsWorkflowService.performMaintenance();
  revalidatePath('/admin/studio/news/scheduler');
  return { ok: true };
}
