# shorts-factory Architecture

## 프로젝트 구조
monorepo (apps/web, apps/workers, packages/shared)

## API 엔드포인트 (계획)
- GET /api/shorts/trending
- GET /api/shorts/:id
- GET /api/pipeline/status
- POST /api/pipeline/trigger
- GET /api/review/queue

## D1 스키마 (계획)
- shorts: 메타데이터
- trends: 분석 결과
- pipeline_runs: 실행 기록
- review_queue: 검토 대기
