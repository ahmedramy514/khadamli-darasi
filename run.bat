@echo off
REM ==========================================
REM  خدملي دراسي - Khadamli Darasi Startup
REM ==========================================
echo.
echo 🎓 خدملي دراسي - تطبيق تعليمي متكامل
echo =====================================
echo.

REM التحقق من Node.js
echo ⏳ التحقق من Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js غير مثبت!
    echo 🔗 حمّله من https://nodejs.org/
    pause
    exit /b 1
)
echo ✅ Node.js مثبت بنجاح

echo.
echo ⏳ فتح 3 نوافذ للتشغيل...
echo.

REM فتح نافذة Backend
echo 🚀 شغّل Backend على المنفذ 5000...
start cmd /k "cd /d "%cd%\backend" && npm run dev"

REM انتظر قليلاً
timeout /t 3 /nobreak

REM فتح نافذة Frontend
echo 🚀 شغّل Frontend على المنفذ 3000...
start cmd /k "cd /d "%cd%\frontend" && npm start"

echo.
echo ✅ تم تشغيل المشروع بنجاح!
echo.
echo 🌐 Frontend: http://localhost:3000
echo 🔌 Backend: http://localhost:5000
echo.
echo 📝 اترك هذه النافذة مفتوحة
echo.
pause
