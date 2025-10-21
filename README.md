# CRDP Protect/Reveal WebUI# CRDP Protect/Reveal WebUI# CRDP Protect/Reveal WebUI# React + FastAPI Starter



간단한 FastAPI + React 기반 Protect/Reveal 테스트 앱



요약FastAPI + React 기반의 **CRDP 데이터 암호화/복호화 테스트 도구**

- Backend: FastAPI (Python)

- Frontend: React + Vite (TypeScript)

- 배포: Docker 이미지 → Helm 차트로 Kubernetes 배포

- **Backend**: FastAPI (Python 3.11+)미니멀한 FastAPI + React 기반의 **CRDP 데이터 암호화/복호화 테스트 도구**입니다.이 프로젝트는 FastAPI 백엔드와 Vite + React(Typescript) 프론트엔드로 구성되며, CORS 설정, Swagger UI 자동 문서화, 그리고 **CRDP Protect/Reveal API 통합**을 제공합니다. (미니멀 버전: 인증·아이템 라우트 제거, Protect/Reveal 전용)

빠른 시작 (로컬)

- **Frontend**: React 19 + Vite + TypeScript  

1) 백엔드 실행

- **Deployment**: Docker + Kubernetes (Helm)

```bash

cd backend

pip install -r requirements.txt

export CRDP_API_HOST=192.168.0.231---- **Backend**: FastAPI, Python 3.11+## 구성

export CRDP_API_PORT=32082

export CRDP_PROTECTION_POLICY=P03

uvicorn app.main:app --reload --port 8000

```## 🚀 로컬 개발- **Frontend**: React 19 + Vite + TypeScript- Backend: FastAPI, CORS, pydantic-settings (Protect/Reveal 전용 API)



2) 프론트엔드 실행



```bash### 1. 백엔드- **Deployment**: Docker + Kubernetes (Helm)- Frontend: Vite + React + TS, React Router, Axios 인터셉터

cd frontend

npm install

npm run dev

``````bash- **Features**: 단일/대량 데이터 암호화·복호화, 실시간 진행 로그, 자동 입력 연결- **CRDP Integration**: Protect/Reveal API (데이터 암호화/복호화)



주요 엔드포인트cd backend

- POST /api/crdp/protect  — 단일 암호화

- POST /api/crdp/reveal   — 단일 복호화pip install -r requirements.txt

- POST /api/crdp/protect-bulk — 대량 암호화

- POST /api/crdp/reveal-bulk  — 대량 복호화export CRDP_API_HOST=192.168.0.231 CRDP_API_PORT=32082 CRDP_PROTECTION_POLICY=P03

- GET  /api/crdp/health    — 헬스체크

uvicorn app.main:app --reload --port 8000---## 빠른 시작

Helm 빠른 배포

```

```bash

kubectl create namespace crdp-webui || true1) 전체 셋업 자동 실행

helm upgrade --install crdp-webui ./helm/react-fastapi -n crdp-webui -f ./helm/react-fastapi/values-local-registry.yaml

```접속: http://localhost:8000/docs (API 문서)



문제 해결(짧게)## 🚀 빠른 시작```

- ImagePullBackOff: containerd에 HTTP 레지스트리 신뢰 설정 필요

- Ingress 접속: 클라이언트 hosts에 `192.168.0.240 crdp-webui.local` 추가### 2. 프론트엔드



저장소 구조(간단)chmod +x setup.sh

```

backend/   # FastAPI 서버```bash

frontend/  # React 앱

helm/      # Helm 차트cd frontend### 로컬 개발./setup.sh

```

npm install

더 자세한 내용은 각 서브폴더의 문서 및 코드 주석을 확인하세요.

npm run dev```

```

#### 1. 저장소 클론

접속: http://localhost:5173/protect-reveal

```bash2) 백엔드 실행

---

git clone https://github.com/sjrhee/crdp_webui.git```

## 🐳 Docker 빌드 & 푸시

cd crdp_webuibackend/.venv/bin/uvicorn app.main:app --reload --port 8000

