const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const outDir = path.resolve(__dirname, '../src/assets/panduan');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

async function generateAllUniqueShots() {
  console.log('=== GENERATING DISTINCT DEDICATED SCREENSHOT FOR EVERY SINGLE STEP ===');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    defaultViewport: { width: 1280, height: 850, deviceScaleFactor: 2 }
  });

  const page = await browser.newPage();

  async function applyAuth(p) {
    await p.evaluate(() => {
      localStorage.setItem('token', '102|CArY3e8rxuNnxzkrlL9WDLWMRoNDKRFA3golo4XMfcc4c877');
      localStorage.setItem('user', JSON.stringify({
        id: 14,
        name: 'Reseller Surade',
        username: 'reseller_surade',
        email: 'user@surade.com',
        role: 'user',
        avatar: 'https://surade.com/storage/avatars/F5WfEOdsleLBH8zVB5oXwswDIhMYL8WqtnJ3BNDl.jpg',
        referral_code: 'SURADE-RESELLER-592'
      }));
      localStorage.setItem('surade_welcome_modal_closed', 'true');
      localStorage.setItem('hasSeenWelcome', 'true');
      document.querySelectorAll('.welcome-modal, [class*="welcome"], [class*="backdrop"]').forEach(el => el.remove());
    });
  }

  async function snap(url, filename, options = {}) {
    const { scrollY = 0, customFn = null, waitMs = 1800 } = options;
    console.log(`[SNAP] -> ${filename}`);
    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await applyAuth(page);
      await new Promise(r => setTimeout(r, waitMs));
      await applyAuth(page);

      if (customFn) {
        await customFn(page);
        await new Promise(r => setTimeout(r, 600));
      }

      await page.evaluate((y) => window.scrollTo(0, y), scrollY);
      await new Promise(r => setTimeout(r, 600));

      const dest = path.join(outDir, filename);
      await page.screenshot({ path: dest });
      console.log(`[OK] ${filename}`);
    } catch (e) {
      console.error(`[ERR] ${filename}:`, e.message);
    }
  }

  // ══════════════════════════════════════════════
  // MODUL 1: Beranda & Pencarian
  // ══════════════════════════════════════════════
  await snap('http://localhost:5173/', 'panduan_m1_step1_search.png', { scrollY: 0 });
  await snap('http://localhost:5173/', 'panduan_m1_step2_quickcats.png', { scrollY: 850 });
  await snap('http://localhost:5173/', 'panduan_m1_step3_featured.png', { scrollY: 1400 });

  // ══════════════════════════════════════════════
  // MODUL 2: 10 Kategori & Filter 12 Desa
  // ══════════════════════════════════════════════
  await snap('http://localhost:5173/', 'panduan_m2_step1_catgrid.png', { scrollY: 860 });
  
  // Step 2: Open Village dropdown on directory
  await snap('http://localhost:5173/category/all', 'panduan_m2_step2_villagedropdown.png', {
    scrollY: 180,
    customFn: async (p) => {
      await p.evaluate(() => {
        const selects = Array.from(document.querySelectorAll('select, [class*="dropdown"], [class*="filter"]'));
        if (selects.length > 0) selects[0].focus();
      });
    }
  });

  // Step 3: Sorting dropdown on directory
  await snap('http://localhost:5173/category/all', 'panduan_m2_step3_sorting.png', {
    scrollY: 240,
    customFn: async (p) => {
      await p.evaluate(() => {
        const sortSelect = document.querySelector('select:last-of-type, [class*="sort"]');
        if (sortSelect) sortSelect.focus();
      });
    }
  });

  // ══════════════════════════════════════════════
  // MODUL 3: Detail Toko, WhatsApp, Maps & Produk
  // ══════════════════════════════════════════════
  // Step 1: Business Header & Status
  await snap('http://localhost:5173/business/1', 'panduan_m3_step1_header.png', { scrollY: 0, waitMs: 2200 });
  // Step 2: Product Catalog section
  await snap('http://localhost:5173/business/1', 'panduan_m3_step2_products.png', { scrollY: 550, waitMs: 2200 });
  // Step 3: WhatsApp Button & Direct Chat
  await snap('http://localhost:5173/business/1', 'panduan_m3_step3_whatsapp.png', { scrollY: 280, waitMs: 2200 });
  // Step 4: Google Maps & Route
  await snap('http://localhost:5173/business/1', 'panduan_m3_step4_maps.png', { scrollY: 900, waitMs: 2500 });

  // ══════════════════════════════════════════════
  // MODUL 4: Pendaftaran Akun & OTP
  // ══════════════════════════════════════════════
  await snap('http://localhost:5173/register', 'panduan_m4_step1_registerform.png', { scrollY: 0 });
  await snap('http://localhost:5173/register', 'panduan_m4_step2_passwordterms.png', { scrollY: 200 });
  await snap('http://localhost:5173/register', 'panduan_m4_step3_emailotp.png', {
    scrollY: 0,
    customFn: async (p) => {
      await p.evaluate(() => {
        const modalDiv = document.createElement('div');
        modalDiv.className = 'panduan-mock-otp-modal';
        modalDiv.style.position = 'fixed';
        modalDiv.style.inset = '0';
        modalDiv.style.background = 'rgba(15, 23, 42, 0.75)';
        modalDiv.style.backdropFilter = 'blur(6px)';
        modalDiv.style.display = 'flex';
        modalDiv.style.alignItems = 'center';
        modalDiv.style.justifyContent = 'center';
        modalDiv.style.zIndex = '9999';
        modalDiv.innerHTML = `
          <div style="background:#ffffff; border-radius:20px; padding:32px 36px; max-width:440px; width:90%; text-align:center; box-shadow:0 20px 40px rgba(0,0,0,0.3); border:1.5px solid #e2e8f0;">
            <div style="width:56px; height:56px; background:#e6f4f3; color:#007570; border-radius:50%; display:flex; align-items:center; justify-content:center; margin:0 auto 16px; font-size:24px;">🔒</div>
            <h3 style="font-size:1.3rem; font-weight:800; color:#0f172a; margin-bottom:8px;">Verifikasi Kode OTP Email</h3>
            <p style="font-size:0.88rem; color:#64748b; line-height:1.5; margin-bottom:20px;">Kami telah mengirimkan 6 digit kode angka ke email Anda (<strong>user@surade.com</strong>):</p>
            <div style="display:flex; gap:8px; justify-content:center; margin-bottom:20px;">
              <input type="text" value="8" style="width:46px; height:52px; font-size:1.4rem; font-weight:700; text-align:center; border:2px solid #007570; border-radius:10px; background:#f0fdf9;" readonly />
              <input type="text" value="4" style="width:46px; height:52px; font-size:1.4rem; font-weight:700; text-align:center; border:2px solid #007570; border-radius:10px; background:#f0fdf9;" readonly />
              <input type="text" value="9" style="width:46px; height:52px; font-size:1.4rem; font-weight:700; text-align:center; border:2px solid #007570; border-radius:10px; background:#f0fdf9;" readonly />
              <input type="text" value="2" style="width:46px; height:52px; font-size:1.4rem; font-weight:700; text-align:center; border:2px solid #007570; border-radius:10px; background:#f0fdf9;" readonly />
              <input type="text" value="0" style="width:46px; height:52px; font-size:1.4rem; font-weight:700; text-align:center; border:2px solid #007570; border-radius:10px; background:#f0fdf9;" readonly />
              <input type="text" value="1" style="width:46px; height:52px; font-size:1.4rem; font-weight:700; text-align:center; border:2px solid #007570; border-radius:10px; background:#f0fdf9;" readonly />
            </div>
            <button style="width:100%; padding:12px; background:#007570; color:#fff; font-weight:700; border:none; border-radius:12px; font-size:0.95rem; cursor:pointer;">Verifikasi Akun Sekarang</button>
          </div>
        `;
        document.body.appendChild(modalDiv);
      });
    }
  });

  await snap('http://localhost:5173/register', 'panduan_m4_step4_verified.png', {
    scrollY: 0,
    customFn: async (p) => {
      await p.evaluate(() => {
        const modalDiv = document.createElement('div');
        modalDiv.style.position = 'fixed';
        modalDiv.style.inset = '0';
        modalDiv.style.background = 'rgba(15, 23, 42, 0.75)';
        modalDiv.style.backdropFilter = 'blur(6px)';
        modalDiv.style.display = 'flex';
        modalDiv.style.alignItems = 'center';
        modalDiv.style.justifyContent = 'center';
        modalDiv.style.zIndex = '9999';
        modalDiv.innerHTML = `
          <div style="background:#ffffff; border-radius:20px; padding:32px 36px; max-width:440px; width:90%; text-align:center; box-shadow:0 20px 40px rgba(0,0,0,0.3); border:1.5px solid #e2e8f0;">
            <div style="width:64px; height:64px; background:#dcfce7; color:#16a34a; border-radius:50%; display:flex; align-items:center; justify-content:center; margin:0 auto 16px; font-size:32px;">✓</div>
            <h3 style="font-size:1.35rem; font-weight:800; color:#0f172a; margin-bottom:8px;">Akun Berhasil Diverifikasi!</h3>
            <p style="font-size:0.9rem; color:#64748b; line-height:1.5; margin-bottom:20px;">Selamat! Akun Surade.com Anda telah aktif dan siap digunakan untuk mengelola bisnis.</p>
            <button style="width:100%; padding:12px; background:#16a34a; color:#fff; font-weight:700; border:none; border-radius:12px; font-size:0.95rem;">Lanjut ke Dashboard</button>
          </div>
        `;
        document.body.appendChild(modalDiv);
      });
    }
  });

  // ══════════════════════════════════════════════
  // MODUL 5: Login & Navigasi
  // ══════════════════════════════════════════════
  await snap('http://localhost:5173/login', 'panduan_m5_step1_login.png', { scrollY: 60 });
  await snap('http://localhost:5173/forgot-password', 'panduan_m5_step2_forgotpass.png', { scrollY: 60 });
  await snap('http://localhost:5173/dashboard', 'panduan_m5_step3_dashnav.png', { scrollY: 0 });

  // ══════════════════════════════════════════════
  // MODUL 6: Dashboard Overview & Analitik
  // ══════════════════════════════════════════════
  await snap('http://localhost:5173/dashboard', 'panduan_m6_step1_metrics.png', { scrollY: 0 });
  await snap('http://localhost:5173/dashboard', 'panduan_m6_step2_chart.png', { scrollY: 180 });
  await snap('http://localhost:5173/dashboard', 'panduan_m6_step3_banner.png', { scrollY: 0 });

  // ══════════════════════════════════════════════
  // MODUL 7: Tambah Bisnis & Pin Map
  // ══════════════════════════════════════════════
  await snap('http://localhost:5173/dashboard?tab=businesses', 'panduan_m7_step1_bizlist.png', { scrollY: 0 });
  await snap('http://localhost:5173/add-business', 'panduan_m7_step2_form.png', { scrollY: 0 });
  await snap('http://localhost:5173/add-business', 'panduan_m7_step3_mappin.png', { scrollY: 450 });
  await snap('http://localhost:5173/dashboard?tab=businesses', 'panduan_m7_step4_activelist.png', { scrollY: 0 });

  // ══════════════════════════════════════════════
  // MODUL 8: Jam Operasional
  // ══════════════════════════════════════════════
  await snap('http://localhost:5173/dashboard?tab=businesses', 'panduan_m8_step1_editbtn.png', { scrollY: 0 });
  await snap('http://localhost:5173/dashboard?tab=businesses', 'panduan_m8_step2_schedule.png', { scrollY: 200 });
  await snap('http://localhost:5173/dashboard?tab=businesses', 'panduan_m8_step3_closeddays.png', { scrollY: 300 });
  await snap('http://localhost:5173/business/1', 'panduan_m8_step4_statusbadge.png', { scrollY: 180 });

  // ══════════════════════════════════════════════
  // MODUL 9: Katalog Produk & Harga
  // ══════════════════════════════════════════════
  await snap('http://localhost:5173/dashboard?tab=businesses', 'panduan_m9_step1_prodtab.png', { scrollY: 0 });
  await snap('http://localhost:5173/dashboard?tab=businesses', 'panduan_m9_step2_photo.png', { scrollY: 320 });
  await snap('http://localhost:5173/dashboard?tab=businesses', 'panduan_m9_step3_priceform.png', { scrollY: 420 });
  await snap('http://localhost:5173/business/1', 'panduan_m9_step4_prodlist.png', { scrollY: 600 });

  // ══════════════════════════════════════════════
  // MODUL 10: Upgrade Centang Emas & QRIS
  // ══════════════════════════════════════════════
  await snap('http://localhost:5173/pricing', 'panduan_m10_step1_plans.png', { scrollY: 180 });
  await snap('http://localhost:5173/pricing', 'panduan_m10_step2_coupon.png', { scrollY: 450 });
  await snap('http://localhost:5173/pricing', 'panduan_m10_step3_qris.png', {
    scrollY: 80,
    customFn: async (p) => {
      await p.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const btn = btns.find(b => b.textContent.includes('Pilih') || b.textContent.includes('Upgrade') || b.textContent.includes('Langganan'));
        if (btn) btn.click();
      });
    }
  });
  await snap('http://localhost:5173/business/1', 'panduan_m10_step4_goldbadge.png', { scrollY: 100 });

  // ══════════════════════════════════════════════
  // MODUL 11: Inbox Chat
  // ══════════════════════════════════════════════
  await snap('http://localhost:5173/dashboard?tab=inbox', 'panduan_m11_step1_chatlist.png', { scrollY: 0 });
  await snap('http://localhost:5173/dashboard?tab=inbox', 'panduan_m11_step2_chatview.png', { scrollY: 100 });
  await snap('http://localhost:5173/dashboard?tab=inbox', 'panduan_m11_step3_replybox.png', { scrollY: 200 });

  // ══════════════════════════════════════════════
  // MODUL 12: Iklan Banner
  // ══════════════════════════════════════════════
  await snap('http://localhost:5173/dashboard?tab=dashboard', 'panduan_m12_step1_adstab.png', { scrollY: 0 });
  await snap('http://localhost:5173/dashboard?tab=dashboard', 'panduan_m12_step2_slots.png', { scrollY: 180 });
  await snap('http://localhost:5173/dashboard?tab=dashboard', 'panduan_m12_step3_upload.png', { scrollY: 280 });
  await snap('http://localhost:5173/dashboard?tab=dashboard', 'panduan_m12_step4_stats.png', { scrollY: 400 });

  // ══════════════════════════════════════════════
  // MODUL 13: Referral & Komisi
  // ══════════════════════════════════════════════
  await snap('http://localhost:5173/dashboard?tab=referrals', 'panduan_m13_step1_reflink.png', { scrollY: 0 });
  await snap('http://localhost:5173/dashboard?tab=referrals', 'panduan_m13_step2_qrcode.png', { scrollY: 120 });
  await snap('http://localhost:5173/dashboard?tab=referrals', 'panduan_m13_step3_balance.png', { scrollY: 220 });
  await snap('http://localhost:5173/dashboard?tab=referrals', 'panduan_m13_step4_withdraw.png', { scrollY: 340 });

  // ══════════════════════════════════════════════
  // MODUL 14: Ulasan & Bookmark
  // ══════════════════════════════════════════════
  await snap('http://localhost:5173/business/1', 'panduan_m14_step1_reviews.png', { scrollY: 800 });
  await snap('http://localhost:5173/business/1', 'panduan_m14_step2_reply.png', { scrollY: 950 });
  await snap('http://localhost:5173/dashboard?tab=saved', 'panduan_m14_step3_saved.png', { scrollY: 0 });

  // ══════════════════════════════════════════════
  // MODUL 15: Blog, Smart City & CS
  // ══════════════════════════════════════════════
  await snap('http://localhost:5173/berita', 'panduan_m15_step1_blog.png', { scrollY: 180 });
  await snap('http://localhost:5173/smart-city', 'panduan_m15_step2_smartcity.png', { scrollY: 220 });
  await snap('http://localhost:5173/dashboard?tab=settings', 'panduan_m15_step3_profile.png', { scrollY: 0 });
  await snap('http://localhost:5173/contact', 'panduan_m15_step4_cs.png', { scrollY: 160 });

  await browser.close();
  console.log('=== ALL UNIQUE STEP SCREENSHOTS CREATED SUCCESSFULLY! ===');
}

generateAllUniqueShots().catch(console.error);
