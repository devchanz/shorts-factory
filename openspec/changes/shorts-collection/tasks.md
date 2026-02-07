## 1. Database Setup

- [x] 1.1 Create D1 migration file for `shorts` and `trends` tables as per design
- [x] 1.2 Apply migrations to local and remote D1 databases
- [x] 1.3 Verify table structures and indexes (`idx_trends_country_score`, `idx_trends_created_at_desc`)

## 2. YouTube Data API Integration

- [x] 2.1 Implement `YouTubeDataService` with `getPopularVideos` method
- [x] 2.2 Implement Shorts filtering logic (duration < 60s, aspect ratio check)
- [x] 2.3 Add API quota tracking logic to record units used per request

## 3. Core Logic Implementation

- [x] 3.1 Implement `ShortsAnalyzer` for viral score calculation (Log-scale normalization + Weights)
- [x] 3.2 Add Time Decay logic to `ShortsAnalyzer` based on publication date
- [x] 3.3 Implement `ShortsRepository` for batch upserting data into D1
- [x] 3.4 Implement 7-day data retention cleanup logic in repository

## 4. Collection Pipeline & Quota Protection

- [x] 4.1 Implement `ShortsCollector` service to orchestrate sequential multi-country collection
- [x] 4.2 Integrate dynamic configuration using environment variables (`TARGET_COUNTRIES`, `SHORTS_PER_COUNTRY`, etc.)
- [x] 4.3 Implement Quota Protection logic (Panic mode at 80%, Stop mode at 95%)
- [x] 4.4 Persist daily quota usage in D1 or KV for real-time tracking

## 5. API Endpoints (Hono)

- [x] 5.1 Implement `GET /api/shorts/trending` with country filtering and score sorting
- [x] 5.2 Implement `GET /api/shorts/:id` for detailed metadata and analytic info
- [x] 5.3 Implement Admin/Internal endpoint to check current quota status and config

## 6. Worker & Cron Configuration

- [x] 6.1 Update `wrangler.toml` with Cron Trigger schedule (`0 */2 * * *`)
- [x] 6.2 Connect `scheduled` handler in `src/index.ts` to `ShortsCollector`
- [x] 6.3 Register new routes in the main Hono app

## 7. Verification & Testing

- [x] 7.1 Add unit tests for `ShortsAnalyzer` (verify viral score range and decay)
- [ ] 7.2 Add integration tests for `ShortsCollector` filtering logic
- [ ] 7.3 Manual end-to-end test in local environment (Wrangler dev)