```bash

TAG=$(date +%Y%m%d-%H%M%S)``````



# Backend

docker build -t 192.168.0.231:5001/backend:$TAG -f backend/Dockerfile backend

docker push 192.168.0.231:5001/backend:$TAG#### 2. 백엔드 시작3) 프론트엔드 실행



# Frontend```bash```

docker build -t 192.168.0.231:5001/frontend:$TAG -f frontend/Dockerfile frontend

docker push 192.168.0.231:5001/frontend:$TAG# 의존성 설치cd frontend



echo "Backend: $TAG"cd backendnpm run dev

echo "Frontend: $TAG"

```pip install -r requirements.txt```



---



## ☸️ Kubernetes 배포 (Helm)# 환경 설정 (선택)- Swagger UI: http://localhost:8000/docs



```bashexport CRDP_API_HOST=192.168.0.231- **Protect/Reveal UI**: http://localhost:5173/protect-reveal

# 네임스페이스 생성

kubectl create namespace crdp-webuiexport CRDP_API_PORT=32082



# Helm 배포export CRDP_PROTECTION_POLICY=P03## 환경 변수

helm upgrade --install crdp-webui ./helm/react-fastapi \

  -n crdp-webui \- backend/.env

  -f ./helm/react-fastapi/values-local-registry.yaml

# 실행  - SECRET_KEY: 자동 생성됨

# 상태 확인

kubectl -n crdp-webui get podsuvicorn app.main:app --reload --port 8000  - CORS_ORIGINS: JSON 배열 혹은 콤마 구분 문자열 허용

```

```  - **CRDP_API_HOST**: CRDP 암·복호화 서버 호스트(백엔드가 통신). 웹UI 도메인과 구분 필요.

**hosts 파일 설정** (클라이언트 PC):

```bash  - **CRDP_API_PORT**: CRDP API 서버 포트 (기본: 32082)

192.168.0.240 crdp-webui.local

```#### 3. 프론트엔드 시작  - **CRDP_PROTECTION_POLICY**: 보호 정책 이름 (기본: P03)



접속: http://crdp-webui.local/protect-reveal```bash- frontend/.env



---cd frontend  - VITE_API_BASE_URL: 기본 http://localhost:8000



## 📋 API 엔드포인트npm install



### Protect (암호화)npm run dev## 스크립트

```bash

POST /api/crdp/protect```- 백엔드 테스트

{

  "data": "1234567890123",```

  "policy": "P03"

}접속:cd backend

```

- **WebUI**: http://localhost:5173/protect-reveal. .venv/bin/activate

### Reveal (복호화)

```bash- **API 문서**: http://localhost:8000/docspytest -q

POST /api/crdp/reveal

{```

  "protected_data": "8555545382975",

  "policy": "P03"---- 프론트엔드 빌드

}

``````



### Bulk 작업## 📦 Docker 빌드cd frontend

- `POST /api/crdp/protect-bulk` - 대량 암호화

- `POST /api/crdp/reveal-bulk` - 대량 복호화npm run build

- `GET /api/crdp/health` - 헬스 체크

### 이미지 빌드 및 로컬 레지스트리 푸시```

---



## 🎯 주요 기능

```bash## Kubernetes 배포

| 기능 | 설명 |

|------|------|# 이미지 태그 생성 (예: YYYYMMDD-HHMMSS)

| 🔒 Protect | 13자리 숫자 → 암호화 토큰 |

| 🔓 Reveal | 암호화 토큰 → 원본 데이터 |TAG=$(date +%Y%m%d-%H%M%S)### Helm 차트

| 📦 Bulk Protect | 여러 데이터 한 번에 암호화 |

| 📦 Bulk Reveal | 여러 토큰 한 번에 복호화 |프로젝트에는 Kubernetes 배포를 위한 Helm 차트가 포함되어 있습니다.

| 🔍 Progress Log | 백엔드↔CRDP 통신 상세 로그 |

# Backend 이미지 빌드

---

docker build -t 192.168.0.231:5001/backend:$TAG -f backend/Dockerfile backend```bash

## 🛠️ 개발

docker push 192.168.0.231:5001/backend:$TAG# 로컬 레지스트리 사용 배포

### 테스트

helm upgrade -i crdp-webui ./helm/react-fastapi \

```bash

# Backend# Frontend 이미지 빌드  -n crdp-webui --create-namespace \

cd backend && python -m pytest -v

docker build -t 192.168.0.231:5001/frontend:$TAG -f frontend/Dockerfile frontend  -f ./helm/react-fastapi/values-local-registry.yaml

# Frontend

cd frontend && npm run lintdocker push 192.168.0.231:5001/frontend:$TAG

```

```# 배포 상태 확인

### 빌드

kubectl -n crdp-webui get pods

```bash

