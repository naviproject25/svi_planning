# 사회적가치지표 포털 배포 가이드

## 📋 개요
현재 프로젝트는 순수 HTML/CSS/JavaScript로 구성된 정적 웹사이트입니다.
별도의 서버 프로그래밍이 필요없어 배포가 매우 간단합니다.

---

## 🚀 배포 방법 (난이도 순)

### ✅ 방법 1: 시놀로지 NAS (가장 쉬움, 내부망 + 외부 접근 가능)

#### 📌 장점
- 이미 보유한 인프라 활용
- 설정이 간단함
- 내부망에서 빠른 접근
- DDNS로 외부 접근 가능

#### 📝 단계별 설정

**1단계: Web Station 설치**
```
1. 시놀로지 DSM 로그인
2. 패키지 센터 열기
3. "Web Station" 검색
4. 설치 버튼 클릭
```

**2단계: 웹 서비스 생성**
```
1. Web Station 앱 실행
2. "웹 서비스 포털" 탭 선택
3. "생성" 버튼 클릭
4. 설정:
   - 포털 유형: 이름 기반
   - 호스트명: svi-portal (또는 원하는 이름)
   - 프로토콜: HTTP (또는 HTTPS)
   - 포트: 80 (또는 원하는 포트)
   - 문서 루트: web/svi-portal
```

**3단계: 파일 업로드**
```
1. File Station 앱 실행
2. web 폴더로 이동
3. svi-portal 폴더 생성 (없으면)
4. 다음 파일들을 업로드:
   ✓ login.html
   ✓ survey.html
   ✓ admin-list.html
   ✓ report.html (있다면)
   ✓ test-flow.html
```

**4단계: 접속 테스트 (내부망)**
```
브라우저에서 접속:
http://시놀로지IP주소/login.html

예: http://192.168.0.100/login.html
```

**5단계: 외부 접속 설정 (선택사항)**

**5-1. QuickConnect 사용 (가장 쉬움)**
```
1. 제어판 > QuickConnect
2. QuickConnect 활성화
3. QuickConnect ID 등록 (예: mynas)
4. 외부에서 접속:
   http://mynas.quickconnect.to/login.html
```

**5-2. DDNS + 포트포워딩 (더 빠름)**
```
1. 제어판 > 외부 액세스 > DDNS
2. 추가 버튼 클릭
3. 서비스 제공자: Synology
4. 호스트명 입력: svi-portal (원하는 이름)

5. 공유기 설정:
   - 포트 포워딩 규칙 추가
   - 외부 포트: 8080
   - 내부 포트: 80
   - 내부 IP: 시놀로지 NAS IP

6. 외부에서 접속:
   http://svi-portal.synology.me:8080/login.html
```

---

### ✅ 방법 2: OCI (Oracle Cloud Infrastructure) 무료 티어

#### 📌 장점
- 평생 무료 (무료 티어)
- 외부 접속 가능
- 빠른 속도
- 전문적인 호스팅

#### 📝 단계별 설정

**1단계: OCI 인스턴스 생성**
```
1. cloud.oracle.com 로그인
2. 컴퓨트 > 인스턴스 > 인스턴스 생성
3. 설정:
   - 이미지: Ubuntu 22.04 (Always Free)
   - Shape: VM.Standard.E2.1.Micro (Always Free)
   - SSH 키: 새로 생성 또는 기존 키 사용
```

**2단계: 방화벽 규칙 추가**
```
1. 인스턴스 세부정보 페이지
2. 서브넷 클릭
3. 보안 목록 클릭
4. 수신 규칙 추가:
   - 소스: 0.0.0.0/0
   - IP 프로토콜: TCP
   - 대상 포트 범위: 80
```

**3단계: SSH 접속**
```
# Windows에서 (PowerShell 또는 CMD)
ssh -i 다운로드한키.key ubuntu@인스턴스공인IP

# 예시
ssh -i oci-key.key ubuntu@123.45.67.89
```

**4단계: 웹 서버 설치 (Nginx)**
```bash
# 패키지 업데이트
sudo apt update

# Nginx 설치
sudo apt install nginx -y

# 방화벽 허용
sudo ufw allow 'Nginx HTTP'

# Nginx 시작
sudo systemctl start nginx
sudo systemctl enable nginx

# 상태 확인
sudo systemctl status nginx
```

**5단계: 파일 업로드**

**방법 A: SCP 사용 (권장)**
```bash
# Windows PowerShell에서
scp -i oci-key.key D:\1.Git\AX\SVI\Servei\*.html ubuntu@공인IP:/tmp/

# SSH 접속 후
sudo mv /tmp/*.html /var/www/html/
```

**방법 B: Git 사용**
```bash
# SSH 접속 상태에서
cd /var/www/html
sudo rm index.nginx-debian.html

# GitHub에 올린 경우
sudo git clone https://github.com/yourname/svi-portal.git .
```

**6단계: 접속 테스트**
```
브라우저에서:
http://공인IP주소/login.html

예: http://123.45.67.89/login.html
```

