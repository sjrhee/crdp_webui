# 워커 노드 Containerd HTTP 레지스트리 수동 설정 가이드

## 문제 상황
- 파드가 `192.168.0.231:5001/backend:local` 이미지를 풀 때 ImagePullBackOff 발생
- 에러: "http: server gave HTTP response to HTTPS client"
- 원인: containerd가 기본적으로 HTTPS만 허용

## 해결 방법 (워커 노드에서 실행)

### 1단계: 기존 설정 백업
```bash
sudo cp /etc/containerd/config.toml /etc/containerd/config.toml.backup
```

### 2단계: config.toml 편집
```bash
sudo vi /etc/containerd/config.toml
```

### 3단계: 레지스트리 설정 추가

`[plugins."io.containerd.grpc.v1.cri".registry]` 섹션을 찾아서 아래 내용을 추가합니다.
만약 registry 섹션이 없다면 새로 만듭니다.

```toml
[plugins."io.containerd.grpc.v1.cri".registry]
  [plugins."io.containerd.grpc.v1.cri".registry.mirrors]
    [plugins."io.containerd.grpc.v1.cri".registry.mirrors."192.168.0.231:5001"]
      endpoint = ["http://192.168.0.231:5001"]
  
  [plugins."io.containerd.grpc.v1.cri".registry.configs]
    [plugins."io.containerd.grpc.v1.cri".registry.configs."192.168.0.231:5001".tls]
      insecure_skip_verify = true
```

### 4단계: 설정 검증
```bash
# 설정이 올바른지 확인
sudo grep -A 10 "192.168.0.231:5001" /etc/containerd/config.toml
```

### 5단계: containerd 재시작
```bash
sudo systemctl restart containerd
sudo systemctl status containerd
```

### 6단계: 설정 적용 확인
```bash
# containerd가 정상 실행되는지 확인
sudo systemctl is-active containerd
```

## 대안 방법: 간단한 sed 명령 (한 줄씩 실행)

만약 vi 편집이 어렵다면 아래 명령들을 순서대로 실행:

```bash
# 백업
sudo cp /etc/containerd/config.toml /etc/containerd/config.toml.backup

# registry.mirrors 섹션이 있는지 확인
grep -q "registry.mirrors" /etc/containerd/config.toml

# 없다면 추가 (있으면 수동으로 편집 필요)
if ! grep -q "registry.mirrors" /etc/containerd/config.toml; then
  sudo bash -c 'cat >> /etc/containerd/config.toml << "EOF"

[plugins."io.containerd.grpc.v1.cri".registry.mirrors."192.168.0.231:5001"]
  endpoint = ["http://192.168.0.231:5001"]

[plugins."io.containerd.grpc.v1.cri".registry.configs."192.168.0.231:5001".tls]
  insecure_skip_verify = true
EOF'
fi

# 재시작
sudo systemctl restart containerd
sudo systemctl status containerd
```

## 설정 완료 후 (마스터 노드에서 실행)

```bash
# 파드 삭제해서 재생성
kubectl -n crdp-webui delete pod --all

# 파드 상태 확인
kubectl -n crdp-webui get pods -w
```

## 문제 해결 체크리스트

- [ ] 워커 노드 containerd 설정 파일 백업 완료
- [ ] config.toml에 레지스트리 설정 추가 완료
- [ ] containerd 재시작 성공
- [ ] containerd active 상태 확인
- [ ] 마스터에서 파드 재생성 완료
- [ ] 파드 Running 상태 확인

## 만약 여전히 실패한다면

1. 레지스트리가 실제로 동작하는지 확인:
   ```bash
   curl http://192.168.0.231:5001/v2/_catalog
   ```

2. 워커 노드에서 레지스트리 접근 가능한지 확인:
   ```bash
   # 워커 노드에서
   curl http://192.168.0.231:5001/v2/_catalog
   ```

3. containerd 로그 확인:
   ```bash
   sudo journalctl -u containerd -n 100 --no-pager
   ```
