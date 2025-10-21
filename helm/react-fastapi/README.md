# Helm - Kubernetes 배포# react-fastapi Helm Chart# react-fastapi Helm Chart



FastAPI 백엔드 + React 프론트엔드를 Kubernetes에 배포하는 Helm 차트



---FastAPI 백엔드와 React 프론트엔드를 Kubernetes 클러스터에 배포하기 위한 Helm 차트입니다.## 이미지 빌드/푸시



## 🚀 빠른 시작



### 1. 네임스페이스 생성---레지스트리에 푸시할 이미지를 빌드합니다.



```bash

kubectl create namespace crdp-webui

```## 📋 차트 구조```



### 2. Helm 배포# Backend



```bash```docker build -t <REGISTRY>/<NAMESPACE>/backend:<TAG> ../../backend

helm upgrade --install crdp-webui ./helm/react-fastapi \

  -n crdp-webui \helm/react-fastapi/docker push <REGISTRY>/<NAMESPACE>/backend:<TAG>

  -f ./helm/react-fastapi/values-local-registry.yaml

```├── Chart.yaml                       # 차트 메타데이터



### 3. 상태 확인├── values.yaml                      # 기본 설정값# Frontend



```bash├── values-local-registry.yaml       # 로컬 레지스트리 설정값docker build -t <REGISTRY>/<NAMESPACE>/frontend:<TAG> ../../frontend

kubectl -n crdp-webui get pods

kubectl -n crdp-webui get svc├── templates/docker push <REGISTRY>/<NAMESPACE>/frontend:<TAG>

kubectl -n crdp-webui get ingress

```│   ├── backend-deploy.yaml          # Backend Deployment```



### 4. 접속│   ├── backend-service.yaml         # Backend Service



**hosts 파일에 추가** (클라이언트 PC):│   ├── backend-secret.yaml          # Backend Secret (env vars)values.yaml에 이미지 정보를 지정합니다.

```bash

192.168.0.240 crdp-webui.local│   ├── frontend-deploy.yaml         # Frontend Deployment

```

│   ├── frontend-service.yaml        # Frontend Service```

접속: http://crdp-webui.local/protect-reveal

│   ├── ingress.yaml                 # Ingress 설정images:

---

│   ├── _helpers.tpl                 # 헬퍼 템플릿  registry: "<REGISTRY>/<NAMESPACE>"

## 📊 배포 구조

│   └── NOTES.txt                    # 설치 후 노트  backend:

```

crdp-webui (Helm Release)└── README.md                        # 이 파일    repository: backend

├── frontend (Pod)

│   ├── React 웹앱 (포트 80)```    tag: <TAG>

│   └── Service (ClusterIP)

├── backend (Pod)  frontend:

│   ├── FastAPI 서버 (포트 8000)

│   └── Service (ClusterIP)---    repository: frontend

└── Ingress

    └── nginx-controller    tag: <TAG>

        └── 192.168.0.240:80

```## 🐳 Docker 이미지 준비```



---



## 📁 파일 구조### 1. 이미지 빌드프라이빗 레지스트리의 경우 pull secret을 생성해 참조하세요.



```

helm/react-fastapi/

├── Chart.yaml                    # 차트 메타데이터```bash```

├── values.yaml                   # 기본 설정값

├── values-local-registry.yaml     # 로컬 레지스트리 설정# 프로젝트 루트에서 실행kubectl create secret docker-registry regcred \

├── README.md

├── templates/TAG=$(date +%Y%m%d-%H%M%S)  --docker-server=<REGISTRY> \

│   ├── backend-deploy.yaml        # 백엔드 Deployment

│   ├── backend-secret.yaml        # 백엔드 Secret  --docker-username=<USERNAME> \

│   ├── frontend-deploy.yaml       # 프론트엔드 Deployment

│   ├── ingress.yaml               # Ingress# Backend 이미지  --docker-password=<PASSWORD> \

│   ├── _helpers.tpl               # 템플릿 헬퍼

│   └── NOTES.txt                  # 배포 후 메시지docker build -t 192.168.0.231:5001/backend:$TAG -f backend/Dockerfile backend  --docker-email=<EMAIL>

```

