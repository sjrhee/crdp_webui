# react-fastapi Helm Chart

## 이미지 빌드/푸시

레지스트리에 푸시할 이미지를 빌드합니다.

```
# Backend
docker build -t <REGISTRY>/<NAMESPACE>/backend:<TAG> ../../backend
docker push <REGISTRY>/<NAMESPACE>/backend:<TAG>

# Frontend
docker build -t <REGISTRY>/<NAMESPACE>/frontend:<TAG> ../../frontend
docker push <REGISTRY>/<NAMESPACE>/frontend:<TAG>
```

values.yaml에 이미지 정보를 지정합니다.

```
images:
  registry: "<REGISTRY>/<NAMESPACE>"
  backend:
    repository: backend
    tag: <TAG>
  frontend:
    repository: frontend
    tag: <TAG>
```

프라이빗 레지스트리의 경우 pull secret을 생성해 참조하세요.

```
kubectl create secret docker-registry regcred \
  --docker-server=<REGISTRY> \
  --docker-username=<USERNAME> \
  --docker-password=<PASSWORD> \
  --docker-email=<EMAIL>

# values.yaml
imagePullSecrets:
  - regcred
```

## 설치/업그레이드

```
helm upgrade -i myapp ./helm/react-fastapi \
  -f ./helm/react-fastapi/values.yaml \
  --set ingress.enabled=true \
  --set ingress.hosts[0].host=your.domain.com
```

## 로컬 레지스트리 사용 가이드 (containerd, HTTP)

로컬 개발 환경에서 사설 레지스트리(예: 192.168.0.231:5001, HTTP)를 사용하는 경우, 워커 노드의 containerd가 기본적으로 HTTPS를 강제하기 때문에 ImagePullBackOff가 발생할 수 있습니다.

증상 예시:

```
Failed to pull and unpack image "192.168.0.231:5001/backend:local":
failed to resolve reference "192.168.0.231:5001/backend:local":
failed to do request: Head "https://192.168.0.231:5001/v2/backend/manifests/local":
http: server gave HTTP response to HTTPS client
```

해결: 워커 노드(containerd)에서 해당 레지스트리를 HTTP 미러로 신뢰하도록 설정합니다.

1) containerd 설정 편집 (워커 노드에서 실행)

```bash
sudo mkdir -p /etc/containerd
sudo bash -lc 'test -f /etc/containerd/config.toml || containerd config default > /etc/containerd/config.toml'
sudo sed -i \
  -e "/\[plugins.\"io.containerd.grpc.v1.cri\"\.registry\]/{:a;n;/\[/q;H;};$q1" \
  /etc/containerd/config.toml || true

cat <<'TOML' | sudo tee /etc/containerd/config.d/local-registry.toml >/dev/null
[plugins."io.containerd.grpc.v1.cri".registry.mirrors."192.168.0.231:5001"]
  endpoint = ["http://192.168.0.231:5001"]
TOML

# config.d 를 include 하지 않는 경우, config.toml 내 registry.mirrors 섹션에 동일 내용 직접 추가
```

2) containerd 재시작

```bash
sudo systemctl restart containerd
sudo systemctl is-active containerd
```

3) 이미지 재시도: 파드 삭제 또는 롤아웃 재시작

```bash
kubectl -n <NAMESPACE> rollout restart deploy/<DEPLOYMENT_NAME>
```

참고: 운영 환경에서는 레지스트리를 TLS(HTTPS)로 구성하고 imagePullSecrets 사용을 권장합니다.

## Helm 값 선택 가이드

- 기본값(values.yaml): Docker Hub 등 공개 레지스트리에 푸시된 `backend:<TAG>`, `frontend:<TAG>`를 사용할 때 적합합니다.
- 로컬 레지스트리(values-local-registry.yaml): HTTP 레지스트리 `192.168.0.231:5001`를 사용할 때 적용합니다.

적용 예시:

```bash
# 로컬 레지스트리 사용 배포/업그레이드
helm upgrade -i crdp-webui ./helm/react-fastapi \
  -n crdp-webui --create-namespace \
  -f ./helm/react-fastapi/values-local-registry.yaml

# 디버그: 실제 렌더링 값 확인
helm template crdp-webui ./helm/react-fastapi -f ./helm/react-fastapi/values-local-registry.yaml | head -200
```

## Secret 사용
values.yaml에서 Secret 사용을 켜면 Helm이 Secret을 생성하고 Deployment는 해당 Secret을 사용합니다.

```
backend:
  secret:
    enabled: true
    name: ""            # 비우면 <release>-react-fastapi-backend 사용
    secretKey: "<your-random-secret>"
```

운영 환경에서는 외부에서 미리 Secret을 생성하고 name만 지정하는 방법을 권장합니다.

## 포트포워딩 예시

```
kubectl port-forward svc/myapp-react-fastapi-frontend 5173:80
kubectl port-forward svc/myapp-react-fastapi-backend 8000:8000
```

## 주의
- 프런트 Axios 기본 baseURL은 '/'입니다. Ingress로 '/api'를 백엔드로 프록시합니다.
- CORS는 동일 오리진 구성 시 크게 필요치 않으나, 크로스 도메인 시 백엔드 CORS_ORIGINS 값을 조정하세요.
