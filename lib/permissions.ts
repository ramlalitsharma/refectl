export type PermissionKey =
  | 'admin:access'
  | 'content:create'
  | 'content:publish'
  | 'content:moderate'
  | 'users:manage'
  | 'analytics:view'
  | 'finance:view'
  | 'notifications:manage'
  | 'schemas:manage';

export const PERMISSION_OPTIONS: { key: PermissionKey; label: string; description: string }[] = [
  { key: 'admin:access', label: 'Admin Access', description: 'Grants access to admin console and protected tools.' },
  { key: 'content:create', label: 'Create Content', description: 'Allows creating courses, blogs, tutorials, exams, etc.' },
  { key: 'content:publish', label: 'Publish Content', description: 'Allows publishing and scheduling content.' },
  { key: 'content:moderate', label: 'Moderate Content', description: 'Allows moderating reviews, tickets, and user submissions.' },
  { key: 'users:manage', label: 'Manage Users', description: 'Allows viewing and editing user accounts and enrollments.' },
  { key: 'analytics:view', label: 'View Analytics', description: 'Allows accessing analytics dashboards and reports.' },
  { key: 'finance:view', label: 'View Financials', description: 'Allows viewing subscription revenue and financial metrics.' },
  { key: 'notifications:manage', label: 'Manage Notifications', description: 'Allows editing notification templates and triggers.' },
  { key: 'schemas:manage', label: 'Manage Content Schemas', description: 'Allows creating and editing schema definitions for studios.' },
];
