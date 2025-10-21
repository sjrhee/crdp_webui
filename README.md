# React + FastAPI Starter

이 프로젝트는 FastAPI 백엔드와 Vite + React(Typescript) 프론트엔드로 구성되며, CORS 설정, Swagger UI 자동 문서화, 그리고 **CRDP Protect/Reveal API 통합**을 제공합니다. (미니멀 버전: 인증·아이템 라우트 제거, Protect/Reveal 전용)

## 구성
- Backend: FastAPI, CORS, pydantic-settings (Protect/Reveal 전용 API)
- Frontend: Vite + React + TS, React Router, Axios 인터셉터
- **CRDP Integration**: Protect/Reveal API (데이터 암호화/복호화)

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
- **Protect/Reveal UI**: http://localhost:5173/protect-reveal

## 환경 변수
- backend/.env
  - SECRET_KEY: 자동 생성됨
  - CORS_ORIGINS: JSON 배열 혹은 콤마 구분 문자열 허용
  - **CRDP_API_HOST**: CRDP 암·복호화 서버 호스트(백엔드가 통신). 웹UI 도메인과 구분 필요.
  - **CRDP_API_PORT**: CRDP API 서버 포트 (기본: 32082)
  - **CRDP_PROTECTION_POLICY**: 보호 정책 이름 (기본: P03)
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
helm upgrade -i crdp-webui ./helm/react-fastapi \
  -n crdp-webui --create-namespace \
  -f ./helm/react-fastapi/values-local-registry.yaml

# 배포 상태 확인
kubectl -n crdp-webui get pods
helm -n crdp-webui get all crdp-webui
```

자세한 내용은 [helm/react-fastapi/README.md](./helm/react-fastapi/README.md)를 참조하세요.

### 접속
- Ingress 호스트(웹UI): values에서 기본 `crdp-webui.local`
- CRDP 서버(백엔드가 통신): 예) `crdp.local` (별도 시스템)

Windows 등 클라이언트 PC에서 hosts를 사용하는 경우:
```
192.168.0.240 crdp-webui.local
```
브라우저: http://crdp-webui.local/protect-reveal

### 트러블슈팅
클러스터 운영 중 발생한 문제와 해결 방법은 [docs/troubleshooting](./docs/troubleshooting/)를 참조하세요.

## 다음 단계 제안
- 프론트엔드 UI 개선 및 상태 관리 도입(Zustand/Recoil 등)
- 백엔드 사용자 관리/DB 연동(SQLModel/SQLAlchemy) 추가
- Ingress 설정 및 도메인 연결(웹UI 도메인과 CRDP 도메인 혼동 방지)
- CI/CD 파이프라인 구축
- **CRDP Protect/Reveal 기능 확장** (배치 처리, 통계, 감사 로그 등)

## CRDP Protect/Reveal 기능

### API 엔드포인트
- `POST /api/crdp/protect` - 단일 데이터 암호화
- `POST /api/crdp/reveal` - 단일 토큰 복호화
- `POST /api/crdp/protect-bulk` - 대량 데이터 암호화
- `POST /api/crdp/reveal-bulk` - 대량 토큰 복호화
- `GET /api/crdp/health` - CRDP 서비스 상태 확인

### 사용 예시

#### 단일 Protect
```bash
curl -X POST http://localhost:8000/api/crdp/protect \
  -H "Content-Type: application/json" \
  -d '{"data": "1234567890123"}'
```

#### 단일 Reveal
```bash
curl -X POST http://localhost:8000/api/crdp/reveal \
  -H "Content-Type: application/json" \
  -d '{"protected_data": "PROTECTED_TOKEN", "username": "admin"}'
```

#### 대량 Protect
```bash
curl -X POST http://localhost:8000/api/crdp/protect-bulk \
  -H "Content-Type: application/json" \
  -d '{"data_array": ["001", "002", "003"]}'
```

### 통합 출처
이 기능은 [crdp_protect_reveal](https://github.com/sjrhee/crdp_protect_reveal) 프로젝트를 통합한 것입니다.