# Frontend---helm -n crdp-webui get all crdp-webui

cd frontend && npm run build

``````



---## 🎯 주요 기능



## 📁 디렉토리 구조자세한 내용은 [helm/react-fastapi/README.md](./helm/react-fastapi/README.md)를 참조하세요.



```### 1️⃣ 단일 데이터 암호화 (Protect)

backend/          # FastAPI 서버

├── app/- 13자리 숫자 입력### 접속

│   ├── main.py

│   ├── api/routes/protect_reveal.py- 암호화 토큰 생성- Ingress 호스트(웹UI): values에서 기본 `crdp-webui.local`

│   ├── services/protect_reveal/

│   └── core/config.py- 자동으로 복호화 입력칸에 채워짐- CRDP 서버(백엔드가 통신): 예) `crdp.local` (별도 시스템)

└── Dockerfile



frontend/         # React 앱

├── src/### 2️⃣ 단일 데이터 복호화 (Reveal)Windows 등 클라이언트 PC에서 hosts를 사용하는 경우:

│   ├── pages/ProtectReveal.tsx

│   ├── lib/api.ts- 보호된 토큰 입력```

│   └── index.css

└── Dockerfile- 원본 데이터 복구192.168.0.240 crdp-webui.local



helm/             # Kubernetes 배포- 진행 로그에 백엔드↔CRDP 통신 정보 표시```

└── react-fastapi/

    ├── values.yaml브라우저: http://crdp-webui.local/protect-reveal

    ├── values-local-registry.yaml

    └── templates/### 3️⃣ 대량 데이터 암호화 (Bulk Protect)

```

- 여러 줄의 데이터 입력 (한 줄에 하나씩)### 트러블슈팅

---

- 배열 형태로 한 번에 암호화클러스터 운영 중 발생한 문제와 해결 방법은 [docs/troubleshooting](./docs/troubleshooting/)를 참조하세요.

## 🔧 환경 변수

- 결과가 자동으로 대량 복호화 입력칸으로 연결됨

| 변수 | 기본값 | 설명 |

|------|--------|------|## 다음 단계 제안

| CRDP_API_HOST | 192.168.0.231 | CRDP 서버 호스트 |

| CRDP_API_PORT | 32082 | CRDP 서버 포트 |### 4️⃣ 대량 데이터 복호화 (Bulk Reveal)- 프론트엔드 UI 개선 및 상태 관리 도입(Zustand/Recoil 등)

| CRDP_PROTECTION_POLICY | P03 | 보호 정책 |

| CORS_ORIGINS | * | CORS 허용 도메인 |- 여러 줄의 보호된 토큰 입력- 백엔드 사용자 관리/DB 연동(SQLModel/SQLAlchemy) 추가



---- 배열 형태로 한 번에 복호화- Ingress 설정 및 도메인 연결(웹UI 도메인과 CRDP 도메인 혼동 방지)



## 🚨 문제 해결- 모든 결과를 진행 로그에 기록- CI/CD 파이프라인 구축



### ImagePullBackOff- **CRDP Protect/Reveal 기능 확장** (배치 처리, 통계, 감사 로그 등)

containerd가 HTTP 레지스트리를 신뢰하지 않을 때:

### 🔍 진행 로그 (Progress Log)

```bash

sudo mkdir -p /etc/containerd/certs.d/192.168.0.231:5001각 요청의 백엔드↔CRDP 통신 상세 정보:## CRDP Protect/Reveal 기능

sudo tee /etc/containerd/certs.d/192.168.0.231:5001/hosts.toml > /dev/null << EOF

server = "http://192.168.0.231:5001"```json

EOF

sudo systemctl restart containerd{### API 엔드포인트

```

  "stage": "protect_bulk",- `POST /api/crdp/protect` - 단일 데이터 암호화

### Ingress 접근 불가

