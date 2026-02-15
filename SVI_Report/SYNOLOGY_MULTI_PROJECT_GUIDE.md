# 시놀로지 NAS 멀티 프로젝트 배포 가이드

## 🎯 목표
하나의 메인 도메인(test.naviproject.biz)으로 여러 프로젝트 관리하기

---

## 📋 시나리오 분석

### ✅ 가능한 방법 (3가지)

#### 방법 1: 서브 경로 방식 (추천 ⭐⭐⭐⭐⭐)
```
메인: test.naviproject.biz
프로젝트A: test.naviproject.biz/projectA
프로젝트B: test.naviproject.biz/projectB
SVI 포털: test.naviproject.biz/svi
```
**장점:**
- 가장 간단함
- 추가 도메인/서브도메인 불필요
- 폴더 구조만으로 관리

**단점:**
- URL이 약간 길어짐
- 각 프로젝트 HTML에서 상대 경로 수정 필요

---

#### 방법 2: 서브도메인 방식
```
메인: test.naviproject.biz
프로젝트A: projecta.test.naviproject.biz
프로젝트B: projectb.test.naviproject.biz
SVI 포털: svi.test.naviproject.biz
```
**장점:**
- 깔끔한 URL
- 프로젝트 독립성

**단점:**
- 각 서브도메인마다 DNS 설정 필요
- 가상 호스트 설정 복잡

---

#### 방법 3: 포트 방식
```
메인: test.naviproject.biz
프로젝트A: test.naviproject.biz:8081
프로젝트B: test.naviproject.biz:8082
SVI 포털: test.naviproject.biz:8083
```
**장점:**
- 완전한 독립성

**단점:**
- 포트번호 기억 필요
- 각 포트마다 방화벽 설정 필요
- 전문적이지 않음

---

## 🚀 방법 1: 서브 경로 방식 (추천)

### 📝 전체 구조
```
시놀로지 NAS
└── web/
    ├── index.html (메인 페이지)
    ├── projectA/
    │   ├── index.html
    │   └── ...
    ├── projectB/
    │   ├── index.html
    │   └── ...
    └── svi/
        ├── login.html
        ├── survey.html
        ├── admin-list.html
        └── ...
```

### 단계별 설정

#### 1단계: 폴더 구조 생성

**File Station에서:**
```
1. File Station 앱 실행
2. web 폴더로 이동
3. 다음 폴더들 생성:
   - projectA
   - projectB
   - svi
```

#### 2단계: 메인 페이지 생성

**web/index.html 파일 생성:**
```html
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>NaviProject - 프로젝트 포털</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        .container {
            background: white;
            border-radius: 16px;
            padding: 60px 40px;
            max-width: 600px;
            width: 100%;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        }
        h1 {
            text-align: center;
            color: #2d3748;
            margin-bottom: 16px;
            font-size: 32px;
        }
        .subtitle {
            text-align: center;
            color: #718096;
            margin-bottom: 48px;
            font-size: 14px;
        }
        .project-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
        }
        .project-card {
            padding: 32px 24px;
            background: #f7fafc;
            border-radius: 12px;
            text-align: center;
            text-decoration: none;
            transition: all 0.3s ease;
            border: 2px solid transparent;
        }
        .project-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 8px 24px rgba(102, 126, 234, 0.3);
            border-color: #667eea;
        }
        .project-icon {
            font-size: 48px;
            margin-bottom: 16px;
        }
        .project-name {
            font-size: 18px;
            font-weight: 600;
            color: #2d3748;
            margin-bottom: 8px;
        }
        .project-desc {
            font-size: 13px;
            color: #718096;
        }
        .footer {
            text-align: center;
            margin-top: 40px;
            padding-top: 24px;
            border-top: 1px solid #e2e8f0;
            color: #718096;
            font-size: 13px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>NaviProject</h1>
        <p class="subtitle">프로젝트 포털에 오신 것을 환영합니다</p>

        <div class="project-grid">
            <a href="/projectA/" class="project-card">
                <div class="project-icon">📊</div>
                <div class="project-name">프로젝트 A</div>
                <div class="project-desc">설명을 입력하세요</div>
            </a>

            <a href="/projectB/" class="project-card">
                <div class="project-icon">📈</div>
                <div class="project-name">프로젝트 B</div>
                <div class="project-desc">설명을 입력하세요</div>
            </a>

            <a href="/svi/login.html" class="project-card">
                <div class="project-icon">🏢</div>
                <div class="project-name">SVI 포털</div>
                <div class="project-desc">사회적가치지표</div>
            </a>

            <a href="/admin/" class="project-card">
                <div class="project-icon">⚙️</div>
                <div class="project-name">관리자</div>
                <div class="project-desc">시스템 관리</div>
            </a>
        </div>

        <div class="footer">
            Powered by 협동조합 소셜랩
        </div>
    </div>
</body>
</html>
```

