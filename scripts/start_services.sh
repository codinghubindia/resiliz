# Start script that works both locally and remotely
pkill -f "uvicorn main:app" 2>/dev/null || true
pkill -f "vite" 2>/dev/null || true

# Start FastAPI backend on port 8000
cd ~/resiliz/backend
nohup ./venv/bin/uvicorn main:app --host 0.0.0.0 --port 8000 > backend.log 2>&1 &
BACKEND_PID=$!
echo "Backend started in background (PID: ${BACKEND_PID})."

# Start Vite frontend on port 5173
cd ~/resiliz/frontend
nohup npx vite --host 0.0.0.0 --port 5173 > frontend.log 2>&1 &
FRONTEND_PID=$!
echo "Frontend started in background (PID: ${FRONTEND_PID})."

sleep 3
echo "Checking backend /api/system-info..."
curl -s http://localhost:8000/api/system-info | head -c 250
echo ""
echo "ResiliZ services successfully launched on IBM LinuxONE s390x!"

echo "ResiliZ services successfully launched on IBM LinuxONE!"
