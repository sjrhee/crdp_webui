#!/usr/bin/env bash
set -euo pipefail

# Safe Kubernetes cluster startup script
# - Defaults to DRY_RUN (no changes) and confirmation prompt
# - Start containerd/kubelet on master/workers (via SSH)
# - Wait for nodes to become Ready (optional)
# - Uncordon nodes
# - Optional: rollout restart deployments and wait for rollout

DRY_RUN=1
ASK_CONFIRM=1
MASTER_HOST=${MASTER_HOST:-k8s-master}
WORKERS_CSV=${WORKERS:-k8s-worker}
SSH_USER=${SSH_USER:-ubuntu}
KCTL=${KCTL:-kubectl}
WAIT_READY=0
READY_TIMEOUT=${READY_TIMEOUT:-10m}
ROLL_NS=""
DO_ROLLOUT_RESTART=0
ROLLOUT_TIMEOUT=${ROLLOUT_TIMEOUT:-5m}
SKIP_START_WORKER=0
SKIP_START_MASTER=0

usage() {
  cat <<'USAGE'
Usage: scripts/startup.sh [options]

Options:
  --execute                   Run actions (disable DRY_RUN)
  --yes                       Skip confirmation prompt
  --master <host>             Master hostname (default: k8s-master)
  --workers <h1,h2,...>       Comma-separated worker hostnames (default: k8s-worker)
  --ssh-user <user>           SSH username (default: ubuntu)
  --kctl <kubectl|...>        kubectl command (default: kubectl)
  --wait-ready                Wait nodes to become Ready
  --ready-timeout <dur>       Wait timeout for node Ready (default: 10m)
  --rollout-namespace <ns>    Namespace to operate rollout
  --rollout-restart           Perform 'kubectl -n <ns> rollout restart deploy' and wait
  --rollout-timeout <dur>     Rollout status timeout (default: 5m)
  --skip-start-worker         Do not start services on workers
  --skip-start-master         Do not start services on master
  -h, --help                  Show this help

Environment overrides:
  MASTER_HOST, WORKERS, SSH_USER, KCTL, READY_TIMEOUT, ROLLOUT_TIMEOUT

Notes:
  - If nodes are powered off, ensure machines are powered on or IPMI/console used.
  - This script attempts 'systemctl start containerd && kubelet' via SSH.
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
    --wait-ready) WAIT_READY=1; shift ;;
    --ready-timeout) READY_TIMEOUT="$2"; shift 2 ;;
    --rollout-namespace) ROLL_NS="$2"; shift 2 ;;
    --rollout-restart) DO_ROLLOUT_RESTART=1; shift ;;
    --rollout-timeout) ROLLOUT_TIMEOUT="$2"; shift 2 ;;
    --skip-start-worker) SKIP_START_WORKER=1; shift ;;
    --skip-start-master) SKIP_START_MASTER=1; shift ;;
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
  ssh -o StrictHostKeyChecking=no "${SSH_USER}@${host}" "$cmd" || true
}

confirm() {
  if [[ "$ASK_CONFIRM" -eq 0 ]]; then return 0; fi
  echo "This will attempt to start services and uncordon nodes:"
  echo "  Master : $MASTER_HOST"
  echo "  Workers: ${WORKER_HOSTS[*]}"
  echo "  DRY_RUN: $([[ "$DRY_RUN" -eq 1 ]] && echo ON || echo OFF)"
  read -r -p "Proceed? type 'yes' to continue: " ans
  [[ "$ans" == "yes" ]]
}

wait_node_ready() {
  local node="$1"
  run "$KCTL wait --for=condition=Ready node/$node --timeout=$READY_TIMEOUT || true"
}

rollout_restart_and_wait() {
  local ns="$1"
  step "Rollout restart deployments in namespace: $ns"
  run "$KCTL -n $ns rollout restart deploy || true"
  # Wait each deployment to complete
  # shellcheck disable=SC2046
  local deps
  deps=$(bash -lc "$KCTL -n $ns get deploy -o jsonpath='{.items[*].metadata.name}'")
  for d in $deps; do
    run "$KCTL -n $ns rollout status deploy/$d --timeout=$ROLLOUT_TIMEOUT || true"
  done
}

main() {
  step "(1/6) Cluster/Nodes info (pre)"
  run "$KCTL cluster-info || true"
  run "$KCTL get nodes -o wide || true"

  step "(2/6) Start services on workers"
  if [[ "$SKIP_START_WORKER" -eq 1 ]]; then
    log "  -> skip start services on workers"
  else
    for n in "${WORKER_HOSTS[@]}"; do
      ssh_run "$n" "sudo systemctl start containerd || sudo systemctl restart containerd || true; sudo systemctl start kubelet || sudo systemctl restart kubelet || true"
    done
  fi

  step "(3/6) Start services on master"
  if [[ "$SKIP_START_MASTER" -eq 1 ]]; then
    log "  -> skip start services on master"
  else
    run "sudo systemctl start containerd || sudo systemctl restart containerd || true"
    run "sudo systemctl start kubelet || sudo systemctl restart kubelet || true"
  fi

  step "(4/6) Wait nodes Ready (optional)"
  if [[ "$WAIT_READY" -eq 1 ]]; then
    for n in "${WORKER_HOSTS[@]}"; do wait_node_ready "$n"; done
    wait_node_ready "$MASTER_HOST"
  else
    log "  -> skip wait ready"
  fi

  step "(5/6) Uncordon nodes"
  for n in "${WORKER_HOSTS[@]}"; do run "$KCTL uncordon $n || true"; done
  run "$KCTL uncordon $MASTER_HOST || true"

  step "(6/6) Post checks and optional rollout"
  run "$KCTL get nodes -o wide || true"
  run "$KCTL get pods -A -o wide || true"
  if [[ -n "$ROLL_NS" && "$DO_ROLLOUT_RESTART" -eq 1 ]]; then
    rollout_restart_and_wait "$ROLL_NS"
  fi
}

confirm && main || { echo "Aborted"; exit 1; }
