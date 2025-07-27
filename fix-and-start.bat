@echo off
echo 🚀 CV Tailoring App - Complete Startup Guide
echo ============================================

echo.
echo 🔍 DIAGNOSIS: Why your app isn't running
echo   ❌ Frontend server stopped (was on port 3001)
echo   ❌ Backend server not running (should be on port 5000)
echo   ❌ ngrok needs both servers to work

echo.
echo 📋 SOLUTION: Start everything in correct order
echo.

echo 🎯 STEP 1: Start the application servers
echo    Running: npm run dev
echo    This starts BOTH frontend (Vite) and backend (Node.js)
echo.

start "CV App Servers" cmd /k "npm run dev"

echo    ⏳ Waiting for servers to start...
timeout /t 10 /nobreak

echo.
echo 🔧 STEP 2: Check if servers are running
echo    Checking ports...

netstat -ano | findstr :3001 >nul
if %ERRORLEVEL% equ 0 (
    echo    ✅ Frontend running on port 3001
) else (
    echo    ❌ Frontend not detected on port 3001
)

netstat -ano | findstr :5000 >nul
if %ERRORLEVEL% equ 0 (
    echo    ✅ Backend running on port 5000
) else (
    echo    ❌ Backend not detected on port 5000
    echo    💡 You may need to start it manually: node server.js
)

echo.
echo 🌐 STEP 3: ngrok Setup (once servers are running)
echo    1. First get ngrok authtoken from: https://dashboard.ngrok.com/signup
echo    2. Configure: npx ngrok config add-authtoken YOUR_TOKEN
echo    3. Start tunnel: npx ngrok http 3001

echo.
echo 📱 STEP 4: Access your app
echo    Local Frontend:  http://localhost:3001
echo    Local Backend:   http://localhost:5000
echo    Public (ngrok):  https://your-id.ngrok.io

echo.
echo 🆘 TROUBLESHOOTING:
echo    • If servers don't start: Check for port conflicts
echo    • If ngrok fails: Make sure you have authtoken configured
echo    • If backend fails: Check .env file has API keys

echo.
echo 💡 Quick fixes:
echo    • Kill port conflicts: taskkill /f /im node.exe
echo    • Restart: npm run dev
echo    • Manual backend: node server.js

echo.
pause