클라이언트 hosts 파일에 다음 추가:  "debug": {- `POST /api/crdp/reveal` - 단일 토큰 복호화

```

192.168.0.240 crdp-webui.local    "url": "http://192.168.0.231:32082/v1/protect",- `POST /api/crdp/protect-bulk` - 대량 데이터 암호화

```

    "request": { "protection_policy_name": "P03", "data_array": [...] },- `POST /api/crdp/reveal-bulk` - 대량 토큰 복호화

---

    "status_code": 200,- `GET /api/crdp/health` - CRDP 서비스 상태 확인

## 📚 참고

    "response": { ... },

- [FastAPI 문서](https://fastapi.tiangolo.com)

- [React 문서](https://react.dev)    "headers": { ... }### 사용 예시

- [Kubernetes 문서](https://kubernetes.io)

- [Helm 문서](https://helm.sh)  }



---}#### 단일 Protect



**Last Updated**: 2025-10-21``````bash


curl -X POST http://localhost:8000/api/crdp/protect \

---  -H "Content-Type: application/json" \

  -d '{"data": "1234567890123"}'

## 🛠 환경 설정```



### Backend 환경 변수 (`backend/.env`)#### 단일 Reveal

```bash

```bashcurl -X POST http://localhost:8000/api/crdp/reveal \

# CRDP 암·복호화 서버 설정  -H "Content-Type: application/json" \

CRDP_API_HOST=192.168.0.231        # CRDP 서버 호스트 (기본값)  -d '{"protected_data": "PROTECTED_TOKEN", "username": "admin"}'

CRDP_API_PORT=32082                 # CRDP 서버 포트 (기본값)```

CRDP_PROTECTION_POLICY=P03          # 보호 정책 이름 (기본값)

#### 대량 Protect

# CORS 설정```bash

CORS_ORIGINS=http://localhost:5173,http://crdp-webui.localcurl -X POST http://localhost:8000/api/crdp/protect-bulk \

```  -H "Content-Type: application/json" \

  -d '{"data_array": ["001", "002", "003"]}'

### Frontend 환경 변수 (없음)```

프론트엔드는 동일 도메인에서 `/api` 프록시를 통해 백엔드에 접속합니다.

### 통합 출처

---이 기능은 [crdp_protect_reveal](https://github.com/sjrhee/crdp_protect_reveal) 프로젝트를 통합한 것입니다.


## 🐳 Kubernetes 배포 (Helm)

### 전제 조건
- Kubernetes 클러스터 (1.20+)
- kubectl 설치
- Helm 3 설치
- ingress-nginx 설치
- MetalLB (선택: 외부 IP 필요 시)
- containerd HTTP 레지스트리 신뢰 설정

### 배포 방법

```bash
# 네임스페이스 생성
kubectl create namespace crdp-webui

# Helm 업그레이드/설치
helm upgrade --install crdp-webui ./helm/react-fastapi \
  -n crdp-webui \
  -f ./helm/react-fastapi/values-local-registry.yaml

# 배포 상태 확인
kubectl -n crdp-webui get pods
kubectl -n crdp-webui get svc
kubectl -n crdp-webui get ingress
```

### Helm Values 설정 (`helm/react-fastapi/values-local-registry.yaml`)

```yaml
images:
  registry: "192.168.0.231:5001"
  backend:
    repository: backend
    tag: "20251021-140929"
    pullPolicy: IfNotPresent
  frontend:
    repository: frontend
    tag: "20251021-140929"
    pullPolicy: IfNotPresent

ingress:
  enabled: true
  className: nginx
  hosts:
    - host: crdp-webui.local
      paths:
        - path: /
          pathType: Prefix
          service: frontend
        - path: /api
          pathType: Prefix
          service: backend
```

### 접속 (클라이언트 PC)

```bash
# /etc/hosts (Linux/Mac) 또는 C:\Windows\System32\drivers\etc\hosts (Windows)에 추가
192.168.0.240 crdp-webui.local
```

브라우저: `http://crdp-webui.local/protect-reveal`

---

## 📋 API 엔드포인트

### Protect (암호화)
```bash
POST /api/crdp/protect
Content-Type: application/json

{
  "data": "1234567890123",
  "policy": "P03",
  "host": "192.168.0.231",
  "port": 32082
}

Response:
{
  "status_code": 200,
  "protected_data": "8555545382975",
  "debug": { "url": "...", "request": {...}, ... }
}
```

### Reveal (복호화)
```bash
POST /api/crdp/reveal
Content-Type: application/json

{
  "protected_data": "8555545382975",
  "policy": "P03",
  "host": "192.168.0.231",
  "port": 32082
}

Response:
{
  "status_code": 200,
  "data": "1234567890123",
  "debug": { "url": "...", "request": {...}, ... }
}
```

### Bulk Protect (대량 암호화)
```bash
POST /api/crdp/protect-bulk

{
  "data_array": ["1234567890123", "1234567890124", "1234567890125"],
  "policy": "P03"
}

Response:
{
  "status_code": 200,
  "protected_data_array": ["8555545382975", "..."],
  "debug": { ... }
}
```

### Bulk Reveal (대량 복호화)
```bash
POST /api/crdp/reveal-bulk

{
  "protected_data_array": ["8555545382975", "..."],
  "policy": "P03"
}

Response:
{
  "status_code": 200,
  "data_array": ["1234567890123", "1234567890124", "..."],
  "debug": { ... }
}
```

### Health Check
```bash
GET /api/crdp/health

Response:
{
  "status": "healthy",
  "crdp_api_host": "192.168.0.231",
  "crdp_api_port": 32082,
  "protection_policy": "P03"
}
```

---

## 🔧 테스트

### Backend 테스트
```bash
cd backend
python -m pytest -v
```

### Frontend Lint
```bash
cd frontend
npm run lint
```

---

## 📁 프로젝트 구조

```
crdp_webui/
├── backend/                          # FastAPI 백엔드
│   ├── app/
│   │   ├── main.py
│   │   ├── core/
│   │   │   ├── config.py
│   │   │   └── security.py
│   │   ├── api/
│   │   │   └── routes/
│   │   │       └── protect_reveal.py
│   │   ├── models/
│   │   │   └── schemas.py
│   │   └── services/
│   │       └── protect_reveal/
│   │           ├── client.py
│   │           └── utils.py
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/                         # React + Vite 프론트엔드
│   ├── src/
│   │   ├── main.tsx
│   │   ├── App.tsx
│   │   ├── pages/
│   │   │   └── ProtectReveal.tsx   # 메인 페이지
│   │   ├── components/
│   │   ├── contexts/
│   │   ├── lib/
│   │   │   └── api.ts
│   │   ├── index.css                # 디자인 시스템
│   │   └── assets/
│   ├── package.json
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── nginx.conf                   # Nginx 설정
│   └── Dockerfile
├── helm/
│   └── react-fastapi/
│       ├── Chart.yaml
│       ├── values.yaml              # 기본 값
│       ├── values-local-registry.yaml # 로컬 레지스트리 값
│       ├── templates/
│       │   ├── backend-deploy.yaml
│       │   ├── backend-secret.yaml
│       │   ├── frontend-deploy.yaml
│       │   ├── ingress.yaml
│       │   └── ...
│       └── README.md
├── docker-compose.yml               # (참고용)
├── setup.sh                         # 자동 설정 스크립트
└── README.md                        # 이 파일
```

---

## 🔍 문제 해결

### ImagePullBackOff (HTTP 레지스트리)
containerd 설정에서 HTTP 레지스트리를 신뢰하지 않을 때 발생합니다.

**해결 방법:**
```bash
# containerd 설정 수정
sudo mkdir -p /etc/containerd/certs.d/192.168.0.231:5001
sudo tee /etc/containerd/certs.d/192.168.0.231:5001/hosts.toml > /dev/null << EOF
server = "http://192.168.0.231:5001"
EOF

# config.toml에서 config_path 설정
sudo sed -i '/config_path.*certs.d/s/^#//' /etc/containerd/config.toml

# containerd 재시작
sudo systemctl restart containerd
```

### Ingress 호스트 접근 불가
클라이언트 PC에서 hosts 파일 설정 필요합니다.

**Linux/Mac:**
```bash
echo "192.168.0.240 crdp-webui.local" | sudo tee -a /etc/hosts
```

**Windows:**
```
C:\Windows\System32\drivers\etc\hosts 파일에 다음 줄 추가:
192.168.0.240 crdp-webui.local
```

자세한 내용은 [docs/troubleshooting/README.md](./docs/troubleshooting/README.md)를 참조하세요.

---

## 📚 참고 자료

- [FastAPI 공식 문서](https://fastapi.tiangolo.com/)
- [React 공식 문서](https://react.dev)
- [Vite 공식 문서](https://vitejs.dev/)
- [Kubernetes 공식 문서](https://kubernetes.io/)
- [Helm 공식 문서](https://helm.sh/)
- [CRDP Protect/Reveal](https://github.com/sjrhee/crdp_protect_reveal)

---

## 📝 라이선스

이 프로젝트는 MIT 라이선스 하에 공개됩니다.

---

## 👤 작성자

[sjrhee](https://github.com/sjrhee)

---

**최종 업데이트**: 2025-10-21
