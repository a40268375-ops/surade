const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const outDir = path.resolve('c:/laragon/www/Surade/frontend/src/assets/panduan');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

async function captureAll() {
  console.log('Starting high-precision screenshot capture...');
  const browser = await puppeteer.launch({
    headless: 'new',
    defaultViewport: { width: 1280, height: 800, deviceScaleFactor: 2 },
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  // Helper function to capture a specific element or scroll position
  async function takeSnap(url, filename, setupFn = null) {
    console.log(`[CAPTURE] ${filename} from ${url}`);
    try {
      await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
      await new Promise(r => setTimeout(r, 1500));

      if (setupFn) {
        await setupFn(page);
        await new Promise(r => setTimeout(r, 800));
      }

      const filePath = path.join(outDir, filename);
      await page.screenshot({
        path: filePath,
        clip: { x: 0, y: 0, width: 1280, height: 720 }
      });
      console.log(`[SUCCESS] -> ${filename}`);
    } catch (e) {
      console.error(`[FAILED] -> ${filename}:`, e.message);
    }
  }

  // 1. Home Hero (Search & Title)
  await takeSnap('http://localhost:5173/', 'panduan_home_hero.png', async (p) => {
    await p.evaluate(() => window.scrollTo(0, 0));
  });

  // 1.2 Home Featured / Rekomendasi UMKM Unggulan
  await takeSnap('http://localhost:5173/', 'panduan_home_featured.png', async (p) => {
    await p.evaluate(() => {
      const el = document.querySelector('.featured-businesses') || document.querySelector('.business-grid') || document.querySelector('section:nth-of-type(2)');
      if (el) el.scrollIntoView({ block: 'center' });
      else window.scrollTo(0, 1100);
    });
  });

  // 2.1 Home Categories Grid (10 Sektor Usaha)
  await takeSnap('http://localhost:5173/', 'panduan_home_categories.png', async (p) => {
    await p.evaluate(() => {
      const el = document.querySelector('.category-section') || document.querySelector('.categories-grid') || document.querySelector('.category-grid');
      if (el) el.scrollIntoView({ block: 'center' });
      else window.scrollTo(0, 560);
    });
  });

  // 2.2 Category Listing with Desa Filter
  await takeSnap('http://localhost:5173/category/all', 'panduan_category_filter.png', async (p) => {
    await p.evaluate(() => window.scrollTo(0, 150));
  });

  // 3. Biz Detail with WhatsApp Button
  await takeSnap('http://localhost:5173/business/1', 'panduan_biz_detail.png', async (p) => {
    await p.evaluate(() => window.scrollTo(0, 80));
  });

  // 4.1 Register Page
  await takeSnap('http://localhost:5173/register', 'panduan_register_clean.png', async (p) => {
    await p.evaluate(() => window.scrollTo(0, 0));
  });

  // 4.2 Verify OTP Page
  await takeSnap('http://localhost:5173/verify-otp', 'panduan_otp_modal.png', async (p) => {
    await p.evaluate(() => window.scrollTo(0, 0));
  });

  // 5. Login Page
  await takeSnap('http://localhost:5173/login', 'panduan_login_clean.png', async (p) => {
    await p.evaluate(() => window.scrollTo(0, 0));
  });

  // Perform Login to get authenticated dashboard view
  console.log('Logging in to capture User Dashboard pages...');
  try {
    await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 1000));
    await page.evaluate(() => {
      const inputs = document.querySelectorAll('input');
      inputs.forEach(input => {
        if (input.type === 'email' || input.name === 'email') input.value = 'user@surade.com';
        if (input.type === 'password' || input.name === 'password') input.value = 'password';
        input.dispatchEvent(new Event('input', { bubbles: true }));
      });
      const submitBtn = document.querySelector('button[type="submit"]');
      if (submitBtn) submitBtn.click();
    });
    await new Promise(r => setTimeout(r, 2500));
  } catch (e) {
    console.log('Login attempt note:', e.message);
  }

  // 6. Dashboard Overview
  await takeSnap('http://localhost:5173/dashboard', 'panduan_dash_overview.png', async (p) => {
    await p.evaluate(() => window.scrollTo(0, 0));
  });

  // 7.1 Add Business form
  await takeSnap('http://localhost:5173/dashboard/businesses', 'panduan_add_business.png', async (p) => {
    await p.evaluate(() => {
      const btn = document.querySelector('.add-business-btn') || document.querySelector('button.btn-primary');
      if (btn) btn.click();
    });
  });

  // 7.2 Businesses Management Tab
  await takeSnap('http://localhost:5173/dashboard/businesses', 'panduan_dash_bisnis.png');

  // 8. Business Edit & Operational Hours
  await takeSnap('http://localhost:5173/dashboard/businesses', 'panduan_bisnis.png', async (p) => {
    await p.evaluate(() => window.scrollTo(0, 100));
  });

  // 9. Products Tab
  await takeSnap('http://localhost:5173/dashboard/products', 'panduan_dash_produk.png');

  // 10.1 Pricing & Centang Emas
  await takeSnap('http://localhost:5173/pricing', 'panduan_dash_premium.png');

  // 10.2 Premium Upgrade Checkout / Payment
  await takeSnap('http://localhost:5173/premium-upgrade', 'panduan_dash_bayar.png');

  // 11. Inbox Chat
  await takeSnap('http://localhost:5173/dashboard/messages', 'panduan_dash_inbox.png');

  // 12. Ads Management
  await takeSnap('http://localhost:5173/dashboard/ads', 'panduan_dash_iklan.png');

  // 13. Referral & Commission
  await takeSnap('http://localhost:5173/dashboard/referral', 'panduan_dash_referral.png');

  // 14.1 Reviews Tab
  await takeSnap('http://localhost:5173/dashboard/reviews', 'panduan_dash_ulasan.png');

  // 14.2 Saved / Bookmarks Tab
  await takeSnap('http://localhost:5173/dashboard/saved', 'panduan_dash_simpan.png');

  // 15.1 Blog Page
  await takeSnap('http://localhost:5173/blog', 'panduan_dash_blog.png');

  // 15.2 Smart City 12 Desa
  await takeSnap('http://localhost:5173/smart-city/surade', 'panduan_smart_city.png');

  // 15.3 Profile Settings
  await takeSnap('http://localhost:5173/dashboard/profile', 'panduan_dash_profil.png');

  // 15.4 Contact Page
  await takeSnap('http://localhost:5173/contact', 'panduan_hubungi_cs.png');

  await browser.close();
  console.log('ALL PRECISE SCREENSHOTS CAPTURED!');
}

captureAll().catch(console.error);
