# react-fastapi Helm Chart# react-fastapi Helm Chart



FastAPI 백엔드와 React 프론트엔드를 Kubernetes 클러스터에 배포하기 위한 Helm 차트입니다.## 이미지 빌드/푸시



---레지스트리에 푸시할 이미지를 빌드합니다.



## 📋 차트 구조```

# Backend

```docker build -t <REGISTRY>/<NAMESPACE>/backend:<TAG> ../../backend

helm/react-fastapi/docker push <REGISTRY>/<NAMESPACE>/backend:<TAG>

├── Chart.yaml                       # 차트 메타데이터

├── values.yaml                      # 기본 설정값# Frontend

├── values-local-registry.yaml       # 로컬 레지스트리 설정값docker build -t <REGISTRY>/<NAMESPACE>/frontend:<TAG> ../../frontend

├── templates/docker push <REGISTRY>/<NAMESPACE>/frontend:<TAG>

│   ├── backend-deploy.yaml          # Backend Deployment```

│   ├── backend-service.yaml         # Backend Service

│   ├── backend-secret.yaml          # Backend Secret (env vars)values.yaml에 이미지 정보를 지정합니다.

│   ├── frontend-deploy.yaml         # Frontend Deployment

│   ├── frontend-service.yaml        # Frontend Service```

│   ├── ingress.yaml                 # Ingress 설정images:

│   ├── _helpers.tpl                 # 헬퍼 템플릿  registry: "<REGISTRY>/<NAMESPACE>"

│   └── NOTES.txt                    # 설치 후 노트  backend:

└── README.md                        # 이 파일    repository: backend

```    tag: <TAG>

  frontend:

---    repository: frontend

    tag: <TAG>

## 🐳 Docker 이미지 준비```



### 1. 이미지 빌드프라이빗 레지스트리의 경우 pull secret을 생성해 참조하세요.



```bash```

# 프로젝트 루트에서 실행kubectl create secret docker-registry regcred \

TAG=$(date +%Y%m%d-%H%M%S)  --docker-server=<REGISTRY> \

  --docker-username=<USERNAME> \

# Backend 이미지  --docker-password=<PASSWORD> \

docker build -t 192.168.0.231:5001/backend:$TAG -f backend/Dockerfile backend  --docker-email=<EMAIL>

docker push 192.168.0.231:5001/backend:$TAG

# values.yaml

# Frontend 이미지imagePullSecrets:

docker build -t 192.168.0.231:5001/frontend:$TAG -f frontend/Dockerfile frontend  - regcred

docker push 192.168.0.231:5001/frontend:$TAG```



echo "Backend tag: $TAG"## 설치/업그레이드

echo "Frontend tag: $TAG"

``````

helm upgrade -i myapp ./helm/react-fastapi \

### 2. values 파일에 이미지 정보 업데이트  -f ./helm/react-fastapi/values.yaml \

  --set ingress.enabled=true \

```yaml  --set ingress.hosts[0].host=your.domain.com

# helm/react-fastapi/values-local-registry.yaml```

images:

  registry: "192.168.0.231:5001"## 로컬 레지스트리 사용 가이드 (containerd, HTTP)

  backend:

    repository: backend로컬 개발 환경에서 사설 레지스트리(예: 192.168.0.231:5001, HTTP)를 사용하는 경우, 워커 노드의 containerd가 기본적으로 HTTPS를 강제하기 때문에 ImagePullBackOff가 발생할 수 있습니다.

    tag: "20251021-140929"

    pullPolicy: IfNotPresent증상 예시:

  frontend:

    repository: frontend```

    tag: "20251021-140929"Failed to pull and unpack image "192.168.0.231:5001/backend:local":

    pullPolicy: IfNotPresentfailed to resolve reference "192.168.0.231:5001/backend:local":

```failed to do request: Head "https://192.168.0.231:5001/v2/backend/manifests/local":

http: server gave HTTP response to HTTPS client

---```



## 🚀 배포 방법해결: 워커 노드(containerd)에서 해당 레지스트리를 HTTP 미러로 신뢰하도록 설정합니다.



### 전제 조건1) containerd 설정 편집 (워커 노드에서 실행)



```bash```bash

# 필수 구성 요소 확인sudo mkdir -p /etc/containerd

kubectl get ns                           # Kubernetes 클러스터 확인sudo bash -lc 'test -f /etc/containerd/config.toml || containerd config default > /etc/containerd/config.toml'

helm version                             # Helm 설치 확인sudo sed -i \

kubectl get deployment -n ingress-nginx  # ingress-nginx 설치 확인  -e "/\[plugins.\"io.containerd.grpc.v1.cri\"\.registry\]/{:a;n;/\[/q;H;};$q1" \

```  /etc/containerd/config.toml || true



