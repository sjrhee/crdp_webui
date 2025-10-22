# K8s + Helm 점검/조치 런북

목적: 클러스터 이슈 발생 시 표준 절차로 빠르게 진단/복구하기 위한 체크리스트와 명령 모음입니다.

## 0) 전제 및 컨텍스트
- 마스터 노드: 192.168.0.231 (sudo NOPASSWD 구성)
- 워커 노드: 192.168.0.232 (sudo NOPASSWD 구성)
- kubeconfig: /etc/kubernetes/admin.conf
- 컨테이너 런타임: containerd (SystemdCgroup=true)
- etcd: 단일 노드, static pod

## 1) 컨트롤 플레인 헬스 체크
```bash
# API 서버 readiness (자세히)
sudo kubectl --kubeconfig=/etc/kubernetes/admin.conf get --raw='/readyz?verbose'

# 버전/접속 테스트
sudo kubectl --kubeconfig=/etc/kubernetes/admin.conf version --short
sudo kubectl --kubeconfig=/etc/kubernetes/admin.conf get --raw='/version'

# etcd 헬스
ETCD_ID=$(sudo crictl ps | awk '/etcd/{print $1; exit}')
sudo crictl exec "$ETCD_ID" etcdctl \
  --endpoints=https://127.0.0.1:2379 \
  --cacert=/etc/kubernetes/pki/etcd/ca.crt \
  --cert=/etc/kubernetes/pki/etcd/server.crt \
  --key=/etc/kubernetes/pki/etcd/server.key \
  endpoint health

# 컨트롤 플레인 로그 스팟 점검
sudo journalctl -u kubelet -n 200 --no-pager | egrep -i 'error|fail|timeout' || true
sudo crictl logs $(sudo crictl ps | awk '/kube-apiserver/{print $1; exit}') 2>&1 | tail -n 100
```

## 2) 노드/네트워크/코어 애드온 상태
```bash
kubectl get nodes -o wide
kubectl get pods -A -o wide

# 코어 네임스페이스 확인
kubectl -n kube-system get pods
kubectl -n kube-flannel get pods 2>/dev/null || true
kubectl -n ingress-nginx get pods 2>/dev/null || true
```

## 3) 흔한 장애와 빠른 조치

### A. kubectl 타임아웃 / API 연결 불가
- 6443 포트 점유/중복 프로세스 확인 → 오래된 kube-apiserver PID 종료
```bash
sudo lsof -i:6443
sudo kill -9 <PID>
```
- kubelet 재시작으로 static pod 재생성
```bash
sudo systemctl restart kubelet
```

### B. etcd 느림(GuaranteedUpdate 지연)/헬스 불량
- 디스크 I/O, 용량 점검 → 문제 없으면 일시 부하 가능성
- 필요 시 etcd 상태/알람, defrag 고려(운영 전 사전 점검)
```bash
ETCD_ID=$(sudo crictl ps | awk '/etcd/{print $1; exit}')
sudo crictl exec "$ETCD_ID" etcdctl alarm list || true
sudo crictl exec "$ETCD_ID" etcdctl defrag --cluster || true
```

### C. ImagePullBackOff (HTTP 레지스트리)
- containerd가 HTTPS를 강제 → HTTP 레지스트리 허용 필요
- 워커 노드 `/etc/containerd/config.toml`에 mirrors/configs 추가
- 상세 절차: docs/troubleshooting/containerd-http-registry-setup.md

### D. Frontend CrashLoopBackOff (nginx upstream not found)
- 프론트엔드 nginx.conf에 하드코딩된 `backend:8000` → Service 이름 확인
- 해결: ExternalName Service로 별칭 제공 또는 Helm 템플릿/환경변수화
```bash
kubectl -n <NS> apply -f - <<EOF
apiVersion: v1
kind: Service
metadata:
  name: backend
spec:
  type: ExternalName
  externalName: <backend-svc>.<ns>.svc.cluster.local
EOF
```

## 4) Helm 점검/조치
```bash
# 릴리스 조회
helm list -A

# 릴리스 상세
helm status <RELEASE> -n <NS>

# 템플릿 렌더링 확인
helm template <RELEASE> ./helm/react-fastapi -f ./helm/react-fastapi/values-local-registry.yaml | head -200

# 롤아웃 재시작
kubectl -n <NS> rollout restart deploy/<DEPLOY>

# 실패 시 롤백
helm rollback <RELEASE> <REVISION> -n <NS>
```

## 5) 보안/청소 체크
```bash
# 임시 인증서/키 정리
sudo rm -f /tmp/admin.crt /tmp/admin.key 2>/dev/null || true

# sudo NOPASSWD 확인(개발 환경 한정)
sudo -n true && echo OK || echo "NOPASSWD 미적용"
```

## 6) 체크리스트
- [ ] 노드 Ready 상태 확인
- [ ] API /readyz 통과
- [ ] etcd healthy
- [ ] 문제 파드 없음 (Running/Completed 외 없음)
- [ ] Helm 릴리스 정상 (deployed)
- [ ] 임시 파일/민감정보 정리 완료

## 부록: 네임스페이스별 빠른 조회
```bash
NS=crdp-webui
kubectl -n "$NS" get deploy,svc,pods
kubectl -n "$NS" describe deploy <DEPLOY>
```
