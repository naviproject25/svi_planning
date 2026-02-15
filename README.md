# Light-SVI 진단 시스템

사회적기업 직무역량 자가진단 웹 서비스

## 시스템 구성

```
1. SVI_Report/       - SVI 보고서 샘플 및 기업 데이터
2. SVI_Survei_Tool/  - 설문 웹 서비스 (React + Supabase)
3. SVI_Chatbot/      - SVI 매뉴얼 자료
```

## 주요 기능

- 로그인 : 역할별 인증 (관리자 / 일반 사용자)
- 설문 : 18개 문항 + 기본 문항 2개, 신규 작성 및 수정 모드
- 결과 : LLM 기반 분석 보고서, 차트 시각화, 인쇄
- 관리자 : 설문 목록 조회, 수정, 삭제

## 계정

| 역할 | 계정명 | 비밀번호 | 용도 |
|------|--------|----------|------|
| 관리자 | admin | admin123! | 설문 관리 (회사직원) |
| 사용자 | user | user123! | 설문 참여 (일반인) |

## 기술 스택

- Frontend : React + TypeScript + Tailwind CSS
- Backend : Supabase (Edge Functions)
- AI : LLM 기반 진단 분석
