@echo off
echo 🌐 Setting up ngrok for CV Tailoring Application...

echo.
echo 📋 Current Status:
echo   Frontend (Vite): http://localhost:3001
echo   Backend (Express): http://localhost:5000 (needs to be started)

echo.
echo 🚀 Starting ngrok tunnel for frontend...
start "ngrok-frontend" npx ngrok http 3001

echo.
echo 💡 Instructions:
echo 1. Your frontend is now accessible via ngrok
echo 2. Make sure backend server is running on port 5000
echo 3. Both servers need to be running for full functionality

echo.
echo 🔧 To start backend separately:
echo    node server.js

echo.
echo 📱 Once both servers are running, your app will be fully functional!

pause