docker push 192.168.0.231:5001/backend:$TAG

---

# values.yaml

## ⚙️ 설정값 (values.yaml)

# Frontend 이미지imagePullSecrets:

### 백엔드 설정

docker build -t 192.168.0.231:5001/frontend:$TAG -f frontend/Dockerfile frontend  - regcred

```yaml

backend:docker push 192.168.0.231:5001/frontend:$TAG```

  replicaCount: 1

  image:

    repository: 192.168.0.231:5001/backend

    tag: "20251021-132600"echo "Backend tag: $TAG"## 설치/업그레이드

    pullPolicy: IfNotPresent

  resources:echo "Frontend tag: $TAG"

    limits:

      cpu: 500m``````

      memory: 512Mi

    requests:helm upgrade -i myapp ./helm/react-fastapi \

      cpu: 250m

      memory: 256Mi### 2. values 파일에 이미지 정보 업데이트  -f ./helm/react-fastapi/values.yaml \

  env:

    CRDP_API_HOST: "192.168.0.231"  --set ingress.enabled=true \

    CRDP_API_PORT: "32082"

    CRDP_PROTECTION_POLICY: "P03"```yaml  --set ingress.hosts[0].host=your.domain.com

    CORS_ORIGINS: "*"

```# helm/react-fastapi/values-local-registry.yaml```



### 프론트엔드 설정images:



```yaml  registry: "192.168.0.231:5001"## 로컬 레지스트리 사용 가이드 (containerd, HTTP)

frontend:

  replicaCount: 1  backend:

  image:

    repository: 192.168.0.231:5001/frontend    repository: backend로컬 개발 환경에서 사설 레지스트리(예: 192.168.0.231:5001, HTTP)를 사용하는 경우, 워커 노드의 containerd가 기본적으로 HTTPS를 강제하기 때문에 ImagePullBackOff가 발생할 수 있습니다.

    tag: "20251021-140929"

    pullPolicy: IfNotPresent    tag: "20251021-140929"

  resources:

    limits:    pullPolicy: IfNotPresent증상 예시:

      cpu: 250m

      memory: 256Mi  frontend:

    requests:

      cpu: 100m    repository: frontend```

      memory: 128Mi

```    tag: "20251021-140929"Failed to pull and unpack image "192.168.0.231:5001/backend:local":



### Ingress 설정    pullPolicy: IfNotPresentfailed to resolve reference "192.168.0.231:5001/backend:local":



```yaml```failed to do request: Head "https://192.168.0.231:5001/v2/backend/manifests/local":

ingress:

  enabled: truehttp: server gave HTTP response to HTTPS client

  className: "nginx"

  host: "crdp-webui.local"---```

  port: 80

```



---## 🚀 배포 방법해결: 워커 노드(containerd)에서 해당 레지스트리를 HTTP 미러로 신뢰하도록 설정합니다.



## 🔧 일반적인 명령어



### 배포### 전제 조건1) containerd 설정 편집 (워커 노드에서 실행)



```bash

# 처음 배포

helm install crdp-webui ./helm/react-fastapi \```bash```bash

  -n crdp-webui \

  -f ./helm/react-fastapi/values-local-registry.yaml# 필수 구성 요소 확인sudo mkdir -p /etc/containerd



# 업데이트 배포kubectl get ns                           # Kubernetes 클러스터 확인sudo bash -lc 'test -f /etc/containerd/config.toml || containerd config default > /etc/containerd/config.toml'

helm upgrade crdp-webui ./helm/react-fastapi \

  -n crdp-webui \helm version                             # Helm 설치 확인sudo sed -i \

  -f ./helm/react-fastapi/values-local-registry.yaml

```kubectl get deployment -n ingress-nginx  # ingress-nginx 설치 확인  -e "/\[plugins.\"io.containerd.grpc.v1.cri\"\.registry\]/{:a;n;/\[/q;H;};$q1" \



### 상태 확인```  /etc/containerd/config.toml || true



