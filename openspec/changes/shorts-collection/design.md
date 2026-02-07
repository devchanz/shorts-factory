# Architecture Design: Shorts Collection System

## Context
Shorts-factory 프로젝트의 핵심 데이터 소스인 글로벌 YouTube Shorts 트렌드를 수집하는 시스템을 구축한다. 6개국(KR, US, UK, CA, AU, IN)의 데이터를 2시간 주기로 수집하여 D1 데이터베이스에 저장하고, 자체 알고리즘으로 바이럴 점수를 산출한다. 수집량과 주기는 환경 변수로 제어하여 유연성을 확보한다.

## Design

### 1. Data Collection Strategy (Cron & Workers)

**Architecture:**
- **Trigger**: Cloudflare Workers Cron Trigger (예: `0 */2 * * *` - 매 2시간마다 실행)
- **Configuration**: 환경 변수(`COLLECT_INTERVAL_HOURS`, `SHORTS_PER_COUNTRY`)를 통해 동작 제어
- **Controller**: `ShortsCollector` 서비스가 전체 수집 프로세스 제어 및 쿼터 상태 확인
- **Execution**: 국가별 병렬 처리는 API Rate Limit 관리 복잡성을 피하기 위해 **순차 처리(Sequential)**를 채택한다.

**Flow:**
1. Cron 이벤트 발생
2. `TargetCountries` (Env: `TARGET_COUNTRIES`) 배열 순회
3. 각 국가별로 `YouTubeDataService.getPopularShorts(countryCode, limit=SHORTS_PER_COUNTRY)` 호출
4. 수집된 Raw 데이터 파싱 및 필터링 (60초 이하, 9:16 비율)
5. `ShortsAnalyzer.calculateViralScore(shorts)` 호출
6. `ShortsRepository.upsertBatch(shorts)` 호출

### 2. Database Schema (D1)

**Table: `shorts`**
- `id` (TEXT, PRIMARY KEY): YouTube Video ID
- `title` (TEXT)
- `thumbnail_url` (TEXT)
- `channel_id` (TEXT)
- `channel_title` (TEXT)
- `published_at` (TEXT): ISO 8601
- `duration` (TEXT): ISO 8601 Duration (e.g., PT59S)
- `created_at` (INTEGER): 수집 시점 Timestamp

**Table: `trends`**
- `id` (INTEGER, PRIMARY KEY AUTOINCREMENT)
- `short_id` (TEXT, FOREGIN KEY to shorts.id)
- `country_code` (TEXT): ISO 3166-1 alpha-2
- `view_count` (INTEGER)
- `like_count` (INTEGER)
- `comment_count` (INTEGER)
- `viral_score` (INTEGER): 0-100
- `snapshotted_at` (INTEGER): 수집 시점 Timestamp

**Indexes:**
- `idx_trends_country_score`: `country_code`, `viral_score` DESC (조회 성능 최적화)
- `idx_trends_created_at_desc`: `snapshotted_at` DESC (오래된 데이터 삭제용)

### 3. API Quota Management & Dynamic Config

**Environment Variables:**
- `COLLECT_INTERVAL_HOURS`: 2 (Default)
- `SHORTS_PER_COUNTRY`: 100 (Default)
- `TARGET_COUNTRIES`: "KR,US,UK,CA,AU,IN"
- `DAILY_QUOTA_LIMIT`: 7200

**Quota Consumption Estimation:**
- 1 request = 50 videos (max page size)
- `SHORTS_PER_COUNTRY` = 100 -> 2 requests needed
- Cost per request = ~7 units (snippet, statistics, contentDetails, etc.)
- Total per run = 6 countries * 2 requests * 7 units = 84 units
- Daily runs = 24 / 2 = 12 runs
- Daily Total = 84 units * 12 runs = 1,008 units << 7,200 (Daily Limit)

**Quota Protection Logic:**
- **Real-time Tracking**: D1 또는 KV에 `daily_quota_used` 저장 및 갱신.
- **Panic Mode (80%)**: `daily_quota_used` > `DAILY_QUOTA_LIMIT * 0.8` (5,760) 도달 시,
  - `SHORTS_PER_COUNTRY`를 50으로 자동 감소.
- **Stop Mode (95%)**: Quota 95% 초과 시 수집 중단 및 알림.

### 4. Viral Score Algorithm

`Viral Score = (Normalized Views * W1) + (Normalized Likes * W2) + (Normalized Comments * W3) * TimeDecay`

- **Normalization**: 각 메트릭을 로그 스케일로 변환하여 값의 편차 완화 (e.g., `log(views + 1)`)
- **Weights**:
  - 조회수(W1): 0.3
  - 좋아요(W2): 0.5 (높은 가중치)
  - 댓글(W3): 0.2
- **Time Decay**: `1 / (days_since_published + 1)^0.5` (최신 영상 우대)
- 최종 점수는 0~100 사이로 스케일링하여 저장.

## Decisions

- **Single Worker vs Multiple Workers**: 단일 Worker(`apps/workers`) 내에서 모든 로직 처리. 현재 트래픽 규모에서 분리 불필요.
- **D1 vs KV**: 구조화된 쿼리(범위 검색, 정렬)가 필수적이므로 D1 선택.

## Risks & Trade-offs

- **Risk**: YouTube API 응답에서 `short` 여부를 명확히 구분하는 필드가 제한적임.
  - **Mitigation**: `duration` < 60s 필터와 썸네일 비율(또는 `videoDetails` API 추가 호출 없이 가능한 메타데이터)로 1차 필터링. 필요 시 `search` API 병행 고려 가능하나 쿼터 비용이 높으므로 `videos.list` (chart=mostPopular) 우선 사용.
- **Risk**: 빈번한 수집(2시간)으로 인한 중복 데이터 처리 부하
  - **Mitigation**: `upsert` 로직 최적화. 변동 사항(조회수, 좋아요 등)이 큰 경우에만 업데이트하거나, `trends` 테이블에 스냅샷만 추가하고 `shorts` 메타데이터 업데이트는 최소화.

## Migration Plan

1. D1 migration 파일 생성 및 적용 (`wrangler d1 migrations apply`)
2. Worker 환경 변수(YOUTUBE_API_KEY) 설정
3. 로컬 테스트: `wrangler dev` 환경에서 Cron 트리거 수동 호출 (`curl` or `wrangler` command)
4. 배포 및 모니터링
