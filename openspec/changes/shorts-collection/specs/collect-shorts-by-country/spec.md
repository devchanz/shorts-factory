# Spec: collect-shorts-by-country

## ADDED Requirements

### Requirement: 국가별 Shorts 수집
시스템은 환경 변수(`TARGET_COUNTRIES`)에 지정된 국가들(기본: KR, US, UK, CA, AU, IN)의 YouTube Shorts 데이터를 수집해야 한다. 수집 주기와 수집량 또한 환경 변수로 동적 제어되어야 한다.

#### Scenario: 정기 수집 (Dynamic Interval)
- **WHEN** Cron Trigger가 설정된 주기(기본 `COLLECT_INTERVAL_HOURS=2`, 2시간)마다 실행되면
- **THEN** 시스템은 설정된 대상 국가 각각에 대해 YouTube Data API v3를 호출하여 인기 동영상을 조회한다.
- **AND** 각 국가별로 설정된 수량(`SHORTS_PER_COUNTRY`, 기본 100개)만큼 동영상 데이터를 가져온다.

### Requirement: Shorts 필터링
수집된 동영상 중 Shorts 형식이 아닌 것(예: 일반 가로 동영상)은 제외해야 한다.

#### Scenario: 동영상 길이 기반 필터링
- **WHEN** API로부터 동영상 목록을 응답받으면
- **THEN** 동영상 길이가 60초 이하, 가로 세로 비율이 9:16 인 동영상만 필터링하여 유지한다. (API 파라미터 또는 응답 데이터 검사)

### Requirement: API 쿼터 최적화
하루 API 쿼터 사용량을 7,200 units 이내로 유지해야 한다.

#### Scenario: 쿼터 소진 방지 및 자동 조절
- **WHEN** 수집 프로세스가 시작될 때 현재까지의 일일 쿼터 사용량을 조회하여
- **IF** 사용량이 일일 한도(`DAILY_QUOTA_LIMIT`)의 80%를 초과했다면
  - **THEN** `SHORTS_PER_COUNTRY`를 절반(기본 50)으로 줄여서 수집을 진행한다.
- **IF** 사용량이 일일 한도의 95%를 초과했다면
  - **THEN** 수집을 중단하고 관리자에게 경고 로그를 남긴다.
- **ALWAYS** 수집 완료 후 사용된 쿼터 양을 누적하여 저장한다.
