# React + FastAPI Starter

이 프로젝트는 FastAPI 백엔드와 Vite + React(Typescript) 프론트엔드로 구성되며, JWT 인증, CORS 설정, Swagger UI 자동 문서화를 제공합니다.

## 구성
- Backend: FastAPI, JWT(OAuth2 Password), CORS, pydantic-settings
- Frontend: Vite + React + TS, React Router, Axios 인터셉터

## 빠른 시작
1) 전체 셋업 자동 실행
```
chmod +x setup.sh
./setup.sh
```

2) 백엔드 실행
```
backend/.venv/bin/uvicorn app.main:app --reload --port 8000
```

3) 프론트엔드 실행
```
cd frontend
npm run dev
```

- Swagger UI: http://localhost:8000/docs
- 기본 로그인 데모 계정: username=demo, password=demo

## 환경 변수
- backend/.env
  - SECRET_KEY: 자동 생성됨
  - CORS_ORIGINS: JSON 배열 혹은 콤마 구분 문자열 허용
- frontend/.env
  - VITE_API_BASE_URL: 기본 http://localhost:8000

## 스크립트
- 백엔드 테스트
```
cd backend
. .venv/bin/activate
pytest -q
```
- 프론트엔드 빌드
```
cd frontend
npm run build
```

## 다음 단계 제안
- Dockerfile / docker-compose로 로컬 개발 환경 컨테이너화
- 프론트엔드 UI 개선 및 상태 관리 도입(Zustand/Recoil 등)
- 백엔드 사용자 관리/DB 연동(SQLModel/SQLAlchemy) 추가
