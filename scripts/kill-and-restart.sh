#!/usr/bin/env bash
# Kill all dev processes so you see latest code (no stacking, no old cache).
# Run from repo root: ./scripts/kill-and-restart.sh

set -e
echo "Killing processes on 5173, 8080, 8001..."

for port in 5173 8080 8001; do
  if command -v lsof >/dev/null 2>&1; then
    pid=$(lsof -ti :$port 2>/dev/null || true)
    if [ -n "$pid" ]; then
      kill -9 $pid 2>/dev/null || true
      echo "Killed port $port (PID $pid)"
    fi
  fi
done

echo "Done. Start frontend: npm run dev"
echo "This project uses port 8080 (see vite.config.ts). Open: http://localhost:8080"
echo "Then hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)"
echo "Backend: cd backend && python -m uvicorn main:app --reload --port 8001"
