@echo off
echo ========================================
echo   CLEAR ALL CACHE - SURADE.COM
echo ========================================
echo.

echo [1/4] Clearing Laravel Cache...
cd backend
call php artisan cache:clear
call php artisan config:clear
call php artisan view:clear
call php artisan route:clear
echo ✓ Laravel cache cleared!
echo.

echo [2/4] Clearing Frontend Cache...
cd ..\frontend
if exist "node_modules\.vite" (
    rmdir /s /q "node_modules\.vite"
    echo ✓ Vite cache cleared!
) else (
    echo ✓ No vite cache found
)
echo.

echo [3/4] Build Instructions:
echo ✓ Backend ready! Run: php artisan serve
echo ✓ Frontend ready! Run: npm run dev
echo.

echo [4/4] Browser Instructions:
echo → Open browser and press: CTRL + SHIFT + R
echo → Or press F12, right-click refresh, select "Empty Cache and Hard Reload"
echo.

echo ========================================
echo   ✓ ALL CACHE CLEARED SUCCESSFULLY!
echo ========================================
echo.
echo Next steps:
echo 1. Start backend:  cd backend ^&^& php artisan serve
echo 2. Start frontend: cd frontend ^&^& npm run dev
echo 3. Hard refresh browser: CTRL + SHIFT + R
echo.
pause
