@echo off
echo ========================================
echo  Kommunalka - LOCAL DEV MODE
echo ========================================

echo [1/3] Starting MongoDB service...
net start MongoDB 2>nul || echo MongoDB already running

echo [2/3] Starting FastAPI (localhost:8000)...
start "FastAPI local" cmd /k "call C:\dev\kommunalka-venv\Scripts\activate && cd /d c:\PROJECTS\pwa-kommunalka\backend && uvicorn app.main:app --reload --host 127.0.0.1 --port 8000"

timeout /t 2 /nobreak >nul

echo [3/3] Starting Vite with local API...
start "Vite local" cmd /k "cd /d c:\PROJECTS\pwa-kommunalka\frontend && npm run dev:local"

echo.
echo Done! Open: http://localhost:5173/my.space/
echo API:        http://localhost:8000/health
echo.
pause
