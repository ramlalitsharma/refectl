/**
 * PostHog Analytics Integration
 * Open-source, privacy-friendly alternative to Google Analytics 4
 * Self-hostable, free, world-class product analytics
 *
 * Features:
 * - Event tracking
 * - User identification
 * - Feature flags
 * - Session replay (optional)
 * - Cohort analysis
 * - Conversion funnels
 */

import { PostHog } from "posthog-js";

// Initialize PostHog client
let posthog: PostHog | null = null;

/**
 * Initialize PostHog analytics
 * Can be self-hosted or use cloud version
 */
export function initializePostHog(
  apiKey: string,
  options?: {
    apiHost?: string; // For self-hosted: http://localhost:8000
    enabled?: boolean;
    capturePageViews?: boolean;
    captureNetworkActivity?: boolean;
    persistence?:
    | "localStorage"
    | "localStorage+cookie"
    | "memory"
    | "sessionStorage";
  },
) {
  if (!apiKey) {
    return null;
  }

  if (typeof window === "undefined") {
    return null; // Server-side, skip initialization
  }

  try {
    posthog = new PostHog(apiKey, {
      api_host: options?.apiHost || "https://app.posthog.com",
      loaded: () => {
        console.log("PostHog loaded");
      },
      autocapture: true,
      disable_session_recording: false,
      persistence: options?.persistence || "localStorage",
      enable_recording_console_log: true,
      capture_exceptions: true,
      capture_pageview: options?.capturePageViews ?? true,
      capture_performance: true,
    });
  } catch (error) {
    console.error("Failed to initialize PostHog:", error);
    return null;
  }

  return posthog;
}

/**
 * Get PostHog instance
 */
export function getPostHog(): PostHog | null {
  if (typeof window === "undefined") {
    return null;
  }
  return posthog || (window as any).posthog;
}

/**
 * Track a custom event
 */