```bash

# 차트 검증

helm lint ./helm/react-fastapi### 배포 명령어cat <<'TOML' | sudo tee /etc/containerd/config.d/local-registry.toml >/dev/null



# 템플릿 렌더링 (적용 전)[plugins."io.containerd.grpc.v1.cri".registry.mirrors."192.168.0.231:5001"]

helm template crdp-webui ./helm/react-fastapi \

  -f ./helm/react-fastapi/values-local-registry.yaml#### 1. 네임스페이스 생성 (처음 1회)  endpoint = ["http://192.168.0.231:5001"]



# 배포 상태```bashTOML

helm status crdp-webui -n crdp-webui

kubectl create namespace crdp-webui

# 배포 히스토리

helm history crdp-webui -n crdp-webui```# config.d 를 include 하지 않는 경우, config.toml 내 registry.mirrors 섹션에 동일 내용 직접 추가

```

```

### 테스트

#### 2. Helm 설치/업그레이드

```bash

# Ingress 접속 확인```bash2) containerd 재시작

curl -H "Host: crdp-webui.local" http://192.168.0.240/

# 로컬 레지스트리 사용

# 백엔드 API 확인

kubectl -n crdp-webui port-forward svc/backend 8000:8000helm upgrade --install crdp-webui ./helm/react-fastapi \```bash

curl http://localhost:8000/api/crdp/health

```  -n crdp-webui \sudo systemctl restart containerd



### 문제 해결  -f ./helm/react-fastapi/values-local-registry.yamlsudo systemctl is-active containerd



```bash```

# Pod 로그 확인

kubectl -n crdp-webui logs -f deployment/backend# 또는 기본 values 사용

kubectl -n crdp-webui logs -f deployment/frontend

helm upgrade --install crdp-webui ./helm/react-fastapi \3) 이미지 재시도: 파드 삭제 또는 롤아웃 재시작

# Pod 내부 접근

kubectl -n crdp-webui exec -it deployment/backend -- /bin/bash  -n crdp-webui



# 이벤트 확인``````bash

kubectl -n crdp-webui get events --sort-by='.lastTimestamp'

```kubectl -n <NAMESPACE> rollout restart deploy/<DEPLOYMENT_NAME>



### 롤백#### 3. 배포 상태 확인```



```bash```bash

# 이전 버전으로 롤백

helm rollback crdp-webui 1 -n crdp-webui# Pod 상태참고: 운영 환경에서는 레지스트리를 TLS(HTTPS)로 구성하고 imagePullSecrets 사용을 권장합니다.



# 배포 삭제kubectl -n crdp-webui get pods -o wide

helm uninstall crdp-webui -n crdp-webui

```## Helm 값 선택 가이드



---# Service 상태



## 🐳 이미지 태그 업데이트kubectl -n crdp-webui get svc- 기본값(values.yaml): Docker Hub 등 공개 레지스트리에 푸시된 `backend:<TAG>`, `frontend:<TAG>`를 사용할 때 적합합니다.



새로운 이미지를 빌드한 후:- 로컬 레지스트리(values-local-registry.yaml): HTTP 레지스트리 `192.168.0.231:5001`를 사용할 때 적용합니다.



```bash# Ingress 상태

# values-local-registry.yaml 에서 태그 업데이트

# backend.image.tag: "20251021-132600"kubectl -n crdp-webui get ingress적용 예시:

# frontend.image.tag: "20251021-140929"



# 배포 업데이트

helm upgrade crdp-webui ./helm/react-fastapi \# 전체 리소스```bash

  -n crdp-webui \

  -f ./helm/react-fastapi/values-local-registry.yamlkubectl -n crdp-webui get all# 로컬 레지스트리 사용 배포/업그레이드

```

```helm upgrade -i crdp-webui ./helm/react-fastapi \

---

  -n crdp-webui --create-namespace \

## 🏗️ 로컬 레지스트리 설정

#### 4. 로그 확인  -f ./helm/react-fastapi/values-local-registry.yaml

### containerd HTTP 레지스트리 신뢰

```bash

```bash

# 경로 생성# Backend 로그# 디버그: 실제 렌더링 값 확인

sudo mkdir -p /etc/containerd/certs.d/192.168.0.231:5001

kubectl -n crdp-webui logs -f deployment/crdp-webui-react-fastapi-backendhelm template crdp-webui ./helm/react-fastapi -f ./helm/react-fastapi/values-local-registry.yaml | head -200

