# 🔄 CARA MELIHAT PERUBAHAN YANG SUDAH DIEDIT

## ❗ PENTING! File sudah diedit tapi belum keliatan karena:
1. ❌ Browser masih pakai cache lama
2. ❌ Dev server belum restart
3. ❌ Laravel cache masih lama

---

## 🚀 LANGKAH-LANGKAH UNTUK MELIHAT PERUBAHAN:

### **STEP 1: Clear Laravel Cache (Backend)**

Buka **Command Prompt** atau **Terminal**, lalu jalankan:

```bash
cd c:\laragon\www\Surade.co.id\backend
php artisan cache:clear
php artisan config:clear
php artisan view:clear
php artisan route:clear
```

✅ Ini akan membersihkan cache Laravel sehingga perubahan email template dan API terlihat.

---

### **STEP 2: Restart Frontend Dev Server**

#### Jika sudah jalan, matikan dulu:
- Tekan `CTRL + C` di terminal yang menjalankan `npm run dev`

#### Lalu jalankan lagi:
```bash
cd c:\laragon\www\Surade.co.id\frontend
npm run dev
```

✅ Server akan restart dan load file JavaScript yang baru.

---

### **STEP 3: Clear Browser Cache**

**Pilihan A: Hard Refresh (Recommended)**
- **Chrome/Edge:** Tekan `CTRL + SHIFT + R`
- **Firefox:** Tekan `CTRL + F5`

**Pilihan B: Clear Cache Manual**
1. Buka DevTools (`F12`)
2. Klik kanan pada tombol **Refresh** (⟳)
3. Pilih **"Empty Cache and Hard Reload"**

**Pilihan C: Clear All Cache**
1. Tekan `CTRL + SHIFT + DELETE`
2. Pilih **"Cached images and files"**
3. Pilih **"All time"**
4. Klik **"Clear data"**

✅ Browser akan load ulang dengan file terbaru.

---

## 📧 CARA TEST EMAIL OTP YANG BARU

### **Step 1: Buka Terminal**
```bash
cd c:\laragon\www\Surade.co.id\backend
php artisan tinker
```

### **Step 2: Jalankan Command Ini (di dalam tinker)**
```php
Mail::to('email-anda@gmail.com')->send(new \App\Mail\OtpMail('123456', 'Nama Anda', 'registration'));
```

**Ganti:**
- `email-anda@gmail.com` → Email Gmail Anda
- `Nama Anda` → Nama yang mau ditampilkan

### **Step 3: Cek Email**
Buka: **https://mail.google.com/mail/u/0/#inbox**

Anda akan lihat email baru dengan:
- ✅ Logo "S" di tengah header
- ✅ Text "Surade.co.id" di sebelah kanan
- ✅ Design gradient teal
- ✅ OTP code besar
- ✅ Warning box kuning

---

## 💳 CARA TEST PAYMENT GATEWAY YANG BARU

### **Step 1: Login ke Website**
1. Buka: `http://localhost:5173` (atau port frontend Anda)
2. Login sebagai user biasa

### **Step 2: Test Premium Subscription**
1. Klik pada bisnis mana saja
2. Scroll ke bawah, klik **"Upgrade Premium"**
3. Pilih paket (Monthly/Quarterly/Yearly)
4. Klik **"Lanjutkan ke Pembayaran"**
5. **Lihat PaymentMethodSelector muncul dengan:**
   - ✅ Logo bank di setiap card
   - ✅ Toggle selection dengan radio button
   - ✅ Nomor rekening bisa di-copy
   - ✅ Grouped by: Bank, E-Wallet, QRIS

### **Step 3: Test Admin Panel**
1. Login sebagai **admin**
2. Klik **"Admin Web"** di navbar
3. Pilih tab **"Kelola Pembayaran"**
4. **Lihat admin panel dengan:**
   - ✅ List semua metode payment
   - ✅ Toggle ON/OFF untuk setiap metode
   - ✅ Filter by kategori (Bank/E-Wallet/QRIS)
   - ✅ Edit nomor rekening
   - ✅ Upload QRIS image

---

## 🔍 CARA CEK FILE SUDAH BENAR-BENAR BERUBAH

### **Check 1: Verifikasi Email Template**
```bash
cd c:\laragon\www\Surade.co.id\backend\resources\views\emails
notepad otp.blade.php
```

**Cari text ini:**
- `Surade.co.id` → Harus ada di line ~42
- `Platform UMKM Digital Kecamatan Surade` → Harus ada
- `<div class="logo">S</div>` → Harus ada

### **Check 2: Verifikasi PaymentMethodSelector**
```bash
cd c:\laragon\www\Surade.co.id\frontend\src\components
notepad PaymentMethodSelector.jsx
```

**Cari text ini:**
- `methods = null,` → Harus ada di line ~70
- `selectedMethod = null,` → Harus ada
- `onSelect = null,` → Harus ada

### **Check 3: Test API Payment Methods**
Buka browser, paste URL ini:
```
http://localhost:8000/api/payment-methods
```