#### 3단계: 프로젝트 파일 업로드

**각 프로젝트 폴더에 파일 업로드:**

**SVI 프로젝트 (web/svi/):**
```
1. File Station에서 web/svi 폴더 열기
2. 다음 파일들 업로드:
   - login.html
   - survey.html
   - admin-list.html
   - report.html
   - test-flow.html
```

**프로젝트 A, B도 동일하게:**
```
web/projectA/ → 프로젝트 A 파일들
web/projectB/ → 프로젝트 B 파일들
```

#### 4단계: HTML 파일 수정 (중요!)

각 프로젝트의 HTML에서 **상대 경로 수정 필요**

**예시: SVI 프로젝트의 survey.html에서**

❌ **수정 전:**
```html
<a href="login.html">로그아웃</a>
<a href="admin-list.html">관리자</a>
```

✅ **수정 후:**
```html
<a href="/svi/login.html">로그아웃</a>
<a href="/svi/admin-list.html">관리자</a>
```

**또는 상대 경로 유지:**
```html
<a href="./login.html">로그아웃</a>
<a href="./admin-list.html">관리자</a>
```

#### 5단계: Web Station 설정

```
1. Web Station 앱 실행
2. "일반 설정" 탭
3. HTTP 서비스 포트: 80
4. HTTPS 서비스 포트: 443 (선택)
5. 기본 백엔드 서버: Apache 2.4 (또는 Nginx)
```

#### 6단계: 도메인 연결

**방법 A: 도메인 구매한 경우**
```
1. 도메인 업체(가비아, 호스팅케이알 등) 로그인
2. DNS 관리 메뉴
3. A 레코드 추가:
   - 호스트: @ (또는 test)
   - 값: 시놀로지 공인 IP
   - TTL: 3600

4. 공유기 포트포워딩:
   - 외부 포트: 80
   - 내부 포트: 80
   - 내부 IP: 시놀로지 IP
```

**방법 B: 시놀로지 DDNS 사용**
```
1. 제어판 > 외부 액세스 > DDNS
2. 추가 버튼
3. 서비스 제공자: Synology
4. 호스트명: test-naviproject (원하는 이름)
5. 결과: test-naviproject.synology.me
```

#### 7단계: 접속 테스트

**내부망 테스트:**
```
http://시놀로지IP/
http://시놀로지IP/projectA/
http://시놀로지IP/projectB/
http://시놀로지IP/svi/login.html
```

**외부 접속 테스트:**
```
http://test.naviproject.biz/
http://test.naviproject.biz/projectA/
http://test.naviproject.biz/projectB/
http://test.naviproject.biz/svi/login.html
```

---

## 🚀 방법 2: 서브도메인 방식 (고급)

### 전제 조건
- 도메인 소유 및 DNS 관리 권한 필요
- 각 서브도메인마다 별도 설정 필요

### 단계별 설정

#### 1단계: DNS 설정

**도메인 업체에서:**
```
A 레코드 추가:
- projecta.test.naviproject.biz → 시놀로지 공인 IP
- projectb.test.naviproject.biz → 시놀로지 공인 IP
- svi.test.naviproject.biz → 시놀로지 공인 IP

또는 와일드카드:
- *.test.naviproject.biz → 시놀로지 공인 IP
```

#### 2단계: Web Station 가상 호스트 설정

```
1. Web Station 앱 실행
2. "웹 서비스 포털" 탭
3. 각 서브도메인마다 생성:

프로젝트 A:
- 포털 유형: 이름 기반
- 호스트명: projecta.test.naviproject.biz
- 포트: 80
- 문서 루트: web/projectA

프로젝트 B:
- 포털 유형: 이름 기반
- 호스트명: projectb.test.naviproject.biz
- 포트: 80
- 문서 루트: web/projectB

SVI 포털:
- 포털 유형: 이름 기반
- 호스트명: svi.test.naviproject.biz
- 포트: 80
- 문서 루트: web/svi
```

#### 3단계: 접속 테스트

```
http://projecta.test.naviproject.biz
http://projectb.test.naviproject.biz
http://svi.test.naviproject.biz/login.html
```

---

## 🔧 자동화 스크립트 (선택사항)

### 프로젝트 배포 스크립트

