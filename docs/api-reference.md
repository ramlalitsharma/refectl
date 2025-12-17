# LMS Gamification API Reference

This document outlines the API endpoints available in the LMS Gamification System.

**Base URL**: `/api`
**Authentication**: Most endpoints require Clerk Authentication (Session Cookie).

---

## 👤 User & Stats

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/user/stats` | Get current user's XP, Level, Streak, etc. |
| `GET` | `/user/stats/streak` | Get simplified streak info. |
| `POST` | `/user/stats/xp/award` | (Internal) Grant XP to user. |
| `POST` | `/user/stats/streak/update` | (Internal) Update streak status. |
| `GET` | `/user/export/data` | **Data Download**. Get full JSON dump of user data. |

## 🏆 Leaderboard

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/leaderboard/rank` | Get user's rank, tier, and surrounding players (Cached). |
| `GET` | `/leaderboard/history` | Get historical ranking data. |

## 🎖️ Badges

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/badges` | List all available badge definitions. |
| `GET` | `/badges/collection` | Get user's earned badges and progress. |
| `POST` | `/badges/check` | Trigger a check for new badges. |
| `POST` | `/badges/unlock` | (Internal) Force unlock a badge. |

## 📜 Quests

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/quests/daily` | Get today's 3 generated quests. |
| `POST` | `/quests/daily/progress` | Update progress on a quest. |
| `POST` | `/quests/daily/complete` | Claim reward for completing all daily quests. |

## 📊 Analytics

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/analytics/score-trend` | Get quiz score history (Line Chart). |
| `GET` | `/analytics/study-time` | Get study duration breakdown (Bar Chart). |
| `GET` | `/analytics/activity-heatmap`| Get daily activity intensity (Grid). |
| `GET` | `/analytics/subject-mastery` | Get subject performance (Radar Chart). |

## 🔔 Notifications

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/notifications` | Get unread/recent notifications. |
| `POST` | `/notifications/mark-read` | Mark notifications as read. |
| `POST` | `/notifications/send` | (Internal) Dispatch a new notification. |

## 🤝 Social & Community

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/users/:userId/profile` | Public profile view. |
| `GET` | `/social/friends` | List friends and requests. |
| `POST` | `/social/friend-request` | Send/Accept/Reject requests. |
| `GET` | `/social/activity-feed` | Get global or friend activity feed. |

## 🛠️ Admin & Management

**Note**: Headers must include valid Admin Session.

### Dashboard
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/admin/stats` | System wide totals (Users, XP, etc). |
| `GET` | `/admin/users` | User management list. |
| `GET` | `/admin/logs` | Audit logs. |

### Content Management (CMS)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/admin/content/badges` | List all badges. |
| `POST` | `/admin/content/badges` | Create new badge. |
| `GET` | `/admin/content/quests` | List quest templates. |
| `POST` | `/admin/content/quests` | Create new quest template. |

### Moderation
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/admin/moderation/queue` | View pending reports. |
| `POST` | `/admin/moderation/resolve` | Ban/Warn/Dismiss a report. |
| `POST` | `/admin/test/diagnostics` | **Health Check**. Run system simulation. |

### Reporting
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/admin/reports/:type` | Download CSV (users, activity, gamification). |
