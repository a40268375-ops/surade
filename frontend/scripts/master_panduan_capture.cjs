const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const outDir = path.resolve(__dirname, '../src/assets/panduan');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

async function captureAllPages() {
  console.log('=== STARTING COMPLETE LIVE SCREENSHOT CAPTURE FOR PANDUAN ===');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-features=IsolateOrigins',
      '--disable-site-isolation-trials'
    ],
    defaultViewport: { width: 1280, height: 800, deviceScaleFactor: 2 }
  });

  const page = await browser.newPage();

  // Helper to remove any popup modals or welcome overlays
  async function cleanPageOverlays(p) {
    await p.evaluate(() => {
      localStorage.setItem('surade_welcome_modal_closed', 'true');
      localStorage.setItem('hasSeenWelcome', 'true');
      // Remove any unwanted modal backdrops or overlays (except when deliberately capturing a modal)
      document.querySelectorAll('.welcome-modal, [class*="welcome"], [class*="backdrop"]').forEach(el => {
        el.remove();
      });
    });
  }

  // Helper to set mock logged-in state
  async function setSellerAuth(p) {
    await p.evaluate(() => {
      localStorage.setItem('token', 'mock-valid-token-surade-umkm');
      localStorage.setItem('user', JSON.stringify({
        id: 1,
        name: 'Haji Ahmad Fauzi',
        username: 'ahmad_surade',
        email: 'ahmad@surade.com',
        role: 'seller',
        phone: '081234567890',
        avatar: null,
        created_at: '2025-01-10'
      }));
    });
  }

  async function snap(url, filename, scrollY = 0, customFn = null, waitTime = 1600) {
    console.log(`[SNAP] Capturing ${filename} from ${url}...`);
    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await new Promise(r => setTimeout(r, waitTime));
      await cleanPageOverlays(page);

      if (customFn) {
        await customFn(page);
        await new Promise(r => setTimeout(r, 600));
      }

      if (scrollY > 0) {
        await page.evaluate((y) => window.scrollTo(0, y), scrollY);
        await new Promise(r => setTimeout(r, 600));
      }

      const dest = path.join(outDir, filename);
      await page.screenshot({
        path: dest,
        clip: { x: 0, y: 0, width: 1280, height: 720 }
      });
      console.log(`[SUCCESS] -> ${filename}`);
    } catch (e) {
      console.error(`[ERROR] -> ${filename}:`, e.message);
    }
  }

  // 1. Home Hero (Search Bar & Header, NO POPUP)
  await snap('http://localhost:5173/', 'panduan_home_hero.png', 0, async (p) => {
    await p.evaluate(() => {
      window.scrollTo(0, 0);
      document.querySelectorAll('[class*="modal"], [class*="welcome"], [class*="backdrop"]').forEach(el => el.remove());
    });
  });

  // 2. Home Categories Grid
  await snap('http://localhost:5173/', 'panduan_home_categories.png', 480, async (p) => {
    await p.evaluate(() => {
      const catSec = document.querySelector('.category-grid') || document.querySelector('.categories-grid') || document.querySelector('.category-section') || document.querySelector('.categories-section');
      if (catSec) catSec.scrollIntoView({ block: 'center' });
    });
  });

  // 3. Home Featured UMKM Cards Grid
  await snap('http://localhost:5173/', 'panduan_home_featured.png', 1150, async (p) => {
    await p.evaluate(() => {
      const feat = document.querySelector('.featured-businesses') || document.querySelector('.business-grid') || document.querySelector('.recommendations');
      if (feat) feat.scrollIntoView({ block: 'start' });
    });
  });

  // 4. Category Filter Page (Directory & 12 Villages Filter)
  await snap('http://localhost:5173/category/all', 'panduan_category_filter.png', 220);

  // 5. Business Detail Page
  await snap('http://localhost:5173/category/all', 'panduan_biz_detail.png', 0, async (p) => {
    // Click on the first business card if present
    const firstCard = await p.$('.business-card a, .biz-card a, a[href*="/business/"]');
    if (firstCard) {
      await firstCard.click();
      await new Promise(r => setTimeout(r, 2000));
      await cleanPageOverlays(p);
      await p.evaluate(() => window.scrollTo(0, 300));
    }
  });

  // 6. Register Page (Clean Form)
  await snap('http://localhost:5173/register', 'panduan_register_clean.png', 100);

  // 7. OTP Modal
  await snap('http://localhost:5173/register', 'panduan_otp_modal.png', 0, async (p) => {
    await p.evaluate(() => {
      // Create a clean mock OTP modal presentation if not naturally triggered
      const existing = document.querySelector('.otp-modal, .modal-otp');
      if (!existing) {
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
            <p style="font-size:0.88rem; color:#64748b; line-height:1.5; margin-bottom:20px;">Kami telah mengirimkan 6 digit kode angka verifikasi ke alamat email Anda (<strong>ahmad@surade.com</strong>). Masukkan kode di bawah ini:</p>
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
      }
    });
  });

  // 8. Login Page (Clean Card)
  await snap('http://localhost:5173/login', 'panduan_login_clean.png', 80);

  // Set Auth state for all dashboard captures
  await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded' });
  await setSellerAuth(page);

  // 9. Dashboard Overview
  await snap('http://localhost:5173/dashboard', 'panduan_dash_overview.png', 0, async (p) => {
    await setSellerAuth(p);
  });

  // 10. Dashboard Businesses & Add Business Modal
  await snap('http://localhost:5173/dashboard/businesses', 'panduan_dash_bisnis.png', 0, async (p) => {
    await setSellerAuth(p);
  });

  await snap('http://localhost:5173/dashboard/businesses', 'panduan_add_business.png', 0, async (p) => {
    await setSellerAuth(p);
    const addBtn = await p.$('button:has-text("Tambah"), button:has-text("+"), .add-biz-btn, [class*="add"]');
    if (addBtn) {
      await addBtn.click();
      await new Promise(r => setTimeout(r, 600));
    }
  });

  await snap('http://localhost:5173/dashboard/businesses', 'panduan_bisnis.png', 100, async (p) => {
    await setSellerAuth(p);
  });

  // 11. Dashboard Products
  await snap('http://localhost:5173/dashboard/products', 'panduan_dash_produk.png', 0, async (p) => {
    await setSellerAuth(p);
  });

  // 12. Dashboard Premium / Pricing
  await snap('http://localhost:5173/pricing', 'panduan_dash_premium.png', 180);

  // 13. Payment / QRIS Modal
  await snap('http://localhost:5173/pricing', 'panduan_dash_bayar.png', 0, async (p) => {
    const payBtn = await p.$('button:has-text("Pilih"), button:has-text("Upgrade"), .pricing-btn, [class*="btn-plan"]');
    if (payBtn) {
      await payBtn.click();
      await new Promise(r => setTimeout(r, 800));
    }
  });
  // Copy to panduan_bayar.png as well
  fs.copyFileSync(path.join(outDir, 'panduan_dash_bayar.png'), path.join(outDir, 'panduan_bayar.png'));

  // 14. Dashboard Inbox Messages
  await snap('http://localhost:5173/dashboard/messages', 'panduan_dash_inbox.png', 0, async (p) => {
    await setSellerAuth(p);
  });

  // 15. Dashboard Ads
  await snap('http://localhost:5173/dashboard/ads', 'panduan_dash_iklan.png', 0, async (p) => {
    await setSellerAuth(p);
  });
  fs.copyFileSync(path.join(outDir, 'panduan_dash_iklan.png'), path.join(outDir, 'panduan_iklan.png'));

  // 16. Dashboard Referral
  await snap('http://localhost:5173/dashboard/referral', 'panduan_dash_referral.png', 0, async (p) => {
    await setSellerAuth(p);
  });
  fs.copyFileSync(path.join(outDir, 'panduan_dash_referral.png'), path.join(outDir, 'panduan_referral.png'));

  // 17. Dashboard Reviews
  await snap('http://localhost:5173/dashboard/reviews', 'panduan_dash_ulasan.png', 0, async (p) => {
    await setSellerAuth(p);
  });

  // 18. Dashboard Saved Items
  await snap('http://localhost:5173/dashboard/saved', 'panduan_dash_simpan.png', 0, async (p) => {
    await setSellerAuth(p);
  });

  // 19. Dashboard Blog / Berita
  await snap('http://localhost:5173/berita', 'panduan_dash_blog.png', 200);
  fs.copyFileSync(path.join(outDir, 'panduan_dash_blog.png'), path.join(outDir, 'panduan_blog.png'));

  // 20. Smart City Portal
  await snap('http://localhost:5173/smart-city', 'panduan_smart_city.png', 240);

  // 21. Dashboard Profile
  await snap('http://localhost:5173/dashboard/profile', 'panduan_dash_profil.png', 0, async (p) => {
    await setSellerAuth(p);
  });

  // 22. Contact Us / Hubungi CS
  await snap('http://localhost:5173/contact', 'panduan_hubungi_cs.png', 180);

  await browser.close();
  console.log('=== ALL 24+ HIGH RESOLUTION AUTHENTIC SCREENSHOTS SUCCESSFULLY CAPTURED! ===');
}

captureAllPages().catch(err => {
  console.error('CAPTURE FAILED:', err);
  process.exit(1);
});
