/**
 * Analytics Integration Utilities
 * Primary: PostHog (Open-source, privacy-friendly)
 * Secondary: Google Analytics 4 (Conditional)
 */

import * as posthog from './posthog-analytics';

export enum AnalyticsEvent {
  // Page events
  PAGE_VIEW = 'page_view',

  // User events
  SIGN_UP = 'sign_up',
  SIGN_IN = 'sign_in',
  SIGN_OUT = 'sign_out',
  USER_CREATED = 'user_created',
  USER_UPDATED = 'user_updated',

  // Course events
  COURSE_VIEWED = 'course_viewed',
  COURSE_ENROLLED = 'course_enrolled',
  COURSE_COMPLETED = 'course_completed',
  COURSE_PURCHASED = 'course_purchased',

  // Lesson events
  LESSON_STARTED = 'lesson_started',
  LESSON_COMPLETED = 'lesson_completed',

  // Quiz events
  QUIZ_STARTED = 'quiz_started',
  QUIZ_COMPLETED = 'quiz_completed',
  QUIZ_SUBMITTED = 'quiz_submitted',
  ANSWER_PROVIDED = 'answer_provided',

  // Payment events
  PAYMENT_INITIATED = 'payment_initiated',
  PAYMENT_COMPLETED = 'payment_completed',
  PAYMENT_FAILED = 'payment_failed',
  SUBSCRIPTION_CREATED = 'subscription_created',
  SUBSCRIPTION_CANCELLED = 'subscription_cancelled',

  // Engagement events
  SEARCH = 'search',
  SHARE = 'share',
  COMMENT = 'comment',
  LIKE = 'like',
  FOLLOW = 'follow',

  // Error events
  ERROR = 'error',
  EXCEPTION = 'exception',

  // Performance events
  PERFORMANCE = 'performance',
  PAGE_LOAD_TIME = 'page_load_time',
  API_CALL = 'api_call',

  // Achievement events
  BADGE_EARNED = 'badge_earned',
  ACHIEVEMENT_UNLOCKED = 'achievement_unlocked',
  LEVEL_UP = 'level_up',

  // Social events
  SOCIAL_SHARE = 'social_share',
  SOCIAL_FOLLOW = 'social_follow',
  SOCIAL_LOGIN = 'social_login',

  // Video events
  VIDEO_START = 'video_start',
  VIDEO_COMPLETE = 'video_complete',
  VIDEO_PROGRESS = 'video_progress',
}

interface AnalyticsEventParams {
  [key: string]: string | number | boolean | undefined;
}

/**
 * Initialize Analytics
 */
export function initializeAnalytics(measurementId: string) {
  // GA4 Initialization (Legacy Support)
  if (measurementId && typeof window !== 'undefined') {
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
    document.head.appendChild(script);

    (window as any).dataLayer = (window as any).dataLayer || [];
    function gtag() {
      (window as any).dataLayer.push(arguments);
    }
    (window as any).gtag = gtag;

    (gtag as any)('js', new Date());
    (gtag as any)('config', measurementId);
  }
}

/**
 * Track a custom event
 */
export function trackEvent(
  eventName: AnalyticsEvent | string,
  params?: AnalyticsEventParams
) {
  // Capture locale if available on window
  const locale = typeof window !== 'undefined' ? window.location.pathname.split('/')[1] : undefined;
  const enrichedParams = { ...params, locale };

  // Primary: PostHog
  posthog.trackEvent(eventName, enrichedParams);

  // Secondary: GA4 (if available)
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', eventName, {
      ...enrichedParams,
      timestamp: new Date().toISOString(),
    });
  }
}

/**
 * Track page view
 */
export function trackPageView(
  pagePath: string,
  pageTitle?: string,
  additionalParams?: AnalyticsEventParams
) {
  const locale = typeof window !== 'undefined' ? pagePath.split('/')[1] : undefined;
  
  posthog.trackPageView(pagePath, pageTitle);

  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', 'page_view', {
      page_path: pagePath,
      page_title: pageTitle || document.title,
      locale,
      ...additionalParams,
    });
  }
}

export function trackLocaleSwitch(from: string, to: string) {
  trackEvent('locale_switched', { from, to });
}

// Map specialized functions to PostHog wrappers while maintaining signatures

export function trackSignUp(method: string, userId?: string) {
  posthog.trackSignUp(method, userId);
  trackEvent(AnalyticsEvent.SIGN_UP, { method, user_id: userId });
}

export function trackSignIn(method: string, userId?: string) {
  posthog.trackSignIn(method, userId);
  trackEvent(AnalyticsEvent.SIGN_IN, { method, user_id: userId });
}

export function trackSignOut(userId?: string) {
  posthog.trackSignOut(userId);
  trackEvent(AnalyticsEvent.SIGN_OUT, { user_id: userId });
}

