# Admin Guide

Welcome to the **LMS Gamification Admin Dashboard**.

**URL**: `/dashboard/admin`
**Access**: Users with `role: "admin"`.

---

## 🛡️ Moderation

### Handling Reports
1. Go to **Moderation Queue**.
2. Review pending reports (Oldest first).
3. **Actions**:
   - **Dismiss**: If report is invalid (spam/mistake).
   - **Warn**: Log a warning locally (doesn't affect access).
   - **Ban**: Instantly revokes user access to the platform.

### Banning/Unbanning
- You can manually ban a user from the **User Management** tab.
- Banned users receive a 403 Forbidden on all API requests.

---

## 🎨 Content Management (CMS)

You can add new Badges and Quests *without* asking developers to change code.

### Adding a Badge
1. Navigate to **Content -> Badges**.
2. Click **Create Badge**.
3. **Fields**:
   - **ID**: `summer_event_2025` (Must be unique).
   - **Requirement**: `quizzes_completed` = `50`.
   - **XP**: `500`.
4. Users will automatically start earning this badge if they meet criteria.

### Adding a Daily Quest
1. Navigate to **Content -> Quests**.
2. Create a template (e.g., "Read 3 Articles").
3. Tomorrow, the system will random generator *might* pick this quest for users.

---

## 📊 Reports & Data

### Exporting Data
Go to **Reports** tab to download CSVs:
- **User Audit**: Check for level distribution or duplicate accounts.
- **Activity Log**: Analyze peak study times.
- **Gamification**: See which badges are too rare or too common.

---

## 🧪 System Diagnostics

If the game features seem Broken (e.g., XP not updating):
1. Go to **Settings/Diagnostics**.
2. Click **Run Health Check**.
3. The system will simulate a "Ghost User" and verifies:
   - DB Connection.
   - XP Calculation.
   - Quest Engine.
4. If checking fails, contact the Developer Team.
