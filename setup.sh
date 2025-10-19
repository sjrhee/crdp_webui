#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$ROOT_DIR/backend"
FRONTEND_DIR="$ROOT_DIR/frontend"
BACKEND_VENV="$BACKEND_DIR/.venv"
NVM_DIR="$HOME/.nvm"

log() { echo -e "\033[1;32m[setup]\033[0m $*"; }
warn() { echo -e "\033[1;33m[warn ]\033[0m $*"; }
err() { echo -e "\033[1;31m[error]\033[0m $*"; }

require_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    err "필수 명령이 없습니다: $1"; return 1
  fi
}

gen_secret() {
  python3 - <<'PY'
import secrets
print(secrets.token_urlsafe(48))
PY
}

setup_python() {
  log "Python/venv 준비 중"
  require_cmd python3 || { err "Python3가 필요합니다"; exit 1; }
  if [ ! -d "$BACKEND_DIR" ]; then
    err "백엔드 디렉터리가 없습니다: $BACKEND_DIR"; exit 1;
  fi
  if [ ! -d "$BACKEND_VENV" ]; then
    log "가상환경 생성: $BACKEND_VENV"
    python3 -m venv "$BACKEND_VENV"
  else
    log "가상환경 존재: $BACKEND_VENV"
  fi
  "$BACKEND_VENV/bin/pip" install -U pip >/dev/null
  log "백엔드 의존성 설치"
  "$BACKEND_VENV/bin/pip" install -r "$BACKEND_DIR/requirements.txt"
}

setup_backend_env() {
  log "backend/.env 준비 중"
  local env_file="$BACKEND_DIR/.env"
  local example_file="$BACKEND_DIR/.env.example"
  if [ ! -f "$env_file" ]; then
    if [ -f "$example_file" ]; then
      cp "$example_file" "$env_file"
      log ".env 생성됨"
    else
      warn ".env.example이 없어 기본 값을 사용해 .env 생성"
  cat > "$env_file" <<EOF
APP_NAME=FastAPI Starter
DEBUG=true
SECRET_KEY=change_me_super_secret
ACCESS_TOKEN_EXPIRE_MINUTES=60
ALGORITHM=HS256
CORS_ORIGINS=["http://localhost:5173","http://127.0.0.1:5173"]
EOF
    fi
  else
    log "기존 backend/.env 사용"
  fi

  # CORS_ORIGINS가 콤마 문자열이면 JSON 배열로 마이그레이션
  if grep -qE '^CORS_ORIGINS="?[^\[][^\n]*,.*"?$' "$env_file"; then
    raw=$(grep '^CORS_ORIGINS=' "$env_file" | sed 's/^CORS_ORIGINS=//')
    raw=${raw%\"}; raw=${raw#\"}
    json='['
    IFS=',' read -ra parts <<< "$raw"
    for i in "${!parts[@]}"; do
      v="${parts[$i]}"; v="${v//\"/}"
      v="$(echo "$v" | xargs)"
      json+="\"$v\""
      if [ "$i" -lt $(( ${#parts[@]} - 1 )) ]; then json+=","; fi
    done
    json+=']'
    sed -i "s|^CORS_ORIGINS=.*$|CORS_ORIGINS=${json}|" "$env_file"
    log "CORS_ORIGINS를 JSON 배열로 변환"
  fi

  if grep -qE '^SECRET_KEY=change_me' "$env_file"; then
    local secret
    secret="$(gen_secret)"
    sed -i "s|^SECRET_KEY=.*$|SECRET_KEY=${secret}|" "$env_file"
    log "SECRET_KEY 자동 생성 완료"
  fi
}

load_nvm() {
  if [ -s "$NVM_DIR/nvm.sh" ]; then
    set +u
    . "$NVM_DIR/nvm.sh"
    set -u
  else
    return 1
  fi
}

setup_node() {
  log "Node.js(nvm) 준비 중"
  if ! load_nvm; then
    log "nvm 미설치: 설치 진행"
    curl -fsSL https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
    if ! load_nvm; then
      if [ -f "$HOME/.bashrc" ]; then . "$HOME/.bashrc" || true; fi
      load_nvm || { err "nvm 로드 실패"; exit 1; }
    fi
  fi
  set +u
  nvm install --lts >/dev/null
  nvm use --lts >/dev/null
  local NODE_VER NPM_VER
  NODE_VER=$(node -v)
  NPM_VER=$(npm -v)
  set -u
  log "Node: ${NODE_VER}, npm: ${NPM_VER}"
}

setup_frontend() {
  log "프론트엔드(Vite React TS) 준비 중"
  if [ ! -d "$FRONTEND_DIR" ]; then
    (cd "$ROOT_DIR" && npm create vite@latest frontend -- --template react-ts)
  else
    log "frontend 디렉터리 존재: 스캐폴드 생략"
  fi
  (cd "$FRONTEND_DIR" && npm i && npm i axios react-router-dom)

  if [ ! -f "$FRONTEND_DIR/.env" ]; then
    cat > "$FRONTEND_DIR/.env" <<EOF
VITE_API_BASE_URL=http://localhost:8000
EOF
    log "frontend/.env 생성"
  else
    log "기존 frontend/.env 사용"
  fi
}

quick_verify() {
  log "간단 검증: 백엔드 테스트 실행"
  (cd "$BACKEND_DIR" && "$BACKEND_VENV/bin/python" -m pytest -q) || {
    warn "테스트 실패(무시 가능). 백엔드 실행으로 직접 확인하세요."
  }
}

main() {
  log "프로젝트 루트: $ROOT_DIR"
  setup_python
  setup_backend_env
  setup_node
  setup_frontend
  quick_verify
  cat <<'MSG'

완료! 다음으로 시도해 보세요:

- 백엔드 개발 서버 실행:
  backend/.venv/bin/uvicorn app.main:app --reload --port 8000

- 프론트엔드 개발 서버 실행:
  cd frontend && npm run dev

Swagger UI: http://localhost:8000/docs
프론트 기본 API 베이스: http://localhost:8000

MSG
}

main "$@"
