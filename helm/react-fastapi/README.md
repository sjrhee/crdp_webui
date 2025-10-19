# react-fastapi Helm Chart

## 설치 예시
```
helm install myapp ./helm/react-fastapi \
  --set images.backend=ghcr.io/you/react-fastapi-backend:1.0.0 \
  --set images.frontend=ghcr.io/you/react-fastapi-frontend:1.0.0 \
  --set ingress.enabled=true \
  --set ingress.hosts[0].host=your.domain.com
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
