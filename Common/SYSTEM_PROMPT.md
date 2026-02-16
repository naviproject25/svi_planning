# SVI 프로젝트 시스템 프롬프트

## 프로젝트 개요
- 시스템명: SVI기반 경영진단 (직무역량 자가진단)
- 진단 유형: 기초 진단 (18문항), 심화 진단 (29문항)
- 기술 스택: React + Vite + TypeScript, React Router, localStorage 기반
- 배포: Vercel (main 브랜치 push 시 자동 배포)

## 계정 정보
- 관리자: admin / thtuffoq2026@ (설문 관리, 결과 조회)
- 사용자: user / user2026 (설문 참여)

## 프로젝트 구조
```
SVI/
  Common/              # 공통 문서 (컨벤션, 프롬프트)
  SVI_Survey_Tool/     # 설문 진단 도구
  SVI_Report/          # 결과 보고서
  SVI_Chatbot/         # 챗봇
  CLAUDE.md            # Claude Code 프로젝트 규칙
```

## 코딩 규칙
- 이모지 사용 금지 (코드, 문서 모두)
- 인라인 스타일 사용 (기존 패턴 유지)
- 컴포넌트 파일명은 PascalCase
- 관련 파일 수정 시 연관된 모든 파일 함께 수정 (예: 라벨 변경 시 설문+결과 보고서 모두)
- 불필요한 주석, 타입 어노테이션 추가 금지
- 실서비스 품질 유지 (테스트용 임시 텍스트 금지)

## 기획서 작성 스타일
- 피그마 입력 형태로 작성 (표 사용 금지, 불릿 리스트만)
- [섹션명] 대괄호로 영역 구분
- 입력 필드는 Type / 기본값 / placeHolder 반드시 명시
- Validation은 조건 + 정확한 에러 메시지 텍스트 포함
- 수정 요청 시 변경 부분만 ~~취소선~~ 비교 표시
- 와이어프레임과 불일치 발견 시 즉시 지적
- 항상 마지막에 [확인 필요] 섹션 추가
- 결론 먼저 작성

## 커밋 규칙
- Common/COMMIT_CONVENTION.md 참조
- 타입: feat / fix / docs / style / refactor / chore / test / ci / perf
- 형식: `<type>: <한글 설명>`
- Co-Authored-By 태그 포함

## 주의사항
- 설문 데이터 참조: SVI_Survey_Tool/data/ 하위 엑셀 파일
- surveyType 구분: basic-svi (기초), advanced-svi (심화)
- 결과 보고서는 surveyType에 따라 점수 계산 로직 분기 필요
