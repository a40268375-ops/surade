@echo off
echo ========================================================
echo     MENJALANKAN SURADE.COM (BACKEND + FRONTEND)
echo ========================================================
echo.

cd /d "%~dp0backend"
echo [1/3] Menjalankan Backend Laravel (Port 8000)...
start "Backend Surade (Laravel)" cmd /k "php artisan serve --host=127.0.0.1 --port=8000"

cd /d "%~dp0frontend"
echo [2/3] Menjalankan Frontend React Vite (Port 5173)...
start "Frontend Surade (Vite)" cmd /k "npm run dev"

echo [3/3] Membuka Website di Browser...
timeout /t 3 /nobreak >nul
start http://surade.com

echo.
echo ========================================================
echo   Backend & Frontend berhasil dijalankan!
echo   - URL:   http://surade.com
echo   - Admin: admin@surade.com / admin123
echo   - User:  user@surade.com  / password123
echo ========================================================
pause
