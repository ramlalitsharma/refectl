# Modular Architecture (In-Project)

This project now uses feature modules under `modules/` while keeping current URLs unchanged.

## Structure

- `modules/core/shared/*`
  - Shared OOP abstractions used by all features.
- `modules/terai-times/*`
  - Public news surface and backend service orchestration.
- `modules/blogs/*`
  - Blogs feature module boundary.
- `modules/courses/*`
  - Courses feature module boundary.
- `modules/forum/*`
  - Forum/discussions feature module boundary.
- `modules/forge-shop/*`
  - Forge Shop (whiteboard/IDE/tools) module boundary.

## Pattern

Each feature has:

- `frontend/*`
  - Route composition, view models, and UI wiring.
- `backend/services/*`
  - OOP service classes and business orchestration.
- `index.ts`
  - Barrel exports for feature-level imports.

## Terai Times (Implemented Reference)

- `modules/terai-times/frontend/public/NewsLandingPage.tsx`
- `modules/terai-times/frontend/public/NewsDetailPage.tsx`
- `modules/terai-times/backend/services/TeraiTimesPublicService.ts`
- `modules/terai-times/backend/services/TeraiTimesArticleService.ts`
- `modules/terai-times/backend/services/TeraiTimesSeoService.ts`

`app/[locale]/news/page.tsx` and `app/[locale]/news/[slug]/page.tsx` now delegate to module entrypoints.

## Migration Strategy

1. Keep route paths stable in `app/[locale]/*`.
2. Move composition logic into `modules/<feature>/frontend/*`.
3. Move orchestration into `modules/<feature>/backend/services/*`.
4. Keep shared primitives in `modules/core/shared/*`.
5. Migrate one route at a time with zero URL/API break.
