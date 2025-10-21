#!/usr/bin/env bash
set -euo pipefail

# Build backend/frontend images, push to registry, then deploy Helm chart using the built tags.
# Config via env:
#   REGISTRY   - image registry (default: 192.168.0.231:5001)
#   TAG        - image tag for both images (default: YYYYMMDD-HHMMSS)
#   NAMESPACE  - k8s namespace (default: crdp-webui)
#   RELEASE    - helm release name (default: crdp-webui)
#   SKIP_BUILD - set to 1 to skip docker build
#   SKIP_PUSH  - set to 1 to skip docker push

REGISTRY=${REGISTRY:-192.168.0.231:5001}
TAG=${TAG:-$(date +%Y%m%d-%H%M%S)}
NAMESPACE=${NAMESPACE:-crdp-webui}
RELEASE=${RELEASE:-crdp-webui}

info() { echo "[INFO] $*"; }

info "Using REGISTRY=${REGISTRY} TAG=${TAG} NAMESPACE=${NAMESPACE} RELEASE=${RELEASE}"

if [[ "${SKIP_BUILD:-0}" != "1" ]]; then
  info "Building images..."
  docker build -t "${REGISTRY}/backend:${TAG}" ./backend
  docker build -t "${REGISTRY}/frontend:${TAG}" ./frontend
else
  info "Skipping build (SKIP_BUILD=1)"
fi

if [[ "${SKIP_PUSH:-0}" != "1" ]]; then
  info "Pushing images..."
  docker push "${REGISTRY}/backend:${TAG}"
  docker push "${REGISTRY}/frontend:${TAG}"
else
  info "Skipping push (SKIP_PUSH=1)"
fi

info "Deploying with Helm..."
helm upgrade --install "${RELEASE}" ./helm/react-fastapi \
  -n "${NAMESPACE}" --create-namespace \
  -f ./helm/react-fastapi/values-local-registry.yaml \
  --set images.registry="${REGISTRY}" \
  --set images.backend.tag="${TAG}" \
  --set images.frontend.tag="${TAG}"

info "Deployment kicked off. Current resources:"
kubectl get pods,svc,ingress -n "${NAMESPACE}" --no-headers || true

info "Done. Access via Ingress IP/Host when ready."
