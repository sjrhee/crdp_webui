# Backend - CRDP FastAPI 서버# Backend - FastAPI CRDP Protect/Reveal API# Backend (FastAPI)



FastAPI 기반 CRDP 데이터 보호/복구 API 서버



---FastAPI 기반의 CRDP 데이터 암호화/복호화 REST API 서버입니다.## Features



## 🚀 빠른 시작- FastAPI with automatic OpenAPI/Swagger UI



### 1. 설치---- JWT auth (OAuth2 password flow)



```bash- CORS configured for Vite dev server

pip install -r requirements.txt

```## 🏗️ 구조- Items demo API (protected)



### 2. 환경 설정



```bash```## Endpoints

export CRDP_API_HOST=192.168.0.231

export CRDP_API_PORT=32082backend/- `GET /health` – health check

export CRDP_PROTECTION_POLICY=P03

```├── app/- `POST /api/auth/login` – form fields: username, password; returns JWT



### 3. 실행│   ├── __init__.py- `GET /api/auth/me` – requires `Authorization: Bearer <token>`



```bash│   ├── main.py                  # FastAPI 애플리케이션 진입점- `GET /api/items` – protected demo list

# 개발 모드

uvicorn app.main:app --reload --host 0.0.0.0 --port 8000│   ├── core/- Swagger UI: `/docs`  | ReDoc: `/redoc`



# 프로덕션 모드│   │   ├── __init__.py

gunicorn app.main:app --workers 4 --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000

```│   │   ├── config.py            # 환경 설정 관리## Setup



접속: http://localhost:8000/docs│   │   └── security.py          # 보안 관련 유틸1. Create virtualenv (optional) and install deps:



---│   ├── api/```



## 📋 API 엔드포인트│   │   ├── __init__.pypip3 install -r requirements.txt



### 기본 정보│   │   └── routes/```



모든 응답은 다음 필드를 포함합니다:│   │       ├── __init__.py2. Create `.env` from example and adjust:

- `data` - 결과 데이터

- `debug` - 요청/응답 상세 정보 (개발용)│   │       └── protect_reveal.py # Protect/Reveal 엔드포인트```



### Protect (암호화)│   ├── models/cp .env.example .env



```bash│   │   ├── __init__.py```

POST /api/crdp/protect

│   │   └── schemas.py           # Pydantic 스키마3. Run dev server:

