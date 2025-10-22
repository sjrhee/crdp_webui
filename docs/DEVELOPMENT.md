# CRDP WebUI - Development Guide

## 개발 환경 설정

### 요구사항

- Python 3.10+
- Node.js 22+
- Git

### 초기 설정

```bash
# 저장소 클론
git clone https://github.com/sjrhee/crdp_webui.git
cd crdp_webui

# 의존성 설치
make setup

# 환경 변수 설정
cp backend/.env.example backend/.env
# backend/.env 파일을 편집하여 CRDP 설정 입력

cp frontend/.env.local.example frontend/.env.local
# (선택) 프론트엔드 환경 변수 설정
```

## 개발 서버 실행

### 방법 1: Makefile 사용 (권장)

```bash
# 백엔드 + 프론트엔드 동시 실행
make dev

# 백엔드만 실행
make dev-backend

# 프론트엔드만 실행
make dev-frontend

# 서비스 중지
make stop
```

### 방법 2: 수동 실행

**백엔드:**
```bash
cd backend
source .venv/bin/activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**프론트엔드:**
```bash
cd frontend
npm run dev -- --host
```

## 테스트

```bash
# 모든 테스트 실행
make test

# 백엔드 테스트만
cd backend
pytest

# 커버리지 리포트 확인
cd backend
pytest
# HTML 리포트: backend/htmlcov/index.html
```

## 코드 스타일

### 백엔드 (Python)

- PEP 8 준수
- Type hints 사용 권장
- Docstring 작성 (Google 스타일)

### 프론트엔드 (TypeScript)

```bash
# 린트 검사
cd frontend
npm run lint

# 타입 체크
npm run build
```

## 디버깅

### 백엔드 로그

로그 파일 위치: `backend/logs/app_YYYYMMDD.log`

```bash
# 실시간 로그 확인
tail -f backend/logs/app_$(date +%Y%m%d).log
```

### 프론트엔드 디버그

브라우저 개발자 도구의 Console 탭 사용

## 환경 변수

### 백엔드 (`backend/.env`)

```bash
# 필수
CRDP_API_HOST=192.168.0.231
CRDP_API_PORT=32082
CRDP_PROTECTION_POLICY=P03

# 선택 (기본값 있음)
DEBUG=true
APP_NAME="CRDP WebUI"
CORS_ORIGINS=["http://localhost:5173","http://127.0.0.1:5173"]
```

### 프론트엔드 (`frontend/.env.local`)

```bash
# 선택
VITE_API_BASE_URL=/
VITE_CRDP_HOST=192.168.0.231
VITE_CRDP_PORT=32082
VITE_CRDP_POLICY=P03
```

## Git 워크플로우

1. Feature 브랜치 생성
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. 변경사항 커밋
   ```bash
   git add .
   git commit -m "feat: add new feature"
   ```

3. Push 및 PR 생성
   ```bash
   git push origin feature/your-feature-name
   # GitHub에서 Pull Request 생성
   ```

## 커밋 메시지 규칙

- `feat:` 새로운 기능
- `fix:` 버그 수정
- `docs:` 문서 변경
- `style:` 코드 포맷팅
- `refactor:` 코드 리팩토링
- `test:` 테스트 추가/수정
- `chore:` 빌드/설정 변경

## 트러블슈팅

### CRDP 연결 실패

1. CRDP 서버가 실행 중인지 확인
2. 네트워크 연결 확인
3. 환경 변수 확인 (`backend/.env`)

### 포트 충돌

```bash
# 포트 사용 중인 프로세스 확인
lsof -i:8000  # 백엔드
lsof -i:5173  # 프론트엔드

# 프로세스 종료
make stop
```

### 의존성 문제

```bash
# 가상환경 재생성
make clean
make setup
```
