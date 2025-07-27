@echo off
echo 🔍 Finding your ngrok public URL...
echo.

echo 📋 Method 1: Check ngrok web interface
echo    Open: http://127.0.0.1:4040
echo    Look for "Tunnels" section

echo.
echo 📋 Method 2: Check ngrok API
curl -s http://127.0.0.1:4040/api/tunnels | findstr "public_url"

echo.
echo 📋 Method 3: Manual check
echo    Your ngrok terminal should show:
echo    "Forwarding    https://[random].ngrok.io -> http://localhost:3000"

echo.
echo 🌐 Once you find the https://...ngrok.io URL:
echo    ✅ Copy it
echo    ✅ Open it in browser 
echo    ✅ Share with anyone!
echo    ✅ Your CV Tailoring App is now public!

pause
