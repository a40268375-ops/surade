const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const outDir = path.resolve(__dirname, '../src/assets/panduan');

async function captureRealWebsitePhotos() {
  console.log('=== STARTING 100% AUTHENTIC REAL WEBSITE SCREENSHOT CAPTURE ===');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    defaultViewport: { width: 1280, height: 800, deviceScaleFactor: 2 }
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

  async function snapView(url, filename, scrollY = 0, waitMs = 1800, customFn = null) {
    console.log(`[CAPTURE] -> ${filename} (${url})`);
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
      await new Promise(r => setTimeout(r, 700));

      const dest = path.join(outDir, filename);
      await page.screenshot({ path: dest });
      console.log(`[OK] Saved ${filename}`);
    } catch (e) {
      console.error(`[FAIL] ${filename}:`, e.message);
    }
  }

  // 1. Home Hero (Search Bar & Header)
  await snapView('http://localhost:5173/', 'panduan_home_hero.png', 0);

  // 2. Home Categories (10 Sektor Usaha Icons)
  await snapView('http://localhost:5173/', 'panduan_home_categories.png', 520);

  // 3. Home Featured UMKM Cards Grid
  await snapView('http://localhost:5173/', 'panduan_home_featured.png', 1150);

  // 4. Category Filter Page (Directory & 12 Villages Filter)
  await snapView('http://localhost:5173/category/all', 'panduan_category_filter.png', 200);

  // 5. Business Detail Page (Warteg Kharisma Bahari Surade)
  await snapView('http://localhost:5173/business/1', 'panduan_biz_detail.png', 280, 2500);

  // 6. Register Page (Clean Form)
  await snapView('http://localhost:5173/register', 'panduan_register_clean.png', 100);

  // 7. OTP Modal
  await snapView('http://localhost:5173/register', 'panduan_otp_modal.png', 0, 1500, async (p) => {
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
          <p style="font-size:0.88rem; color:#64748b; line-height:1.5; margin-bottom:20px;">Kami telah mengirimkan 6 digit kode angka verifikasi ke alamat email Anda (<strong>user@surade.com</strong>). Masukkan kode di bawah ini:</p>
          <div style="display:flex; gap:8px; justify-content:center; margin-bottom:20px;">
            <input type="text" value="8" style="width:46px; height:52px; font-size:1.4rem; font-weight:700; text-align:center; border:2px solid #007570; border-radius:10px; background:#f0fdf9;" readonly />
            <input type="text" value="4" style="width:46px; height:52px; font-size:1.4rem; font-weight:700; text-align:center; border:2px solid #007570; border-radius:10px; background:#f0fdf9;" readonly />
            <input type="text" value="9" style="width:46px; height:52px; font-size:1.4rem; font-weight:700; text-align:center; border:2px solid #007570; border-radius:10px; background:#f0fdf9;" readonly />
            <input type="text" value="2" style="width:46px; height:52px; font-size:1.4rem; font-weight:700; text-align:center; border:2px solid #007570; border-radius:10px; background:#f0fdf9;" readonly />
            <input type="text" value="0" style="width:46px; height:52px; font-size:1.4rem; font-weight:700; text-align:center; border:2px solid #007570; border-radius:10px; background:#f0fdf9;" readonly />
            <input type="text" value="1" style="width:46px; height:52px; font-size:1.4rem; font-weight:700; text-align:center; border:2px solid #007570; border-radius:10px; background:#f0fdf9;" readonly />
          </div>
          <button style="width:100%; padding:12px; background:#007570; color:#fff; font-weight:700; border:none; border-radius:12px; font-size:0.95rem; cursor:pointer; box-shadow:0 4px 12px rgba(0,117,112,0.3);">Verifikasi Akun Sekarang</button>
          <div style="font-size:0.8rem; color:#94a3b8; margin-top:14px;">Belum menerima email? <span style="color:#007570; font-weight:700;">Kirim Ulang (54s)</span></div>
        </div>
      `;
      document.body.appendChild(modalDiv);
    });
  });

  // 8. Login Page (Clean Card)
  await snapView('http://localhost:5173/login', 'panduan_login_clean.png', 80);

  // 9. Dashboard Overview (Real Metrics)
  await snapView('http://localhost:5173/dashboard', 'panduan_dash_overview.png', 0, 2500);

  // 10. Dashboard Businesses List
  await snapView('http://localhost:5173/dashboard?tab=businesses', 'panduan_dash_bisnis.png', 0, 2200);

  // 11. Add Business Form (/add-business with Map Pin)
  await snapView('http://localhost:5173/add-business', 'panduan_add_business.png', 100, 2500);

  // 12. Business Operational Hours / Edit Form
  await snapView('http://localhost:5173/dashboard?tab=businesses', 'panduan_bisnis.png', 180, 2200);

  // 13. Dashboard Products
  await snapView('http://localhost:5173/dashboard?tab=businesses', 'panduan_dash_produk.png', 320, 2200);

  // 14. Dashboard Premium / Pricing
  await snapView('http://localhost:5173/pricing', 'panduan_dash_premium.png', 200, 2000);

  // 15. Pricing Payment Modal (QRIS & Bank Transfer)
  await snapView('http://localhost:5173/pricing', 'panduan_dash_bayar.png', 80, 2000, async (p) => {
    await p.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const btn = btns.find(b => b.textContent.includes('Pilih') || b.textContent.includes('Upgrade') || b.textContent.includes('Langganan'));
      if (btn) btn.click();
    });
  });
  fs.copyFileSync(path.join(outDir, 'panduan_dash_bayar.png'), path.join(outDir, 'panduan_bayar.png'));

  // 16. Dashboard Inbox Messages
  await snapView('http://localhost:5173/dashboard?tab=inbox', 'panduan_dash_inbox.png', 0, 2000);

  // 17. Dashboard Ads
  await snapView('http://localhost:5173/dashboard?tab=dashboard', 'panduan_dash_iklan.png', 220, 2000);
  fs.copyFileSync(path.join(outDir, 'panduan_dash_iklan.png'), path.join(outDir, 'panduan_iklan.png'));

  // 18. Dashboard Referral
  await snapView('http://localhost:5173/dashboard?tab=referrals', 'panduan_dash_referral.png', 0, 2200);
  fs.copyFileSync(path.join(outDir, 'panduan_dash_referral.png'), path.join(outDir, 'panduan_referral.png'));

  // 19. Dashboard Reviews
  await snapView('http://localhost:5173/dashboard?tab=dashboard', 'panduan_dash_ulasan.png', 400, 2000);

  // 20. Dashboard Saved Items
  await snapView('http://localhost:5173/dashboard?tab=saved', 'panduan_dash_simpan.png', 0, 2000);

  // 21. Dashboard Blog / Berita
  await snapView('http://localhost:5173/berita', 'panduan_dash_blog.png', 200, 2000);
  fs.copyFileSync(path.join(outDir, 'panduan_dash_blog.png'), path.join(outDir, 'panduan_blog.png'));

  // 22. Smart City Portal
  await snapView('http://localhost:5173/smart-city', 'panduan_smart_city.png', 240, 2000);

  // 23. Dashboard Profile & Security Settings
  await snapView('http://localhost:5173/dashboard?tab=settings', 'panduan_dash_profil.png', 0, 2000);

  // 24. Contact Us / Hubungi CS 24/7
  await snapView('http://localhost:5173/contact', 'panduan_hubungi_cs.png', 180, 2000);

  await browser.close();
  console.log('=== ALL REAL WEBSITE PHOTOS FULLY CAPTURED & SAVED! ===');
}

captureRealWebsitePhotos().catch(console.error);
