# 🔐 SISTEM VERIFIKASI OTP VIA EMAIL & RESET PASSWORD

## ✅ STATUS IMPLEMENTASI

✅ **BACKEND LARAVEL:**
- ✅ Migration `otp_verifications` table
- ✅ Model `OtpVerification` 
- ✅ AuthController dengan OTP endpoints
- ✅ Mail class `OtpMail`
- ✅ Email template `emails/otp.blade.php`
- ✅ API Routes untuk OTP

✅ **FRONTEND REACT:**
- ✅ Register.jsx - Form pendaftaran
- ✅ VerifyOtp.jsx - Verifikasi OTP
- ✅ ForgotPassword.jsx - Reset password dengan OTP
- ✅ Login.jsx - Updated untuk handle email verification
- ✅ Routes untuk semua halaman OTP

## 🚀 CARA MENJALANKAN

### 1. **Setup Database & Backend**
```bash
cd backend

# Install dependencies jika belum
composer install

# Jalankan migration
php artisan migrate

# Jalankan server Laravel
php artisan serve --host=127.0.0.1 --port=8000
```

### 2. **Setup Frontend**
```bash
cd frontend

# Install dependencies jika belum
npm install

# Jalankan development server
npm run dev
```

Frontend akan berjalan di: http://localhost:5173 atau http://localhost:5174

### 3. **Konfigurasi Email (Opsional)**
Saat ini menggunakan `MAIL_MAILER=log` untuk testing. Email OTP akan tersimpan di:
```
backend/storage/logs/laravel.log
```

Untuk setup email production, lihat file: `backend/.env.email-setup`

## 📊 DATABASE STRUCTURE

### Table: `users`
- ✅ Sudah ada kolom `email_verified_at`
- ✅ Password di-hash otomatis

### Table: `otp_verifications` (BARU)
```sql
- id (Primary Key)
- user_id (Foreign Key, nullable)
- email (String)
- otp_code (String, 6 digits)
- purpose (Enum: 'register', 'reset_password')
- expires_at (Timestamp)
- verified_at (Timestamp, nullable)
- created_at, updated_at
```

## 🔗 API ENDPOINTS

### **Public Endpoints (Tanpa Auth):**
- `POST /api/register` - Daftar + kirim OTP
- `POST /api/login` - Login (redirect ke OTP jika email belum verified)
- `POST /api/verify-otp` - Verifikasi OTP registrasi
- `POST /api/resend-otp` - Kirim ulang OTP registrasi
- `POST /api/forgot-password` - Kirim OTP reset password
- `POST /api/verify-reset-otp` - Verifikasi OTP reset
- `POST /api/resend-reset-otp` - Kirim ulang OTP reset
- `POST /api/reset-password` - Set password baru

### **Protected Endpoints:**
- `POST /api/logout` - Logout
- `GET /api/profile` - Get user profile

## 🔄 ALUR LENGKAP

### **ALUR REGISTER:**
```
1. User isi form Register.jsx
   ↓
2. POST /api/register
   ↓
3. User dibuat di database (email_verified_at = null)
   ↓
4. OTP 6 digit dibuat & dikirim via email
   ↓
5. Redirect ke VerifyOtp.jsx
   ↓
6. User input OTP & submit
   ↓
7. POST /api/verify-otp
   ↓
8. OTP diverifikasi, email_verified_at di-set
   ↓
9. Auto-login & redirect ke Dashboard
```

### **ALUR RESET PASSWORD:**
```
1. User klik "Lupa kata sandi?" di Login.jsx
   ↓
2. Redirect ke ForgotPassword.jsx
   ↓
3. User input email & submit
   ↓
4. POST /api/forgot-password
   ↓
5. OTP dikirim ke email user
   ↓
6. User input OTP & submit
   ↓
7. POST /api/verify-reset-otp
   ↓
8. Jika valid, bisa input password baru
   ↓
9. POST /api/reset-password
   ↓
10. Password diupdate, redirect ke Login
```

