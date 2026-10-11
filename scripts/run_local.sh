#!/usr/bin/env bash
set -e

echo "=== Starting Urban Flood Risk Prediction System ==="

# Check virtual environment
if [ ! -d ".venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv .venv
    .venv/bin/pip install --upgrade pip
    .venv/bin/pip install -r ml/requirements.txt
    .venv/bin/pip install -r backend/requirements.txt
fi

# Ensure data and models exist
if [ ! -f "ml/artifacts/flood_risk_pipeline.joblib" ]; then
    echo "Generating pilot dataset and training models..."
    DYLD_LIBRARY_PATH=/opt/homebrew/opt/libomp/lib PYTHONPATH=. .venv/bin/python ml/src/data/download.py
    DYLD_LIBRARY_PATH=/opt/homebrew/opt/libomp/lib PYTHONPATH=. .venv/bin/python ml/src/models/train.py
fi

# Start backend in background
echo "Starting FastAPI backend on http://127.0.0.1:8000..."
DYLD_LIBRARY_PATH=/opt/homebrew/opt/libomp/lib PYTHONPATH=. .venv/bin/uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 &
BACKEND_PID=$!

# Trap signals to clean up background processes
trap "kill $BACKEND_PID 2>/dev/null || true; exit" SIGINT SIGTERM EXIT

# Start frontend
echo "Starting Vite frontend on http://127.0.0.1:5173..."
cd frontend
npm run dev

# Wait on backend if frontend stops
wait $BACKEND_PID
