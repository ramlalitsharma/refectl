# Reflect Games: Global Platform Plan

## Goals
1. Deliver a premium browser gaming hub with instant play and cross-device performance.
2. Build lasting retention with social play, personalization, and high-quality UX.
3. Scale content and discoverability with SEO-first game pages and structured data.

## Market Signals (Summary)
1. Instant play, no downloads, and cross-device support are table stakes.
2. Discovery is driven by curated collections, personal recommendations, and fast preview content.
3. Clear, credible game detail pages improve trust and time-on-site.

## UX Pillars
1. Speed: Launch games in one tap, show load skeletons, stream assets.
2. Trust: Transparent metadata, age/safety info, smooth ads, no intrusive popups.
3. Discovery: Filters by genre, tags, and “Top Picks” sections.
4. Social: Friends, parties, and community leaderboards.
5. Credibility: Ratings, release info, device compatibility, and update cadence.

## Architecture Overview
1. `games/portal`: Discovery hub, curated rows, search, and personalized sections.
2. `games/<game>`: Modular game folder with `frontend/`, `core/`, and `backend/`.
3. `games/shared`: Reusable shells, SEO helpers, analytics, and UI blocks.
4. `public/og/games`: Social previews for each game.
5. `public/games/logos`: Brand marks for each game card.

## SEO & Discovery System
1. Structured data (VideoGame + CollectionPage) for each game and hub.
2. Per-game metadata, keywords, and OG imagery.
3. Dedicated game guides and “How to Play” sections.
4. Game sitemap entries for search indexing.

## Content System
1. Game overview, rules, controls, and tips.
2. Feature blocks and benefits per game.
3. FAQ for each game (play time, devices, modes).

## Monetization & AdSense Compliance
1. Auto ads loaded globally via AdSense script.
2. Ads excluded only on content that disallows auto placements.
3. Avoid intrusive overlays or deceptive UI elements.

## Roadmap
### Phase 1: Core
1. Premium games hub with hero, top picks, featured, and multiplayer rows.
2. Dedicated game pages with guides and structured data.
3. OG assets and brand logos.

### Phase 2: Discovery & Retention
1. Personalized “Continue Playing” + “Recommended for You”.
2. Collections by genre and device.
3. Lightweight ratings and review prompts.

### Phase 3: Social & Competitive
1. Friend lists, parties, and voice.
2. Ranked ladders and seasonal leaderboards.
3. Tournament infrastructure.

### Phase 4: Monetization & Growth
1. Play-pass, cosmetics, and VIP perks.
2. Sponsorship placements for featured rows.
3. Regional marketing pages and localization.

## Execution Checklist
1. Finish thumbnails/logos for every game.
2. Add per-game “Guide + Tips” content.
3. Expand GameHub sections and tracking.
4. Monitor CWV and optimize heavy assets.
5. Submit sitemap to Search Console.
