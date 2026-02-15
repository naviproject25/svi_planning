# 세션 컨텍스트 - SVI 설문 시스템 개발

## 프로젝트 개요

**프로젝트명**: 사회적가치지표(SVI) 측정 설문 및 보고서 시스템

**디자인 컨셉**: 무채색 모던 미니멀 디자인

**작업 일시**: 2024년 2월 13일

---

## 완료된 작업

### 1. 로그인 페이지 (login.html) ✅
- 관리자/사용자 구분 로그인
- 무채색 디자인 (검정/흰색/회색)
- Border radius: 0 (직각 디자인)
- 데모 계정:
  - 관리자: `admin` / `admin`
  - 사용자: `user` / `user`

### 2. 설문 입력 페이지 (survey.html) ✅
- 15개 섹션 (기업정보 + 14개 지표)
- 좌측 네비게이션 사이드바
- 프로그레스 바
- 주요 3개 페이지 구현 (나머지는 동일 패턴으로 확장 가능)
- 무채색 디자인 적용
- 직각 디자인 (border-radius: 0)

### 3. 관리자 리스트 페이지 (admin-list.html) ✅
- 통계 카드 (전체/대기/검토중/완료)
- 검색/필터 기능
- 설문 목록 테이블
- 페이지네이션
- 무채색 디자인 적용

### 4. 보고서 페이지 (report.html) ✅
- Chart.js 기반 차트 (그레이스케일)
- 종합 평가 섹션
- 관점별 성과
- 지표별 성과 (레이더 차트)
- 개선지표 의견
- 인쇄/PDF 저장 기능
- 무채색 디자인 적용

### 5. 기획서 (기획서.txt) ✅
- Figma Design 붙여넣기 가능한 텍스트 형태
- 무채색 디자인 시스템 문서
- 4개 화면별 상세 기획
- API 명세, 데이터 구조

---

## 파일 구조

```
D:\1.Git\AX\SVI\Servei\
├── login.html                 # 로그인 페이지
├── survey.html                # 설문 입력 페이지 (1223 lines)
├── admin-list.html            # 관리자 리스트 페이지 (745 lines)
├── report.html                # 보고서 페이지 (774 lines)
├── 기획서.txt                  # 기획서 문서
├── SESSION_CONTEXT.md         # 이 파일 (세션 컨텍스트)
└── Src/                       # 참조 이미지
    ├── 00.png ~ 14.png        # 설문 화면 참조
    ├── 16 결과.png             # 보고서 참조
    ├── 17 결과.png             # 보고서 참조
    └── 기획서 참조.png         # 기획서 참조
```

---

## 디자인 시스템

### 색상 팔레트 (Grayscale Only)
- **Pure Black**: `#000000` (Primary, CTA)
- **Dark Gray**: `#1a1a1a` (Headers)
- **Medium Dark**: `#2a2a2a` (Hover)
- **Gray**: `#333333` (Body Text)
- **Mid Gray**: `#666666` (Secondary Text)
- **Light Gray**: `#888888`, `#aaaaaa`, `#cccccc`
- **Very Light**: `#e5e5e5`, `#f5f5f5`, `#fafafa`
- **White**: `#ffffff`

### 디자인 원칙
1. **완전한 무채색** - 유채색 사용 금지
2. **직각 디자인** - border-radius: 0 (spinner 제외)
3. **강한 대비** - 검정 vs 흰색
4. **미니멀리즘** - 불필요한 장식 제거
5. **넓은 여백** - 충분한 공간감

---

## 사용 방법

### Figma Make 사용
1. HTML 파일 전체 코드 복사
2. Figma Make에 붙여넣어 목업 생성
3. 프롬프트로 수정 및 다듬기
4. 캡처 후 로컬 프로그램 반영

### Figma Design 사용
1. `기획서.txt` 전체 내용 복사
2. Figma Design에 텍스트 상자로 붙여넣기
3. 섹션별 정리
4. 최종 기획서 완성

---

## 기술 스택

### 프론트엔드
- HTML5, CSS3, JavaScript (ES6+)
- Chart.js 4.4.0 (CDN)
- Vanilla JS (프레임워크 없음)

### 스타일
- Pure CSS (No Framework)
- System Fonts
- Border Radius: 0
- Grayscale Colors Only

---

## 다음 작업 (미완료)

### 1. 설문 입력 페이지 확장
**현재 상태**: 3개 페이지만 구현 (기업정보, 지표1, 지표2)

**필요 작업**:
- [ ] 지표 3~14 페이지 추가 구현
- [ ] 각 지표별 입력 양식 구현
- [ ] 동적 테이블 행 추가/삭제 기능 완성
- [ ] 파일 업로드 기능 구현

**참조 파일**:
- `Src/03.png` ~ `Src/14.png` 확인

**작업 방법**:
```javascript
// survey.html에 섹션 추가
<section class="page-section" id="page-3">
    <!-- 지표3 내용 -->
</section>
```

