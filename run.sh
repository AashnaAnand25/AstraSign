#!/usr/bin/env bash
# ──────────────────────────────────────────────────────────────────────────────
#  AstraSign — One-Click Launch Script
#  Usage:  ./run.sh          (launches frontend + backend)
#          ./run.sh --front  (frontend only)
#          ./run.sh --back   (backend only)
# ──────────────────────────────────────────────────────────────────────────────
set -e

FRONTEND_PORT=8080
BACKEND_PORT=8000
ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"

# ── Colors ────────────────────────────────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; CYAN='\033[0;36m'; YELLOW='\033[1;33m'
BOLD='\033[1m'; NC='\033[0m'

info()  { echo -e "${CYAN}[AstraSign]${NC} $1"; }
ok()    { echo -e "${GREEN}[✓]${NC} $1"; }
warn()  { echo -e "${YELLOW}[!]${NC} $1"; }
err()   { echo -e "${RED}[✗]${NC} $1"; }

# ── Kill port if occupied ─────────────────────────────────────────────────────
kill_port() {
  local port=$1
  local pids
  pids=$(lsof -ti :"$port" 2>/dev/null || true)
  if [ -n "$pids" ]; then
    warn "Port $port is in use — killing process(es): $pids"
    echo "$pids" | xargs kill -9 2>/dev/null || true
    sleep 1
    ok "Port $port freed"
  fi
}

# ── Cleanup on exit ───────────────────────────────────────────────────────────
cleanup() {
  info "Shutting down..."
  [ -n "$FRONTEND_PID" ] && kill "$FRONTEND_PID" 2>/dev/null && ok "Frontend stopped"
  [ -n "$BACKEND_PID" ]  && kill "$BACKEND_PID"  2>/dev/null && ok "Backend stopped"
  exit 0
}
trap cleanup SIGINT SIGTERM

# ── Dependency checks ─────────────────────────────────────────────────────────
check_deps() {
  if ! command -v node &>/dev/null; then
    err "Node.js not found. Install it from https://nodejs.org"
    exit 1
  fi
  ok "Node $(node -v) detected"

  if ! command -v npm &>/dev/null; then
    err "npm not found."
    exit 1
  fi
  ok "npm $(npm -v) detected"
}

# ── Frontend ──────────────────────────────────────────────────────────────────
start_frontend() {
  info "Setting up frontend..."
  cd "$ROOT_DIR"

  # Install deps if node_modules missing or package.json changed
  if [ ! -d "node_modules" ] || [ "package.json" -nt "node_modules/.package-lock.json" ]; then
    info "Installing npm dependencies..."
    npm install --legacy-peer-deps
    ok "Dependencies installed"
  else
    ok "Dependencies up to date"
  fi

  kill_port "$FRONTEND_PORT"

  info "Starting frontend on port $FRONTEND_PORT..."
  npm run dev &
  FRONTEND_PID=$!
  ok "Frontend starting (PID: $FRONTEND_PID)"
}

# ── Backend ───────────────────────────────────────────────────────────────────
start_backend() {
  local backend_dir="$ROOT_DIR/signbridge/backend"

  if [ ! -f "$backend_dir/main.py" ]; then
    warn "Backend not found at $backend_dir — skipping"
    return
  fi

  info "Setting up backend..."
  cd "$backend_dir"

  # Check for Python
  local py_cmd=""
  if command -v python3 &>/dev/null; then
    py_cmd="python3"
  elif command -v python &>/dev/null; then
    py_cmd="python"
  else
    warn "Python not found — skipping backend"
    return
  fi
  ok "$($py_cmd --version) detected"

  # Create venv if needed
  if [ ! -d "venv" ]; then
    info "Creating Python virtual environment..."
    $py_cmd -m venv venv
    ok "Virtual environment created"
  fi

  # Activate venv
  source venv/bin/activate

  # Install Python deps
  if [ -f "requirements.txt" ]; then
    info "Installing Python dependencies..."
    pip install -q -r requirements.txt
    ok "Python dependencies installed"
  fi

  # Create .env from example if missing
  if [ ! -f ".env" ] && [ -f ".env.example" ]; then
    cp .env.example .env
    warn "Created .env from .env.example — fill in your API keys!"
  fi

  kill_port "$BACKEND_PORT"

  info "Starting backend on port $BACKEND_PORT..."
  $py_cmd -m uvicorn main:app --host 0.0.0.0 --port "$BACKEND_PORT" --reload &
  BACKEND_PID=$!
  ok "Backend starting (PID: $BACKEND_PID)"

  cd "$ROOT_DIR"
}

# ── Main ──────────────────────────────────────────────────────────────────────
echo ""
echo -e "${BOLD}${CYAN}"
echo "    ╔═══════════════════════════════════════╗"
echo "    ║         🤟  AstraSign  🤟             ║"
echo "    ║      ASL Translation System           ║"
echo "    ╚═══════════════════════════════════════╝"
echo -e "${NC}"

check_deps

RUN_FRONT=true
RUN_BACK=true

case "${1:-}" in
  --front) RUN_BACK=false ;;
  --back)  RUN_FRONT=false ;;
esac

[ "$RUN_BACK"  = true ] && start_backend
[ "$RUN_FRONT" = true ] && start_frontend

echo ""
echo -e "${GREEN}${BOLD}══════════════════════════════════════════${NC}"
[ "$RUN_FRONT" = true ] && echo -e "${GREEN}  🌐 Frontend:  ${BOLD}http://localhost:${FRONTEND_PORT}${NC}"
[ "$RUN_BACK"  = true ] && [ -n "$BACKEND_PID" ] && echo -e "${GREEN}  🔧 Backend:   ${BOLD}http://localhost:${BACKEND_PORT}${NC}"
echo -e "${GREEN}${BOLD}══════════════════════════════════════════${NC}"
echo -e "${CYAN}  Press Ctrl+C to stop all services${NC}"
echo ""

wait
