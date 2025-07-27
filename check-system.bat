@echo off
echo 🔍 CV Tailoring App - System Check
echo ==================================

echo.
echo 📋 Checking current status...

echo.
echo 🔧 Node.js version:
node --version

echo.
echo 📦 npm version:
npm --version

echo.
echo 🌐 Checking ports:
echo    Port 3001 (Frontend):
netstat -ano | findstr :3001
if %ERRORLEVEL% neq 0 echo    ❌ Not running

echo    Port 5000 (Backend):
netstat -ano | findstr :5000
if %ERRORLEVEL% neq 0 echo    ❌ Not running

echo.
echo 📁 Checking files:
if exist "server.js" (
    echo    ✅ server.js found
) else (
    echo    ❌ server.js missing
)

if exist "src\App.tsx" (
    echo    ✅ React app found
) else (
    echo    ❌ React app missing
)

if exist ".env" (
    echo    ✅ .env file found
) else (
    echo    ⚠️ .env file missing - you'll need API keys
)

echo.
echo 🎯 RECOMMENDED ACTIONS:
echo.
echo    1. Start servers: npm run dev
echo    2. Wait for both servers to start
echo    3. Check http://localhost:3001 (frontend)
echo    4. Check http://localhost:5000 (backend)
echo    5. Set up ngrok if needed

echo.
pause