export function trackCourseView(courseId: string, courseName: string, category?: string) {
  posthog.trackCourseViewed(courseId, courseName, category);
}

export function trackCourseEnrollment(courseId: string, courseName: string, price?: number, currency?: string) {
  posthog.trackCourseEnrolled(courseId, courseName, price, currency);
}

export function trackCourseCompletion(courseId: string, courseName: string, duration?: number, lessonsCompleted?: number) {
  posthog.trackCourseCompleted(courseId, courseName, duration, lessonsCompleted);
}

export function trackLessonStart(courseId: string, lessonId: string, lessonTitle: string) {
  posthog.trackLessonStarted(courseId, lessonId, lessonTitle);
}

export function trackLessonCompletion(courseId: string, lessonId: string, lessonTitle: string, duration?: number) {
  posthog.trackLessonCompleted(courseId, lessonId, lessonTitle, duration);
}

export function trackQuizStart(quizId: string, quizName: string, courseId?: string, difficulty?: string) {
  posthog.trackQuizStarted(quizId, quizName, courseId, difficulty);
}

export function trackQuizCompletion(quizId: string, quizName: string, score: number, totalQuestions: number, duration?: number, courseId?: string) {
  posthog.trackQuizCompleted(quizId, quizName, score, totalQuestions, duration, courseId);
}

export function trackQuizSubmission(quizId: string, submissionCount: number) {
  posthog.trackQuizSubmitted(quizId, submissionCount);
}

export function trackAnswerProvided(quizId: string, questionNumber: number, isCorrect: boolean, timeSpent?: number) {
  trackEvent(AnalyticsEvent.ANSWER_PROVIDED, {
    quiz_id: quizId,
    question_number: questionNumber,
    is_correct: isCorrect,
    time_spent_seconds: timeSpent,
  });
}

export function trackPaymentInitiated(transactionId: string, value: number, currency: string, itemName: string, itemCategory?: string) {
  posthog.trackPaymentInitiated(transactionId, value, currency, itemName, itemCategory);
}

export function trackPaymentCompleted(transactionId: string, value: number, currency: string, itemName: string, itemCategory?: string, method?: string) {
  posthog.trackPaymentCompleted(transactionId, value, currency, itemName, itemCategory, method);
}

export function trackPaymentFailed(transactionId: string, value: number, currency: string, reason?: string) {
  posthog.trackPaymentFailed(transactionId, value, currency, reason);
}

export function trackSubscriptionCreated(subscriptionId: string, plan: string, value: number, currency: string) {
  posthog.trackSubscriptionCreated(subscriptionId, plan, value, currency);
}

export function trackSearch(searchTerm: string, resultCount?: number, resultType?: string) {
  posthog.trackSearch(searchTerm, resultCount, resultType);
}

export function trackShare(contentType: string, contentId: string, method: string) {
  posthog.trackShare(contentType, contentId, method);
}

export function trackBadgeEarned(badgeId: string, badgeName: string, userId?: string) {
  posthog.trackBadgeEarned(badgeId, badgeName, userId);
}

export function trackAchievementUnlocked(achievementId: string, achievementName: string, rarity?: string) {
  posthog.trackAchievementUnlocked(achievementId, achievementName, rarity);
}

export function trackLevelUp(newLevel: number, userId?: string, totalXp?: number) {
  posthog.trackLevelUp(newLevel, userId, totalXp);
}

export function trackVideoStart(videoId: string, videoTitle: string, duration?: number) {
  posthog.trackVideoStarted(videoId, videoTitle, duration);
}

export function trackVideoCompletion(videoId: string, videoTitle: string, watchedDuration: number, totalDuration: number) {
  posthog.trackVideoCompleted(videoId, videoTitle, watchedDuration, totalDuration);
}

export function trackVideoProgress(videoId: string, currentTime: number, totalDuration: number, percentage: number) {
  posthog.trackVideoProgress(videoId, currentTime, totalDuration, percentage);
}

export function trackError(errorMessage: string, errorCode?: string, context?: Record<string, any>) {
  posthog.trackError(errorMessage, errorCode, context);
}

export function trackException(description: string, fatal = false) {
  posthog.trackException(description, fatal);
}

export function setUserId(userId: string) {
  posthog.identifyUser(userId);
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('config', process.env.NEXT_PUBLIC_GA_ID, { user_id: userId });
  }
}

export function setUserProperties(properties: Record<string, any>) {
  posthog.setUserProperties(properties);
}

export function trackPageLoadTime(loadTime: number) {
  posthog.trackPageLoadTime(loadTime);
}

export function trackApiCall(endpoint: string, method: string, duration: number, statusCode?: number) {
  posthog.trackApiCall(endpoint, method, duration, statusCode);
}

export function isAnalyticsConfigured(): boolean {
  return posthog.isPostHogReady() || !!process.env.NEXT_PUBLIC_GA_ID;
}

export function clearUserData() {
  posthog.resetUser();
}
