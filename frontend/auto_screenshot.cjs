const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Folder tujuan penyimpanan
const outputDirFrontend = path.join(__dirname, 'dokumentasi-surade');
const outputDirRoot = path.join(__dirname, '..', 'dokumentasi-surade');

[outputDirFrontend, outputDirRoot].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Daftar modul dengan penamaan file presisi sesuai instruksi
const modules = [
  { id: 'beranda-pencarian', filename: '01_modul1_beranda_dan_smart_search.png', title: 'Modul 1: Beranda Utama & Pencarian Pintar (Smart Search)' },
  { id: 'kategori-desa', filename: '02_modul2_kategori_dan_filter_12_desa.png', title: 'Modul 2: 9 Kategori Bisnis & Filter 12 Desa/Kelurahan' },
  { id: 'detail-kontak', filename: '03_modul3_profil_detail_gps_whatsapp.png', title: 'Modul 3: Profil Detail Tempat Usaha, Peta GPS & WhatsApp' },
  { id: 'pendaftaran-otp', filename: '04_modul4_pendaftaran_akun_verifikasi_otp.png', title: 'Modul 4: Pendaftaran Akun Baru & Verifikasi OTP 6-Digit' },
  { id: 'login-pengantar', filename: '05_modul5_masuk_login_reset_sandi_dashboard.png', title: 'Modul 5: Masuk Akun (Login), Reset Sandi & Dashboard' },
  { id: 'dashboard-overview', filename: '06_modul6_dashboard_overview_analitik_views.png', title: 'Modul 6: Dashboard Overview & Analitik Kunjungan' },
  { id: 'tambah-kelola-bisnis', filename: '07_modul7_tambah_bisnis_titik_maps.png', title: 'Modul 7: Pendaftaran Tempat Usaha & Pin Peta GPS' },
  { id: 'jam-operasional', filename: '08_modul8_pengaturan_jam_operasional.png', title: 'Modul 8: Pengaturan Jam Operasional Mingguan' },
  { id: 'katalog-produk', filename: '09_modul9_manajemen_katalog_produk.png', title: 'Modul 9: Manajemen Katalog Produk & Daftar Menu' },
  { id: 'upgrade-premium', filename: '10_modul10_upgrade_premium_centang_emas_qris.png', title: 'Modul 10: Upgrade Akun Centang Emas & QRIS' },
  { id: 'inbox-chat', filename: '11_modul11_inbox_chat_pelanggan.png', title: 'Modul 11: Pusat Pesan & Chat Pelanggan' },
  { id: 'iklan-banner', filename: '12_modul12_pemasangan_banner_iklan.png', title: 'Modul 12: Pemasangan Banner Iklan Promosi' },
  { id: 'referral-komisi', filename: '13_modul13_kemitraan_referral_tarik_saldo.png', title: 'Modul 13: Program Kemitraan Referral & Tarik Saldo' },
  { id: 'ulasan-simpan', filename: '14_modul14_ulasan_rating_toko_favorit.png', title: 'Modul 14: Manajemen Ulasan & Koleksi Toko Favorit' },
  { id: 'blog-smartcity-cs', filename: '15_modul15_blog_berita_smart_city_cs.png', title: 'Modul 15: Blog Berita, Smart City 12 Desa & CS 24/7' }
];

async function saveFile(filename, buffer) {
  fs.writeFileSync(path.join(outputDirFrontend, filename), buffer);
  fs.writeFileSync(path.join(outputDirRoot, filename), buffer);
}

async function runScreenshotAutomation() {
  console.log('================================================================');
  console.log('🚀 MEMULAI OTOMASI SCREENSHOT PANDUAN SURADE.COM');
  console.log('================================================================');

  const browser = await puppeteer.launch({
    headless: 'new',
    defaultViewport: { width: 1920, height: 1080 },
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--force-device-scale-factor=1']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  const targetUrl = 'http://localhost:5173/panduan';
  console.log(`🌐 Navigasi ke URL: ${targetUrl}`);
  
  try {
    await page.goto(targetUrl, { waitUntil: 'networkidle2', timeout: 30000 });
  } catch (e) {
    console.log('⚠️ Networkidle timeout, melanjutkan proses...');
  }

  // Inject CSS untuk tampilan bersih tanpa scrollbar dan tanpa popup modal yang menghalangi
  await page.addStyleTag({
    content: `
      ::-webkit-scrollbar { display: none !important; }
      body, html { scrollbar-width: none !important; -ms-overflow-style: none !important; }
      .umkm-promo-modal-overlay, [class*="modal-backdrop"], .umkm-promo-popup, [role="dialog"] {
        display: none !important;
      }
    `
  });

  // Tunggu font dan resource selesai rendering
  await new Promise(r => setTimeout(r, 2000));

  // -------------------------------------------------------------
  // LANGKAH 1: Tangkapan Layar Tampilan Header (Hero Section)
  // -------------------------------------------------------------
  console.log('\n[Langkah 1] Mengambil screenshot Header Atas...');
  await page.evaluate(() => window.scrollTo(0, 0));
  await new Promise(r => setTimeout(r, 1000));

  const headerBuffer = await page.screenshot({
    clip: { x: 0, y: 0, width: 1920, height: 580 }
  });
  await saveFile('00_header_cara_penggunaan.png', headerBuffer);
  console.log('✅ Tersimpan: 00_header_cara_penggunaan.png');

  // -------------------------------------------------------------
  // LANGKAH 2 s/d LANGKAH 16: Tangkapan Layar Modul 1 sampai Modul 15
  // -------------------------------------------------------------
  for (let i = 0; i < modules.length; i++) {
    const mod = modules[i];
    const stepNumber = i + 2;
    console.log(`\n[Langkah ${stepNumber}] Memproses ${mod.title}...`);

    try {
      // 1. Klik menu di sidebar atau scroll ke section
      await page.evaluate((sectionId) => {
        // Klik link sidebar jika ada
        const sidebarLinks = Array.from(document.querySelectorAll('.panduan-nav-link, .panduan-sidebar-link, a[href^="#"]'));
        const targetLink = sidebarLinks.find(a => a.getAttribute('href') === `#${sectionId}`);
        if (targetLink) {
          targetLink.click();
        } else {
          const el = document.getElementById(sectionId);
          if (el) {
            el.scrollIntoView({ behavior: 'instant', block: 'start' });
            window.scrollBy(0, -90);
          }
        }
      }, mod.id);

      // 2. Jeda agar transisi konten dan gambar stabil
      await new Promise(r => setTimeout(r, 1200));

      // 3. Tangkap elemen modul
      const sectionEl = await page.$(`#${mod.id}`);
      if (sectionEl) {
        const modBuffer = await sectionEl.screenshot();
        await saveFile(mod.filename, modBuffer);
        console.log(`✅ Tersimpan: ${mod.filename}`);
      } else {
        // Fallback viewport clip
        const fallbackBuffer = await page.screenshot({
          clip: { x: 360, y: 100, width: 1500, height: 920 }
        });
        await saveFile(mod.filename, fallbackBuffer);
        console.log(`✅ Fallback Tersimpan: ${mod.filename}`);
      }
    } catch (err) {
      console.error(`❌ Gagal pada ${mod.filename}:`, err.message);
    }
  }

  await browser.close();

  console.log('\n================================================================');
  console.log('🎉 SEMUA TANGKAPAN LAYAR LENGKAP TELAH BERHASIL DIAMBIL!');
  console.log(`📁 Lokasi Penyimpanan: ${outputDirRoot}`);
  console.log('================================================================\n');
}

runScreenshotAutomation().catch(err => {
  console.error('Fatal Error:', err);
});
