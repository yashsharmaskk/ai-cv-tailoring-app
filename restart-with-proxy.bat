@echo off
echo 🔄 Restarting CV Tailoring App with ngrok proxy fix...

echo.
echo 📋 The Fix:
echo   ✅ Added Vite proxy configuration
echo   ✅ Updated API calls to use relative URLs
echo   ✅ Frontend and backend now work through same ngrok tunnel

echo.
echo 🛑 Step 1: Stop current servers (if running)
echo    Press Ctrl+C in any terminals running npm run dev

echo.
echo 🚀 Step 2: Restart the application
echo    Run: npm run dev

echo.
echo 🌐 Step 3: ngrok will now work perfectly!
echo    Your ngrok URL will work for both frontend and backend
echo    PDF parsing and AI features will work through ngrok

echo.
echo 💡 What changed:
echo    • Vite now proxies /extract-text to backend
echo    • Vite now proxies /parse-cv to backend  
echo    • Vite now proxies /ai/tailor-cv to backend
echo    • All API calls use relative URLs

echo.
echo 🎯 Ready to restart? 
echo    1. Stop current servers (Ctrl+C)
echo    2. Run: npm run dev
echo    3. Start ngrok: npx ngrok http 3000
echo    4. PDF parsing will work through ngrok! 🎉

pause