{

  "data": "1234567890123",│   └── services/```

  "policy": "P03"

}│       ├── __init__.pyuvicorn app.main:app --reload --port 8000

```

│       └── protect_reveal/```

### Reveal (복호화)

│           ├── __init__.py

```bash

POST /api/crdp/reveal│           ├── client.py        # CRDP HTTP 클라이언트## Tests



{│           ├── runner.py        # (미사용)```

  "protected_data": "8555545382975",

  "policy": "P03"│           ├── cli.py           # (미사용)pytest -q

}

```│           └── utils.py         # 유틸 함수```



### Bulk Protect├── tests/



```bash│   ├── __init__.py## CRDP Protect integration

POST /api/crdp/protect-bulk

│   ├── test_auth.py

{

  "data_list": ["1234567890123", "9876543210987"],│   ├── test_health.pyNew endpoints:

  "policy": "P03"

}│   └── test_protect_reveal.py- `POST /api/protect` → external CRDP Protect API

```

├── requirements.txt             # Python 의존성- `POST /api/reveal` → external CRDP Reveal API

### Bulk Reveal

├── pytest.ini                   # pytest 설정

```bash

POST /api/crdp/reveal-bulk├── Dockerfile                   # 컨테이너 이미지Optional JSON body to override (protect):



{└── README.md                    # 이 파일

  "protected_data_list": ["8555545382975", "9999999999999"],

  "policy": "P03"``````

}

```{



### Health Check---	"host": "192.168.0.231",



```bash	"port": 32082,

GET /api/crdp/health

```## 🚀 빠른 시작	"policy": "P03",



응답:	"data": "1234567890123"

```json

{### 로컬 개발 환경}

  "status": "healthy",

  "crdp_config": {```

    "host": "192.168.0.231",

    "port": 32082,#### 1. 의존성 설치

    "policy": "P03"

  }```bashEnvironment variables (backend/.env):

}

```cd backend



---pip install -r requirements.txt```



## 📂 구조```CRDP_API_HOST=192.168.0.231



```CRDP_API_PORT=32082

backend/

├── app/#### 2. 환경 변수 설정CRDP_PROTECTION_POLICY=P03

│   ├── __init__.py

│   ├── main.py                     # FastAPI 앱 초기화```bashCRDP_SAMPLE_DATA=1234567890123

│   ├── core/

│   │   ├── config.py               # 환경설정# Linux/Mac```

│   │   └── security.py             # CORS 설정

│   ├── api/export CRDP_API_HOST=192.168.0.231

│   │   └── routes/

│   │       └── protect_reveal.py    # Protect/Reveal 엔드포인트export CRDP_API_PORT=32082Reveal body example:

│   ├── models/

│   │   └── schemas.py              # Pydantic 모델export CRDP_PROTECTION_POLICY=P03

│   └── services/

│       └── protect_reveal/export CORS_ORIGINS=http://localhost:5173,http://localhost:8000```

│           ├── cli.py              # CLI 클라이언트

│           ├── client.py           # CRDP 클라이언트{

│           ├── runner.py           # 요청 실행기

│           └── utils.py            # 유틸리티# Windows	"host": "192.168.0.231",

├── tests/

│   ├── test_health.pyset CRDP_API_HOST=192.168.0.231	"port": 32082,

│   ├── test_auth.py

│   └── test_protect_reveal.pyset CRDP_API_PORT=32082	"policy": "P03",

├── pytest.ini

├── requirements.txtset CRDP_PROTECTION_POLICY=P03	"protected_data": "<protected string>",

└── Dockerfile

```set CORS_ORIGINS=http://localhost:5173,http://localhost:8000	"username": "user1",            // optional



---```	"external_version": "1001002"   // optional



## 🧪 테스트}



```bash#### 3. 서버 시작```

# 모든 테스트 실행

python -m pytest -v```bash

uvicorn app.main:app --reload --port 8000

# 특정 테스트만 실행```

python -m pytest tests/test_protect_reveal.py -v

#### 4. 접속

# 커버리지 확인- **API 문서**: http://localhost:8000/docs

python -m pytest --cov=app tests/- **ReDoc**: http://localhost:8000/redoc

```- **Health Check**: http://localhost:8000/api/crdp/health



------



## 🐳 Docker 빌드## 🛠️ 환경 설정



```bash### 환경 변수 (`backend/.env`)

TAG=$(date +%Y%m%d-%H%M%S)

docker build -t 192.168.0.231:5001/backend:$TAG -f backend/Dockerfile backend| 변수명 | 기본값 | 설명 |

docker push 192.168.0.231:5001/backend:$TAG|--------|--------|------|

echo "Image: 192.168.0.231:5001/backend:$TAG"| `CRDP_API_HOST` | `192.168.0.231` | CRDP 암·복호화 서버 호스트 |

```| `CRDP_API_PORT` | `32082` | CRDP 서버 포트 |

| `CRDP_PROTECTION_POLICY` | `P03` | 데이터 보호 정책 이름 |

---| `CORS_ORIGINS` | `http://localhost:5173` | CORS 허용 도메인 (콤마 구분) |

| `SECRET_KEY` | (자동 생성) | JWT 시크릿 키 |

## 🔑 환경 변수

### 설정 파일 (`app/core/config.py`)

| 변수 | 기본값 | 설명 |```python

|------|--------|------|from pydantic_settings import BaseSettings

| `CRDP_API_HOST` | `192.168.0.231` | CRDP 서버 호스트 |

| `CRDP_API_PORT` | `32082` | CRDP 서버 포트 |class Settings(BaseSettings):

| `CRDP_PROTECTION_POLICY` | `P03` | 보호 정책 |    CRDP_API_HOST: str = "192.168.0.231"

| `CORS_ORIGINS` | `["*"]` | CORS 허용 도메인 |    CRDP_API_PORT: int = 32082

    CRDP_PROTECTION_POLICY: str = "P03"

---    CORS_ORIGINS: str = "http://localhost:5173"

    

## 🔍 Debug Field    class Config:

        env_file = ".env"

모든 응답에 `debug` 필드가 포함되어 있습니다:```



```json---

{

  "data": {...},## 📋 API 엔드포인트

  "debug": {

    "url": "http://192.168.0.231:32082/protect",### 1. Protect (암호화)

    "request": {...},

    "response": {...},**요청:**

    "headers": {...},```bash

    "status_code": 200POST /api/crdp/protect

  }Content-Type: application/json

}

