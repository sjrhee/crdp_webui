# Kubernetes 클러스터 트러블슈팅 가이드

이 디렉토리에는 Kubernetes 클러스터 운영 중 발생한 문제들과 해결 방법을 문서화합니다.

## 문서 목록

### [containerd-http-registry-setup.md](./containerd-http-registry-setup.md)
- **주제**: Containerd HTTP 레지스트리 설정
- **문제**: ImagePullBackOff - "http: server gave HTTP response to HTTPS client"
- **해결**: containerd에서 HTTP 레지스트리 허용 설정 방법

### 런북
- [K8s + Helm 점검/조치 런북](../runbooks/k8s-helm-runbook.md)

## 해결된 주요 문제들 (2025-10-21)

### 1. API 서버 포트 충돌
- **증상**: kubectl 명령 timeout, API 서버 재시작 실패
- **원인**: 이전 kube-apiserver 프로세스가 포트 6443 점유
- **해결**: `kill -9 <PID>` 후 kubelet이 자동 재시작

### 2. etcd 성능 저하
- **증상**: GuaranteedUpdate 작업 500-2000ms 지연
- **원인**: API 서버 재시작 후 일시적 부하
- **해결**: 시간 경과 후 자연 안정화, etcd defrag 불필요

### 3. ImagePullBackOff (HTTP 레지스트리)
- **증상**: 192.168.0.231:5001 이미지 풀 실패
- **원인**: containerd가 HTTPS만 허용
- **해결**: containerd config.toml에 HTTP endpoint 설정

### 4. Frontend CrashLoopBackOff
- **증상**: nginx upstream 'backend' not found
- **원인**: Service 이름 불일치 (nginx.conf에 하드코딩)
- **해결**: ExternalName Service 생성으로 별칭 제공

## 유용한 명령어

### 클러스터 상태 확인
```bash
# 노드 상태
kubectl get nodes -o wide

# 모든 파드 상태
kubectl get pods -A

# 문제 파드 찾기
kubectl get pods -A | grep -v Running | grep -v Completed

# Helm 릴리스
helm list -A
```

### 컨트롤 플레인 진단
```bash
# API 서버 헬스
sudo kubectl --kubeconfig=/etc/kubernetes/admin.conf get --raw='/readyz?verbose'

# etcd 헬스
sudo crictl exec $(sudo crictl ps | grep etcd | awk '{print $1}') \
  etcdctl --endpoints=https://127.0.0.1:2379 \
  --cacert=/etc/kubernetes/pki/etcd/ca.crt \
  --cert=/etc/kubernetes/pki/etcd/server.crt \
  --key=/etc/kubernetes/pki/etcd/server.key \
  endpoint health

# 컨테이너 로그
sudo crictl logs <container-id>
```

### 트러블슈팅 팁
1. 항상 백업 먼저: `sudo cp <config> <config>.backup`
2. 로그 확인: `journalctl -u kubelet -n 100`
3. 단계적 접근: 문제를 작은 단위로 분리
4. 문서화: 해결 과정을 기록해 재발 방지

## 참고 자료
- [Kubernetes 공식 문서](https://kubernetes.io/docs/)
- [containerd 레지스트리 설정](https://github.com/containerd/containerd/blob/main/docs/cri/registry.md)
- [etcd 운영 가이드](https://etcd.io/docs/v3.5/op-guide/)