### 배포 명령어cat <<'TOML' | sudo tee /etc/containerd/config.d/local-registry.toml >/dev/null

[plugins."io.containerd.grpc.v1.cri".registry.mirrors."192.168.0.231:5001"]

#### 1. 네임스페이스 생성 (처음 1회)  endpoint = ["http://192.168.0.231:5001"]

```bashTOML

kubectl create namespace crdp-webui

```# config.d 를 include 하지 않는 경우, config.toml 내 registry.mirrors 섹션에 동일 내용 직접 추가

```

#### 2. Helm 설치/업그레이드

```bash2) containerd 재시작

# 로컬 레지스트리 사용

helm upgrade --install crdp-webui ./helm/react-fastapi \```bash

  -n crdp-webui \sudo systemctl restart containerd

  -f ./helm/react-fastapi/values-local-registry.yamlsudo systemctl is-active containerd

```

# 또는 기본 values 사용

helm upgrade --install crdp-webui ./helm/react-fastapi \3) 이미지 재시도: 파드 삭제 또는 롤아웃 재시작

  -n crdp-webui

``````bash

kubectl -n <NAMESPACE> rollout restart deploy/<DEPLOYMENT_NAME>

#### 3. 배포 상태 확인```

```bash

# Pod 상태참고: 운영 환경에서는 레지스트리를 TLS(HTTPS)로 구성하고 imagePullSecrets 사용을 권장합니다.

kubectl -n crdp-webui get pods -o wide

## Helm 값 선택 가이드

# Service 상태

kubectl -n crdp-webui get svc- 기본값(values.yaml): Docker Hub 등 공개 레지스트리에 푸시된 `backend:<TAG>`, `frontend:<TAG>`를 사용할 때 적합합니다.

- 로컬 레지스트리(values-local-registry.yaml): HTTP 레지스트리 `192.168.0.231:5001`를 사용할 때 적용합니다.

# Ingress 상태

kubectl -n crdp-webui get ingress적용 예시:



# 전체 리소스```bash

kubectl -n crdp-webui get all# 로컬 레지스트리 사용 배포/업그레이드

```helm upgrade -i crdp-webui ./helm/react-fastapi \

  -n crdp-webui --create-namespace \

#### 4. 로그 확인  -f ./helm/react-fastapi/values-local-registry.yaml

```bash

# Backend 로그# 디버그: 실제 렌더링 값 확인

kubectl -n crdp-webui logs -f deployment/crdp-webui-react-fastapi-backendhelm template crdp-webui ./helm/react-fastapi -f ./helm/react-fastapi/values-local-registry.yaml | head -200

```

# Frontend 로그

kubectl -n crdp-webui logs -f deployment/crdp-webui-react-fastapi-frontend## Secret 사용

```values.yaml에서 Secret 사용을 켜면 Helm이 Secret을 생성하고 Deployment는 해당 Secret을 사용합니다.



---```

backend:

## 🔧 값(Values) 설정  secret:

    enabled: true

### 기본 설정 (`values.yaml`)    name: ""            # 비우면 <release>-react-fastapi-backend 사용

    secretKey: "<your-random-secret>"

```yaml```

images:

  registry: "your-registry.com"운영 환경에서는 외부에서 미리 Secret을 생성하고 name만 지정하는 방법을 권장합니다.

  backend:

    repository: backend## 포트포워딩 예시

    tag: "latest"

    pullPolicy: IfNotPresent```

  frontend:kubectl port-forward svc/myapp-react-fastapi-frontend 5173:80

    repository: frontendkubectl port-forward svc/myapp-react-fastapi-backend 8000:8000

    tag: "latest"```

    pullPolicy: IfNotPresent

## 주의

backend:- 프런트 Axios 기본 baseURL은 '/'입니다. Ingress로 '/api'를 백엔드로 프록시합니다.

  replicaCount: 1- CORS는 동일 오리진 구성 시 크게 필요치 않으나, 크로스 도메인 시 백엔드 CORS_ORIGINS 값을 조정하세요.

  port: 8000
  env:
    CRDP_API_HOST: "192.168.0.231"
    CRDP_API_PORT: "32082"
    CRDP_PROTECTION_POLICY: "P03"

frontend:
  replicaCount: 1
  port: 80

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

### 로컬 레지스트리 설정 (`values-local-registry.yaml`)

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

### 환경 변수 설정

```yaml
# Backend 환경 변수 (values.yaml에서)
backend:
  env:
    CRDP_API_HOST: "192.168.0.231"      # CRDP 서버 호스트
    CRDP_API_PORT: "32082"               # CRDP 서버 포트
    CRDP_PROTECTION_POLICY: "P03"        # 보호 정책
    CORS_ORIGINS: "http://crdp-webui.local"  # CORS 허용 도메인
