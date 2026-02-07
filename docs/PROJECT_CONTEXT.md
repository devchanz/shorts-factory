# shorts-factory Project Context

## 목적
글로벌 YouTube Shorts 트렌드 분석 → AI 영상 자동화 파이프라인

## 타겟 시장
KR, US, UK, CA, AU, IN (6개국)
- KR: 한국어 콘텐츠, 홈 마켓
- US, UK, CA, AU, IN: 영어 콘텐츠, 고CPM ($10-30)

## 기술 스택
- Frontend: Next.js 14, Tailwind, TypeScript
- Backend: Cloudflare Workers (Hono)
- Database: Cloudflare D1
- AI: Gemini 1.5 Flash
- Design: Pencil.dev
- Spec: OpenSpec

## 개발 환경
- 패키지 매니저: pnpm
- Node 버전: 18+
- IDE: Antigravity (VSCode 기반)
- OS: Windows

## 페이지 (4개)
1. / - 대시보드
2. /shorts-trends - 트렌드 목록
3. /pipeline - 자동화 상태
4. /review - 검토 대기열

## TDD 적용 대상
- 바이럴 점수 계산
- Shorts 데이터 검증
- 트렌드 분석 알고리즘
