# Developer & Architecture Guide

## 🏗️ System Architecture

The LMS Gamification project is a **Next.js 14** application (App Router) using a **Service-Layer Architecture**.

### Stack
- **Framework**: Next.js 14 (TypeScript)
- **Database**: MongoDB (Native Driver + Models)
- **Auth**: Clerk
- **Styling**: Tailwind CSS + Framer Motion
- **Caching**: In-Memory `CacheService` (Replaceable with Redis)

---

## 🧩 Architectural Patterns

### 1. Service Layer (`/lib`)
Business logic lives here, NOT in API routes.
- `xp-system.ts`: Logic for leveling up.
- `badge-system.ts`: Logic for checking achievements.
- `moderation-service.ts`: Logic for reports.

**Rule**: API Routes (`/app/api`) should only *call* Service functions. They handle Auth and Response formatting. Service functions handle Data and Logic.

### 2. Caching Strategy
We use a **Cache-Aside** pattern.
- **Read**: Check `CacheService.get(key)`. If missing, query DB, then `CacheService.set()`.
- **Write**: Update DB, then `CacheService.del(key)` (Invalidate).
- **Critical Endpoints**: Leaderboard (`5 min TTL`), Analytics (`1 hr TTL`).

### 3. CMS / Dynamic Content
Badges and Quests are **Database-Driven**.
- The app fetches definitions from `badges` collection at runtime.
- Use `lib/cms-seed.ts` to initialize default content if DB is empty.

---

## 💻 Local Development

### Setup
```bash
npm install
# Set .env.local with MONGODB_URI and CLERK_SECRET_KEY
npm run dev
```

### Running Tests
We use a **Diagnostics Script** instead of Jest for E2E logic verification.
```bash
# Trigger via API (Requires Admin Token)
POST /api/admin/test/diagnostics
```

### Adding a New Feature
1. **Model**: Create interface in `lib/models`.
2. **Service**: implement logic in `lib/my-feature-service.ts`.
3. **API**: Expose via `app/api/my-feature/route.ts`.
4. **UI**: Create component in `components/dashboard`.
