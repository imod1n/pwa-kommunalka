@echo off
echo ========================================
echo  Kommunalka - LOCAL DEV MODE
echo ========================================

echo [1/3] Starting MongoDB...
docker-compose up -d
if %errorlevel% neq 0 (
    echo ERROR: Docker not running or docker-compose failed
    pause
    exit /b 1
)

echo [2/3] Starting FastAPI (localhost:8000)...
start "FastAPI local" cmd /k "cd /d c:\PROJECTS\pwa-kommunalka\backend && call .venv\Scripts\activate && uvicorn app.main:app --reload --host 127.0.0.1 --port 8000"

timeout /t 2 /nobreak >nul

echo [3/3] Starting Vite with local API...
start "Vite local" cmd /k "cd /d c:\PROJECTS\pwa-kommunalka\frontend && npm run dev:local"

echo.
echo Done! Open: http://localhost:5173/pwa-kommunalka/
echo API:        http://localhost:8000/health
echo.
pause
