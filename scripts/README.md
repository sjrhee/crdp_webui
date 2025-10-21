# scripts

이 디렉터리는 클러스터 운영을 돕는 보조 스크립트를 제공합니다.

## shutdown.sh
안전하게 Kubernetes 클러스터(마스터/다중 워커)를 중지하기 위한 스크립트입니다.

특징:
- 기본 DRY_RUN(파괴적 작업 미수행)
- 확인 프롬프트( --yes 로 생략 )
- 다중 워커 지원(콤마 구분)
- 선택적 etcd 스냅샷(로컬 etcdctl/인증서 필요)
- cordon/drain 후 kubelet/containerd 종료 및 전원 종료

사용 예시:
```
# 드라이런(기본): 실제 종료 없이 절차만 확인
scripts/shutdown.sh

# 실제 실행 + 확인 생략 + 워커 2대 지정
scripts/shutdown.sh --execute --yes --master k8s-master \
  --workers k8s-worker1,k8s-worker2 --ssh-user ubuntu

# drain 강제, etcd 스냅샷 생략
scripts/shutdown.sh --execute --yes --force --skip-etcd-snapshot

# 종료 단계 일부 생략
scripts/shutdown.sh --execute --yes --skip-poweroff-worker --skip-poweroff-master
```

환경 변수로도 설정 가능:
- MASTER_HOST, WORKERS, SSH_USER, KCTL, ETCD_SNAPSHOT

주의:
- 실제 종료 전, 워크로드 중단 가능 시간/데이터(EmptyDir) 확인이 필요합니다.
- etcd 스냅샷은 kubeadm 기본 인증서 경로( /etc/kubernetes/pki/etcd ) 기준입니다.
- SSH 접근 권한과 sudo 권한이 필요합니다.
