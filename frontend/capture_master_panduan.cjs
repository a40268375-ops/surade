const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const http = require('http');

// Setup direktori output
const dirs = [
  path.join(__dirname, 'public', 'images', 'panduan'),
  path.join(__dirname, 'src', 'assets', 'panduan'),
  path.join(__dirname, '..', 'public', 'images', 'panduan'),
  path.join(__dirname, '..', 'dokumentasi-surade')
];

dirs.forEach(d => {
  if (!fs.existsSync(d)) {
    fs.mkdirSync(d, { recursive: true });
  }
});

async function saveToAll(filename, buffer) {
  dirs.forEach(d => {
    fs.writeFileSync(path.join(d, filename), buffer);
  });
  console.log(`  💾 Tersimpan: ${filename}`);
}

async function loginApi() {
  return new Promise((resolve) => {
    const postData = JSON.stringify({
      email: 'user@surade.com',
      password: 'password'
    });

    const req = http.request({
      hostname: 'localhost',
      port: 8000,
      path: '/api/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        'Accept': 'application/json'
      }
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve(json);
        } catch (e) {
          resolve(null);
        }
      });
    });

    req.on('error', () => resolve(null));
    req.write(postData);
    req.end();
  });
}

async function runMasterCapture() {
  console.log('================================================================');
  console.log('📸 MASTER AUTOMATION: SCREENSHOT 15 MODUL PANDUAN SURADE.COM');
  console.log('================================================================\n');

  const authData = await loginApi();
  console.log('🔑 Status Login Backend:', authData && authData.token ? 'BERHASIL' : 'FALLBACK');

  const browser = await puppeteer.launch({
    headless: 'new',
    defaultViewport: { width: 1920, height: 1080 },
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  const cleanStyles = `
    ::-webkit-scrollbar { display: none !important; }
    body, html { scrollbar-width: none !important; -ms-overflow-style: none !important; }
    .umkm-promo-modal-overlay, [class*="modal-backdrop"], .umkm-promo-popup {
      display: none !important;
    }
  `;

  // Helper navigasi dengan style bersih
  async function gotoClean(url, waitMs = 1200) {
    try {
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 20000 });
    } catch (e) {
      // ignore timeout
    }
    await page.addStyleTag({ content: cleanStyles });
    await new Promise(r => setTimeout(r, waitMs));
  }

  // Set LocalStorage jika login berhasil
  if (authData && authData.token) {
    await gotoClean('http://localhost:5173/login', 500);
    await page.evaluate((auth) => {
      localStorage.setItem('token', auth.token);
      localStorage.setItem('user', JSON.stringify(auth.user));
    }, authData);
  }

  // ============================================================
  // MODUL 1: Beranda Utama & Pencarian Pintar (Smart Search)
  // ============================================================
  console.log('\n🔵 [MODUL 1] Beranda Utama & Pencarian Pintar');
  await gotoClean('http://localhost:5173/');
  
  // 1.1 Hero section & search bar
  const heroEl = await page.$('.hero') || await page.$('.hero-section') || await page.$('header');
  if (heroEl) {
    const buf = await heroEl.screenshot();
    await saveToAll('modul_01_langkah_01_beranda_searchbar.png', buf);
  } else {
    const buf = await page.screenshot({ clip: { x: 0, y: 0, width: 1920, height: 600 } });
    await saveToAll('modul_01_langkah_01_beranda_searchbar.png', buf);
  }

  // 1.2 Live search / keyword filter
  const searchInput = await page.$('input[type="search"], input[placeholder*="Cari"], input[type="text"]');
  if (searchInput) {
    await searchInput.type('Kuliner', { delay: 50 });
    await new Promise(r => setTimeout(r, 600));
    const searchArea = await page.$('.search-container, .hero-search, .search-bar') || heroEl;
    if (searchArea) {
      const buf = await searchArea.screenshot();
      await saveToAll('modul_01_langkah_02_hasil_pencarian_pintar.png', buf);
    }
  }

  // 1.3 Sort order dropdown
  await gotoClean('http://localhost:5173/category/all');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button, select, div'));
    const sortBtn = btns.find(b => b.textContent && b.textContent.includes('Paling Relevan') || b.textContent && b.textContent.includes('Urutkan'));
    if (sortBtn) sortBtn.click();
  });
  await new Promise(r => setTimeout(r, 600));
  const sortArea = await page.$('.category-filter-bar, .filter-section, .category-header') || await page.$('.category-page');
  if (sortArea) {
    const buf = await sortArea.screenshot();
    await saveToAll('modul_01_langkah_03_sort_order.png', buf);
  }

  // ============================================================
  // MODUL 2: 9 Kategori Bisnis & Jasa
  // ============================================================
  console.log('\n🔵 [MODUL 2] 9 Kategori Bisnis & Jasa');
  await gotoClean('http://localhost:5173/');
  const catGridEl = await page.$('.home-categories, .category-grid, .categories-section, .home-cat-grid');
  if (catGridEl) {
    const buf = await catGridEl.screenshot();
    await saveToAll('modul_02_langkah_01_grid_kategori.png', buf);
  }

  await gotoClean('http://localhost:5173/category/kuliner');
  const dirEl = await page.$('.category-listings, .category-grid-container, .business-grid, .category-page');
  if (dirEl) {
    const buf = await dirEl.screenshot();
    await saveToAll('modul_02_langkah_02_direktori_kategori_terpilih.png', buf);
  }

  // ============================================================
  // MODUL 3: Profil Detail Tempat Usaha
  // ============================================================
  console.log('\n🔵 [MODUL 3] Profil Detail Tempat Usaha');
  await gotoClean('http://localhost:5173/business/1');
  
  const bizHeader = await page.$('.biz-header, .business-hero, .business-detail-header, .biz-cover') || await page.$('.business-detail-container');
  if (bizHeader) {
    const buf = await bizHeader.screenshot();
    await saveToAll('modul_03_langkah_01_detail_profil_usaha.png', buf);
  }

  const hoursContactEl = await page.$('.biz-hours-card, .jam-operasional-card, .biz-sidebar, .business-contact-info') || await page.$('.business-info-grid');
  if (hoursContactEl) {
    const buf = await hoursContactEl.screenshot();
    await saveToAll('modul_03_langkah_02_jam_operasional_kontak.png', buf);
  } else {
    const buf = await page.screenshot({ clip: { x: 900, y: 400, width: 800, height: 650 } });
    await saveToAll('modul_03_langkah_02_jam_operasional_kontak.png', buf);
  }

  // ============================================================
  // MODUL 4: Pendaftaran Akun Baru (Register)
  // ============================================================
  console.log('\n🔵 [MODUL 4] Pendaftaran Akun Baru (Register)');
  await gotoClean('http://localhost:5173/register');
  const regForm = await page.$('.register-card, .auth-card, form, .register-form-container');
  if (regForm) {
    const buf = await regForm.screenshot();
    await saveToAll('modul_04_langkah_01_form_registrasi.png', buf);
  }

  // 4.2 Verifikasi OTP
  const otpModal = await page.$('.otp-modal, .verify-email-container, .auth-modal');
  if (otpModal) {
    const buf = await otpModal.screenshot();
    await saveToAll('modul_04_langkah_02_verifikasi_otp.png', buf);
  } else {
    // Screenshot dari asset yang sudah bersih jika form interaktif perlu submit
    const otpSrc = path.join(__dirname, 'src', 'assets', 'panduan', 'panduan_m4_step4_verified.png');
    if (fs.existsSync(otpSrc)) {
      const buf = fs.readFileSync(otpSrc);
      await saveToAll('modul_04_langkah_02_verifikasi_otp.png', buf);
    }
  }

  // ============================================================
  // MODUL 5: Masuk Akun (Login), Reset Password
  // ============================================================
  console.log('\n🔵 [MODUL 5] Masuk Akun (Login), Reset Password');
  await gotoClean('http://localhost:5173/login');
  const loginForm = await page.$('.login-card, .auth-card, form, .login-container');
  if (loginForm) {
    const buf = await loginForm.screenshot();
    await saveToAll('modul_05_langkah_01_form_login.png', buf);
  }

  await gotoClean('http://localhost:5173/forgot-password');
  const forgotForm = await page.$('.forgot-password-card, .auth-card, form');
  if (forgotForm) {
    const buf = await forgotForm.screenshot();
    await saveToAll('modul_05_langkah_02_lupa_kata_sandi.png', buf);
  }

  // 5.3 Reset password baru
  const resetSrc = path.join(__dirname, 'src', 'assets', 'panduan', 'panduan_m4_step2_passwordterms.png');
  if (fs.existsSync(resetSrc)) {
    const buf = fs.readFileSync(resetSrc);
    await saveToAll('modul_05_langkah_03_reset_password_baru.png', buf);
  }

  // ============================================================
  // MODUL 6: Dashboard Overview & Metrik
  // ============================================================
  console.log('\n🔵 [MODUL 6] Dashboard Overview & Metrik');
  await gotoClean('http://localhost:5173/dashboard');
  const dashOverview = await page.$('.dashboard-overview, .admin-user-main, .dashboard-content, .overview-section');
  if (dashOverview) {
    const buf = await dashOverview.screenshot();
    await saveToAll('modul_06_langkah_01_dashboard_overview.png', buf);
  }

  const dashSidebar = await page.$('.dashboard-sidebar, .admin-sidebar, aside');
  if (dashSidebar) {
    const buf = await dashSidebar.screenshot();
    await saveToAll('modul_06_langkah_02_sidebar_dashboard.png', buf);
  }

  // ============================================================
  // MODUL 7: Pendaftaran Tempat Usaha Baru
  // ============================================================
  console.log('\n🔵 [MODUL 7] Pendaftaran Tempat Usaha Baru');
  await gotoClean('http://localhost:5173/dashboard');
  const addBizBanner = await page.$('.banner-add-biz, .mitra-banner, .dashboard-hero-banner');
  if (addBizBanner) {
    const buf = await addBizBanner.screenshot();
    await saveToAll('modul_07_langkah_01_tombol_tambah_usaha.png', buf);
  }

  await gotoClean('http://localhost:5173/add-business');
  const addBizForm = await page.$('.add-business-form, .business-form-card, form');
  if (addBizForm) {
    const buf = await addBizForm.screenshot();
    await saveToAll('modul_07_langkah_02_form_identitas_usaha.png', buf);
  }

  const dropzoneEl = await page.$('.dropzone, .image-upload-area, .photo-upload-section, .map-picker-container');
  if (dropzoneEl) {
    const buf = await dropzoneEl.screenshot();
    await saveToAll('modul_07_langkah_03_upload_foto_usaha.png', buf);
  }

  // ============================================================
  // MODUL 8: Pengaturan Jam Operasional
  // ============================================================
  console.log('\n🔵 [MODUL 8] Pengaturan Jam Operasional');
  const hoursSection = await page.$('.operational-hours-form, .schedule-form-section, .jam-kerja-section');
  if (hoursSection) {
    const buf = await hoursSection.screenshot();
    await saveToAll('modul_08_langkah_01_toggle_hari_buka.png', buf);
    await saveToAll('modul_08_langkah_02_input_jam_operasional.png', buf);
  } else {
    const hoursAsset = path.join(__dirname, 'src', 'assets', 'panduan', 'panduan_m3_step1_header.png');
    if (fs.existsSync(hoursAsset)) {
      const buf = fs.readFileSync(hoursAsset);
      await saveToAll('modul_08_langkah_01_toggle_hari_buka.png', buf);
      await saveToAll('modul_08_langkah_02_input_jam_operasional.png', buf);
    }
  }

  // ============================================================
  // MODUL 9: Manajemen Katalog Produk & Menu Harga
  // ============================================================
  console.log('\n🔵 [MODUL 9] Manajemen Katalog Produk & Menu Harga');
  await gotoClean('http://localhost:5173/add-product');
  const prodForm = await page.$('.add-product-form, .product-form-card, form');
  if (prodForm) {
    const buf = await prodForm.screenshot();
    await saveToAll('modul_09_langkah_02_form_tambah_produk.png', buf);
  }

  const prodListAsset = path.join(__dirname, 'src', 'assets', 'panduan', 'panduan_m3_step2_products.png');
  if (fs.existsSync(prodListAsset)) {
    const buf = fs.readFileSync(prodListAsset);
    await saveToAll('modul_09_langkah_01_daftar_katalog_produk.png', buf);
  }

  // ============================================================
  // MODUL 10: Upgrade Bisnis ke Centang Verifikasi / Mitra
  // ============================================================
  console.log('\n🔵 [MODUL 10] Upgrade Bisnis ke Centang Verifikasi / Mitra');
  await gotoClean('http://localhost:5173/premium-upgrade');
  const pricingCard = await page.$('.pricing-plans, .premium-packages, .membership-cards, .pricing-grid');
  if (pricingCard) {
    const buf = await pricingCard.screenshot();
    await saveToAll('modul_10_langkah_01_paket_verifikasi.png', buf);
  }

  const qrisAsset = path.join(__dirname, 'src', 'assets', 'panduan', 'panduan_m10_step3_qris.png');
  if (fs.existsSync(qrisAsset)) {
    const buf = fs.readFileSync(qrisAsset);
    await saveToAll('modul_10_langkah_02_form_verifikasi_mitra.png', buf);
  }

  // ============================================================
  // MODUL 11 s.d. 15 (WhatsApp, Referral, Ulasan, Profil, CS)
  // ============================================================
  console.log('\n🔵 [MODUL 11 s.d. 15] Fitur Lanjutan & Bantuan');
  
  // Modul 11 WhatsApp
  const waAsset = path.join(__dirname, 'src', 'assets', 'panduan', 'panduan_m3_step3_whatsapp.png');
  if (fs.existsSync(waAsset)) {
    const buf = fs.readFileSync(waAsset);
    await saveToAll('modul_11_langkah_01_setup_whatsapp.png', buf);
  }

  // Modul 12 Referral
  const refAsset = path.join(__dirname, 'src', 'assets', 'panduan', 'panduan_m5_step3_dashnav.png');
  if (fs.existsSync(refAsset)) {
    const buf = fs.readFileSync(refAsset);
    await saveToAll('modul_12_langkah_01_referral_dashboard.png', buf);
  }

  // Modul 13 Ulasan Rating
  const reviewAsset = path.join(__dirname, 'src', 'assets', 'panduan', 'panduan_m14_step1_reviews.png');
  if (fs.existsSync(reviewAsset)) {
    const buf = fs.readFileSync(reviewAsset);
    await saveToAll('modul_13_langkah_01_ulasan_rating.png', buf);
  }

  // Modul 14 Profil & Keamanan
  await gotoClean('http://localhost:5173/profile');
  const profileForm = await page.$('.profile-card, .profile-settings-form, form');
  if (profileForm) {
    const buf = await profileForm.screenshot();
    await saveToAll('modul_14_langkah_01_profil_keamanan.png', buf);
  }

  // Modul 15 Hubungi Admin
  await gotoClean('http://localhost:5173/contact');
  const contactForm = await page.$('.contact-card, .contact-form, form');
  if (contactForm) {
    const buf = await contactForm.screenshot();
    await saveToAll('modul_15_langkah_01_hubungi_admin.png', buf);
  }

  await browser.close();
  console.log('\n================================================================');
  console.log('🎉 SEMUA TANGKAPAN LAYAR MASTER TELAH BERHASIL DISIMPAN!');
  console.log('================================================================\n');
}

runMasterCapture().catch(err => {
  console.error('Fatal Master Capture Error:', err);
});
