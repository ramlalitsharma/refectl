/**
 * Role-Based Navigation Configuration
 * Defines navigation links and features for each user role
 */

export type UserRole = 'superadmin' | 'admin' | 'teacher' | 'student';

export interface NavLink {
  href: string;
  label: string;
  icon?: string;
  badge?: string;
  requiresPermission?: string;
}

export interface RoleNavigationConfig {
  primaryLinks: NavLink[];
  dashboardLink: { href: string; label: string };
  consoleLink?: { href: string; label: string };
  showAdminBadge: boolean;
  showViewAs: boolean;
}

export const ROLE_NAVIGATION: Record<UserRole, RoleNavigationConfig> = {
  superadmin: {
    primaryLinks: [
      { href: '/courses', label: 'Courses', icon: '📚' },
      { href: '/quizzes', label: 'Quizzes', icon: '📝' },
      { href: '/question-bank', label: 'Question Bank', icon: '🗂️' },
      { href: '/blog', label: 'Blogs', icon: '📰' },
      { href: '/admin/super', label: 'Super Admin', icon: '🛡️' },
      { href: '/admin', label: 'Admin Panel', icon: '👨‍💼' },
      { href: '/admin/users', label: 'Users', icon: '👥' },
      { href: '/admin/analytics', label: 'Analytics', icon: '📊' },
      { href: '/admin/settings', label: 'Settings', icon: '⚙️' },
      { href: '/live', label: 'Live Classes', icon: '🎥' },
      { href: '/forum', label: 'Forum', icon: '💬' },
    ],
    dashboardLink: { href: '/admin/super', label: 'Super Admin Console' },
    consoleLink: { href: '/admin/super', label: 'Super Admin Console' },
    showAdminBadge: true,
    showViewAs: true,
  },
  admin: {
    primaryLinks: [
      { href: '/courses', label: 'Courses', icon: '📚' },
      { href: '/quizzes', label: 'Quizzes', icon: '📝' },
      { href: '/question-bank', label: 'Question Bank', icon: '🗂️' },
      { href: '/blog', label: 'Blogs', icon: '📰' },
      { href: '/admin', label: 'Admin Panel', icon: '👨‍💼' },
      { href: '/admin/users', label: 'Users', icon: '👥' },
      { href: '/admin/courses', label: 'Manage Courses', icon: '📚' },
      { href: '/admin/analytics', label: 'Analytics', icon: '📊' },
      { href: '/admin/videos', label: 'Videos', icon: '🎥' },
      { href: '/live', label: 'Live Classes', icon: '🎥' },
      { href: '/forum', label: 'Forum', icon: '💬' },
    ],
    dashboardLink: { href: '/admin/dashboard', label: 'Admin Dashboard' },
    consoleLink: { href: '/admin', label: 'Admin Console' },
    showAdminBadge: true,
    showViewAs: false,
  },
  teacher: {
    primaryLinks: [
      { href: '/courses', label: 'Courses', icon: '📚' },
      { href: '/quizzes', label: 'Quizzes', icon: '📝' },
      { href: '/question-bank', label: 'Question Bank', icon: '🗂️' },
      { href: '/blog', label: 'Blogs', icon: '📰' },
      { href: '/teacher/dashboard', label: 'Teacher Dashboard', icon: '👨‍🏫' },
      { href: '/admin/studio/courses', label: 'Create Course', icon: '➕' },
      { href: '/admin/studio/blogs', label: 'Write Blog', icon: '✍️' },
      { href: '/admin/studio/questions', label: 'Create Quiz', icon: '❓' },
      { href: '/admin/courses', label: 'My Courses', icon: '📚' },
      { href: '/live', label: 'Live Classes', icon: '🎥' },
    ],
    dashboardLink: { href: '/teacher/dashboard', label: 'Teacher Dashboard' },
    showAdminBadge: false,
    showViewAs: false,
  },
  student: {
    primaryLinks: [
      { href: '/courses', label: 'Courses', icon: '📚' },
      { href: '/quizzes', label: 'Quizzes', icon: '📝' },
      { href: '/question-bank', label: 'Question Bank', icon: '🗂️' },
      { href: '/blog', label: 'Blogs', icon: '📰' },
      { href: '/dashboard', label: 'My Dashboard', icon: '📊' },
      { href: '/my-learning', label: 'My Learning', icon: '📖' },
      { href: '/subjects', label: 'Subjects', icon: '📚' },
      { href: '/live', label: 'Live Classes', icon: '🎥' },
      { href: '/forum', label: 'Forum', icon: '💬' },
      { href: '/contact', label: 'Contact', icon: '📧' },
    ],
    dashboardLink: { href: '/dashboard', label: 'My Dashboard' },
    showAdminBadge: false,
    showViewAs: false,
  },
};

/**
 * Get navigation config for a role, considering "View As" context
 */
export function getNavigationForRole(
  role: UserRole | null,
  viewAsRole: UserRole | null = null
): RoleNavigationConfig {
  // If viewing as another role, use that role's navigation
  const effectiveRole = viewAsRole || role || 'student';
  return ROLE_NAVIGATION[effectiveRole] || ROLE_NAVIGATION.student;
}

/**
 * Get the effective role considering "View As" context
 */
export function getEffectiveRole(
  actualRole: UserRole | null,
  viewAsRole: UserRole | null = null
): UserRole {
  return viewAsRole || actualRole || 'student';
}

