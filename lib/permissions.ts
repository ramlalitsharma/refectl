export type PermissionKey =
  | 'superadmin:access'
  | 'admin:access'
  | 'teacher:access'
  | 'admin:create'
  | 'teacher:create'
  | 'student:create'
  | 'content:create'
  | 'content:publish'
  | 'content:moderate'
  | 'users:manage'
  | 'users:create'
  | 'users:delete'
  | 'roles:manage'
  | 'analytics:view'
  | 'finance:view'
  | 'notifications:manage'
  | 'schemas:manage'
  | 'videos:manage';

export const PERMISSION_OPTIONS: { key: PermissionKey; label: string; description: string; category: string }[] = [
  // Super Admin Permissions
  { key: 'superadmin:access', label: 'Super Admin Access', description: 'Full system access, can manage all admins and teachers.', category: 'Super Admin' },
  { key: 'admin:create', label: 'Create Admins', description: 'Allows creating new admin users.', category: 'Super Admin' },
  { key: 'teacher:create', label: 'Create Teachers', description: 'Allows creating new teacher users.', category: 'Super Admin' },
  { key: 'student:create', label: 'Create Students', description: 'Allows creating new student user accounts.', category: 'Super Admin' },
  { key: 'users:delete', label: 'Delete Users', description: 'Allows permanently deleting user accounts (students, teachers, admins).', category: 'Super Admin' },
  { key: 'roles:manage', label: 'Manage Roles', description: 'Allows creating and editing role definitions.', category: 'Super Admin' },
  
  // Admin Permissions
  { key: 'admin:access', label: 'Admin Access', description: 'Grants access to admin console and protected tools.', category: 'Admin' },
  { key: 'users:manage', label: 'Manage Users', description: 'Allows viewing and editing user accounts and enrollments.', category: 'Admin' },
  { key: 'users:create', label: 'Create Users', description: 'Allows creating new user accounts (teachers).', category: 'Admin' },
  { key: 'content:moderate', label: 'Moderate Content', description: 'Allows moderating reviews, tickets, and user submissions.', category: 'Admin' },
  { key: 'analytics:view', label: 'View Analytics', description: 'Allows accessing analytics dashboards and reports.', category: 'Admin' },
  { key: 'finance:view', label: 'View Financials', description: 'Allows viewing subscription revenue and financial metrics.', category: 'Admin' },
  { key: 'notifications:manage', label: 'Manage Notifications', description: 'Allows editing notification templates and triggers.', category: 'Admin' },
  { key: 'schemas:manage', label: 'Manage Content Schemas', description: 'Allows creating and editing schema definitions for studios.', category: 'Admin' },
  { key: 'videos:manage', label: 'Manage Videos', description: 'Allows managing video library and linking videos to courses.', category: 'Admin' },
  
  // Teacher Permissions
  { key: 'teacher:access', label: 'Teacher Access', description: 'Grants access to teacher dashboard and course creation tools.', category: 'Teacher' },
  { key: 'content:create', label: 'Create Content', description: 'Allows creating courses, blogs, tutorials, exams, etc.', category: 'Teacher' },
  { key: 'content:publish', label: 'Publish Content', description: 'Allows publishing and scheduling content.', category: 'Teacher' },
];