# hosts.toml 작성

sudo tee /etc/containerd/certs.d/192.168.0.231:5001/hosts.toml > /dev/null << EOF```

server = "http://192.168.0.231:5001"

EOF# Frontend 로그



# containerd 재시작kubectl -n crdp-webui logs -f deployment/crdp-webui-react-fastapi-frontend## Secret 사용

sudo systemctl restart containerd

``````values.yaml에서 Secret 사용을 켜면 Helm이 Secret을 생성하고 Deployment는 해당 Secret을 사용합니다.



### 이미지 푸시/풀 테스트



```bash---```

# 이미지 빌드

docker build -t 192.168.0.231:5001/backend:latest -f backend/Dockerfile backendbackend:



# 푸시## 🔧 값(Values) 설정  secret:

docker push 192.168.0.231:5001/backend:latest

    enabled: true

# 풀

docker pull 192.168.0.231:5001/backend:latest### 기본 설정 (`values.yaml`)    name: ""            # 비우면 <release>-react-fastapi-backend 사용

```

    secretKey: "<your-random-secret>"

---

```yaml```

## 📋 필수 조건

images:

| 항목 | 버전 | 확인 명령 |

|------|------|---------|  registry: "your-registry.com"운영 환경에서는 외부에서 미리 Secret을 생성하고 name만 지정하는 방법을 권장합니다.

| Kubernetes | 1.20+ | `kubectl version` |

| Helm | 3.0+ | `helm version` |  backend:

| nginx-ingress | - | `kubectl get ingressclass` |

| MetalLB | - | `kubectl get svc -n metallb-system` |    repository: backend## 포트포워딩 예시



---    tag: "latest"



## 🔍 문제 해결    pullPolicy: IfNotPresent```



### ImagePullBackOff  frontend:kubectl port-forward svc/myapp-react-fastapi-frontend 5173:80



```bash    repository: frontendkubectl port-forward svc/myapp-react-fastapi-backend 8000:8000

# containerd 레지스트리 신뢰 확인

cat /etc/containerd/certs.d/192.168.0.231:5001/hosts.toml    tag: "latest"```



# 컨테이너 로그 확인    pullPolicy: IfNotPresent

kubectl -n crdp-webui describe pod backend-xxx

```## 주의



### Ingress 접근 불가backend:- 프런트 Axios 기본 baseURL은 '/'입니다. Ingress로 '/api'를 백엔드로 프록시합니다.



```bash  replicaCount: 1- CORS는 동일 오리진 구성 시 크게 필요치 않으나, 크로스 도메인 시 백엔드 CORS_ORIGINS 값을 조정하세요.

# Ingress 상태 확인

kubectl -n crdp-webui get ingress  port: 8000

kubectl -n crdp-webui describe ingress crdp-webui  env:

    CRDP_API_HOST: "192.168.0.231"

# Ingress Controller 확인    CRDP_API_PORT: "32082"

kubectl get pods -n ingress-nginx    CRDP_PROTECTION_POLICY: "P03"



# DNS 설정 확인 (hosts 파일)frontend:

cat /etc/hosts | grep crdp-webui.local  replicaCount: 1

```  port: 80



### Pod Pendingingress:

  enabled: true

```bash  className: nginx

# 리소스 확인  hosts:

kubectl top nodes    - host: crdp-webui.local

kubectl describe node <node-name>      paths:

        - path: /

# Pod 이벤트 확인          pathType: Prefix

kubectl -n crdp-webui describe pod <pod-name>          service: frontend

```        - path: /api

          pathType: Prefix

---          service: backend

```

## 📚 참고

### 로컬 레지스트리 설정 (`values-local-registry.yaml`)

- [Helm 공식 문서](https://helm.sh/docs/)

- [Kubernetes 공식 문서](https://kubernetes.io/docs/)```yaml

- [nginx-ingress](https://kubernetes.github.io/ingress-nginx/)images:

- [MetalLB](https://metallb.universe.tf/)  registry: "192.168.0.231:5001"

  backend:

---    repository: backend

    tag: "20251021-140929"

**Last Updated**: 2025-10-21    pullPolicy: IfNotPresent

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
