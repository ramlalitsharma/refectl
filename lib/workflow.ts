import { getDatabase } from './mongodb';
import { ContentType } from './models/ContentVersion';
import { WORKFLOW_STATUSES, isValidStatus } from './workflow-status';

export { WORKFLOW_STATUSES, isValidStatus };

export async function recordContentVersion({
  contentType,
  contentId,
  status,
  snapshot,
  changeNote,
  changedBy,
}: {
  contentType: ContentType;
  contentId: string;
  status: string;
  snapshot: any;
  changeNote?: string | null;
  changedBy: string;
}) {
  const db = await getDatabase();
  const versionNumber = (await db.collection('contentVersions').countDocuments({ contentType, contentId })) + 1;

  await db.collection('contentVersions').insertOne({
    contentType,
    contentId,
    version: versionNumber,
    status,
    snapshot,
    changeNote: changeNote || null,
    changedBy,
    createdAt: new Date(),
  });
}
