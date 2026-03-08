# Modular + OOP Standard

Use this standard for every feature migration.

## Folder Convention

- `modules/<feature>/frontend/*`
- `modules/<feature>/backend/services/*`
- `modules/<feature>/shared/*` (optional)
- `modules/<feature>/index.ts`

## Class Convention

- `*PublicService`: read/query orchestration for public routes.
- `*AdminService`: write/update orchestration for admin routes.
- `*SeoService`: metadata + structured data generation.
- All services extend `FeatureModule` or `SeoModule`.

## Route Convention

Route files under `app/[locale]/*` are thin wrappers:

1. import page composer from `modules/<feature>/frontend/*`
2. import metadata function from `modules/<feature>/frontend/*`
3. return delegated function

## Security + Reliability Rules

1. Keep DB access only in backend service classes.
2. Validate route params in service methods.
3. Centralize fallback behavior in service methods.
4. Keep UI components pure and data-agnostic.
5. Keep SEO logic in `SeoService`.

