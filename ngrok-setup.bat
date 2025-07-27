@echo off
echo 🔐 ngrok Authentication Setup Helper
echo.

echo 📋 STEP 1: Create ngrok Account (if you haven't already)
echo    👉 Open: https://dashboard.ngrok.com/signup
echo    ✅ It's FREE - no credit card required
echo.
pause

echo 📋 STEP 2: Get Your Auth Token
echo    👉 Login and go to: https://dashboard.ngrok.com/get-started/your-authtoken
echo    📋 Copy the authtoken (looks like: 2abc123def456...)
echo.
pause

echo 📋 STEP 3: Enter Your Auth Token
set /p AUTHTOKEN="🔑 Paste your authtoken here: "

if "%AUTHTOKEN%"=="" (
    echo ❌ No authtoken entered. Please try again.
    pause
    exit /b 1
)

echo.
echo 🔧 Configuring ngrok with your authtoken...
npx ngrok config add-authtoken %AUTHTOKEN%

if %ERRORLEVEL% neq 0 (
    echo ❌ Failed to configure authtoken. Please check and try again.
    pause
    exit /b 1
)

echo.
echo ✅ SUCCESS! ngrok is now configured!
echo.
echo 🚀 Testing ngrok connection...
echo 💡 This will start a tunnel to your CV app (make sure it's running on port 3001)
echo.
echo Press any key to start ngrok tunnel...
pause

echo 🌐 Starting ngrok tunnel for your CV Tailoring App...
npx ngrok http 3001

echo.
echo 🎉 If you see a public URL above, your app is now accessible worldwide!
echo 📱 Share the https://... URL with anyone to demo your CV Tailoring App!
echo.
pause
