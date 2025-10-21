# CRDP Protect/Reveal WebUI (간단 안내)

간단한 설명
- FastAPI 백엔드와 React(Vite) 프론트엔드로 구성된 Protect/Reveal 테스트 도구입니다.

빠른 시작 (로컬)

1. 백엔드 실행

```bash
cd backend
pip install -r requirements.txt
export CRDP_API_HOST=192.168.0.231
export CRDP_API_PORT=32082
export CRDP_PROTECTION_POLICY=P03
uvicorn app.main:app --reload --port 8000
```

2. 프론트엔드 실행

```bash
cd frontend
npm install
npm run dev
# 열기: http://localhost:5173/protect-reveal
```

핵심 엔드포인트
- POST /api/crdp/protect
- POST /api/crdp/reveal
- POST /api/crdp/protect-bulk
- POST /api/crdp/reveal-bulk
- GET  /api/crdp/health

Helm 간단 배포 (클러스터)

```bash
kubectl create namespace crdp-webui || true
helm upgrade --install crdp-webui ./helm/react-fastapi -n crdp-webui -f ./helm/react-fastapi/values-local-registry.yaml
```

문제 해결 팁
- ImagePullBackOff: containerd에 레지스트리 신뢰 설정 필요
- Ingress 접속: 클라이언트 hosts에 `192.168.0.240 crdp-webui.local` 추가

더 자세한 내용은 코드와 각 서브폴더의 문서를 참고하세요.
