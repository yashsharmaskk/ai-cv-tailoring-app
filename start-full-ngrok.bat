@echo off
echo 🚀 Starting CV Tailoring App with ngrok (Full Setup)
echo ================================================

echo.
echo 📋 This will start:
echo    1. Your application (frontend on 3000, backend on 5000)
echo    2. ngrok tunnel for frontend (port 3000)
echo    3. ngrok tunnel for backend (port 5000)

echo.
echo 🎯 Step 1: Starting your application...
start "CV App" cmd /k "npm run dev"

echo    ⏳ Waiting for app to start...
timeout /t 10 /nobreak

echo.
echo 🌐 Step 2: Starting ngrok tunnel for frontend...
start "ngrok-frontend" cmd /k "npx ngrok http 3000"

echo.
echo 🌐 Step 3: Starting ngrok tunnel for backend...
start "ngrok-backend" cmd /k "npx ngrok http 5000"

echo.
echo ✅ Setup complete! Check the ngrok windows for your public URLs:
echo.
echo 📱 Frontend ngrok window: Copy the https://...ngrok.io URL
echo 🔧 Backend ngrok window: Copy the https://...ngrok.io URL
echo.
echo 💡 To make it work properly:
echo    1. Note both ngrok URLs
echo    2. Update your frontend to use the backend ngrok URL
echo    3. Or use the simpler solution below...

echo.
echo 🎯 SIMPLER SOLUTION: Use frontend ngrok only
echo    The backend will be accessible at your-ngrok-url/api/*
echo    (This requires backend to serve static files)

pause