**7단계: 도메인 연결 (선택사항)**
```
1. 도메인 구매 (가비아, 호스팅케이알 등)
2. DNS 설정:
   - A 레코드: @ -> OCI 공인IP
   - A 레코드: www -> OCI 공인IP

3. Nginx 설정:
sudo nano /etc/nginx/sites-available/default

server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    root /var/www/html;
    index login.html;
}

sudo systemctl reload nginx
```

---

## 🎯 추천 방법 (가장 쉬운 방법 3가지)

### ✅ 방법 3: GitHub Pages (무료, 가장 쉬움)

```bash
1. GitHub 계정 생성 (github.com)
2. 새 저장소 생성: svi-portal
3. 파일 업로드 (드래그 앤 드롭)
4. Settings > Pages
5. Branch: main 선택
6. 자동 배포됨

접속: https://username.github.io/svi-portal/login.html
```

### ✅ 방법 4: Netlify (무료, 드래그 앤 드롭)

```
1. netlify.com 접속
2. 회원가입 (GitHub 계정으로)
3. "Add new site" > "Deploy manually"
4. Servei 폴더를 드래그 앤 드롭
5. 자동 배포됨

접속: https://random-name-123.netlify.app/login.html
```

### ✅ 방법 5: Vercel (무료, 가장 빠름)

```
1. vercel.com 접속
2. 회원가입 (GitHub 계정으로)
3. "Add New Project"
4. Servei 폴더 업로드
5. 자동 배포됨

접속: https://svi-portal.vercel.app/login.html
```

---

## 📊 방법별 비교

| 방법 | 난이도 | 비용 | 속도 | 외부접속 | 추천도 |
|------|--------|------|------|----------|--------|
| 시놀로지 NAS | ⭐ | 무료 | 빠름 | QuickConnect | ⭐⭐⭐⭐ |
| OCI | ⭐⭐⭐ | 무료 | 매우빠름 | O | ⭐⭐⭐⭐⭐ |
| GitHub Pages | ⭐ | 무료 | 빠름 | O | ⭐⭐⭐⭐⭐ |
| Netlify | ⭐ | 무료 | 매우빠름 | O | ⭐⭐⭐⭐⭐ |
| Vercel | ⭐ | 무료 | 매우빠름 | O | ⭐⭐⭐⭐⭐ |

---

## 🔧 문제 해결

### 시놀로지 NAS
```
Q: Web Station이 없어요
A: 패키지 센터에서 "Web Station" 검색 후 설치

Q: 외부에서 접속이 안돼요
A: 1. QuickConnect 활성화 확인
   2. 공유기 포트포워딩 확인
   3. 방화벽 규칙 확인

Q: 페이지가 깨져보여요
A: 파일 업로드 시 모든 HTML 파일이 같은 폴더에 있는지 확인
```

### OCI
```
Q: SSH 접속이 안돼요
A: 1. 키 파일 권한 확인: chmod 400 key.pem
   2. 보안그룹 22번 포트 오픈 확인

Q: 웹페이지가 안 열려요
A: 1. Nginx 상태 확인: sudo systemctl status nginx
   2. 방화벽 확인: sudo ufw status
   3. 보안목록 80번 포트 오픈 확인

Q: 파일 업로드가 안돼요
A: scp 명령어에서 키 파일 경로를 절대 경로로 지정
```

---

## 💡 개발자에게 공유하기

### 방법 1: URL 공유
```
배포 후 받은 URL을 개발자들에게 전달:
- 시놀로지: http://yournas.quickconnect.to/login.html
- OCI: http://공인IP/login.html
- GitHub Pages: https://username.github.io/svi-portal/login.html
```

### 방법 2: QR 코드 생성
```
1. qr-code-generator.com 접속
2. URL 입력
3. QR 코드 다운로드
4. 개발자들에게 공유
```

### 방법 3: 짧은 URL
```
1. bitly.com 또는 tinyurl.com
2. 긴 URL 입력
3. 짧은 URL 생성
4. 공유하기 쉬움
```

---

## 📞 다음 단계 제안

1. **프로토타입 공유** (현재 단계)
   - 위 방법 중 하나로 배포
   - 개발자들에게 URL 공유

2. **피드백 수집**
   - 개발자들 의견 수렴
   - 기능 개선사항 정리

3. **실제 개발 준비**
   - 백엔드 API 설계
   - 데이터베이스 설계
   - 사용자 인증 시스템

---

## 🎯 추천: 지금 바로 시작하기

**가장 쉬운 방법 (5분 소요)**

1. **Netlify 선택** (드래그 앤 드롭으로 끝)
2. netlify.com 접속
3. GitHub 계정으로 로그인
4. "Sites" > "Add new site" > "Deploy manually"
5. Servei 폴더 전체를 드래그 앤 드롭
6. 완료! URL 받아서 개발자들에게 공유

**또는 시놀로지 NAS** (이미 있으니까)
1. Web Station 설치
2. File Station에서 파일 업로드
3. QuickConnect URL로 공유

---

도움이 필요하시면 언제든 물어보세요! 🚀
