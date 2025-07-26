@echo off
echo 🛑 Stopping CV Tailoring Application...

echo.
echo 📦 Stopping Docker containers...
docker-compose down

if %ERRORLEVEL% neq 0 (
    echo ⚠️ Some containers may not have stopped properly
)

echo.
echo 🧹 Cleaning up unused Docker resources...
docker system prune -f

echo.
echo ✅ Application stopped and cleaned up!
echo 💡 To start again, run: deploy.bat

pause