export function trackEvent(
  eventName: string,
  properties?: Record<string, any>,
) {
  const ph = getPostHog();
  if (!ph) return;

  ph.capture(eventName, {
    ...properties,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Identify a user
 */
export function identifyUser(
  userId: string,
  properties?: {
    email?: string;
    name?: string;
    plan?: string;
    [key: string]: any;
  },
) {
  const ph = getPostHog();
  if (!ph) return;

  ph.identify(userId, {
    email: properties?.email,
    name: properties?.name,
    plan: properties?.plan,
    ...properties,
  });
}

/**
 * Set user properties without triggering identify
 */
export function setUserProperties(properties: Record<string, any>) {
  const ph = getPostHog();
  if (!ph) return;

  ph.people.set(properties);
}

/**
 * Reset user (logout)
 */
export function resetUser() {
  const ph = getPostHog();
  if (!ph) return;

  ph.reset();
}

/**
 * Alias user (when user becomes authenticated)
 */
export function aliasUser(distinctId: string) {
  const ph = getPostHog();
  if (!ph) return;

  ph.alias(distinctId);
}

// ===== COURSE EVENTS =====

export function trackCourseViewed(
  courseId: string,
  courseName: string,
  category?: string,
) {
  trackEvent("course_viewed", {
    course_id: courseId,
    course_name: courseName,
    course_category: category,
    funnel_stage: "interest",
  });
}

export function trackCourseEnrolled(
  courseId: string,
  courseName: string,
  price?: number,
  currency?: string,
) {
  trackEvent("course_enrolled", {
    course_id: courseId,
    course_name: courseName,
    value: price,
    currency: currency || "USD",
    funnel_stage: "intent",
  });
}

export function trackCourseCompleted(
  courseId: string,
  courseName: string,
  duration?: number,
  lessonsCompleted?: number,
) {
  trackEvent("course_completed", {
    course_id: courseId,
    course_name: courseName,
    duration_minutes: duration,
    lessons_completed: lessonsCompleted,
  });
}

// ===== LESSON EVENTS =====

export function trackLessonStarted(
  courseId: string,
  lessonId: string,
  lessonTitle: string,
) {
  trackEvent("lesson_started", {
    course_id: courseId,
    lesson_id: lessonId,
    lesson_title: lessonTitle,
  });
}

export function trackLessonCompleted(
  courseId: string,
  lessonId: string,
  lessonTitle: string,
  duration?: number,
) {
  trackEvent("lesson_completed", {
    course_id: courseId,
    lesson_id: lessonId,
    lesson_title: lessonTitle,
    duration_minutes: duration,
  });
}

// ===== QUIZ EVENTS =====

export function trackQuizStarted(
  quizId: string,
  quizName: string,
  courseId?: string,
  difficulty?: string,
) {
  trackEvent("quiz_started", {
    quiz_id: quizId,
    quiz_name: quizName,
    course_id: courseId,
    difficulty,
  });
}

export function trackQuizCompleted(
  quizId: string,
  quizName: string,
  score: number,
  totalQuestions: number,
  duration?: number,
  courseId?: string,
) {
  const percentage = (score / totalQuestions) * 100;

  trackEvent("quiz_completed", {
    quiz_id: quizId,
    quiz_name: quizName,
    score,
    total_questions: totalQuestions,
    score_percentage: Math.round(percentage),
    duration_seconds: duration,
    course_id: courseId,
  });
}

export function trackQuizSubmitted(quizId: string, submissionCount: number) {
  trackEvent("quiz_submitted", {
    quiz_id: quizId,
    submission_count: submissionCount,
  });
}

// ===== AUTHENTICATION EVENTS =====

export function trackSignUp(
  method: "email" | "google" | "github" | "clerk" | string,
  userId?: string,
) {
  trackEvent("user_signup", {
    method,
    user_id: userId,
  });
}

export function trackSignIn(
  method: "email" | "google" | "github" | "clerk" | string,
  userId?: string,
) {
  trackEvent("user_signin", {
    method,
    user_id: userId,
  });
}

export function trackSignOut(userId?: string) {
  trackEvent("user_signout", {
    user_id: userId,
  });
}

// ===== PAYMENT EVENTS =====

export function trackPaymentInitiated(
  transactionId: string,
  value: number,
  currency: string,
  itemName: string,
  itemCategory?: string,
) {
  trackEvent("payment_initiated", {
    transaction_id: transactionId,
    value,
    currency,
    item_name: itemName,
    item_category: itemCategory,
    funnel_stage: "conversion_start",
  });
}

export function trackPaymentCompleted(
  transactionId: string,
  value: number,
  currency: string,
  itemName: string,
  itemCategory?: string,
  method?: string,
) {
  trackEvent("payment_completed", {
    transaction_id: transactionId,
    value,
    currency,
    item_name: itemName,
    item_category: itemCategory,
    payment_method: method,
    funnel_stage: "conversion_complete",
  });
}

export function trackPaymentFailed(
  transactionId: string,
  value: number,
  currency: string,
  reason?: string,
) {
  trackEvent("payment_failed", {
    transaction_id: transactionId,
    value,
    currency,
    failure_reason: reason,
  });
}

export function trackSubscriptionCreated(
  subscriptionId: string,
  plan: string,
  value: number,
  currency: string,
) {
  trackEvent("subscription_created", {
    subscription_id: subscriptionId,
    subscription_plan: plan,
    value,
    currency,
  });
}

export function trackSubscriptionCancelled(
  subscriptionId: string,
  plan: string,
  reason?: string,
) {
  trackEvent("subscription_cancelled", {
    subscription_id: subscriptionId,
    subscription_plan: plan,
    cancellation_reason: reason,
  });
}

// ===== ENGAGEMENT EVENTS =====

export function trackSearch(
  searchTerm: string,
  resultCount?: number,
  resultType?: string,
) {
  trackEvent("search", {
    search_term: searchTerm,
    result_count: resultCount,
    result_type: resultType,
  });
}

export function trackShare(
  contentType: string,
  contentId: string,
  method: "email" | "social" | "link" | string,
) {
  trackEvent("content_shared", {
    content_type: contentType,
    content_id: contentId,
    share_method: method,
  });
}

export function trackComment(
  contentType: string,
  contentId: string,
  commentLength?: number,
) {
  trackEvent("comment_created", {
    content_type: contentType,
    content_id: contentId,
    comment_length: commentLength,
  });
}

export function trackLike(contentType: string, contentId: string) {
  trackEvent("content_liked", {
    content_type: contentType,
    content_id: contentId,
  });
}

export function trackFollow(followType: string, followId: string) {
  trackEvent("user_followed", {
    follow_type: followType,
    follow_id: followId,
  });
}

// ===== GAMIFICATION EVENTS =====

export function trackBadgeEarned(
  badgeId: string,
  badgeName: string,
  userId?: string,
) {
  trackEvent("badge_earned", {
    badge_id: badgeId,
    badge_name: badgeName,
    user_id: userId,
  });
}

export function trackAchievementUnlocked(
  achievementId: string,
  achievementName: string,
  rarity?: string,
) {
  trackEvent("achievement_unlocked", {
    achievement_id: achievementId,
    achievement_name: achievementName,
    rarity,
  });
}

export function trackLevelUp(
  newLevel: number,
  userId?: string,
  totalXp?: number,
) {
  trackEvent("level_up", {
    new_level: newLevel,
    user_id: userId,
    total_xp: totalXp,
  });
}

// ===== VIDEO EVENTS =====

export function trackVideoStarted(
  videoId: string,
  videoTitle: string,
  duration?: number,
) {
  trackEvent("video_started", {
    video_id: videoId,
    video_title: videoTitle,
    video_duration: duration,
  });
}

export function trackVideoCompleted(
  videoId: string,
  videoTitle: string,
  watchedDuration: number,
  totalDuration: number,
) {
  const percentage = (watchedDuration / totalDuration) * 100;

  trackEvent("video_completed", {
    video_id: videoId,
    video_title: videoTitle,
    watched_duration: watchedDuration,
    total_duration: totalDuration,
    completion_percentage: Math.round(percentage),
  });
}

export function trackVideoProgress(
  videoId: string,
  currentTime: number,
  totalDuration: number,
  percentage: number,
) {
  trackEvent("video_progress", {
    video_id: videoId,
    current_time: currentTime,
    total_duration: totalDuration,
    progress_percentage: percentage,
  });
}

// ===== ERROR EVENTS =====

export function trackError(
  errorMessage: string,
  errorCode?: string,
  context?: Record<string, any>,
) {
  const ph = getPostHog();
  if (ph) {
    ph.captureException(new Error(errorMessage), {
      error_code: errorCode,
      ...context,
    });
  }

  trackEvent("error_occurred", {
    error_message: errorMessage,
    error_code: errorCode,
    ...context,
  });
}

export function trackException(description: string, fatal = false) {
  const ph = getPostHog();
  if (ph) {
    ph.captureException(new Error(description), {
      fatal,
    });
  }

  trackEvent("exception_caught", {
    description,
    fatal,
  });
}

// ===== PERFORMANCE EVENTS =====

export function trackPageLoadTime(loadTime: number) {
  trackEvent("page_load_time", {
    load_time_ms: loadTime,
  });
}

export function trackApiCall(
  endpoint: string,
  method: string,
  duration: number,
  statusCode?: number,
) {
  trackEvent("api_call", {
    endpoint,
    method,
    duration_ms: duration,
    status_code: statusCode,
  });
}

export function trackEngagement(page: string, timeSpent: number) {
  trackEvent("page_engagement", {
    page,
    time_spent_seconds: timeSpent,
  });
}

// ===== UTILITY FUNCTIONS =====

/**
 * Track page view (usually automatic in PostHog)
 */
export function trackPageView(pathname: string, title?: string) {
  const ph = getPostHog();
  if (!ph) return;

  ph.capture("$pageview", {
    $current_url: pathname,
    title,
  });
}

/**
 * Get PostHog feature flag value
 */
export function getFeatureFlag(flagName: string): boolean | string | null {
  const ph = getPostHog();
  if (!ph) return null;

  return ph.getFeatureFlag(flagName);
}

/**
 * Set feature flag override (for testing)
 */
export function setFeatureFlagOverride(
  flagName: string,
  value: boolean | string,
) {
  const ph = getPostHog();
  if (!ph) return;

  // Store override in localStorage for client-side testing
  if (typeof window !== "undefined") {
    const overrides = JSON.parse(
      localStorage.getItem("posthog_flag_overrides") || "{}",
    );
    overrides[flagName] = value;
    localStorage.setItem("posthog_flag_overrides", JSON.stringify(overrides));
  }
}

/**
 * Check if PostHog is ready
 */
export function isPostHogReady(): boolean {
  const ph = getPostHog();
  return ph !== null && ph !== undefined;
}

/**
 * Get session ID
 */
export function getSessionId(): string | null {
  const ph = getPostHog();
  if (!ph) return null;

  return ph.get_session_id();
}

/**
 * Get distinct ID (user identifier)
 */
export function getDistinctId(): string | null {
  const ph = getPostHog();
  if (!ph) return null;

  return ph.get_distinct_id();
}

/**
 * Disable tracking (for privacy)
 */
export function disableTracking() {
  const ph = getPostHog();
  if (!ph) return;

  ph.opt_out_capturing();
}

/**
 * Enable tracking (if previously disabled)
 */
export function enableTracking() {
  const ph = getPostHog();
  if (!ph) return;

  ph.opt_in_capturing();
}

/**
 * Check if tracking is enabled
 */
export function isTrackingEnabled(): boolean {
  const ph = getPostHog();
  if (!ph) return false;

  return !ph.has_opted_out_capturing();
}

/**
 * Batch track multiple events
 */
export function batchTrackEvents(
  events: Array<{
    name: string;
    properties?: Record<string, any>;
  }>,
) {
  events.forEach(({ name, properties }) => {
    trackEvent(name, properties);
  });
}

export default {
  initializePostHog,
  getPostHog,
  trackEvent,
  identifyUser,
  setUserProperties,
  resetUser,
  aliasUser,
  trackCourseViewed,
  trackCourseEnrolled,
  trackCourseCompleted,
  trackLessonStarted,
  trackLessonCompleted,
  trackQuizStarted,
  trackQuizCompleted,
  trackQuizSubmitted,
  trackSignUp,
  trackSignIn,
  trackSignOut,
  trackPaymentInitiated,
  trackPaymentCompleted,
  trackPaymentFailed,
  trackSubscriptionCreated,
  trackSubscriptionCancelled,
  trackSearch,
  trackShare,
  trackComment,
  trackLike,
  trackFollow,
  trackBadgeEarned,
  trackAchievementUnlocked,
  trackLevelUp,
  trackVideoStarted,
  trackVideoCompleted,
  trackVideoProgress,
  trackError,
  trackException,
  trackPageLoadTime,
  trackApiCall,
  trackEngagement,
  trackPageView,
  getFeatureFlag,
  setFeatureFlagOverride,
  isPostHogReady,
  getSessionId,
  getDistinctId,
  disableTracking,
  enableTracking,
  isTrackingEnabled,
  batchTrackEvents,
};