```{

  "data": "1234567890123",

프론트엔드의 "Progress Log"에서 확인할 수 있습니다.  "policy": "P03",

  "host": "192.168.0.231",

---  "port": 32082

}

## 📦 의존성```



- **fastapi** - 웹 프레임워크**응답 (성공):**

- **uvicorn** - ASGI 서버```json

- **pydantic** - 데이터 검증{

- **requests** - HTTP 클라이언트  "status_code": 200,

- **pytest** - 테스트 프레임워크  "protected_data": "8555545382975",

- **python-multipart** - 폼 데이터 처리  "error": null,

  "debug": {

---    "url": "http://192.168.0.231:32082/v1/protect",

    "request": { "protection_policy_name": "P03", "data": "1234567890123" },

## 🛠️ 개발 명령어    "status_code": 200,

    "response": { "data": "8555545382975" },

```bash    "headers": { "content-type": "application/json" }

# 패키지 설치  }

pip install -r requirements.txt}

```

# 개발 서버 실행

uvicorn app.main:app --reload**매개변수:**

- `data` (필수): 암호화할 데이터 (string)

# 린트 체크 (있으면)- `policy` (선택): 보호 정책 (기본값: 환경 변수)

flake8 app/- `host` (선택): CRDP 서버 호스트 (기본값: 환경 변수)

- `port` (선택): CRDP 서버 포트 (기본값: 환경 변수)

# 테스트 실행

pytest -v---



# 타입 체크 (있으면)### 2. Reveal (복호화)

mypy app/

```**요청:**

```bash

---POST /api/crdp/reveal

Content-Type: application/json

**Last Updated**: 2025-10-21

{
  "protected_data": "8555545382975",
  "policy": "P03",
  "host": "192.168.0.231",
  "port": 32082
}
```

**응답 (성공):**
```json
{
  "status_code": 200,
  "data": "1234567890123",
  "error": null,
  "debug": { ... }
}
```

**매개변수:**
- `protected_data` (필수): 보호된 토큰 (string)
- `policy` (선택): 보호 정책
- `username` (선택): 감시 추적용 사용자명
- `host` (선택): CRDP 서버 호스트
- `port` (선택): CRDP 서버 포트

---

### 3. Bulk Protect (대량 암호화)

**요청:**
```bash
POST /api/crdp/protect-bulk
Content-Type: application/json

{
  "data_array": ["1234567890123", "1234567890124", "1234567890125"],
  "policy": "P03"
}
```

**응답 (성공):**
```json
{
  "status_code": 200,
  "protected_data_array": ["8555545382975", "..."],
  "error": null,
  "debug": { ... }
}
```

---

### 4. Bulk Reveal (대량 복호화)

**요청:**
```bash
POST /api/crdp/reveal-bulk
Content-Type: application/json

{
  "protected_data_array": ["8555545382975", "..."],
  "policy": "P03"
}
```

**응답 (성공):**
```json
{
  "status_code": 200,
  "data_array": ["1234567890123", "1234567890124", "..."],
  "error": null,
  "debug": { ... }
}
```

---

### 5. Health Check

**요청:**
```bash
GET /api/crdp/health
```

**응답:**
```json
{
  "status": "healthy",
  "crdp_api_host": "192.168.0.231",
  "crdp_api_port": 32082,
  "protection_policy": "P03"
}
```

---

## 🧪 테스트

### 테스트 실행

```bash
cd backend

# 모든 테스트 실행
python -m pytest -v

# 특정 테스트 파일 실행
python -m pytest tests/test_protect_reveal.py -v

# 특정 테스트 함수 실행
python -m pytest tests/test_protect_reveal.py::test_protect -v

# 커버리지 리포트
python -m pytest --cov=app tests/
```

### pytest 설정 (`pytest.ini`)
```ini
[pytest]
testpaths = tests
python_files = test_*.py
python_classes = Test*
python_functions = test_*
```

---

## 🐳 Docker

### 이미지 빌드

