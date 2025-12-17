# Database Schema Documentation

The system uses **MongoDB** with Mongoose-like schema validation (via Zod/Interfaces).

## Core Collections

### `users`
Synced from Clerk (Auth).
- `userId` (String, Unique): Clerk ID.
- `name`, `email`, `avatar`.
- `role`: 'user' | 'admin'.
- `isBanned`: Boolean.

### `userStats` (Gamification Core)
Real-time stats for every user.
- `userId` (Unique).
- `currentXP`, `currentLevel`.
- `currentStreak`, `longestStreak`, `lastActivityDate`.
- `quizzesCompleted`, `perfectScores`.
- `totalStudyTime` (minutes).

### `studyActivities`
Immutable log of every learning action.
- `userId`.
- `activityType`: 'quiz' | 'reading' | 'video'.
- `durationSeconds`.
- `score` (for quizzes).
- `metadata`: { subject, topic, difficulty }.
- `createdAt` (Indexed).

---

## Content & Progression

### `badges` (CMS)
Definitions of available badges.
- `id`, `name`, `description`, `icon`.
- `requirementType`: 'streak_days', 'quizzes_completed', etc.
- `requirementValue`.
- `xpReward`.

### `userBadges`
Badges earned by users.
- `userId`, `badgeId`.
- `earnedAt`.
- `progress` (0-100).

### `questTemplates` (CMS)
Blueprints for Daily Quests.
- `type`: 'study_time', 'complete_quiz'.
- `requirementValue`.
- `xpReward`.
- `frequency`: 'daily'.

### `dailyQuests`
Generated daily instances for users.
- `userId`, `date`.
- `quests`: Array of quest instances with `progress` and `completed` status.

---

## Social & Community

### `friendships`
- `userId`, `friendId`.
- `status`: 'pending' | 'accepted'.
- `initiatedBy`.

### `activityFeed`
Public/Friend-only events.
- `userId`, `userName`, `userAvatar`.
- `type`: 'level_up', 'badge_earned', 'streak_milestone'.
- `visibility`: 'public' | 'friends' | 'private'.

### `leaderboardHistory`
Snapshots of rankings.
- `date`.
- `rankings`: Array of { userId, rank, xp }.

### `reports` (Moderation)
- `reporterId`, `reportedId`.
- `reason`, `description`.
- `status`: 'pending' | 'resolved'.

---

## System

### `notifications`
- `userId`.
- `type`, `title`, `message`.
- `read`: Boolean.
- `expiresAt`: TTL Index (30 days).

### `adminLogs`
Audit trail.
- `adminId`.
- `action`: 'ban_user', 'create_badge'.
- `targetId`.
