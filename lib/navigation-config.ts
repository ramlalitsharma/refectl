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

const UTILITIES_ITEMS: NavLink[] = [
  { href: '/tools', label: 'Utilities Hub', icon: '🛠️' },
  { href: '/tools/image-to-pdf', label: 'Image to PDF', icon: '🖼️' },
  { href: '/tools/pdf-merge', label: 'PDF Merge', icon: '🧩' },
  { href: '/tools/pdf-split', label: 'PDF Split', icon: '✂️' },
  { href: '/tools/pdf-compress', label: 'PDF Compress', icon: '🗜️' },
  { href: '/tools/pdf-to-word', label: 'PDF to Word', icon: '📝' },
  { href: '/tools/pdf-to-excel', label: 'PDF to Excel', icon: '📊' },
  { href: '/tools/url-to-pdf', label: 'URL to PDF', icon: '🔗' },
  { href: '/tools/image-convert', label: 'Image Convert/Resize', icon: '🎞️' },
  { href: '/tools/image-compress', label: 'Image Compress', icon: '📉' },
  { href: '/tools/ocr', label: 'OCR (Image/PDF → Text)', icon: '🔍' },
  { href: '/tools/text', label: 'Text Utilities', icon: '✍️' },
  { href: '/tools/qr', label: 'QR Generator', icon: '🔳' },
  { href: '/tools/password', label: 'Password Generator', icon: '🔐' },
  { href: '/tools/timestamp', label: 'Timestamp Converter', icon: '⏱️' },
  { href: '/tools/unit', label: 'Unit Converter', icon: '📏' },
  { href: '/tools/calculator', label: 'Commercial Calculator', icon: '🧮' },
];

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
          { href: '/courses', label: 'All Courses', icon: '📚' },
          { href: '/courses?type=video', label: 'Video Courses', icon: '🎞️' },
          { href: '/courses?type=text', label: 'Text Courses', icon: '📄' },
          { href: '/ebooks', label: 'E-Books Library', icon: '📘' },
          { href: '/live', label: 'Live Classes', icon: '🎥' },
          { href: '/subjects', label: 'All Subjects', icon: '🏷️' },
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
          { href: '/leaderboard', label: 'Leaderboard', icon: '🏆' },
        ],
      },

      // 🛒 Forge Shop - Premium tools & software
      { href: '/shop', label: 'Forge Shop', icon: '🛒' },

      // 🎯 Practice Hub - Assessments & tests
      {
        label: 'Master',
        icon: '🎯',
        description: 'Practice & self-assessment',
        items: [
          { href: '/quizzes', label: 'Quiz Bank', icon: '📝' },
          { href: '/exams', label: 'Exam Center', icon: '📊' },
          { href: '/question-bank', label: 'Question Bank', icon: '🗂️' },
        ],
      },

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
      {
        label: 'Utilities',
        icon: '🛠️',
        description: 'Professional toolkits and calculators',
        items: UTILITIES_ITEMS,
      },
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
          { href: '/courses', label: 'All Courses', icon: '📚' },
          { href: '/courses?type=video', label: 'Video Courses', icon: '🎞️' },
          { href: '/courses?type=text', label: 'Text Courses', icon: '📄' },
          { href: '/ebooks', label: 'E-Books Library', icon: '📘' },
          { href: '/live', label: 'Live Classes', icon: '🎥' },
          { href: '/subjects', label: 'All Subjects', icon: '🏷️' },
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
          { href: '/leaderboard', label: 'Leaderboard', icon: '🏆' },
        ],
      },

      // 🛒 Forge Shop - Premium tools & software
      { href: '/shop', label: 'Forge Shop', icon: '🛒' },

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
      {
        label: 'Utilities',
        icon: '🛠️',
        description: 'Professional toolkits',
        items: UTILITIES_ITEMS,
      },
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
          { href: '/courses', label: 'All Courses', icon: '📚' },
          { href: '/courses?type=video', label: 'Video Courses', icon: '🎞️' },
          { href: '/courses?type=text', label: 'Text Courses', icon: '📄' },
          { href: '/ebooks', label: 'E-Books Library', icon: '📘' },
          { href: '/live', label: 'Live Classes', icon: '🎥' },
          { href: '/subjects', label: 'All Subjects', icon: '🏷️' },
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
          { href: '/leaderboard', label: 'Leaderboard', icon: '🏆' },
        ],
      },

      // 🛒 Forge Shop - Premium tools & software
      { href: '/shop', label: 'Forge Shop', icon: '🛒' },

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

      {
        label: 'Master',
        icon: '🎯',
        description: 'Assessments & practice',
        items: [
          { href: '/quizzes', label: 'Quiz Bank', icon: '📝' },
          { href: '/exams', label: 'Exam Center', icon: '📊' },
          { href: '/question-bank', label: 'Question Bank', icon: '🗂️' },
        ],
      },

      // 🛠️ Utilities
      {
        label: 'Utilities',
        icon: '🛠️',
        description: 'Support tools',
        items: UTILITIES_ITEMS,
      },
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
          { href: '/courses', label: 'All Courses', icon: '📚' },
          { href: '/ebooks', label: 'E-Books', icon: '📘' },
          { href: '/subjects', label: 'Subjects', icon: '🏷️' },
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

      // 🛠️ Utilities
      {
        label: 'Utilities',
        icon: '🛠️',
        description: 'Support tools',
        items: UTILITIES_ITEMS,
      },
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
          { href: '/courses', label: 'All Courses', icon: '📚' },
          { href: '/ebooks', label: 'E-Books', icon: '📘' },
          { href: '/subjects', label: 'Subjects', icon: '🏷️' },
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

      // 🛠️ Utilities
      {
        label: 'Utilities',
        icon: '🛠️',
        description: 'Support tools',
        items: UTILITIES_ITEMS,
      },
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
          { href: '/courses', label: 'All Courses', icon: '📚' },
          { href: '/courses?type=video', label: 'Video Courses', icon: '🎞️' },
          { href: '/courses?type=text', label: 'Text Courses', icon: '📄' },
          { href: '/ebooks', label: 'E-Books', icon: '📘' },
          { href: '/live', label: 'Live Classes', icon: '🎥' },
          { href: '/subjects', label: 'All Subjects', icon: '🏷️' },
        ],
      },

      {
        label: 'Master',
        icon: '🎯',
        description: 'Practice & assessment',
        items: [
          { href: '/quizzes', label: 'Quiz Bank', icon: '📝' },
          { href: '/exams', label: 'Exam Center', icon: '📊' },
          { href: '/question-bank', label: 'Question Bank', icon: '🗂️' },
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
          { href: '/leaderboard', label: 'Leaderboard', icon: '🏆' },
        ],
      },

      // 🛒 Forge Shop - Premium tools & software
      { href: '/shop', label: 'Forge Shop', icon: '🛒' },

      // 🛠️ Utilities
      {
        label: 'Utilities',
        icon: '🛠️',
        description: 'Support toolkits',
        items: UTILITIES_ITEMS,
      },
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
          { href: '/courses', label: 'All Courses', icon: '📚' },
          { href: '/courses?type=video', label: 'Video Courses', icon: '🎞️' },
          { href: '/courses?type=text', label: 'Text Courses', icon: '📄' },
          { href: '/ebooks', label: 'E-Books', icon: '📘' },
          { href: '/live', label: 'Live Classes', icon: '🎥' },
          { href: '/subjects', label: 'Subjects', icon: '🏷️' },
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
          { href: '/leaderboard', label: 'Leaderboard', icon: '🏆' },
        ],
      },

      {
        label: 'Practice',
        icon: '🎯',
        description: 'Test yourself',
        items: [
          { href: '/quizzes', label: 'Quizzes', icon: '📝' },
          { href: '/exams', label: 'Practice Exams', icon: '📊' },
        ],
      },

      // 🛒 Forge Shop - Premium tools & software
      { href: '/shop', label: 'Forge Shop', icon: '🛒' },

      // 🛠️ Utilities
      {
        label: 'Utilities',
        icon: '🛠️',
        description: 'Support toolkits',
        items: UTILITIES_ITEMS,
      },
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
          { href: '/courses', label: 'All Courses', icon: '📚' },
          { href: '/ebooks', label: 'E-Books', icon: '📘' },
          { href: '/subjects', label: 'Subjects', icon: '🏷️' },
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

      // 🛠️ Utilities
      {
        label: 'Utilities',
        icon: '🛠️',
        description: 'Free toolkits',
        items: UTILITIES_ITEMS,
      },

      {
        label: 'Start Learning',
        icon: '👑',
        description: 'Join our community',
        items: [
          { href: '/pricing', label: 'Browse Plans', icon: '💎' },
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

