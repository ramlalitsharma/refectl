# Project Quality Audit (2026-02-16)

## Executive Snapshot
- Product direction and feature depth are strong.
- Visual identity is distinctive and improving.
- Current blockers to "world-class consistency" are engineering hygiene and performance discipline at scale.

## Current Baseline
- `npm run lint` reports large technical-debt volume (warnings + errors), with major noise from generated artifacts.
- UI quality is high on flagship surfaces (`/en`, `/en/news`) but inconsistent across long-tail admin and utility screens.
- Theme behavior is now stabilized (dark/light class init + deterministic toggle), but component-level consistency still needs a sweep.

## High-Impact Fixes Completed In This Pass
- Added production log hygiene in `app/api/public/news/route.ts`:
  - API debug logs run only in non-production.
- Reduced lint noise from generated/system artifacts in `eslint.config.mjs`:
  - Ignore `generated/**`, `generated-prisma/**`, service-worker bundles.
- Added global UX/performance safeguards in `app/globals.css`:
  - `prefers-reduced-motion` accessibility policy.
  - Better text wrapping defaults (`balance`/`pretty`).
  - Offscreen rendering deferral for heavy landing sections.
- Added news-surface rendering optimization in `styles/news.css`:
  - `content-visibility` + `contain-intrinsic-size` for heavy news sections.
  - Headline wrapping for premium readability.

## Priority Roadmap (Recommended)
1. Reliability + Build Integrity
- Re-enable strict TypeScript build gate (remove `ignoreBuildErrors`) after targeted cleanup.
- Remove remaining runtime-only console noise outside diagnostics modules.

2. Core Web Vitals
- Replace remaining `<img>` with Next `<Image />` on critical paths.
- Audit large client bundles and convert non-critical components to lazy/dynamic imports.
- Add route-level skeleton/loading states where network latency is high.

3. Design System Convergence
- Create shared surface primitives (`PageShell`, `Section`, `Card`) and migrate top 12 traffic routes.
- Normalize spacing, typography scale, and contrast across admin/news/home.

4. Accessibility + International UX
- Keyboard focus and ARIA pass for all dropdowns, dialogs, and editor controls.
- Contrast verification for both light/dark and high-density displays.
- Language/locale QA for long strings and navigation overflow.

5. AI Adaptability (Product)
- Add AI quality guardrails:
  - Prompt templates with editorial tone presets.
  - Confidence/verification labels for generated output.
  - Human-review checkpoints before publish for high-visibility content.

## Success Metrics
- Lint: reduce from current baseline to <300 warnings, 0 errors.
- CWV targets: LCP < 2.5s, INP < 200ms, CLS < 0.1 on `/en` and `/en/news`.
- Accessibility: WCAG AA contrast and keyboard pass for primary flows.
- Editorial velocity: reduce publish cycle time while maintaining manual review controls.

