# Proposal: shorts-collection

## Motivation
기존 V1(youtube-trend-insight)은 Shorts 수집률 10% 미만의 실패 사례였습니다. 본 프로젝트는 이를 극복하고 6개국(KR, US, UK, CA, AU, IN)의 YouTube Shorts 트렌드 데이터를 실시간에 가깝게(2시간 주기) 확보하여, AI 영상 자동화 파이프라인의 핵심 데이터 소스로 활용하는 것을 목표로 합니다.

## What Changes
국가별 YouTube Shorts 트렌드 수집 시스템을 구축합니다. YouTube Data API v3를 활용하여 6개국에서 매일 12회(2시간 주기), 회당 국가별 100개씩 총 7,200개의 Shorts 메타데이터를 수집하고, D1 데이터베이스에 저장합니다. 수집 주기와 수집량은 환경 변수를 통해 동적으로 조절 가능하며, API 쿼터 자동 최적화 로직이 적용됩니다.

## Capabilities

### New Capabilities
- `collect-shorts-by-country`: 6개 타겟 국가별 인기 Shorts 수집 (2시간 주기, 국가당 100개)
- `calculate-viral-score`: 조회수, 좋아요, 댓글 수, 게시 시간 기반의 바이럴 영향력 점수(0~100) 산출 로직
- `store-shorts-data`: 수집된 Shorts 및 트렌드 분석 데이터를 D1 데이터베이스에 효율적으로 저장
- `get-trending-shorts`: 저장된 트렌드 데이터를 조회하기 위한 API 엔드포인트 제공
- `manage-collection-config`: 수집 주기, 수집량, 쿼터 한도 등을 환경 변수로 동적 제어
- `monitor-api-quota`: API 쿼터 사용량 실시간 추적 및 80% 도달 시 수집량 자동 조절

### Modified Capabilities
<!-- 변경되는 기존 기능 없음 -->

## Impact
- **Backend**: Cloudflare Workers에 YouTube Data API 연동 및 Cron Trigger(일 1회) 구현
- **Database**: Cloudflare D1에 `shorts`, `trends` 테이블 스키마 설계 및 생성
- **API**: 내부 및 프론트엔드용 트렌드 조회 API 추가
- **Quota Management**: 일일 API 쿼터 7,200 units 이내 사용을 위한 최적화 로직 적용
