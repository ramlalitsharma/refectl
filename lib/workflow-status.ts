export const WORKFLOW_STATUSES = ['draft', 'in_review', 'approved', 'published', 'archived'] as const;

export type WorkflowStatus = (typeof WORKFLOW_STATUSES)[number];

export function isValidStatus(status: string): status is WorkflowStatus {
  return WORKFLOW_STATUSES.includes(status as WorkflowStatus);
}
