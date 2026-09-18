@echo off
echo ========================================================
echo Starting BookSaathi (Indian Professional Booking Platform)
echo ========================================================
echo.
echo [1/2] Launching Backend REST API (port 5000)...
start "BookSaathi Backend API" cmd /k "cd /d %~dp0backend && npm run dev"

timeout /t 2 /nobreak >nul

echo [2/2] Launching Frontend Web App (port 3000)...
start "BookSaathi Frontend Web" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo ========================================================
echo  BookSaathi is running!
echo  - Frontend:   http://localhost:3000
echo  - Demo Link:  http://localhost:3000/book/dr-rajesh
echo  - Dashboard:  http://localhost:3000/dashboard
echo  - Backend:   http://localhost:5000/api/health
echo ========================================================
