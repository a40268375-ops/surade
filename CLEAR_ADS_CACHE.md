# Clear Ads Cache - Instruksi

## Masalah
Iklan dummy/sample masih muncul di homepage padahal tidak ada iklan aktif di database.

## Penyebab
Data lama tersimpan di browser cache (sessionStorage/localStorage).

## Solusi

### Cara 1: Hard Refresh Browser (TERMUDAH)
1. Buka homepage (http://localhost:5173)
2. Tekan **Ctrl + Shift + R** (Windows/Linux) atau **Cmd + Shift + R** (Mac)
3. Atau tekan **Ctrl + F5**
4. Homepage akan reload dan cache akan di-clear otomatis

### Cara 2: Clear Browser Cache Manual
1. Buka Developer Tools (F12)
2. Klik tab **Application** (Chrome) atau **Storage** (Firefox)
3. Di sidebar kiri, expand **Session Storage** atau **Local Storage**
4. Klik kanan pada domain → pilih **Clear**
5. Refresh page

### Cara 3: Clear dari Console
1. Buka Developer Tools (F12)
2. Klik tab **Console**
3. Ketik command berikut dan tekan Enter:
```javascript
sessionStorage.clear(); localStorage.clear(); location.reload();
```

## Verifikasi
Setelah clear cache, Anda akan melihat:
- ✅ Banner Premium menampilkan placeholder "Pasang Iklan Premium"
- ✅ Carousel Standard menampilkan 5 placeholder "Pasang Iklan Standard"
- ✅ Tidak ada iklan dummy/sample (Apotek, Warung Nasi, dll)

## Debug Logs
Di console browser, Anda akan melihat log:
```
⚠️ No advertisements data from backend - showing placeholders
🎫 StandardAdsSection received: { ads: [], adsLength: 0, loading: false }
```

Jika masih muncul iklan dummy setelah cara di atas, hubungi developer.
