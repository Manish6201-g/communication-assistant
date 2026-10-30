#!/usr/bin/env bash
# Screen-Based AI Communication Assistant Launch Script

set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd "$DIR"

echo "=========================================================="
echo " Starting Screen-Based AI Communication Assistant"
echo "=========================================================="

# 1. Start FastAPI Backend
echo "[1/2] Launching Backend on http://localhost:8000..."
./backend/venv/bin/uvicorn app.main:app --app-dir backend --host 0.0.0.0 --port 8000 --reload &
BACKEND_PID=$!

# 2. Start Vite React Frontend
echo "[2/2] Launching Frontend on http://localhost:3000..."
cd frontend
npm run dev &
FRONTEND_PID=$!

echo ""
echo "🚀 Application is running!"
echo "👉 Frontend Interface: http://localhost:3000"
echo "👉 Backend API & Docs: http://localhost:8000/docs"
echo "👉 WebSocket Endpoint: ws://localhost:8000/ws/stream"
echo ""
echo "Press Ctrl+C to stop both services."

trap "kill $BACKEND_PID $FRONTEND_PID; exit" INT TERM EXIT
wait