### 2. 백엔드 API 개발
- [ ] RESTful API 설계
- [ ] 인증/인가 (JWT)
- [ ] 설문 저장/조회
- [ ] 보고서 생성
- [ ] PDF 출력

### 3. 데이터베이스 설계
- [ ] 사용자 테이블
- [ ] 설문 테이블
- [ ] 지표 데이터 테이블
- [ ] 보고서 테이블

### 4. 추가 기능
- [ ] 엑셀 일괄 업로드
- [ ] 이메일 알림
- [ ] 실시간 자동 저장
- [ ] 반응형 모바일 최적화

---

## 주요 코드 패턴

### 페이지 네비게이션
```javascript
function goToPage(pageNum) {
    // 현재 페이지 숨기기
    document.querySelectorAll('.page-section').forEach(section => {
        section.classList.remove('active');
    });

    // 새 페이지 표시
    document.getElementById(`page-${pageNum}`).classList.add('active');

    // 사이드바 업데이트
    updateSidebar(pageNum);

    // 프로그레스 바 업데이트
    updateProgress(pageNum);
}
```

### 저장 기능
```javascript
function savePage() {
    showLoading('저장 중입니다...');

    // API 호출 (실제 구현 필요)
    setTimeout(() => {
        hideLoading();
        alert('저장되었습니다.');
        markAsCompleted(currentPage);
    }, 1500);
}
```

### 차트 생성 (Grayscale)
```javascript
new Chart(ctx, {
    type: 'doughnut',
    data: {
        labels: ['항목1', '항목2'],
        datasets: [{
            data: [90.1, 9.9],
            backgroundColor: ['#000', '#ccc'], // 무채색만
            borderWidth: 2,
            borderColor: '#fff'
        }]
    }
});
```

---

## 주의 사항

### 디자인 관련
1. **절대 유채색 사용 금지**
   - 빨강, 파랑, 녹색, 노랑 등 모든 색상 사용 불가
   - 오직 흑백 그레이스케일만

2. **Border Radius**
   - 모든 요소: `border-radius: 0`
   - 예외: spinner (`border-radius: 50%`)

3. **호버 효과**
   - 버튼: `#2a2a2a` (약간 밝은 검정)
   - 입력 필드: `#000` 테두리

### 개발 관련
1. **필수 필드 검증**
   - 빈 값 체크
   - 형식 검증 (이메일, 전화번호 등)

2. **파일 업로드**
   - 허용 확장자: pdf, jpg, png
   - 최대 용량: 10MB

3. **브라우저 지원**
   - Chrome, Firefox, Safari, Edge (최신 2개 버전)

---

## 테스트 계정

### 관리자
- ID: `admin`
- PW: `admin`
- 접근: admin-list.html

### 사용자
- ID: `user`
- PW: `user`
- 접근: survey.html

---

## 문제 해결

### Q1. 로그인이 안 됨
- 아이디/비밀번호 확인
- 사용자 유형 선택 확인
- 개발자 도구 콘솔 확인

### Q2. 페이지 이동이 안 됨
- JavaScript 오류 확인
- 페이지 ID 확인 (`page-0` ~ `page-14`)

### Q3. 차트가 안 보임
- Chart.js CDN 로드 확인
- Canvas 요소 확인
- 데이터 확인

---

## 커밋 메시지 (참고)

```
feat: 무채색 모던 디자인 SVI 설문 시스템 구현

- 로그인 페이지 (관리자/사용자 구분)
- 설문 입력 페이지 (15개 섹션, 3개 구현)
- 관리자 리스트 페이지 (검색/필터)
- 보고서 페이지 (Chart.js 그레이스케일)
- 기획서 문서 (Figma Design용)

디자인: 완전 무채색, 직각 디자인, 미니멀리즘

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
```

---

## 다음 세션 시작 방법

### 1. 이 파일 먼저 읽기
```
D:\1.Git\AX\SVI\Servei\SESSION_CONTEXT.md
```

### 2. 현재 파일 확인
```bash
cd "D:\1.Git\AX\SVI\Servei"
ls -la
```

### 3. 기존 작업 확인
- login.html 열어보기
- survey.html에서 구현된 부분 확인
- 기획서.txt 참고

### 4. 작업 이어서 하기
```
"D:\1.Git\AX\SVI\Servei 프로젝트 이어서 할게.
survey.html에 지표 3~14 추가해줘"
```

또는

```
"SESSION_CONTEXT.md 확인했어.
다음 작업(미완료) 부분부터 시작하자"
```

---

## 연락처 및 참고

- 작업 디렉토리: `D:\1.Git\AX\SVI\Servei`
- 참조 이미지: `Src/` 폴더
- 디자인 컨셉: 무채색 모던 미니멀

---

**작성일**: 2024년 2월 13일
**작성자**: Claude Code Session
**버전**: 1.0
