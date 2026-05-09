/**
 * Professional Role-Based Navigation Configuration
 * Organized into logical semantic sections for better UX
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
  description?: string;
  items: NavLink[];
}

export type NavItem = NavLink | NavDropdown;

export function isDropdown(item: NavItem): item is NavDropdown {
  return 'items' in item;
}

export interface RoleNavigationConfig {
  // Primary navigation items shown in navbar
  primaryLinks: NavItem[];
  // Dashboard/home link
  dashboardLink: { href: string; label: string };
  // Admin console link (if applicable)
  consoleLink?: { href: string; label: string };
  // Show admin badge indicator
  showAdminBadge: boolean;
  // Show view-as role switcher
  showViewAs: boolean;
}

export const GAMES_LINK: NavLink = { href: '/games', label: 'Games', icon: '🎮' };

export const ROLE_NAVIGATION: Record<UserRole, RoleNavigationConfig> = {
  // 👑 Super Admin - Full platform access
  superadmin: {
    primaryLinks: [
      // 📚 Learning Hub - Access all learning content
      {
        label: 'Learning',
        icon: '📚',
        description: 'Browse all educational content',
        items: [
          { href: '/courses', label: 'Courses', icon: '📚' },
          { href: '/ebooks', label: 'E-Books Library', icon: '📘' },
          { href: '/live', label: 'Live Classes', icon: '🎥' },
        ],
      },

      // 🔗 Community - Connect & collaborate
      {
        label: 'Community',
        icon: '🔗',
        description: 'Share knowledge & connect',
        items: [
          { href: '/blog', label: 'Blog Platform', icon: '✍️' },
          { href: '/news', label: 'Terai Times', icon: '📰' },
          { href: '/forum', label: 'Discussion Forum', icon: '💬' },
        ],
      },

      // 🛒 Forge Shop - Premium tools & software
      { href: '/shop', label: 'Forge Shop', icon: '🛒' },

      // 🎮 Games - Play online
      GAMES_LINK,

      // 🛡️ Administration - Full control
      {
        label: 'Administration',
        icon: '🛡️',
        description: 'System management & oversight',
        items: [
          { href: '/admin/super', label: 'Super Console', icon: '👑' },
          { href: '/admin', label: 'Admin Panel', icon: '⚙️' },
          { href: '/admin/users', label: 'User Management', icon: '👥' },
          { href: '/admin/courses', label: 'Course Management', icon: '📚' },
          { href: '/admin/analytics', label: 'Analytics Dashboard', icon: '📊' },
          { href: '/admin/logs', label: 'Activity Logs', icon: '📋' },
          { href: '/admin/compliance', label: 'Compliance', icon: '⚖️' },
          { href: '/admin/proctoring', label: 'Proctoring Center', icon: '🔒' },
          { href: '/admin/settings', label: 'System Settings', icon: '⚙️' },
        ],
      },

      // 🛠️ Utilities - Support Tools
      { href: '/tools', label: 'Utilities', icon: '🛠️' },
    ],
    dashboardLink: { href: '/admin/super', label: 'Super Admin Console' },
    consoleLink: { href: '/admin/super', label: 'Super Admin Console' },
    showAdminBadge: true,
    showViewAs: true,
  },

  // 👨‍💼 Admin - Platform administration
  admin: {
    primaryLinks: [
      {
        label: 'Learning',
        icon: '📚',
        description: 'Browse educational content',
        items: [
          { href: '/courses', label: 'Courses', icon: '📚' },
          { href: '/ebooks', label: 'E-Books Library', icon: '📘' },
          { href: '/live', label: 'Live Classes', icon: '🎥' },
        ],
      },

      {
        label: 'Community',
        icon: '🔗',
        description: 'Manage community features',
        items: [
          { href: '/blog', label: 'Blog Platform', icon: '✍️' },
          { href: '/news', label: 'Terai Times', icon: '📰' },
          { href: '/forum', label: 'Discussion Forum', icon: '💬' },
        ],
      },

      // 🛒 Forge Shop - Premium tools & software
      { href: '/shop', label: 'Forge Shop', icon: '🛒' },

      // 🎮 Games - Play online
      GAMES_LINK,

      {
        label: 'Administration',
        icon: '🛡️',
        description: 'Platform management',
        items: [
          { href: '/admin', label: 'Admin Panel', icon: '⚙️' },
          { href: '/admin/users', label: 'User Management', icon: '👥' },
          { href: '/admin/courses', label: 'Course Management', icon: '📚' },
          { href: '/admin/analytics', label: 'Analytics Dashboard', icon: '📊' },
          { href: '/admin/logs', label: 'Activity Logs', icon: '📋' },
          { href: '/admin/compliance', label: 'Compliance', icon: '⚖️' },
          { href: '/admin/proctoring', label: 'Proctoring Center', icon: '🔒' },
        ],
      },

      // 🛠️ Utilities
      { href: '/tools', label: 'Utilities', icon: '🛠️' },
    ],
    dashboardLink: { href: '/admin/dashboard', label: 'Admin Dashboard' },
    consoleLink: { href: '/admin', label: 'Admin Console' },
    showAdminBadge: true,
    showViewAs: false,
  },

  // 👨‍🏫 Teacher - Course creation & student management
  teacher: {
    primaryLinks: [
      {
        label: 'Learning',
        icon: '📚',
        description: 'Access learning content',
        items: [
          { href: '/courses', label: 'Courses', icon: '📚' },
          { href: '/ebooks', label: 'E-Books Library', icon: '📘' },
          { href: '/live', label: 'Live Classes', icon: '🎥' },
        ],
      },

      {
        label: 'Community',
        icon: '🔗',
        description: 'Engage with community',
        items: [
          { href: '/blog', label: 'Blog Platform', icon: '✍️' },
          { href: '/news', label: 'Terai Times', icon: '📰' },
          { href: '/forum', label: 'Discussion Forum', icon: '💬' },
        ],
      },

      // 🛒 Forge Shop - Premium tools & software
      { href: '/shop', label: 'Forge Shop', icon: '🛒' },

      // 🎮 Games - Play online
      GAMES_LINK,

      {
        label: 'Teaching Studio',
        icon: '🎓',
        description: 'Create & manage content',
        items: [
          { href: '/teacher/dashboard', label: 'Teacher Dashboard', icon: '📊' },
          { href: '/admin/studio/courses', label: 'Create Course', icon: '➕' },
          { href: '/admin/studio/blogs', label: 'Write Blog', icon: '✍️' },
          { href: '/admin/studio/ebooks', label: 'Create E-Book', icon: '📚' },
          { href: '/admin/studio/questions', label: 'Create Quiz', icon: '❓' },
          { href: '/admin/courses', label: 'My Courses', icon: '🎯' },
        ],
      },

      // 🛠️ Utilities
      { href: '/tools', label: 'Utilities', icon: '🛠️' },
    ],
    dashboardLink: { href: '/teacher/dashboard', label: 'Teacher Dashboard' },
    showAdminBadge: false,
    showViewAs: false,
  },

  // ✍️ Content Writer - Create news & blogs
  content_writer: {
    primaryLinks: [
      {
        label: 'Learning',
        icon: '📚',
        description: 'Access content',
        items: [
          { href: '/courses', label: 'Courses', icon: '📚' },
          { href: '/ebooks', label: 'E-Books', icon: '📘' },
        ],
      },

      {
        label: 'Creation Studio',
        icon: '✨',
        description: 'Create & manage content',
        items: [
          { href: '/admin/studio/news', label: 'News Studio', icon: '📰' },
          { href: '/admin/studio/blogs', label: 'Blog Studio', icon: '✍️' },
          { href: '/admin/studio/ebooks', label: 'E-Book Studio', icon: '📚' },
        ],
      },

      {
        label: 'Community',
        icon: '🔗',
        description: 'View published content',
        items: [
          { href: '/blog', label: 'Blog Platform', icon: '✍️' },
          { href: '/news', label: 'Terai Times', icon: '📰' },
          { href: '/forum', label: 'Forums', icon: '💬' },
        ],
      },

      // 🎮 Games - Play online
      GAMES_LINK,

      // 🛠️ Utilities
      { href: '/tools', label: 'Utilities', icon: '🛠️' },
    ],
    dashboardLink: { href: '/admin/studio/news', label: 'News Studio' },
    showAdminBadge: true,
    showViewAs: false,
  },

  // 📰 News Writer - Create news articles
  news_writer: {
    primaryLinks: [
      {
        label: 'Learning',
        icon: '📚',
        description: 'Access content',
        items: [
          { href: '/courses', label: 'Courses', icon: '📚' },
          { href: '/ebooks', label: 'E-Books', icon: '📘' },
        ],
      },

      {
        label: 'Creation Studio',
        icon: '✨',
        description: 'Create & manage content',
        items: [
          { href: '/admin/studio/news', label: 'News Studio', icon: '📰' },
          { href: '/admin/studio/blogs', label: 'Blog Studio', icon: '✍️' },
        ],
      },

      {
        label: 'Community',
        icon: '🔗',
        description: 'View published content',
        items: [
          { href: '/blog', label: 'Blog Platform', icon: '✍️' },
          { href: '/news', label: 'Terai Times', icon: '📰' },
          { href: '/forum', label: 'Forums', icon: '💬' },
        ],
      },

      // 🎮 Games - Play online
      GAMES_LINK,

      // 🛠️ Utilities
      { href: '/tools', label: 'Utilities', icon: '🛠️' },
    ],
    dashboardLink: { href: '/admin/studio/news', label: 'News Studio' },
    showAdminBadge: true,
    showViewAs: false,
  },

  // 📖 Student - Learning focused
  student: {
    primaryLinks: [
      {
        label: 'Learning Hub',
        icon: '📚',
        description: 'Your learning path',
        items: [
          { href: '/dashboard', label: 'My Dashboard', icon: '📊' },
          { href: '/my-learning', label: 'My Courses', icon: '📖' },
          { href: '/courses', label: 'Courses', icon: '📚' },
          { href: '/ebooks', label: 'E-Books', icon: '📘' },
          { href: '/live', label: 'Live Classes', icon: '🎥' },
        ],
      },

      {
        label: 'Community',
        icon: '🔗',
        description: 'Connect & collaborate',
        items: [
          { href: '/blog', label: 'Blog Platform', icon: '✍️' },
          { href: '/news', label: 'Terai Times', icon: '📰' },
          { href: '/forum', label: 'Discussion Forum', icon: '💬' },
        ],
      },

      // 🛒 Forge Shop - Premium tools & software
      { href: '/shop', label: 'Forge Shop', icon: '🛒' },

      // 🎮 Games - Play online
      GAMES_LINK,

      // 🛠️ Utilities
      { href: '/tools', label: 'Utilities', icon: '🛠️' },
    ],
    dashboardLink: { href: '/dashboard', label: 'My Dashboard' },
    showAdminBadge: false,
    showViewAs: false,
  },

  // 👤 Regular User - Guest/Free user
  user: {
    primaryLinks: [
      {
        label: 'Learning',
        icon: '📚',
        description: 'Explore courses',
        items: [
          { href: '/courses', label: 'Courses', icon: '📚' },
          { href: '/ebooks', label: 'E-Books', icon: '📘' },
          { href: '/live', label: 'Live Classes', icon: '🎥' },
        ],
      },

      {
        label: 'Community',
        icon: '🔗',
        description: 'Connect with others',
        items: [
          { href: '/blog', label: 'Blog', icon: '✍️' },
          { href: '/news', label: 'News', icon: '📰' },
          { href: '/forum', label: 'Forums', icon: '💬' },
        ],
      },

      // 🛒 Forge Shop - Premium tools & software
      { href: '/shop', label: 'Forge Shop', icon: '🛒' },

      // 🎮 Games - Play online
      GAMES_LINK,

      // 🛠️ Utilities
      { href: '/tools', label: 'Utilities', icon: '🛠️' },
    ],
    dashboardLink: { href: '/dashboard', label: 'My Dashboard' },
    showAdminBadge: false,
    showViewAs: false,
  },

  // 👁️ Guest - Unauthenticated user
  guest: {
    primaryLinks: [
      {
        label: 'Explore',
        icon: '🔭',
        description: 'Browse courses',
        items: [
          { href: '/courses', label: 'Courses', icon: '📚' },
          { href: '/ebooks', label: 'E-Books', icon: '📘' },
        ],
      },

      {
        label: 'Discover',
        icon: '✨',
        description: 'Learn more',
        items: [
          { href: '/blog', label: 'Blog', icon: '✍️' },
          { href: '/news', label: 'News', icon: '📰' },
        ],
      },

      // 🎮 Games - Play online
      GAMES_LINK,

      // 🛠️ Utilities
      { href: '/tools', label: 'Utilities', icon: '🛠️' },

      {
        label: 'Start Learning',
        icon: '👑',
        description: 'Join our community',
        items: [
          { href: '/pricing', label: 'Buy us a Coffee', icon: '☕' },
          { href: '/shop', label: 'Shop', icon: '' },
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