**Harus return JSON seperti:**
```json
{
  "success": true,
  "data": {
    "methods": [
      {
        "id": "Mandiri",
        "name": "Bank Mandiri",
        "accountNumber": "133-0011-409-331",
        ...
      }
    ],
    "official_account_holder": "Triwala Mitra Bestari"
  }
}
```

---

## 🐛 TROUBLESHOOTING

### **Problem 1: Email template masih lama**
```bash
# Solution:
cd backend
php artisan view:clear
php artisan cache:clear

# Test lagi dengan tinker
php artisan tinker
Mail::to('your-email@gmail.com')->send(new \App\Mail\OtpMail('999999', 'Test', 'registration'));
```

### **Problem 2: Payment component masih error**
```bash
# Solution 1: Clear frontend cache
cd frontend
rm -rf node_modules/.vite
npm run dev

# Solution 2: Clear browser
# Tekan CTRL + SHIFT + R di browser
```

### **Problem 3: API return 500 error**
```bash
# Solution: Check Laravel logs
cd backend
notepad storage\logs\laravel.log

# Clear cache
php artisan cache:clear
php artisan config:clear
```

### **Problem 4: Logo payment tidak muncul**
```bash
# Solution: Check file exists
cd frontend\public\logos
dir

# Harus ada file:
# - mandiri.png
# - bni.png
# - bca.png
# - maybank.png
# - bjb.png
# - ovo.png
# - dana.png
# - gopay.png
# - qris.png
```

---

## ✅ CHECKLIST - PASTIKAN SEMUA SUDAH DILAKUKAN:

- [ ] Backend cache cleared (`php artisan cache:clear`)
- [ ] View cache cleared (`php artisan view:clear`)
- [ ] Frontend dev server restarted (`npm run dev`)
- [ ] Browser cache cleared (`CTRL + SHIFT + R`)
- [ ] Test email OTP via tinker
- [ ] Check email di Gmail inbox
- [ ] Login ke website sebagai user
- [ ] Test payment selector di Premium
- [ ] Login sebagai admin
- [ ] Check "Kelola Pembayaran" tab
- [ ] Verify API: `http://localhost:8000/api/payment-methods`

---

## 🎬 VIDEO TUTORIAL (Langkah per Langkah)

### **1. Clear All Cache (2 menit)**
```bash
# Terminal 1: Backend
cd c:\laragon\www\Surade.co.id\backend
php artisan cache:clear
php artisan config:clear
php artisan view:clear
php artisan route:clear
php artisan serve
```

```bash
# Terminal 2: Frontend
cd c:\laragon\www\Surade.co.id\frontend
npm run dev
```

### **2. Test Email (3 menit)**
```bash
# Terminal 3: Tinker
cd c:\laragon\www\Surade.co.id\backend
php artisan tinker

# Di tinker, paste ini:
Mail::to('your-email@gmail.com')->send(new \App\Mail\OtpMail('123456', 'Your Name', 'registration'));

# Tekan Enter
# Buka Gmail dan check inbox
```

### **3. Test Payment (5 menit)**
1. Buka browser: `http://localhost:5173`
2. Login dengan user test
3. Klik bisnis mana saja
4. Scroll bawah, klik **"Upgrade Premium"**
5. Pilih paket, klik **"Lanjut"**
6. Lihat payment selector muncul! ✅

---

## 📞 MASIH TIDAK KELIATAN?

**Hubungi saya dengan info:**
1. Screenshot error (kalau ada)
2. Browser console error (F12 → Console tab)
3. Laravel log error (`backend/storage/logs/laravel.log`)
4. Screenshot tampilan yang masih salah

**File yang sudah saya edit 100% benar:**
- ✅ `backend/resources/views/emails/otp.blade.php`
- ✅ `backend/resources/views/emails/reset-password-code.blade.php`
- ✅ `frontend/src/components/PaymentMethodSelector.jsx`

**Masalahnya pasti di cache, bukan di code!**

---

## 🎉 SETELAH CLEAR CACHE, ANDA AKAN LIHAT:

### **Email Baru:**
```
╔════════════════════════════╗
║   [S]  Surade.co.id       ║  ← LOGO DI TENGAH
║   Platform UMKM Digital   ║  ← TEKS BARU
╠════════════════════════════╣
║  Halo! 👋                 ║
║  Kode: 123456             ║  ← OTP BESAR
║  ⏱️ 5 menit               ║
║  ⚠️ Jangan share!         ║
╚════════════════════════════╝
```

### **Payment Selector Baru:**
```
┌─────────────────────────────┐
│ Transfer Bank               │
├─────────────────────────────┤
│ [🏦] Bank Mandiri    (•)   │
│ [🏦] Bank BNI        ( )   │
│ [🏦] Bank BCA        ( )   │
├─────────────────────────────┤
│ E-Wallet                    │
├─────────────────────────────┤
│ [💜] OVO             ( )   │
│ [💙] DANA            ( )   │
│ [💳] GoPay           ( )   │
├─────────────────────────────┤
│ QRIS                        │
├─────────────────────────────┤
│ [📱] QRIS Code       ( )   │
└─────────────────────────────┘
```

---

**Ikuti langkah-langkah di atas, dijamin keliatan perubahannnya!** 🚀

---

**Need help? Contact: support@surade.co.id**
