# TODO: Fix "Profil Saya" Navbar Link & Bersihin Profile.jsx

## Steps
1. ✅ Edit `Navbar.jsx` - Link "Profil Saya" dan "Pengaturan" ke `/admin-user?tab=profile`
2. ✅ Edit `AdminUser.jsx` - Tambah `useSearchParams`, baca `?tab=profile`, set `activeTab` awal sesuai query param
3. ✅ Edit `Profile.jsx` - Bersihin semua sisa CRUD/edit yang broken:
   - Hapus import `../utils/media` (file gak ada)
   - Hapus panggilan `setPhotoPreview`, `setBannerPreview` yang gak didefinisikan
   - Fix URL gambar pake `getMediaUrl()` fungsi lokal
   - Jadikan murni halaman publik view-only (lht profil orang / sendiri)
4. ✅ Router `/admin-user` udah bener di `router/index.jsx`

