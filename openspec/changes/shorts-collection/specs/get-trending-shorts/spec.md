# Spec: get-trending-shorts

## ADDED Requirements

### Requirement: 트렌드 조회 API
클라이언트(웹 프론트엔드 또는 내부 시스템)가 국가별 트렌딩 Shorts 목록을 조회할 수 있어야 한다.

#### Scenario: 국가별 인기 목록 조회
- **WHEN** `GET /api/shorts/trending` 요청이 `country` 파라미터(예: 'KR')와 함께 들어오면
- **THEN** 해당 국가의 Shorts 목록을 바이럴 점수 내림차순으로 정렬하여 반환한다.
- **AND** 기본적으로 상위 50개(또는 요청된 limit) 항목을 반환한다.

#### Scenario: 상세 정보 조회
- **WHEN** `GET /api/shorts/:id` 요청이 들어오면
- **THEN** 해당 Shorts ID에 대한 상세 메타데이터와 최신 분석 정보를 반환한다.