**deploy.sh (로컬에서 실행):**
```bash
#!/bin/bash

# 설정
NAS_IP="192.168.1.100"
NAS_USER="admin"
PROJECT_NAME="svi"
LOCAL_PATH="D:/1.Git/AX/SVI/Servei"
REMOTE_PATH="/volume1/web/$PROJECT_NAME"

# 파일 업로드
echo "프로젝트 배포 중..."
scp -r $LOCAL_PATH/*.html $NAS_USER@$NAS_IP:$REMOTE_PATH/

echo "배포 완료!"
echo "접속: http://$NAS_IP/$PROJECT_NAME/"
```

**사용법:**
```bash
# Git Bash 또는 WSL에서
chmod +x deploy.sh
./deploy.sh
```

---

## 📊 비교표

| 항목 | 서브 경로 | 서브도메인 | 포트 방식 |
|------|----------|-----------|----------|
| 난이도 | ⭐ 쉬움 | ⭐⭐⭐ 어려움 | ⭐⭐ 보통 |
| URL | /projectA | projecta.domain | :8081 |
| DNS 설정 | 불필요 | 필요 (각각) | 불필요 |
| 관리 | 쉬움 | 복잡 | 보통 |
| 전문성 | 보통 | 높음 | 낮음 |
| 추천도 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐ |

---

## 🎯 추천 시나리오

### 당신의 경우 (프로젝트 A, B, SVI)

**추천: 서브 경로 방식**

**이유:**
1. 가장 간단하고 빠름
2. 추가 DNS 설정 불필요
3. 한 번에 여러 프로젝트 관리 가능
4. URL만 바꾸면 됨

**예상 구조:**
```
http://test.naviproject.biz/           (메인 포털)
http://test.naviproject.biz/projectA/  (프로젝트 A)
http://test.naviproject.biz/projectB/  (프로젝트 B)
http://test.naviproject.biz/svi/       (SVI 포털)
```

---

## ✅ 체크리스트

### 서브 경로 방식 설정 체크리스트

- [ ] Web Station 설치 완료
- [ ] web 폴더에 프로젝트 폴더 생성 (projectA, projectB, svi)
- [ ] 메인 index.html 생성
- [ ] 각 프로젝트 파일 업로드
- [ ] HTML 파일의 링크 경로 수정 (절대 경로로)
- [ ] 도메인 DNS 설정 (test.naviproject.biz → 시놀로지 IP)
- [ ] 공유기 포트포워딩 설정 (80번 포트)
- [ ] 내부망 접속 테스트
- [ ] 외부 접속 테스트
- [ ] 팀원들에게 URL 공유

---

## 🔧 문제 해결

### Q1: 서브 경로로 접속하면 404 에러
```
A: 1. 폴더 이름 확인 (대소문자 구분)
   2. index.html 파일 존재 여부 확인
   3. Web Station 재시작
```

### Q2: 메인 페이지는 되는데 프로젝트 페이지가 안 열림
```
A: 1. 각 프로젝트 폴더에 index.html 있는지 확인
   2. 직접 파일명으로 접속 시도
      예: /svi/login.html
```

### Q3: CSS/JS가 안 먹힘
```
A: HTML 파일에서 리소스 경로를 절대 경로로 수정
   예: <link href="/svi/style.css">
```

### Q4: 도메인 연결이 안됨
```
A: 1. DNS 전파 시간 대기 (최대 24시간)
   2. nslookup으로 확인:
      nslookup test.naviproject.biz
   3. 공유기 포트포워딩 확인
```

---

## 📝 실전 예제

### 현재 SVI 프로젝트 배포하기

**1. 폴더 구조:**
```
web/
├── index.html (메인 포털)
└── svi/
    ├── login.html
    ├── survey.html
    ├── admin-list.html
    ├── report.html
    └── test-flow.html
```

**2. login.html 수정:**
```javascript
// 로그인 성공 후
window.location.href = '/svi/survey.html';  // 절대 경로

// 또는 상대 경로
window.location.href = './survey.html';     // 현재 폴더 기준
```

**3. survey.html 수정:**
```html
<!-- 로그아웃 함수 -->
<script>
function logout() {
    if (confirm('로그아웃 하시겠습니까?')) {
        window.location.href = '/svi/login.html';
    }
}
</script>
```

**4. 접속:**
```
http://test.naviproject.biz/svi/login.html
```

---

## 🎉 완료!

이제 하나의 도메인으로 여러 프로젝트를 관리할 수 있습니다!

**다음 단계:**
1. 메인 포털 페이지 디자인 개선
2. 각 프로젝트별 접근 권한 설정
3. HTTPS 적용 (Let's Encrypt)
4. 자동 백업 설정

---

**도움이 필요하시면 언제든 물어보세요!** 🚀