```bash
# 프로젝트 루트에서 실행
TAG=$(date +%Y%m%d-%H%M%S)
docker build -t 192.168.0.231:5001/backend:$TAG -f backend/Dockerfile backend
docker push 192.168.0.231:5001/backend:$TAG
```

### Dockerfile

```dockerfile
# Build stage
FROM python:3.11-slim as builder
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Runtime stage
FROM python:3.11-slim
WORKDIR /app
COPY --from=builder /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY app .
EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### 로컬 실행

```bash
docker run -it --rm \
  -e CRDP_API_HOST=192.168.0.231 \
  -e CRDP_API_PORT=32082 \
  -p 8000:8000 \
  192.168.0.231:5001/backend:latest
```

---

## 📂 주요 파일

### `app/main.py`
FastAPI 애플리케이션 진입점. CORS 설정, 라우터 포함, 헬스 체크 엔드포인트 정의.

### `app/core/config.py`
Pydantic Settings를 사용한 환경 변수 관리. `.env` 파일 지원.

### `app/api/routes/protect_reveal.py`
Protect/Reveal API 엔드포인트 정의. 요청 검증, CRDP 클라이언트 호출, 응답 포맷팅.

### `app/services/protect_reveal/client.py`
CRDP 서버와의 HTTP 통신을 담당하는 클라이언트. 요청 생성, 응답 파싱, 에러 처리.

### `app/models/schemas.py`
Pydantic 모델로 정의된 API 요청/응답 스키마.

---

## 🔍 디버깅

### 로그 레벨 설정

```python
# app/main.py
import logging

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)
```

### 요청/응답 로깅

```bash
# 환경 변수로 로그 레벨 설정
export LOG_LEVEL=DEBUG
uvicorn app.main:app --reload --log-level debug
```

### CRDP 클라이언트 디버깅

```python
# app/services/protect_reveal/client.py
import logging
logger = logging.getLogger(__name__)
logger.debug(f"Request URL: {url}")
logger.debug(f"Request payload: {payload}")
logger.debug(f"Response status: {response.status_code}")
```

---

## 🚨 에러 처리

### 일반적인 에러

| 상태 코드 | 에러 | 원인 | 해결책 |
|----------|------|------|--------|
| 400 | Bad Request | 유효하지 않은 요청 | 요청 스키마 확인 |
| 422 | Validation Error | 입력 검증 오류 | 필수 필드 확인 |
| 500 | Internal Server Error | 서버 오류 | 로그 확인, CRDP 연결 확인 |
| 503 | Service Unavailable | CRDP 서버 미응답 | CRDP 서버 상태 확인 |

### 응답 형식

```json
{
  "status_code": 400,
  "protected_data": null,
  "error": "입력은 정확히 13자리 숫자여야 합니다."
}
```

---

## 📚 의존성

### 주요 라이브러리

```
fastapi==0.104.1              # 웹 프레임워크
uvicorn[standard]==0.24.0     # ASGI 서버
pydantic==2.5.0               # 데이터 검증
pydantic-settings==2.1.0      # 환경 설정 관리
requests==2.31.0              # HTTP 클라이언트
pytest==7.4.3                 # 테스트 프레임워크
pytest-cov==4.1.0             # 커버리지
python-dotenv==1.0.0          # .env 파일 지원
```

---

## 🔄 배포 체크리스트

- [ ] 의존성 설치 (`pip install -r requirements.txt`)
- [ ] 환경 변수 설정 (CRDP_API_HOST, CRDP_API_PORT, CRDP_PROTECTION_POLICY)
- [ ] CORS 설정 확인
- [ ] 헬스 체크 엔드포인트 테스트 (`curl http://localhost:8000/api/crdp/health`)
- [ ] 단위 테스트 실행 (`python -m pytest`)
- [ ] Docker 이미지 빌드 및 레지스트리 푸시
- [ ] Helm values 파일 업데이트
- [ ] Helm 배포 실행

---

## 🎯 다음 단계

- [ ] 사용자 인증 기능 추가
- [ ] 데이터베이스 연동 (SQLAlchemy)
- [ ] 감사 로그 기록
- [ ] 캐싱 (Redis)
- [ ] 메트릭 수집 (Prometheus)
- [ ] 구조화된 로깅 (JSON)

---

**최종 업데이트**: 2025-10-21
