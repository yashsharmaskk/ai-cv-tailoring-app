@echo off
echo 🚀 Starting ngrok for CV Tailoring App
echo ======================================

echo.
echo 📋 Your app is running on:
echo    Frontend: http://localhost:3000
echo    Backend:  http://localhost:5000

echo.
echo 🌐 Starting ngrok tunnel for frontend (port 3000)...
echo.

npx ngrok http 3000

echo.
echo 🎉 ngrok tunnel started!
echo.
echo 💡 If you see an error about authentication:
echo    1. Go to: https://dashboard.ngrok.com/signup
echo    2. Get your authtoken from: https://dashboard.ngrok.com/get-started/your-authtoken
echo    3. Run: npx ngrok config add-authtoken YOUR_TOKEN
echo    4. Then run this script again

pause
