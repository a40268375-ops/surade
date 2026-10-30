const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const outDir = path.resolve(__dirname, '../src/assets/panduan');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

async function run() {
  console.log('Launching browser to capture fresh live screenshots...');
  const browser = await puppeteer.launch({
    headless: 'new',
    defaultViewport: { width: 1280, height: 800, deviceScaleFactor: 2 }
  });

  const page = await browser.newPage();

  async function capture(url, filename, action = null, waitMs = 1500) {
    console.log(`Navigating to ${url} for ${filename}...`);
    try {
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 25000 });
      await new Promise(r => setTimeout(r, waitMs));

      if (action) {
        await action(page);
        await new Promise(r => setTimeout(r, 600));
      }

      const filePath = path.join(outDir, filename);
      await page.screenshot({
        path: filePath,
        clip: { x: 0, y: 0, width: 1280, height: 720 }
      });
      console.log(`[SUCCESS] Saved ${filename}`);
    } catch (err) {
      console.error(`[ERROR] Failed ${filename}:`, err.message);
    }
  }

  // 1. Home Hero & Search
  await capture('http://localhost:5173/', 'panduan_home_hero.png', async (p) => {
    await p.evaluate(() => window.scrollTo(0, 0));
  });

  // 1.2 Home Featured
  await capture('http://localhost:5173/', 'panduan_home_featured.png', async (p) => {
    await p.evaluate(() => window.scrollTo(0, 950));
  });

  // 2. Home Categories
  await capture('http://localhost:5173/', 'panduan_home_categories.png', async (p) => {
    await p.evaluate(() => window.scrollTo(0, 480));
  });

  // 2.2 Category & Desa filter
  await capture('http://localhost:5173/category/all', 'panduan_category_filter.png', async (p) => {
    await p.evaluate(() => window.scrollTo(0, 180));
  });

  // 3. Biz detail
  await capture('http://localhost:5173/business/1', 'panduan_biz_detail.png', async (p) => {
    await p.evaluate(() => window.scrollTo(0, 100));
  });

  // 4. Register
  await capture('http://localhost:5173/register', 'panduan_register_clean.png', async (p) => {
    await p.evaluate(() => window.scrollTo(0, 0));
  });

  // 4.2 Verify OTP
  await capture('http://localhost:5173/verify-otp', 'panduan_otp_modal.png', async (p) => {
    await p.evaluate(() => window.scrollTo(0, 0));
  });

  // 5. Login
  await capture('http://localhost:5173/login', 'panduan_login_clean.png', async (p) => {
    await p.evaluate(() => window.scrollTo(0, 0));
  });

  // Perform actual login on the page to populate localStorage with real user token
  try {
    console.log('Logging in to capture dashboard screenshots...');
    await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle2' });
    await page.type('input[type="email"], input[name="email"], #email', 'user@surade.com');
    await page.type('input[type="password"], input[name="password"], #password', 'password');
    await page.click('button[type="submit"]');
    await new Promise(r => setTimeout(r, 2000));
  } catch (e) {
    console.log('Auto login notice:', e.message);
  }

  // 6. Dashboard Overview
  await capture('http://localhost:5173/dashboard', 'panduan_dash_overview.png', async (p) => {
    await p.evaluate(() => window.scrollTo(0, 0));
  });

  // 7. Add business / business management
  await capture('http://localhost:5173/dashboard/businesses', 'panduan_add_business.png');
  await capture('http://localhost:5173/dashboard/businesses', 'panduan_dash_bisnis.png');
  await capture('http://localhost:5173/dashboard/businesses', 'panduan_bisnis.png');

  // 9. Products
  await capture('http://localhost:5173/dashboard/products', 'panduan_dash_produk.png');

  // 10. Premium upgrade & payment
  await capture('http://localhost:5173/pricing', 'panduan_dash_premium.png');
  await capture('http://localhost:5173/premium-upgrade', 'panduan_dash_bayar.png');

  // 11. Inbox
  await capture('http://localhost:5173/dashboard/messages', 'panduan_dash_inbox.png');

  // 12. Ads
  await capture('http://localhost:5173/dashboard/ads', 'panduan_dash_iklan.png');

  // 13. Referral
  await capture('http://localhost:5173/dashboard/referral', 'panduan_dash_referral.png');

  // 14. Reviews & Saved
  await capture('http://localhost:5173/dashboard/reviews', 'panduan_dash_ulasan.png');
  await capture('http://localhost:5173/dashboard/saved', 'panduan_dash_simpan.png');

  // 15. Blog, Smart City, Profile, Contact
  await capture('http://localhost:5173/blog', 'panduan_dash_blog.png');
  await capture('http://localhost:5173/smart-city/surade', 'panduan_smart_city.png');
  await capture('http://localhost:5173/dashboard/profile', 'panduan_dash_profil.png');
  await capture('http://localhost:5173/contact', 'panduan_hubungi_cs.png');

  await browser.close();
  console.log('DONE! All live screenshots refreshed.');
}

run().catch(console.error);
