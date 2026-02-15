/**
 * Role-Based Navigation Configuration
 * Defines navigation links and features for each user role
 */

export type UserRole = 'superadmin' | 'admin' | 'teacher' | 'content_writer' | 'news_writer' | 'student' | 'user' | 'guest';

export interface NavLink {
  href: string;
  label: string;
  icon?: string;
  badge?: string;
  requiresPermission?: string;
}

export interface NavDropdown {
  label: string;
  icon?: string;
  items: NavLink[];
}

export type NavItem = NavLink | NavDropdown;

export function isDropdown(item: NavItem): item is NavDropdown {
  return 'items' in item;
}

export interface RoleNavigationConfig {
  primaryLinks: NavItem[];
  dashboardLink: { href: string; label: string };
  consoleLink?: { href: string; label: string };
  showAdminBadge: boolean;
  showViewAs: boolean;
}

export const ROLE_NAVIGATION: Record<UserRole, RoleNavigationConfig> = {
  superadmin: {
    primaryLinks: [
      {
        label: 'Courses',
        icon: '📚',
        items: [
          { href: '/courses', label: 'All Courses', icon: '📚' },
          { href: '/courses?type=video', label: 'Video Classes', icon: '🎞️' },
          { href: '/courses?type=text', label: 'Text Classes', icon: '📄' },
          { href: '/ebooks', label: 'Ebooks Library', icon: '📘' },
          { href: '/live', label: 'Live Classes', icon: '🎥' },
        ],
      },
      { href: '/shop', label: 'Forge Shop', icon: '🛒' },
      { href: '/pricing', label: 'Pricing', icon: '💎' },
      {
        label: 'Updates',
        icon: '🔔',
        items: [
          { href: '/blog', label: 'Blog', icon: '✍️' },
          { href: '/news', label: 'News', icon: '📰' },
          { href: '/forum', label: 'Forum', icon: '💬' },
        ],
      },
      {
        label: 'Resources',
        icon: '📚',
        items: [
          { href: '/question-bank', label: 'Question Bank', icon: '🗂️' },
          { href: '/quizzes', label: 'Quizzes', icon: '📝' },
        ],
      },
      {
        label: 'Tool',
        icon: '🛠️',
        items: [
          { href: '/tools/code', label: 'Code Editor', icon: '💻' },
          { href: '/tools/whiteboard', label: 'Whiteboard', icon: '🖍️' },
        ],
      },
      {
        label: 'Admin',
        icon: '🛡️',
        items: [
          { href: '/admin/super', label: 'Super Admin', icon: '🛡️' },
          { href: '/admin', label: 'Admin Panel', icon: '👨‍💼' },
          { href: '/admin/users', label: 'Users', icon: '👥' },
          { href: '/admin/analytics', label: 'Analytics', icon: '📊' },
          { href: '/admin/logs', label: 'Audit Logs', icon: '🛡️' },
          { href: '/admin/compliance', label: 'Compliance', icon: '⚖️' },
          { href: '/admin/proctoring', label: 'Proctoring Center', icon: '🛡️' },
          { href: '/admin/settings', label: 'Settings', icon: '⚙️' },
        ],
      },
    ],
    dashboardLink: { href: '/admin/super', label: 'Super Admin Console' },
    consoleLink: { href: '/admin/super', label: 'Super Admin Console' },
    showAdminBadge: true,
    showViewAs: true,
  },
  admin: {
    primaryLinks: [
      {
        label: 'Courses',
        icon: '📚',
        items: [
          { href: '/courses', label: 'All Courses', icon: '📚' },
          { href: '/courses?type=video', label: 'Video Classes', icon: '🎞️' },
          { href: '/courses?type=text', label: 'Text Classes', icon: '📄' },
          { href: '/ebooks', label: 'Ebooks Library', icon: '📘' },
          { href: '/live', label: 'Live Classes', icon: '🎥' },
        ],
      },
      { href: '/shop', label: 'Forge Shop', icon: '🛒' },
      { href: '/pricing', label: 'Pricing', icon: '💎' },
      {
        label: 'Updates',
        icon: '🔔',
        items: [
          { href: '/blog', label: 'Blog', icon: '✍️' },
          { href: '/news', label: 'News', icon: '📰' },
          { href: '/forum', label: 'Forum', icon: '💬' },
        ],
      },
      {
        label: 'Resources',
        icon: '📚',
        items: [
          { href: '/question-bank', label: 'Question Bank', icon: '🗂️' },
          { href: '/quizzes', label: 'Quizzes', icon: '📝' },
        ],
      },
      {
        label: 'Tool',
        icon: '🛠️',
        items: [
          { href: '/tools/code', label: 'Code Editor', icon: '💻' },
          { href: '/tools/whiteboard', label: 'Whiteboard', icon: '🖍️' },
        ],
      },
      {
        label: 'Admin',
        icon: '👨‍💼',
        items: [
          { href: '/admin', label: 'Admin Panel', icon: '👨‍💼' },
          { href: '/admin/users', label: 'Users', icon: '👥' },
          { href: '/admin/courses', label: 'Manage Courses', icon: '📚' },
          { href: '/admin/analytics', label: 'Analytics', icon: '📊' },
          { href: '/admin/logs', label: 'Audit Logs', icon: '🛡️' },
          { href: '/admin/compliance', label: 'Compliance', icon: '⚖️' },
          { href: '/admin/proctoring', label: 'Proctoring Center', icon: '🛡️' },
          { href: '/admin/videos', label: 'Videos', icon: '🎥' },
        ],
      },
    ],
    dashboardLink: { href: '/admin/dashboard', label: 'Admin Dashboard' },
    consoleLink: { href: '/admin', label: 'Admin Console' },
    showAdminBadge: true,
    showViewAs: false,
  },
  teacher: {
    primaryLinks: [
      {
        label: 'Courses',
        icon: '📚',
        items: [
          { href: '/courses', label: 'All Courses', icon: '📚' },
          { href: '/courses?type=video', label: 'Video Courses', icon: '🎞️' },
          { href: '/courses?type=text', label: 'Courses Classes', icon: '📄' },
          { href: '/ebooks', label: 'Ebooks Library', icon: '📘' },
          { href: '/live', label: 'Live Classes', icon: '🎥' },
        ],
      },
      { href: '/shop', label: 'Forge Shop', icon: '🛒' },
      { href: '/pricing', label: 'Pricing', icon: '💎' },
      {
        label: 'Updates',
        icon: '🔔',
        items: [
          { href: '/blog', label: 'Blog', icon: '✍️' },
          { href: '/news', label: 'News', icon: '📰' },
          { href: '/forum', label: 'Forum', icon: '💬' },
        ],
      },
      {
        label: 'Resources',
        icon: '📚',
        items: [
          { href: '/question-bank', label: 'Question Bank', icon: '🗂️' },
          { href: '/quizzes', label: 'Quizzes', icon: '📝' },
        ],
      },
      {
        label: 'Tool',
        icon: '🛠️',
        items: [
          { href: '/tools/code', label: 'Code Editor', icon: '💻' },
          { href: '/tools/whiteboard', label: 'Whiteboard', icon: '🖍️' },
        ],
      },
      {
        label: 'Teaching',
        icon: '👨‍🏫',
        items: [
          { href: '/teacher/dashboard', label: 'Teacher Dashboard', icon: '👨‍🏫' },
          { href: '/admin/studio/courses', label: 'Create Course', icon: '➕' },
          { href: '/admin/studio/blogs', label: 'Write Blog', icon: '✍️' },
          { href: '/admin/studio/questions', label: 'Create Quiz', icon: '❓' },
          { href: '/admin/courses', label: 'My Courses', icon: '📚' },
        ],
      },
    ],
    dashboardLink: { href: '/teacher/dashboard', label: 'Teacher Dashboard' },
    showAdminBadge: false,
    showViewAs: false,
  },
  content_writer: {
    primaryLinks: [
      {
        label: 'Studio',
        icon: '🎙️',
        items: [
          { href: '/admin/studio/news', label: 'News Studio', icon: '📰' },
          { href: '/admin/studio/blogs', label: 'Blog Studio', icon: '✍️' },
        ],
      },
      {
        label: 'Updates',
        icon: '🔔',
        items: [
          { href: '/blog', label: 'Blog', icon: '✍️' },
          { href: '/news', label: 'News', icon: '📰' },
        ],
      },
    ],
    dashboardLink: { href: '/admin/studio/news', label: 'News Studio' },
    showAdminBadge: true,
    showViewAs: false,
  },
  student: {
    primaryLinks: [
      {
        label: 'Courses',
        icon: '📚',
        items: [
          { href: '/courses', label: 'All Courses', icon: '📚' },
          { href: '/courses?type=video', label: 'Video Classes', icon: '🎞️' },
          { href: '/courses?type=text', label: 'Text Classes', icon: '📄' },
          { href: '/ebooks', label: 'Ebooks Library', icon: '📘' },
          { href: '/live', label: 'Live Classes', icon: '🎥' },
        ],
      },
      { href: '/shop', label: 'Forge Shop', icon: '🛒' },
      { href: '/pricing', label: 'Pricing', icon: '💎' },
      {
        label: 'Updates',
        icon: '🔔',
        items: [
          { href: '/blog', label: 'Blog', icon: '✍️' },
          { href: '/news', label: 'News', icon: '📰' },
          { href: '/forum', label: 'Forum', icon: '💬' },
        ],
      },
      {
        label: 'Resources',
        icon: '📚',
        items: [
          { href: '/question-bank', label: 'Question Bank', icon: '🗂️' },
          { href: '/quizzes', label: 'Quizzes', icon: '📝' },
        ],
      },
      {
        label: 'Tool',
        icon: '🛠️',
        items: [
          { href: '/tools/code', label: 'Code Editor', icon: '💻' },
          { href: '/tools/whiteboard', label: 'Whiteboard', icon: '🖍️' },
        ],
      },
      {
        label: 'Learning',
        icon: '📖',
        items: [
          { href: '/dashboard', label: 'My Dashboard', icon: '📊' },
          { href: '/my-learning', label: 'My Learning', icon: '📖' },
          { href: '/subjects', label: 'Subjects', icon: '📚' },
        ],
      },
    ],
    dashboardLink: { href: '/dashboard', label: 'My Dashboard' },
    showAdminBadge: false,
    showViewAs: false,
  },
  user: {
    primaryLinks: [
      {
        label: 'Courses',
        icon: '📚',
        items: [
          { href: '/courses', label: 'All Courses', icon: '📚' },
          { href: '/courses?type=video', label: 'Video Classes', icon: '🎞️' },
          { href: '/courses?type=text', label: 'Text Classes', icon: '📄' },
          { href: '/ebooks', label: 'Ebooks Library', icon: '📘' },
          { href: '/live', label: 'Live Classes', icon: '🎥' },
        ],
      },
      { href: '/shop', label: 'Forge Shop', icon: '🛒' },
      { href: '/pricing', label: 'Pricing', icon: '💎' },
      {
        label: 'Updates',
        icon: '🔔',
        items: [
          { href: '/blog', label: 'Blog', icon: '✍️' },
          { href: '/news', label: 'News', icon: '📰' },
          { href: '/forum', label: 'Forum', icon: '💬' },
        ],
      },
      {
        label: 'Resources',
        icon: '📚',
        items: [
          { href: '/question-bank', label: 'Question Bank', icon: '🗂️' },
          { href: '/quizzes', label: 'Quizzes', icon: '📝' },
        ],
      },
      {
        label: 'Tool',
        icon: '🛠️',
        items: [
          { href: '/tools/code', label: 'Code Editor', icon: '💻' },
          { href: '/tools/whiteboard', label: 'Whiteboard', icon: '🖍️' },
        ],
      },
      { href: '/subjects', label: 'Subjects', icon: '📚' },
    ],
    dashboardLink: { href: '/dashboard', label: 'My Dashboard' },
    showAdminBadge: false,
    showViewAs: false,
  },
  news_writer: {
    primaryLinks: [
      {
        label: 'Studio',
        icon: '🎙️',
        items: [
          { href: '/admin/studio/news', label: 'News Studio', icon: '📰' },
          { href: '/admin/studio/blogs', label: 'Blog Studio', icon: '✍️' },
        ],
      },
      {
        label: 'Updates',
        icon: '🔔',
        items: [
          { href: '/blog', label: 'Blog', icon: '✍️' },
          { href: '/news', label: 'News', icon: '📰' },
        ],
      },
    ],
    dashboardLink: { href: '/admin/studio/news', label: 'News Studio' },
    showAdminBadge: true,
    showViewAs: false,
  },
  guest: {
    primaryLinks: [
      {
        label: 'Courses',
        icon: '📚',
        items: [
          { href: '/courses', label: 'All Courses', icon: '📚' },
          { href: '/ebooks', label: 'Ebooks Library', icon: '📘' },
        ],
      },
      { href: '/pricing', label: 'Join Us', icon: '💎' },
      { href: '/shop', label: 'Forge Shop', icon: '🛒' },
      {
        label: 'Updates',
        icon: '🔔',
        items: [
          { href: '/blog', label: 'Blog', icon: '✍️' },
          { href: '/news', label: 'News', icon: '📰' },
        ],
      },
    ],
    dashboardLink: { href: '/', label: 'Welcome' },
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

