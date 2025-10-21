## 구성

- 목적: CRDP Protect/Reveal 기능을 빠르게 시험·데모하기 위한 최소 Web UI
- 백엔드: FastAPI (Python)
- 프론트엔드: React + Vite (TypeScript)
- 배포: Helm Chart (Kubernetes), 선택적으로 Ingress/MetalLB 사용

## 프로젝트 구조

```
backend/           # FastAPI 앱 (API, 서비스, 스키마)
frontend/          # React(Vite) 프론트엔드
helm/react-fastapi # Helm 차트 (백/프론트 동시 배포)
docs/              # 트러블슈팅/런북 문서
```

## 요구사항

- 로컬 개발: Python 3.10+, Node.js 18+ (npm), Git
- 선택: Kubernetes 클러스터, Helm 3.x (배포 시)
- 외부 CRDP API 접근(기본값: 192.168.0.231:32082)

## 설치 및 설정

- 백엔드 의존성 설치: `pip install -r backend/requirements.txt`
- 프론트엔드 의존성 설치: `npm install` (디렉터리: `frontend/`)
- 환경 변수(백엔드):
	- `CRDP_API_HOST` (기본: 192.168.0.231)
	- `CRDP_API_PORT` (기본: 32082)
	- `CRDP_PROTECTION_POLICY` (기본: P03)

## 빠른 시작

1) 백엔드 실행

```bash
cd backend
pip install -r requirements.txt
export CRDP_API_HOST=192.168.0.231
export CRDP_API_PORT=32082
export CRDP_PROTECTION_POLICY=P03
uvicorn app.main:app --reload --port 8000
```

2) 프론트엔드 실행

```bash
cd frontend
npm install
npm run dev
# 열기: http://localhost:5173/protect-reveal
```

## 빠른 설정

- 프론트엔드 화면 상단 설정에서 CRDP 호스트/포트/정책을 변경할 수 있습니다.
- Protect 입력 → Reveal 입력 자동 연결(옵션)로 빠른 실험이 가능합니다.

## 주요 기능

- 단일 Protect/Reveal
- 벌크 Protect/Reveal
- Protect → Reveal 자동 채우기(연동)
- 응답 디버그 정보(요청/응답/URL/헤더/상태코드) 표시

## 사용법

- Protect 탭에서 평문을 입력하고 실행 → 암호문을 확인
- Reveal 탭에서 암호문을 입력하고 실행 → 평문을 확인
- 벌크 탭에서는 줄바꿈(또는 배열) 기반으로 여러 건 처리

## 기본 실행

- 백엔드: `http://localhost:8000`
- 프론트엔드: `http://localhost:5173/protect-reveal`
- 주요 API:
	- `POST /api/crdp/protect`
	- `POST /api/crdp/reveal`
	- `POST /api/crdp/protect-bulk`
	- `POST /api/crdp/reveal-bulk`
	- `GET  /api/crdp/health`

## 에러 처리

- CRDP 연결 실패: `CRDP_API_HOST/PORT` 값을 확인하세요.
- CORS 오류: 백엔드 `CORS_ORIGINS` 환경 변수/설정을 점검하세요.
- Ingress 접속 불가(선택 배포 시): Ingress 주소/hosts 파일 매핑을 확인하세요.

## 개발 및 테스트

백엔드 테스트 실행:

```bash
cd backend
pip install -r requirements.txt
pytest -q
```

프론트엔드: 현재 별도 테스트 러너는 포함되어 있지 않습니다.

## 사용 방법

- UI 기반 테스트: 프론트엔드 화면에서 Protect/Reveal 실험
- API 기반 테스트: 위 API 엔드포인트에 JSON payload로 직접 호출

### 배포(도커)

아래는 예시입니다. 환경에 맞게 레지스트리 주소/태그를 변경하세요.

```bash
# 백엔드 이미지 빌드/푸시 (예: 로컬 레지스트리 192.168.0.231:5001)
docker build -t 192.168.0.231:5001/backend:<TAG> ./backend
docker push 192.168.0.231:5001/backend:<TAG>

# 프론트엔드 이미지 빌드/푸시
docker build -t 192.168.0.231:5001/frontend:<TAG> ./frontend
docker push 192.168.0.231:5001/frontend:<TAG>

# (선택) 단독 실행 예시
docker run -d --name crdp-backend -p 8000:8000 \
	-e CRDP_API_HOST=192.168.0.231 -e CRDP_API_PORT=32082 -e CRDP_PROTECTION_POLICY=P03 \
	192.168.0.231:5001/backend:<TAG>

docker run -d --name crdp-frontend -p 8080:80 \
	192.168.0.231:5001/frontend:<TAG>
```

### 배포(Helm)

로컬 레지스트리와 Ingress 환경을 고려한 값 파일: `helm/react-fastapi/values-local-registry.yaml`

```bash
kubectl create namespace crdp-webui || true

# 필요 시 values-local-registry.yaml에서 이미지 태그/레지스트리/ingress host 조정
helm upgrade --install crdp-webui ./helm/react-fastapi \
	-n crdp-webui \
	-f ./helm/react-fastapi/values-local-registry.yaml

# 확인
kubectl get pods,svc,ingress -n crdp-webui
# Ingress: MetalLB가 할당한 IP로 접속 (예: http://crdp-webui.local 또는 http://<할당IP>)
```

참고
- MetalLB는 LoadBalancer IP를 할당합니다. DNS가 없으면 IP로 직접 접근 가능합니다.
- 호스트명 사용 시 클라이언트 `/etc/hosts`에 `192.168.0.240 crdp-webui.local` 추가(예시 IP).

### 언인스톨

```bash
helm uninstall crdp-webui -n crdp-webui
kubectl delete namespace crdp-webui
```

## 문제 해결 가이드

- 클러스터/배포 관련 이슈: `docs/runbooks/k8s-helm-runbook.md`
- 레지스트리/이미지 풀 이슈: `docs/troubleshooting/containerd-http-registry-setup.md`
- 기타는 `docs/troubleshooting/README.md` 참고
