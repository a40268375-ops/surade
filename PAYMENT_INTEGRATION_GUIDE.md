# 🏦 Panduan Integrasi Payment Gateway Universal - Surade.com

## ✅ Update Terbaru (15 September 2026)

### 1. 📧 Email OTP Template - SELESAI ✅

**Lokasi File:**
- `backend/resources/views/emails/otp.blade.php` - Email verifikasi registrasi
- `backend/resources/views/emails/reset-password-code.blade.php` - Email reset password

**Fitur Baru:**
- ✅ Logo Surade.com di tengah header dengan gradient background
- ✅ Teks brand "Surade.com" di sebelah kanan logo
- ✅ Tagline "Platform UMKM Digital Kecamatan Surade"
- ✅ OTP code dengan styling modern dan eye-catching
- ✅ Warning box dengan informasi keamanan lengkap
- ✅ Footer dengan copyright dan contact info
- ✅ Responsive design untuk mobile dan desktop
- ✅ Warna brand konsisten (#007570 - Teal)

**Cara Testing:**
```bash
# Test registrasi dengan OTP
POST /api/register/send-otp
{
  "name": "Test User",
  "email": "test@gmail.com",
  "phone": "081234567890"
}

# Test reset password
POST /api/forgot-password
{
  "email": "test@gmail.com"
}
```

**Preview Email:**
- Header: Logo S di kotak putih + "Surade.com" (font besar)
- Subheader: Tagline platform
- Content: Greeting personal + Kode OTP dalam box gradient
- Warning: Info keamanan dengan bullet points
- Footer: Copyright + contact email

---

### 2. 💳 Unified Payment Gateway System - SELESAI ✅

**Lokasi File:**
- `frontend/src/components/PaymentMethodSelector.jsx` - Component selector payment universal
- `backend/app/Http/Controllers/Api/SettingController.php` - API payment methods
- `frontend/src/pages/admin-web/AdminWeb.jsx` - Admin panel kelola pembayaran

**Metode Pembayaran Tersedia:**

#### 🏦 Transfer Bank (5 Bank)
1. **Bank Mandiri** - 133-0011-409-331
2. **Bank BNI** - 0973607008
3. **Bank BCA** - 0954152045
4. **Maybank** - 2097000009
5. **Bank BJB** - 0119213282001

#### 💳 E-Wallet (3 Platform)
1. **OVO** - 0811-1919-711
2. **DANA** - 0811-1919-711
3. **GoPay** - 0811-1919-711

#### 📱 QRIS
1. **QRIS (Semua E-Wallet & Bank)** - Scan QR Code

**Nama Pemilik Resmi:** Triwala Mitra Bestari

---

### 3. 🔗 Integrasi Payment ke Semua Fitur

Payment methods ini HARUS terintegrasi ke:

#### ✅ 1. Premium Business Subscription
**File:** `frontend/src/pages/BusinessDetail.jsx`
**Endpoint:** `POST /api/subscriptions`
**Status:** ✅ SUDAH TERINTEGRASI

```javascript
import PaymentMethodSelector from "../components/PaymentMethodSelector";

<PaymentMethodSelector
  selectedMethod={selectedPaymentMethod}
  onSelect={(method) => setSelectedPaymentMethod(method.id)}
  title="Pilih Metode Pembayaran Premium"
  showInstruction={true}
/>
```

#### ✅ 2. Blog & Event Payment
**File:** `frontend/src/pages/admin-user/AdminUser.jsx`
**Endpoint:** `POST /api/blogs/{id}/checkout`
**Status:** ✅ SUDAH TERINTEGRASI

```javascript
<PaymentMethodSelector
  methods={paymentMethods}
  selectedMethod={selectedPaymentMethod}
  onSelect={(method) => setSelectedPaymentMethod(method)}
  title="Pilih Metode Pembayaran Blog/Event"
/>
```

#### ✅ 3. Advertisement/Iklan Payment
**File:** `frontend/src/pages/admin-user/AdminUser.jsx`
**Endpoint:** `POST /api/advertisements/{id}/pay`
**Status:** ✅ SUDAH TERINTEGRASI

#### ✅ 4. WhatsApp Access Fee
**File:** `frontend/src/pages/BusinessDetail.jsx`
**Endpoint:** `POST /api/whatsapp-access-log`
**Status:** ✅ SUDAH TERINTEGRASI

```javascript
<PaymentMethodSelector
  selectedMethod={selectedPaymentMethod}
  onSelect={(method) => setSelectedPaymentMethod(method.id)}
  title="Pilih Metode Pembayaran Akses WhatsApp"
  showInstruction={true}
  qrisImage={waSettings.qris_image}
/>
```

---

### 4. 🎛️ Admin Panel - Kelola Pembayaran

**Lokasi:** Admin Web → Tab "Kelola Pembayaran"

**Fitur Admin:**
- ✅ Lihat semua metode pembayaran aktif/nonaktif
- ✅ Filter by kategori (Bank, E-Wallet, QRIS)
- ✅ Toggle ON/OFF metode pembayaran
- ✅ Edit nomor rekening/HP
- ✅ Edit nama pemilik rekening
- ✅ Upload/ganti QRIS image
- ✅ Tambah metode pembayaran baru
- ✅ Hapus metode pembayaran custom

**Global Settings:**
```javascript
// Nama pemilik rekening resmi (ditampilkan di semua metode)
paymentOfficialHolder: "Triwala Mitra Bestari"

// QRIS Image (untuk semua pembayaran QRIS)
qris_image: "/storage/settings/qris-official.png"
```

**API Endpoints:**
```bash
# Get payment methods (public)
GET /api/payment-methods

# Update payment methods (admin only)
PUT /api/admin/payment-methods

# Upload QRIS image
POST /api/admin/whatsapp-settings (with qris_image file)
```

---

### 5. 🔧 Struktur Database

**Table: settings**
```sql
key                              | value                          | type    | group
---------------------------------|--------------------------------|---------|----------
payment_methods_list             | [JSON array methods]           | json    | payment
payment_official_account_holder  | Triwala Mitra Bestari          | text    | payment
whatsapp_fee_qris_image          | settings/qris-xxx.png          | image   | whatsapp
```

**JSON Structure (payment_methods_list):**
```json
[
  {
    "id": "Mandiri",
    "name": "Bank Mandiri",
    "accountNumber": "133-0011-409-331",
    "accountName": "Triwala Mitra Bestari",
    "category": "bank",
    "badgeColor": "bg-[#003d79] text-white",
    "logoUrl": "/logos/mandiri.png",
    "isActive": true
  },
  // ... more methods
]
```

---

### 6. 📊 Flow Pembayaran Universal

```
User memilih fitur → Premium/Blog/Iklan/WA
              ↓
        Pilih Metode Pembayaran
   (PaymentMethodSelector Component)
              ↓
    Tampilkan instruksi pembayaran:
    - Nomor Rekening / HP
    - Atas Nama
    - QR Code (jika QRIS)
              ↓
      User melakukan transfer
              ↓
   Upload bukti pembayaran (jika manual)
              ↓
      Admin verifikasi & approve
              ↓
        Fitur aktif / terbit
```

---

### 7. 🎨 UI/UX Payment Selector

**Features:**
- ✅ Logo bank/ewallet resmi di setiap card
- ✅ Radio button selection dengan check indicator
- ✅ Grouped by category (Bank, E-Wallet, QRIS)
- ✅ Copy button untuk nomor rekening
- ✅ QRIS code display dengan auto-scan instruction
- ✅ Account holder name display
- ✅ Active/Inactive status dari backend
- ✅ Responsive grid layout (1 col mobile, 3 col desktop)

**Color Scheme:**
- Primary: #007570 (Teal)
- Selected: #f0fffe (Light Teal Background)
- Border Selected: #007570
- Badge Colors: Sesuai brand masing-masing bank/ewallet

---

### 8. 🚀 Cara Deploy Changes

#### Backend:
```bash
cd backend
php artisan config:clear
php artisan cache:clear
php artisan view:clear
```

#### Frontend:
```bash
cd frontend
npm run build
# atau untuk dev
npm run dev
```

#### Test Email:
```bash
cd backend
php artisan tinker

# Test OTP email
Mail::to('your-email@gmail.com')->send(new \App\Mail\OtpMail('123456', 'Test User', 'registration'));

# Test Reset Password
Mail::to('your-email@gmail.com')->send(new \App\Mail\ResetPasswordCode('654321', 'Test User'));
```

---

### 9. ✅ Checklist Completion

- [x] Email OTP template redesign dengan logo Surade
- [x] Email Reset Password template redesign
- [x] Payment methods component sudah universal
- [x] Integrasi payment ke Premium subscription
- [x] Integrasi payment ke Blog & Event
- [x] Integrasi payment ke Advertisement
- [x] Integrasi payment ke WhatsApp access
- [x] Admin panel kelola pembayaran lengkap
- [x] QRIS image management
- [x] Toggle active/inactive methods
- [x] Edit nomor rekening dari admin
- [x] Global account holder setting

---

### 10. 📞 Support & Troubleshooting

**Jika email OTP tidak terkirim:**
1. Cek file `.env` → `MAIL_*` configuration
2. Test dengan: `php artisan tinker` → `Mail::to(...)->send(...)`
3. Cek logs: `storage/logs/laravel.log`

**Jika payment methods tidak muncul:**
1. Clear cache: `php artisan cache:clear`
2. Cek API: `GET /api/payment-methods`
3. Cek localStorage browser: `official_payment_methods_custom`

**Jika logo payment tidak tampil:**
1. Pastikan file ada di: `public/logos/`
2. File yang diperlukan:
   - mandiri.png
   - bni.png
   - bca.png
   - maybank.png
   - bjb.png
   - ovo.png
   - dana.png
   - gopay.png
   - qris.png

---

## 🎉 SEMUA FITUR SUDAH BERFUNGSI!

Payment gateway universal Surade.com sekarang sudah terintegrasi penuh ke semua fitur platform:
- ✅ Premium Business
- ✅ Blog & Event Publishing
- ✅ Advertisement
- ✅ WhatsApp Access Fee

Semua menggunakan rekening bank yang sama (Triwala Mitra Bestari) dan bisa dikelola dari satu tempat: **Admin Panel → Kelola Pembayaran**

---

**© 2026 Surade.com - Platform UMKM Digital Kecamatan Surade**
