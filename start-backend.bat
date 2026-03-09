@echo off
echo ========================================
echo  Kommunalka - BACKEND SERVER MODE
echo  (run this on the server PC from Z:\)
echo ========================================

echo [1/2] Starting MongoDB service...
net start MongoDB 2>nul || echo MongoDB already running

echo [2/2] Starting FastAPI (0.0.0.0:8000)...
call C:\dev\kommunalka-venv\Scripts\activate
cd /d %~dp0backend
uvicorn app.main:app --reload --reload-dir %~dp0backend\app --host 0.0.0.0 --port 8000

pause
