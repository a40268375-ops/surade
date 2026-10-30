@echo off
echo ========================================
echo   TEST EMAIL OTP - SURADE.COM
echo ========================================
echo.
echo Masukkan detail untuk test email:
echo.

set /p EMAIL="Email tujuan (Gmail): "
set /p NAME="Nama penerima: "

if "%EMAIL%"=="" (
    set EMAIL=test@gmail.com
)

if "%NAME%"=="" (
    set NAME=Test User
)

echo.
echo Mengirim email OTP ke: %EMAIL%
echo Nama penerima: %NAME%
echo Kode OTP: 123456
echo.
echo Tunggu sebentar...
echo.

cd backend
php artisan tinker --execute="Mail::to('%EMAIL%')->send(new \App\Mail\OtpMail('123456', '%NAME%', 'registration')); echo 'Email berhasil dikirim ke %EMAIL%!' . PHP_EOL;"

echo.
echo ========================================
echo   ✓ EMAIL SENT SUCCESSFULLY!
echo ========================================
echo.
echo Silakan cek inbox Gmail Anda:
echo → https://mail.google.com/mail/u/0/#inbox
echo.
echo Jika tidak ada di Inbox, cek folder:
echo → Spam / Junk
echo → Promotions
echo.
pause
