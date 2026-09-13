# LOGIN CREDENTIALS - Surade.co.id

## 🔐 User Accounts

Semua user sekarang menggunakan password yang sama: **`password123`**

### User Accounts:

**1. Regular User:**
- Email: `user@example.com`
- Password: `password123`
- Role: `user`

**2. Test User:**
- Email: `test@surade.co.id`
- Password: `password123`
- Role: `user`

**3. Admin:**
- Email: `admin@surade.co.id`
- Password: `password123`
- Role: `admin`

---

## 📝 Cara Login

1. Buka website: `http://localhost:5173`
2. Klik tombol "Login" di navbar
3. Masukkan email dan password dari list di atas
4. Klik "Login"

---

## 🔧 Reset Password (Jika Lupa)

Jika password tidak work, jalankan seeder untuk reset:

```bash
cd backend
php artisan db:seed --class=ResetUserPasswordSeeder
```

Semua user akan di-reset ke password: **`password123`**

---

## ✅ Testing Login

Test login via tinker:

```bash
cd backend
php artisan tinker --execute="$credentials = ['email' => 'user@example.com', 'password' => 'password123']; if (Auth::attempt($credentials)) { echo 'Login SUCCESS!' . PHP_EOL; } else { echo 'Login FAILED!' . PHP_EOL; }"
```

Expected output: `Login SUCCESS!`

---

## 🚨 Error 422 (Unprocessable Content)

Jika masih error 422, kemungkinan:

1. **Frontend cache** - Clear browser cache (`Ctrl + Shift + R`)
2. **Validation error** - Check Laravel log:
   ```bash
   cd backend
   tail -f storage/logs/laravel.log
   ```
3. **CORS issue** - Make sure frontend bisa akses backend
4. **Token issue** - Clear localStorage di browser:
   ```javascript
   localStorage.clear();
   sessionStorage.clear();
   ```

---

**Last Updated:** September 4, 2026  
**Default Password:** `password123` (semua user)
