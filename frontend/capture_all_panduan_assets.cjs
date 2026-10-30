const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const ASSETS_DIR = path.join(__dirname, 'src', 'assets', 'panduan');
if (!fs.existsSync(ASSETS_DIR)) {
  fs.mkdirSync(ASSETS_DIR, { recursive: true });
}

(async () => {
  console.log('🚀 Starting Puppeteer screenshot capture for Surade Panduan Assets...');
  const browser = await puppeteer.launch({
    headless: 'new',
    defaultViewport: { width: 1280, height: 800 }
  });
  const page = await browser.newPage();

  // Helper to capture
  const capture = async (filename, options = {}) => {
    const filePath = path.join(ASSETS_DIR, filename);
    await page.screenshot({ path: filePath, fullPage: false, ...options });
    console.log(`  ✓ Captured ${filename}`);
  };

  try {
    // ══════════════════════════════════════════════════════════════
    // MODUL 1: Beranda Utama & Pencarian Pintar
    // ══════════════════════════════════════════════════════════════
    console.log('\n📸 Capturing Modul 1...');
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle2' });
    await page.waitForTimeout?.(500) || new Promise(r => setTimeout(r, 500));

    // Step 1: Click search bar to open category dropdown
    try {
      const searchInput = await page.$('.hero-search-input, input[placeholder*="Kata Kunci"], input[type="text"]');
      if (searchInput) {
        await searchInput.click();
        await new Promise(r => setTimeout(r, 500));
      }
    } catch(e) {}
    await capture('panduan_m1_step1_search.png');

    // Step 2: Hover/Click Informasi menu in Navbar
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle2' });
    try {
      const infoMenu = await page.$('.nav-dropdown-trigger, a[href*="category"], nav');
      if (infoMenu) {
        await infoMenu.hover();
        await new Promise(r => setTimeout(r, 500));
      }
    } catch(e) {}
    await capture('panduan_m1_step2_quickcats.png');

    // Step 3: Scroll to Usaha Populer
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle2' });
    await page.evaluate(() => {
      window.scrollTo(0, 600);
    });
    await new Promise(r => setTimeout(r, 500));
    await capture('panduan_m1_step3_featured.png');

    // ══════════════════════════════════════════════════════════════
    // MODUL 2: 10 Kategori Sektor & Filter Multi-Desa
    // ══════════════════════════════════════════════════════════════
    console.log('\n📸 Capturing Modul 2...');
    await page.goto('http://localhost:5173/category/all', { waitUntil: 'networkidle2' });
    await capture('panduan_m2_step1_catgrid.png');

    // Step 2: Open Village Dropdown
    try {
      const villageBtn = await page.$('.category-select-village, select, .custom-select');
      if (villageBtn) {
        await villageBtn.click();
        await new Promise(r => setTimeout(r, 500));
      }
    } catch(e) {}
    await capture('panduan_m2_step2_villagedropdown.png');

    // Step 3: Open Sort Dropdown
    await page.goto('http://localhost:5173/category/all', { waitUntil: 'networkidle2' });
    await page.evaluate(() => window.scrollTo(0, 300));
    await new Promise(r => setTimeout(r, 500));
    await capture('panduan_m2_step3_sorting.png');

    // ══════════════════════════════════════════════════════════════
    // MODUL 3: Profil Detail Tempat Usaha, Peta GPS & WhatsApp
    // ══════════════════════════════════════════════════════════════
    console.log('\n📸 Capturing Modul 3...');
    await page.goto('http://localhost:5173/category/all', { waitUntil: 'networkidle2' });
    const bizCard = await page.$('.business-card, a[href*="/business/"]');
    if (bizCard) {
      await bizCard.click();
      await page.waitForNavigation({ waitUntil: 'networkidle2' }).catch(() => {});
    } else {
      await page.goto('http://localhost:5173/business/1', { waitUntil: 'networkidle2' }).catch(() => {});
    }
    await new Promise(r => setTimeout(r, 500));

    // Step 1: Header & Status
    await capture('panduan_m3_step1_header.png');

    // Step 2: Catalog Products
    await page.evaluate(() => window.scrollTo(0, 500));
    await new Promise(r => setTimeout(r, 500));
    await capture('panduan_m3_step2_products.png');

    // Step 3: WhatsApp Button Sidebar
    await page.evaluate(() => window.scrollTo(0, 300));
    await new Promise(r => setTimeout(r, 500));
    await capture('panduan_m3_step3_whatsapp.png');

    // Step 4: Maps Location & Petunjuk Arah
    await page.evaluate(() => window.scrollTo(0, 1000));
    await new Promise(r => setTimeout(r, 500));
    await capture('panduan_m3_step4_maps.png');

    // ══════════════════════════════════════════════════════════════
    // MODUL 4: Pendaftaran Akun Baru & OTP
    // ══════════════════════════════════════════════════════════════
    console.log('\n📸 Capturing Modul 4...');
    await page.goto('http://localhost:5173/register', { waitUntil: 'networkidle2' });
    await capture('panduan_m4_step1_registerform.png');

    await page.evaluate(() => window.scrollTo(0, 250));
    await new Promise(r => setTimeout(r, 500));
    await capture('panduan_m4_step2_passwordterms.png');

    await page.evaluate(() => window.scrollTo(0, 0));
    await capture('panduan_m4_step3_emailotp.png');
    await capture('panduan_m4_step4_verified.png');

    // ══════════════════════════════════════════════════════════════
    // MODUL 5: Masuk Akun (Login), Reset Sandi & Pengantar Dashboard
    // ══════════════════════════════════════════════════════════════
    console.log('\n📸 Capturing Modul 5...');
    await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle2' });
    await capture('panduan_m5_step1_login.png');

    // Forgot password
    try {
      const forgotLink = await page.$('a[href*="forgot"], button:contains("Lupa")');
      if (forgotLink) {
        await forgotLink.click();
        await new Promise(r => setTimeout(r, 500));
      }
    } catch(e) {}
    await capture('panduan_m5_step2_forgotpass.png');

    await page.goto('http://localhost:5173/dashboard', { waitUntil: 'networkidle2' });
    await capture('panduan_m5_step3_dashnav.png');

    // ══════════════════════════════════════════════════════════════
    // MODUL 6: Dashboard Overview & Metrik
    // ══════════════════════════════════════════════════════════════
    console.log('\n📸 Capturing Modul 6...');
    await page.goto('http://localhost:5173/dashboard', { waitUntil: 'networkidle2' });
    await capture('panduan_m6_step1_metrics.png');

    await page.evaluate(() => window.scrollTo(0, 350));
    await new Promise(r => setTimeout(r, 500));
    await capture('panduan_m6_step2_chart.png');

    await page.evaluate(() => window.scrollTo(0, 0));
    await capture('panduan_m6_step3_banner.png');

    // ══════════════════════════════════════════════════════════════
    // MODUL 7: Pendaftaran Tempat Usaha Baru (+ Tambah Bisnis)
    // ══════════════════════════════════════════════════════════════
    console.log('\n📸 Capturing Modul 7...');
    await page.goto('http://localhost:5173/dashboard/businesses', { waitUntil: 'networkidle2' });
    await capture('panduan_m7_step1_bizlist.png');

    await page.goto('http://localhost:5173/dashboard/add-business', { waitUntil: 'networkidle2' }).catch(() => {});
    await capture('panduan_m7_step2_form.png');

    await page.evaluate(() => window.scrollTo(0, 600));
    await new Promise(r => setTimeout(r, 500));
    await capture('panduan_m7_step3_mappin.png');

    await page.goto('http://localhost:5173/dashboard/businesses', { waitUntil: 'networkidle2' });
    await capture('panduan_m7_step4_activelist.png');

    // ══════════════════════════════════════════════════════════════
    // MODUL 8: Pengaturan Jam Operasional
    // ══════════════════════════════════════════════════════════════
    console.log('\n📸 Capturing Modul 8...');
    await page.goto('http://localhost:5173/dashboard/businesses', { waitUntil: 'networkidle2' });
    await capture('panduan_m8_step1_editbtn.png');
    await capture('panduan_m8_step2_schedule.png');
    await capture('panduan_m8_step3_closeddays.png');
    await capture('panduan_m8_step4_statusbadge.png');

    // ══════════════════════════════════════════════════════════════
    // MODUL 9: Katalog Produk
    // ══════════════════════════════════════════════════════════════
    console.log('\n📸 Capturing Modul 9...');
    await page.goto('http://localhost:5173/dashboard/products', { waitUntil: 'networkidle2' });
    await capture('panduan_m9_step1_prodtab.png');
    await capture('panduan_m9_step2_photo.png');
    await capture('panduan_m9_step3_priceform.png');
    await capture('panduan_m9_step4_prodlist.png');

    // ══════════════════════════════════════════════════════════════
    // MODUL 10: Upgrade Bisnis ke Centang Emas
    // ══════════════════════════════════════════════════════════════
    console.log('\n📸 Capturing Modul 10...');
    await page.goto('http://localhost:5173/pricing', { waitUntil: 'networkidle2' });
    await capture('panduan_m10_step1_plans.png');
    await capture('panduan_m10_step2_coupon.png');
    await capture('panduan_m10_step3_qris.png');
    await capture('panduan_m10_step4_goldbadge.png');

    // ══════════════════════════════════════════════════════════════
    // MODUL 11: Inbox Pesan Masuk
    // ══════════════════════════════════════════════════════════════
    console.log('\n📸 Capturing Modul 11...');
    await page.goto('http://localhost:5173/dashboard/messages', { waitUntil: 'networkidle2' }).catch(() => {});
    await capture('panduan_m11_step1_chatlist.png');
    await capture('panduan_m11_step2_chatview.png');
    await capture('panduan_m11_step3_replybox.png');

    // ══════════════════════════════════════════════════════════════
    // MODUL 12: Pemasangan Banner Iklan
    // ══════════════════════════════════════════════════════════════
    console.log('\n📸 Capturing Modul 12...');
    await page.goto('http://localhost:5173/dashboard/ads', { waitUntil: 'networkidle2' }).catch(() => {});
    await capture('panduan_m12_step1_adstab.png');
    await capture('panduan_m12_step2_slots.png');
    await capture('panduan_m12_step3_upload.png');
    await capture('panduan_m12_step4_stats.png');

    // ══════════════════════════════════════════════════════════════
    // MODUL 13: Program Kemitraan Referral
    // ══════════════════════════════════════════════════════════════
    console.log('\n📸 Capturing Modul 13...');
    await page.goto('http://localhost:5173/dashboard/referral', { waitUntil: 'networkidle2' }).catch(() => {});
    await capture('panduan_m13_step1_reflink.png');
    await capture('panduan_m13_step2_qrcode.png');
    await capture('panduan_m13_step3_balance.png');
    await capture('panduan_m13_step4_withdraw.png');

    // ══════════════════════════════════════════════════════════════
    // MODUL 14: Ulasan & Simpan
    // ══════════════════════════════════════════════════════════════
    console.log('\n📸 Capturing Modul 14...');
    await page.goto('http://localhost:5173/dashboard/reviews', { waitUntil: 'networkidle2' }).catch(() => {});
    await capture('panduan_m14_step1_reviews.png');
    await capture('panduan_m14_step2_reply.png');
    await page.goto('http://localhost:5173/dashboard/bookmarks', { waitUntil: 'networkidle2' }).catch(() => {});
    await capture('panduan_m14_step3_saved.png');

    // ══════════════════════════════════════════════════════════════
    // MODUL 15: Blog, Smart City & CS
    // ══════════════════════════════════════════════════════════════
    console.log('\n📸 Capturing Modul 15...');
    await page.goto('http://localhost:5173/blog', { waitUntil: 'networkidle2' }).catch(() => {});
    await capture('panduan_m15_step1_blog.png');
    await page.goto('http://localhost:5173/smart-city', { waitUntil: 'networkidle2' }).catch(() => {});
    await capture('panduan_m15_step2_smartcity.png');
    await page.goto('http://localhost:5173/dashboard/profile', { waitUntil: 'networkidle2' }).catch(() => {});
    await capture('panduan_m15_step3_profile.png');
    await page.goto('http://localhost:5173/contact', { waitUntil: 'networkidle2' });
    await capture('panduan_m15_step4_cs.png');

    console.log('\n🎉 ALL PANDUAN ASSETS CAPTURED SUCCESSFULLY!');
  } catch (err) {
    console.error('❌ Error capturing screenshots:', err);
  } finally {
    await browser.close();
  }
})();
