#!/usr/bin/env bash
set -euo pipefail

# Safe Kubernetes cluster shutdown script
# - Defaults to DRY_RUN (no destructive actions)
# - Confirmation prompt unless --yes
# - Multi-worker support (comma-separated)
# - Optional etcd snapshot (if etcdctl and certs available)
# - Cordon/Drain then poweroff worker(s) and master

DRY_RUN=1
ASK_CONFIRM=1
MASTER_HOST=${MASTER_HOST:-k8s-master}
WORKERS_CSV=${WORKERS:-k8s-worker}
SSH_USER=${SSH_USER:-ubuntu}
KCTL=${KCTL:-kubectl}
FORCE_DRAIN=0
SKIP_ETCD_SNAPSHOT=0
SKIP_DRAIN=0
SKIP_POWEROFF_WORKER=0
SKIP_POWEROFF_MASTER=0
ETCD_SNAPSHOT=${ETCD_SNAPSHOT:-/root/etcd-$(date +%F-%H%M%S).db}

usage() {
  cat <<'USAGE'
Usage: scripts/shutdown.sh [options]

Options:
  --execute                 Run destructive actions (disable DRY_RUN)
  --yes                     Skip confirmation prompt
  --master <host>           Master hostname (default: k8s-master)
  --workers <h1,h2,...>     Comma-separated worker hostnames (default: k8s-worker)
  --ssh-user <user>         SSH username (default: ubuntu)
  --kctl <kubectl|k3s kubectl|...>  kubectl command (default: kubectl)
  --force                   Force drain (may disrupt PDB-protected pods)
  --skip-etcd-snapshot      Do not attempt etcd snapshot
  --skip-drain              Skip drain phase
  --skip-poweroff-worker    Do not poweroff workers
  --skip-poweroff-master    Do not poweroff master
  -h, --help                Show this help

Environment overrides:
  MASTER_HOST, WORKERS, SSH_USER, KCTL, ETCD_SNAPSHOT

Notes:
  - DRY_RUN is enabled by default. Use --execute to actually stop/poweroff services.
  - etcd snapshot requires etcdctl and kubeadm certs under /etc/kubernetes/pki/etcd.
USAGE
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --execute) DRY_RUN=0; shift ;;
    --yes) ASK_CONFIRM=0; shift ;;
    --master) MASTER_HOST="$2"; shift 2 ;;
    --workers) WORKERS_CSV="$2"; shift 2 ;;
    --ssh-user) SSH_USER="$2"; shift 2 ;;
    --kctl) KCTL="$2"; shift 2 ;;
    --force) FORCE_DRAIN=1; shift ;;
    --skip-etcd-snapshot) SKIP_ETCD_SNAPSHOT=1; shift ;;
    --skip-drain) SKIP_DRAIN=1; shift ;;
    --skip-poweroff-worker) SKIP_POWEROFF_WORKER=1; shift ;;
    --skip-poweroff-master) SKIP_POWEROFF_MASTER=1; shift ;;
    -h|--help) usage; exit 0 ;;
    *) echo "Unknown option: $1"; usage; exit 1 ;;
  esac
done

IFS=',' read -r -a WORKER_HOSTS <<<"$WORKERS_CSV"

log() { printf '%s\n' "$*"; }
step() { log "[+] $*"; }

run() {
  echo "+ $*"
  if [[ "$DRY_RUN" -eq 1 ]]; then
    return 0
  fi
  bash -lc "$*"
}

ssh_run() {
  local host="$1"; shift
  local cmd="$*"
  echo "+ ssh ${SSH_USER}@${host} -- $cmd"
  if [[ "$DRY_RUN" -eq 1 ]]; then
    return 0
  fi
  ssh -o StrictHostKeyChecking=no "${SSH_USER}@${host}" "$cmd"
}

confirm() {
  if [[ "$ASK_CONFIRM" -eq 0 ]]; then return 0; fi
  echo "This will stop kubelet/containerd and poweroff nodes:"
  echo "  Master : $MASTER_HOST"
  echo "  Workers: ${WORKER_HOSTS[*]}"
  echo "  DRY_RUN: $([[ "$DRY_RUN" -eq 1 ]] && echo ON || echo OFF)"
  read -r -p "Proceed? type 'yes' to continue: " ans
  [[ "$ans" == "yes" ]]
}

main() {
  step "(1/7) Cluster/Nodes info"
  run "$KCTL cluster-info >/dev/null 2>&1 || true"
  run "$KCTL get nodes -o wide || true"

  step "(2/7) Cordon nodes"
  for n in "${WORKER_HOSTS[@]}"; do run "$KCTL cordon $n || true"; done
  run "$KCTL cordon $MASTER_HOST || true"

  step "(3/7) Drain workers (${#WORKER_HOSTS[@]})"
  if [[ "$SKIP_DRAIN" -ne 1 ]]; then
    DRAIN_OPTS=(--ignore-daemonsets --delete-emptydir-data --grace-period=60 --timeout=10m)
    [[ "$FORCE_DRAIN" -eq 1 ]] && DRAIN_OPTS+=(--force)
    for n in "${WORKER_HOSTS[@]}"; do
      run "$KCTL drain $n ${DRAIN_OPTS[*]} || true"
    done
  else
    log "  -> skip drain"
  fi

  step "(4/7) etcd snapshot on master (optional)"
  if [[ "$SKIP_ETCD_SNAPSHOT" -eq 1 ]]; then
    log "  -> skip etcd snapshot"
  else
    if command -v etcdctl >/dev/null 2>&1 && [[ -r /etc/kubernetes/pki/etcd/ca.crt ]]; then
      run "sudo ETCDCTL_API=3 etcdctl snapshot save '$ETCD_SNAPSHOT' \
        --endpoints=https://127.0.0.1:2379 \
        --cacert=/etc/kubernetes/pki/etcd/ca.crt \
        --cert=/etc/kubernetes/pki/etcd/server.crt \
        --key=/etc/kubernetes/pki/etcd/server.key"
      log "  -> etcd snapshot: $ETCD_SNAPSHOT"
    else
      log "  -> etcdctl or certs not available; skipping snapshot"
    fi
  fi

  step "(5/7) Stop services + poweroff workers"
  if [[ "$SKIP_POWEROFF_WORKER" -eq 1 ]]; then
    log "  -> skip worker poweroff"
  else
    for n in "${WORKER_HOSTS[@]}"; do
      ssh_run "$n" "sudo systemctl stop kubelet || true; sudo systemctl stop containerd || true; sudo poweroff" || true
    done
  fi

  step "(6/7) Re-check nodes"
  run "$KCTL get nodes -o wide || true"

  step "(7/7) Stop services + poweroff master"
  if [[ "$SKIP_POWEROFF_MASTER" -eq 1 ]]; then
    log "  -> skip master poweroff"
  else
    run "sleep 2"
    run "sudo systemctl stop kubelet || true"
    run "sudo systemctl stop containerd || true"
    run "sudo poweroff"
  fi
}

confirm && main || { echo "Aborted"; exit 1; }