### **ALUR LOGIN:**
```
1. User input email/password di Login.jsx
   ↓
2. POST /api/login
   ↓
3a. Jika email sudah verified: Login success → Dashboard
3b. Jika email belum verified: Kirim OTP baru → VerifyOtp.jsx
```

## 🛡️ KEAMANAN & VALIDASI

### **OTP Security:**
- ✅ OTP 6 digit random (100000-999999)
- ✅ Expires dalam 5 menit
- ✅ OTP lama otomatis dihapus saat buat OTP baru
- ✅ OTP hanya bisa dipakai sekali
- ✅ Purpose terpisah: 'register' vs 'reset_password'

### **Password Security:**
- ✅ Minimum 6 karakter
- ✅ Hash menggunakan bcrypt
- ✅ Password confirmation validation

### **Email Security:**
- ✅ Email format validation
- ✅ Unique email constraint
- ✅ Case insensitive email storage

## 🧪 TESTING

### **Test Manual:**

**1. Test Register:**
```
1. Buka http://localhost:5174/register
2. Isi form & submit
3. Cek email OTP di: backend/storage/logs/laravel.log
4. Input OTP di halaman verifikasi
5. Harus auto-login ke dashboard
```

**2. Test Login Email Unverified:**
```
1. Register user baru tapi jangan verifikasi OTP
2. Coba login dengan email/password tersebut
3. Harus redirect ke halaman OTP verification
```

**3. Test Reset Password:**
```
1. Buka http://localhost:5174/forgot-password
2. Input email yang sudah terdaftar
3. Cek OTP di log file
4. Input OTP & set password baru
5. Login dengan password baru
```

### **Test via API:**
```bash
# Test register
curl -X POST http://127.0.0.1:8000/api/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123","password_confirmation":"password123"}'

# Test verify OTP (ganti OTP dengan yang ada di log)
curl -X POST http://127.0.0.1:8000/api/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","otp_code":"123456"}'
```

## 📁 FILES YANG DIBUAT/DIMODIFIKASI

### **Backend:**
```
✅ database/migrations/2026_08_21_013125_create_otp_verifications_table.php
✅ app/Models/OtpVerification.php
✅ app/Mail/OtpMail.php
✅ app/Http/Controllers/AuthController.php (updated)
✅ resources/views/emails/otp.blade.php
✅ routes/api.php (updated)
```

### **Frontend:**
```
✅ src/pages/Register.jsx (new)
✅ src/pages/VerifyOtp.jsx (new)
✅ src/pages/ForgotPassword.jsx (updated)
✅ src/pages/Login.jsx (updated)
✅ src/pages/Login.css (updated with OTP styles)
✅ src/router/index.jsx (updated)
✅ src/context/AuthContext.jsx (updated)
✅ src/utils/api.js (updated)
```

## 🎯 FITUR YANG SUDAH BERFUNGSI

✅ **Register dengan OTP verification**
✅ **Login dengan cek email verification**  
✅ **Forgot password dengan OTP**
✅ **Resend OTP (register & reset password)**
✅ **OTP timer countdown (5 menit)**
✅ **Email template yang responsive**
✅ **Auto-login setelah verifikasi**
✅ **Validasi form lengkap**
✅ **Error handling**
✅ **CORS configuration**
✅ **Token authentication**

## 🚨 CATATAN PENTING

1. **Email Configuration:** Saat ini menggunakan log driver untuk testing. Untuk production, setup SMTP di `.env`

2. **Database:** Migration sudah berjalan, tabel `otp_verifications` sudah dibuat

3. **Frontend Port:** Frontend berjalan di port 5174 (bukan 5173 karena port conflict)

4. **API Base URL:** Frontend mengakses backend di `http://127.0.0.1:8000/api`

5. **Token Storage:** Token disimpan di `localStorage` dengan key `'token'`

6. **OTP Log:** OTP dapat dilihat di `backend/storage/logs/laravel.log`

## ✨ SISTEM SUDAH SIAP DIGUNAKAN!

Buka http://localhost:5174 dan test alur:
- Register → Verify OTP → Dashboard ✅
- Login → Dashboard (atau OTP jika email belum verified) ✅  
- Forgot Password → Verify OTP → Reset → Login ✅