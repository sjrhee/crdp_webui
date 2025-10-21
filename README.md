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

## Kubernetes 배포

### Helm 차트
프로젝트에는 Kubernetes 배포를 위한 Helm 차트가 포함되어 있습니다.

```bash
# 로컬 레지스트리 사용 배포
helm upgrade -i crdp ./helm/react-fastapi \
  -n crdp --create-namespace \
  -f ./helm/react-fastapi/values-local-registry.yaml

# 배포 상태 확인
kubectl -n crdp get pods
helm list -A
```

자세한 내용은 [helm/react-fastapi/README.md](./helm/react-fastapi/README.md)를 참조하세요.

### 트러블슈팅
클러스터 운영 중 발생한 문제와 해결 방법은 [docs/troubleshooting](./docs/troubleshooting/)를 참조하세요.

## 다음 단계 제안
- 프론트엔드 UI 개선 및 상태 관리 도입(Zustand/Recoil 등)
- 백엔드 사용자 관리/DB 연동(SQLModel/SQLAlchemy) 추가
- Ingress 설정 및 도메인 연결
- CI/CD 파이프라인 구축