```

---

## 🌐 Ingress 설정

### 호스트 이름 설정
로컬 환경에서는 hosts 파일에 다음을 추가하세요:

**Linux/Mac:**
```bash
echo "192.168.0.240 crdp-webui.local" | sudo tee -a /etc/hosts
```

**Windows:**
```
C:\Windows\System32\drivers\etc\hosts 파일에 추가:
192.168.0.240 crdp-webui.local
```

### 접속
```
http://crdp-webui.local/protect-reveal
```

---

## 🔐 Private 레지스트리 설정

Private 레지스트리를 사용하는 경우:

### 1. Secret 생성
```bash
kubectl create secret docker-registry regcred \
  --docker-server=your-registry.com \
  --docker-username=your-username \
  --docker-password=your-password \
  --docker-email=your-email \
  -n crdp-webui
```

### 2. values.yaml 수정
```yaml
imagePullSecrets:
  - name: regcred
```

### 3. 재배포
```bash
helm upgrade crdp-webui ./helm/react-fastapi \
  -n crdp-webui \
  -f ./helm/react-fastapi/values.yaml
```

---

## 🗑️ 배포 제거

```bash
# Helm 릴리스 제거
helm uninstall crdp-webui -n crdp-webui

# 네임스페이스 제거 (선택)
kubectl delete namespace crdp-webui
```

---

## 📊 모니터링

### Pod 상태 확인
```bash
kubectl -n crdp-webui get pods --watch
```

### 리소스 사용량
```bash
kubectl -n crdp-webui top pods
```

### 이벤트 확인
```bash
kubectl -n crdp-webui get events --sort-by='.lastTimestamp'
```

---

## 🔍 문제 해결

### ImagePullBackOff

**원인**: 이미지를 레지스트리에서 가져올 수 없음

**해결책**:
1. 이미지가 레지스트리에 있는지 확인
2. 레지스트리 접근 권한 확인
3. imagePullSecrets 설정 확인

```bash
# 레지스트리 내 이미지 확인 (로컬 HTTP 레지스트리)
curl http://192.168.0.231:5001/v2/backend/tags/list
curl http://192.168.0.231:5001/v2/frontend/tags/list
```

### CrashLoopBackOff

**원인**: Pod이 시작 후 바로 종료됨

**해결책**:
```bash
# 로그 확인
kubectl -n crdp-webui logs <pod-name>

# 이전 로그 확인
kubectl -n crdp-webui logs <pod-name> --previous
```

### Ingress 접근 불가

**원인**: hosts 파일 미설정 또는 Ingress 설정 오류

**해결책**:
```bash
# Ingress 설정 확인
kubectl -n crdp-webui get ingress -o yaml

# hosts 파일 확인
cat /etc/hosts | grep crdp-webui.local

# Ingress Controller 확인
kubectl get deployment -n ingress-nginx
```

---

## 🔄 업데이트/재배포

### 이미지만 업데이트
```bash
# 새 이미지 빌드 및 푸시
TAG=$(date +%Y%m%d-%H%M%S)
docker build -t 192.168.0.231:5001/backend:$TAG -f backend/Dockerfile backend
docker push 192.168.0.231:5001/backend:$TAG

# values 업데이트
sed -i "s/tag: .*/tag: \"$TAG\"/" helm/react-fastapi/values-local-registry.yaml

# Helm 업그레이드
helm upgrade crdp-webui ./helm/react-fastapi \
  -n crdp-webui \
  -f ./helm/react-fastapi/values-local-registry.yaml
```

### 전체 재배포
```bash
helm uninstall crdp-webui -n crdp-webui
helm upgrade --install crdp-webui ./helm/react-fastapi \
  -n crdp-webui \
  -f ./helm/react-fastapi/values-local-registry.yaml
```

---

## 📝 커스터마이제이션

### 레플리카 개수 변경
```bash
helm upgrade crdp-webui ./helm/react-fastapi \
  -n crdp-webui \
  --set backend.replicaCount=3 \
  --set frontend.replicaCount=2
```

### 포트 변경
```bash
helm upgrade crdp-webui ./helm/react-fastapi \
  -n crdp-webui \
  --set backend.port=9000
```

### 환경 변수 변경
```bash
helm upgrade crdp-webui ./helm/react-fastapi \
  -n crdp-webui \
  --set backend.env.CRDP_API_HOST=192.168.1.100 \
  --set backend.env.CRDP_API_PORT=30000
```

---

## 📚 참고 자료

- [Helm 공식 문서](https://helm.sh/docs/)
- [Kubernetes Ingress](https://kubernetes.io/docs/concepts/services-networking/ingress/)
- [Docker 레지스트리](https://docs.docker.com/registry/)
- [Kubernetes Secret](https://kubernetes.io/docs/concepts/configuration/secret/)

---

**최종 업데이트**: 2025-10-21
