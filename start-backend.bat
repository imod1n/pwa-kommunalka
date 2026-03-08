@echo off
echo ========================================
echo  Kommunalka - BACKEND SERVER MODE
echo  (run this on the server PC from Z:\)
echo ========================================

echo [1/2] Starting MongoDB...
docker-compose up -d
if %errorlevel% neq 0 (
    echo ERROR: Docker not running or docker-compose failed
    pause
    exit /b 1
)

echo [2/2] Starting FastAPI (0.0.0.0:8000)...
cd /d %~dp0backend
call .venv\Scripts\activate
uvicorn app.main:app --reload --reload-dir %~dp0backend\app --host 0.0.0.0 --port 8000

pause
