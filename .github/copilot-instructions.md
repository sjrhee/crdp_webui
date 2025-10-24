# Copilot 사용 지침 — crdp_webui

이 파일은 GitHub Copilot(또는 저장소 내 자동 보조 도구)이 이 리포지토리에서 안전하고 일관되게 작업할 수 있도록 컨텍스트와 규칙을 제공합니다.

목표
- 이 리포지토리는 CRDP(Protect/Reveal) 웹 UI와 이를 프록시하는 FastAPI 백엔드로 구성됩니다.
- Copilot은 코드 편집, 버그 수정, 테스트 생성, 간단한 문서 추가를 도와야 합니다. 하지만 중요한 운영/배포 설정은 사람 확인이 필요합니다.

프로젝트 개요
- 루트: `docker-compose.yml`, `README.md`, `setup.sh`
- `backend/`: FastAPI 앱, 의존성(`requirements.txt`), 테스트(`tests/`)
  - 주요 파일: `backend/app/main.py`, `backend/app/api/routes/*`, `backend/app/core/*`, `backend/app/services/*`
- `frontend/`: React + TypeScript + Vite 앱, Nginx로 번들 서빙
  - 주요 파일: `frontend/src/pages/ProtectReveal.tsx`, `frontend/src/lib/api.ts`, `frontend/Dockerfile`
- `helm/react-fastapi/`: Kubernetes 배포를 위한 Helm 차트

핵심 작업 흐름 (개발자/자동 도구용)
1. 로컬 개발
   - 백엔드:
     - 가상환경 생성 후 의존성 설치
       - python -m venv .venv
       - source .venv/bin/activate
       - pip install -r backend/requirements.txt
     - 테스트 실행: `pytest -q` (경로: `backend/`)
   - 프론트엔드:
     - Node 설치 (권장: Node 18+)
     - npm install
     - 개발 서버: `npm run dev` (frontend 디렉터리)
     - 빌드: `npm run build`
2. 컨테이너 이미지
   - 백엔드: `docker build -t <registry>/crdp-webui-backend:<tag> -f backend/Dockerfile .`
   - 프론트엔드: `docker build -t <registry>/crdp-webui-frontend:<tag> -f frontend/Dockerfile .`
   - 레지스트리 푸시: `docker push <registry>/...` (레지스트리 및 인증은 환경에 따라 다름)
3. Kubernetes 배포 (Helm)
   - `helm upgrade --install crdp react-fastapi -f helm/react-fastapi/values.yaml --namespace <ns>`
   - 이미지 태그를 바꿔서 롤아웃을 강제하는 것이 안전한 패턴입니다 (캐시 문제 방지).

중요 규칙(자동 수정 시 참고)
- API contract를 변경하지 마세요(특히 백엔드의 REST 엔드포인트 시그니처). API 변경이 필요하면 먼저 이슈 또는 PR을 생성하고 팀과 합의하세요.
- Helm 템플릿 및 values 파일을 수정할 때는 이미지 태그/레지스트리 설정과 `imagePullPolicy` 영향을 고려하세요. 운영 배포에 영향을 줄 수 있으므로 PR로 변경사항을 제출하세요.
- 민감한 정보(비밀번호, 토큰, 레지스트리 자격 증명)를 코드나 버전관리로 커밋하지 마세요. 시크릿은 Kubernetes Secret, Vault 또는 CI 시크릿으로 관리하세요.

개발 중 확인할 파일/위치
- CRDP 기본 호스트/포트: 백엔드 환경설정(`backend/app/core/config.py` 또는 도커/헬름 환경 변수)
- Protect/Reveal 관련 엔드포인트: `backend/app/api/routes/protect_reveal.py`
- 프론트엔드 API wrapper: `frontend/src/lib/api.ts`
- Helm 차트 템플릿: `helm/react-fastapi/templates/` — Deployment, Service, Ingress 정의

테스트 & 검증
- 최소한 다음 자동 검사/테스트를 추가/확인하세요:
  - 백엔드 단위/통합 테스트(`pytest`)
  - 프론트엔드 타입체크(`npm run build` 혹은 `tsc --noEmit`)
- 새 기능을 추가할 때는 작은 단위의 테스트(해피 패스 + 1-2 엣지케이스)를 작성하세요.

커밋/브랜치 규칙
- 기본 브랜치는 `main`입니다.
- 새로운 기능/버그픽스는 feature/ 또는 fix/ 프리픽스를 가진 브랜치를 생성하세요(예: `feature/protect-reveal-ui`).
- PR에서 자동 생성되는 변경 사항 설명을 명확히 작성하세요.

PR/릴리즈 주의사항
- 운영 환경에 배포하기 전에 이미지 태그(immutable tag)를 사용하세요(예: 타임스탬프 또는 SHA 기반 태그).
- 헬름 values를 바꿀 때는 차트 버전과 롤백 전략을 고려하세요.

도움말/연락처
- 저장소 소유자: sjrhee (GitHub: `sjrhee`)
- 변경 전 팀 내 리뷰를 요청하세요.

이 파일은 Copilot(혹은 자동 보조 도구)이 리포지토리의 컨텍스트를 이해하고 안전한 변경을 제안하는 데 사용됩니다. 자동으로 큰 구조 변경(예: DB 스키마 변경, 시크릿 노출, 프로덕션 헬름 설정 변경)은 제안만 할 수 있고, 적용 전 사람이 검토해야 합니다.
