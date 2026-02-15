# 시놀로지 NAS 초간단 배포 가이드 (5분 완성)

## 🎯 목표
시놀로지 NAS에 사회적가치지표 포털을 배포하여 누구나 접속 가능하게 만들기

---

## ✅ 준비물
- ✓ 시놀로지 NAS (이미 있음)
- ✓ DSM 관리자 계정
- ✓ HTML 파일들 (D:\1.Git\AX\SVI\Servei 폴더)

---

## 📝 5단계로 완료하기

### 1단계: Web Station 설치 (1분)

1. 시놀로지 DSM에 로그인
2. 메인 메뉴에서 **패키지 센터** 클릭
3. 검색창에 **"Web Station"** 입력
4. **설치** 버튼 클릭
5. 설치 완료될 때까지 대기

![Web Station 설치]
```
패키지 센터 > 검색: "Web Station" > 설치
```

---

### 2단계: 폴더 생성 (30초)

1. **File Station** 앱 실행
2. **web** 폴더로 이동
3. 마우스 우클릭 > **새 폴더 만들기**
4. 폴더 이름: **svi-portal**
5. 확인 클릭

```
File Station > web 폴더 > 우클릭 > 새 폴더 > "svi-portal"
```

---

### 3단계: 파일 업로드 (1분)

1. **svi-portal** 폴더 더블클릭으로 열기
2. 상단 메뉴에서 **업로드** 버튼 클릭
3. 다음 파일들을 선택해서 업로드:

필수 파일:
```
☑ login.html           (로그인 페이지)
☑ survey.html          (설문 페이지)
☑ admin-list.html      (관리자 페이지)
☑ report.html          (리포트 페이지 - 있다면)
☑ test-flow.html       (테스트 페이지 - 있다면)
```

또는 **드래그 앤 드롭**으로 한 번에 업로드

---

### 4단계: Web Station 설정 (2분)

1. **Web Station** 앱 실행
2. 왼쪽 메뉴에서 **웹 서비스 포털** 클릭
3. **생성** 버튼 클릭

4. 설정 입력:
```
포털 유형: 이름 기반
호스트명: svi-portal
프로토콜: HTTP
포트: 80
문서 루트: web/svi-portal
```

5. **확인** 버튼 클릭

---

### 5단계: 접속 테스트 (30초)

#### 내부망에서 테스트

브라우저 주소창에 입력:
```
http://시놀로지IP주소/login.html
```

예시:
```
http://192.168.0.100/login.html
http://192.168.1.50/login.html
```

**시놀로지 IP 주소 확인 방법:**
```
제어판 > 네트워크 > 네트워크 인터페이스 > LAN
```

---

## 🌐 외부에서 접속하기 (선택사항)

### 방법 A: QuickConnect (가장 쉬움)

1. **제어판** > **QuickConnect**
2. **QuickConnect 사용** 체크
3. **QuickConnect ID** 입력 (예: mycompany)
4. **적용** 클릭

외부 접속 URL:
```
http://mycompany.quickconnect.to/login.html
```

---

### 방법 B: DDNS (더 빠름)

1. **제어판** > **외부 액세스** > **DDNS**
2. **추가** 버튼 클릭
3. 설정:
```
서비스 제공자: Synology
호스트명: svi-portal (원하는 이름)
```

4. 공유기 포트포워딩 설정:
```
외부 포트: 8080
내부 포트: 80
내부 IP: 시놀로지 IP
```

외부 접속 URL:
```
http://svi-portal.synology.me:8080/login.html
```

---

## 📱 개발자들에게 공유하기

### 1. URL 공유
```
접속 주소: http://yournas.quickconnect.to/login.html

또는

내부망: http://192.168.x.x/login.html
```

### 2. QR 코드 생성
```
1. https://www.qr-code-generator.com 접속
2. URL 입력
3. QR 코드 다운로드
4. 슬랙/이메일로 공유
```

### 3. 공유 메시지 예시
```
안녕하세요,

사회적가치지표 포털 프로토타입이 완성되었습니다.
아래 링크에서 확인해주세요:

🔗 http://yournas.quickconnect.to/login.html

테스트 계정:
- 유저: user / user
- 관리자: admin / admin

피드백 부탁드립니다!
```

---

## 🔧 문제 해결

### Q1: Web Station이 패키지 센터에 없어요
```
A: 1. DSM 버전 확인 (6.0 이상 필요)
   2. 패키지 센터 > 설정 > 패키지 소스 확인
   3. Synology 공식 소스 추가되어 있는지 확인
```

### Q2: 페이지가 안 열려요
```
A: 1. 파일이 올바른 위치에 있는지 확인
      위치: web/svi-portal/login.html
   2. 파일 이름이 정확한지 확인 (대소문자 구분)
   3. Web Station 서비스 상태 확인
```

### Q3: 외부에서 접속이 안돼요
```
A: 1. QuickConnect가 활성화되어 있는지 확인
   2. 방화벽 설정 확인
   3. 공유기 포트포워딩 설정 확인
```

### Q4: 페이지는 열리는데 디자인이 깨져요
```
A: 모든 HTML 파일이 같은 폴더에 있는지 확인
   (login.html, survey.html, admin-list.html 등)
```

---

## ✅ 완료 체크리스트

- [ ] Web Station 설치 완료
- [ ] svi-portal 폴더 생성 완료
- [ ] HTML 파일 업로드 완료
- [ ] Web Station 웹 서비스 생성 완료
- [ ] 내부망 접속 테스트 완료
- [ ] QuickConnect 설정 완료 (선택)
- [ ] 외부 접속 테스트 완료 (선택)
- [ ] 개발자들에게 URL 공유 완료

---

## 🎉 성공!

축하합니다! 이제 어디서든 프로토타입을 볼 수 있습니다.

**다음 단계:**
1. 개발자들에게 피드백 요청
2. 개선사항 정리
3. 실제 개발 준비

---

**도움이 필요하시면 언제든 물어보세요!** 🚀
