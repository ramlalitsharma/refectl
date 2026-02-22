# News Automation Production Checklist

## What Is Automated Now
- Hourly job: `GET /api/cron/news-automation`
  - Publishes autonomous news (configurable count).
  - Processes approval queue notifications.
  - Sends newsletter at `06:00 UTC` (or forced by env flag).
- Weekly job: `GET /api/cron/news-maintenance`
  - Deletes only:
    - records with `expires_at < now`
    - old bot-generated records (`author_id = global-intelligence-bot`) older than 7 days

## Required Environment Variables
- `CRON_SECRET` = strong random secret (required)
- `NEWS_AUTO_PUBLISH_ENABLED` = `true` or `false` (default enabled)
- `NEWS_AUTO_PUBLISH_COUNT` = `1` to `6` (recommended: `1`)
- `NEWS_NEWSLETTER_ALWAYS` = `true` only for testing (optional)
- `NEWS_REVENUE_MIN_SCORE` = quality gate for automation (recommended: `62`)

## Commercial Safety Recommendations
- Keep `NEWS_AUTO_PUBLISH_COUNT=1` initially.
- Keep `NEWS_REVENUE_MIN_SCORE` between `60-70` initially.
- Use `pending_approval` for sensitive topics (politics/conflict/markets) before full auto-publish.
- Add legal source attribution in every generated piece (`source_url` + source name).
- Monitor:
  - publish success/failure rate
  - duplicate headline rate
  - engagement quality (CTR, dwell time, bounce)

## Verification Commands (after deploy)
- Hourly automation endpoint:
  - `curl -H "Authorization: Bearer <CRON_SECRET>" https://<your-domain>/api/cron/news-automation`
- Weekly maintenance endpoint:
  - `curl -H "Authorization: Bearer <CRON_SECRET>" https://<your-domain>/api/cron/news-maintenance`

## Go-Live Criteria
- Cron endpoints return `success: true` for 7 consecutive runs.
- No unauthorized cron calls in logs.
- No manual/editorial articles deleted by maintenance.
- Frontend `/en/news` remains populated and stable during automation cycles.
