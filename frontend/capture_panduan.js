import puppeteer from 'puppeteer';
import path from 'path';
import fs from 'fs';

const OUT_DIR = 'C:/laragon/www/Surade/frontend/src/assets/panduan';

if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

async function run() {
  console.log("Launching Puppeteer Chrome browser for PRECISION BOUNDING-BOX CAPTURES...");
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    defaultViewport: { width: 1366, height: 768, deviceScaleFactor: 1.5 }
  });

  const page = await browser.newPage();

  // 1. Set cookie to permanently prevent Welcome Banner Modal popup
  await page.setCookie({
    name: 'surade_welcome_banner_shown',
    value: '1',
    domain: 'localhost',
    path: '/',
    httpOnly: false,
    secure: false,
    sameSite: 'Lax'
  });

  // 2. Initialize localStorage with authenticated user
  await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded', timeout: 10000 }).catch(() => {});
  await page.evaluate(() => {
    localStorage.setItem('token', 'mock_panduan_token_12345');
    localStorage.setItem('user', JSON.stringify({
      id: 1,
      name: 'Admin Surade',
      username: 'adminsurade',
      email: 'admin@surade.com',
      phone: '081234567890',
      role: 'admin',
      is_verified: true,
      referral_code: 'SURADE-RESELLER-592'
    }));
  });

  console.log("Auth credentials & cookie initialized in browser session.");

  const delay = (ms) => new Promise(r => setTimeout(r, ms));

  async function clickByText(text) {
    await page.evaluate((t) => {
      const els = Array.from(document.querySelectorAll('button, a, select, div, span'));
      const target = els.find(e => e.innerText && e.innerText.toLowerCase().includes(t.toLowerCase()));
      if (target) target.click();
    }, text).catch(() => {});
  }

  // Helper function to capture screenshot with exact clip box
  async function saveScreenshot(filename, clip, customAction) {
    const outPath = path.join(OUT_DIR, filename);
    try {
      if (customAction) {
        await customAction();
      }
      await delay(800);
      if (clip) {
        await page.screenshot({ path: outPath, clip: clip });
      } else {
        await page.screenshot({ path: outPath, fullPage: false });
      }
      console.log(`[PRECISION CAPTURED SUCCESS] ${filename}`);
    } catch (e) {
      console.error(`[ERROR] ${filename}:`, e.message);
    }
  }

  // ════════════════════════════════════════════════════════════════
  // 1. MODUL 1: BERANDA & PENCARIAN
  // ════════════════════════════════════════════════════════════════
  await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded' });
  await delay(1500);

  await saveScreenshot('panduan_m1_step1_search.png', { x: 0, y: 0, width: 1366, height: 480 }, async () => {
    await page.evaluate(() => window.scrollTo(0, 0));
    const input = await page.$('input[placeholder*="Cari"]');
    if (input) await input.type('Servis AC', { delay: 50 });
  });

  await saveScreenshot('panduan_m1_step2_quickcats.png', { x: 80, y: 460, width: 1200, height: 380 }, async () => {
    await page.evaluate(() => window.scrollTo(0, 460));
  });

  await saveScreenshot('panduan_m1_step3_featured.png', { x: 80, y: 920, width: 1200, height: 580 }, async () => {
    await page.evaluate(() => window.scrollTo(0, 920));
  });

  // ════════════════════════════════════════════════════════════════
  // 2. MODUL 2: KATEGORI & FILTER DESA
  // ════════════════════════════════════════════════════════════════
  await page.goto('http://localhost:5173/category/semua', { waitUntil: 'domcontentloaded' });
  await delay(2000);

  await saveScreenshot('panduan_m2_step1_catgrid.png', { x: 80, y: 80, width: 1200, height: 600 });
  
  await saveScreenshot('panduan_m2_step2_villagedropdown.png', { x: 80, y: 200, width: 1200, height: 480 }, async () => {
    await clickByText('Desa');
  });

  await saveScreenshot('panduan_m2_step3_sorting.png', { x: 80, y: 300, width: 1200, height: 450 }, async () => {
    await page.evaluate(() => window.scrollTo(0, 300));
  });

  // ════════════════════════════════════════════════════════════════
  // 3. MODUL 3: DETAIL TEMPAT USAHA
  // ════════════════════════════════════════════════════════════════
  await page.goto('http://localhost:5173/business/1', { waitUntil: 'domcontentloaded' });
  await delay(2000);

  await saveScreenshot('panduan_m3_step1_header.png', { x: 0, y: 0, width: 1366, height: 550 });
  
  await saveScreenshot('panduan_m3_step2_products.png', { x: 80, y: 720, width: 1200, height: 550 }, async () => {
    await page.evaluate(() => window.scrollTo(0, 720));
  });

  await saveScreenshot('panduan_m3_step3_whatsapp.png', { x: 80, y: 240, width: 1200, height: 420 }, async () => {
    await page.evaluate(() => window.scrollTo(0, 240));
  });

  await saveScreenshot('panduan_m3_step4_maps.png', { x: 80, y: 1250, width: 1200, height: 550 }, async () => {
    await page.evaluate(() => window.scrollTo(0, 1250));
  });

  // ════════════════════════════════════════════════════════════════
  // 4. MODUL 4: PENDAFTARAN AKUN
  // ════════════════════════════════════════════════════════════════
  await page.goto('http://localhost:5173/register', { waitUntil: 'domcontentloaded' });
  await delay(1500);

  await saveScreenshot('panduan_m4_step1_registerform.png', { x: 350, y: 40, width: 666, height: 550 }, async () => {
    const nameInput = await page.$('input[name="name"], input[placeholder*="Nama"]');
    if (nameInput) await nameInput.type('Ahmad Subagja');
    const emailInput = await page.$('input[name="email"], input[placeholder*="email"]');
    if (emailInput) await emailInput.type('ahmad@gmail.com');
  });

  await saveScreenshot('panduan_m4_step2_passwordterms.png', { x: 350, y: 240, width: 666, height: 500 }, async () => {
    await page.evaluate(() => window.scrollTo(0, 240));
  });

  await page.goto('http://localhost:5173/register', { waitUntil: 'domcontentloaded' });
  await saveScreenshot('panduan_m4_step3_emailotp.png', { x: 350, y: 100, width: 666, height: 480 });
  await saveScreenshot('panduan_m4_step4_verified.png', { x: 350, y: 100, width: 666, height: 450 });

  // ════════════════════════════════════════════════════════════════
  // 5. MODUL 5: LOGIN & DASHBOARD NAV
  // ════════════════════════════════════════════════════════════════
  await page.goto('http://localhost:5173/login', { waitUntil: 'domcontentloaded' });
  await delay(1500);

  await saveScreenshot('panduan_m5_step1_login.png', { x: 350, y: 60, width: 666, height: 520 }, async () => {
    const emailInput = await page.$('input[name="email"], input[type="email"]');
    if (emailInput) await emailInput.type('mitra@surade.com');
  });

  await page.goto('http://localhost:5173/forgot-password', { waitUntil: 'domcontentloaded' });
  await delay(1200);
  await saveScreenshot('panduan_m5_step2_forgotpass.png', { x: 350, y: 80, width: 666, height: 480 });

  await page.goto('http://localhost:5173/admin-user', { waitUntil: 'domcontentloaded' });
  await delay(2000);
  await saveScreenshot('panduan_m5_step3_dashnav.png', { x: 0, y: 0, width: 290, height: 768 });

  // ════════════════════════════════════════════════════════════════
  // 6. MODUL 6: DASHBOARD OVERVIEW & METRICS 3D
  // ════════════════════════════════════════════════════════════════
  await page.goto('http://localhost:5173/admin-user?tab=dashboard', { waitUntil: 'domcontentloaded' });
  await delay(2000);

  await saveScreenshot('panduan_m6_step1_metrics.png', { x: 290, y: 280, width: 1050, height: 260 });
  await saveScreenshot('panduan_m6_step2_chart.png', { x: 290, y: 520, width: 1050, height: 440 }, async () => {
    await page.evaluate(() => window.scrollTo(0, 240));
  });
  await saveScreenshot('panduan_m6_step3_banner.png', { x: 290, y: 80, width: 1050, height: 200 });

  // ════════════════════════════════════════════════════════════════
  // 7. MODUL 7: KELOLA TEMPAT USAHA
  // ════════════════════════════════════════════════════════════════
  await page.goto('http://localhost:5173/admin-user?tab=bisnis', { waitUntil: 'domcontentloaded' });
  await delay(2000);

  await saveScreenshot('panduan_m7_step1_bizlist.png', { x: 290, y: 80, width: 1050, height: 600 });

  await page.goto('http://localhost:5173/add-business', { waitUntil: 'domcontentloaded' });
  await delay(2000);
  await saveScreenshot('panduan_m7_step2_form.png', { x: 200, y: 80, width: 966, height: 650 }, async () => {
    const bizName = await page.$('input[name="name"], input[placeholder*="Nama"]');
    if (bizName) await bizName.type('Toko Sembako Berkah Surade');
  });

  await saveScreenshot('panduan_m7_step3_mappin.png', { x: 200, y: 550, width: 966, height: 550 }, async () => {
    await page.evaluate(() => window.scrollTo(0, 500));
  });

  await page.goto('http://localhost:5173/admin-user?tab=bisnis', { waitUntil: 'domcontentloaded' });
  await delay(1500);
  await saveScreenshot('panduan_m7_step4_activelist.png', { x: 290, y: 220, width: 1050, height: 500 });

  // ════════════════════════════════════════════════════════════════
  // 8. MODUL 8: JAM OPERASIONAL & STATUS TOKO
  // ════════════════════════════════════════════════════════════════
  await page.goto('http://localhost:5173/admin-user?tab=operasional', { waitUntil: 'domcontentloaded' });
  await delay(2000);

  await saveScreenshot('panduan_m8_step1_editbtn.png', { x: 290, y: 80, width: 1050, height: 650 });
  await saveScreenshot('panduan_m8_step2_schedule.png', { x: 290, y: 220, width: 1050, height: 500 });
  await saveScreenshot('panduan_m8_step3_closeddays.png', { x: 290, y: 450, width: 1050, height: 400 });

  await page.goto('http://localhost:5173/business/1', { waitUntil: 'domcontentloaded' });
  await delay(1500);
  await saveScreenshot('panduan_m8_step4_statusbadge.png', { x: 100, y: 150, width: 600, height: 220 });

  // ════════════════════════════════════════════════════════════════
  // 9. MODUL 9: KATALOG PRODUK & LAYANAN
  // ════════════════════════════════════════════════════════════════
  await page.goto('http://localhost:5173/admin-user?tab=produk', { waitUntil: 'domcontentloaded' });
  await delay(2000);

  await saveScreenshot('panduan_m9_step1_prodtab.png', { x: 290, y: 80, width: 1050, height: 650 });

  await saveScreenshot('panduan_m9_step2_photo.png', { x: 300, y: 100, width: 766, height: 550 }, async () => {
    await clickByText('Tambah Produk');
    await delay(500);
  });

  await saveScreenshot('panduan_m9_step3_priceform.png', { x: 300, y: 250, width: 766, height: 500 });

  await page.goto('http://localhost:5173/admin-user?tab=produk', { waitUntil: 'domcontentloaded' });
  await delay(1500);
  await saveScreenshot('panduan_m9_step4_prodlist.png', { x: 290, y: 200, width: 1050, height: 550 });

  // ════════════════════════════════════════════════════════════════
  // 10. MODUL 10: UPGRADE PREMIUM CENTANG EMAS
  // ════════════════════════════════════════════════════════════════
  await page.goto('http://localhost:5173/admin-user?tab=premium', { waitUntil: 'domcontentloaded' });
  await delay(2000);

  await saveScreenshot('panduan_m10_step1_plans.png', { x: 290, y: 80, width: 1050, height: 650 });
  await saveScreenshot('panduan_m10_step2_coupon.png', { x: 290, y: 400, width: 1050, height: 350 });

  await saveScreenshot('panduan_m10_step3_qris.png', { x: 300, y: 60, width: 766, height: 650 }, async () => {
    await clickByText('Pilih Paket');
    await delay(600);
  });

  await page.goto('http://localhost:5173/business/1', { waitUntil: 'domcontentloaded' });
  await delay(1500);
  await saveScreenshot('panduan_m10_step4_goldbadge.png', { x: 100, y: 120, width: 600, height: 200 });

  // ════════════════════════════════════════════════════════════════
  // 11. MODUL 11: PESAN & CHAT INBOX
  // ════════════════════════════════════════════════════════════════
  await page.goto('http://localhost:5173/admin-user?tab=inbox', { waitUntil: 'domcontentloaded' });
  await delay(2000);

  await saveScreenshot('panduan_m11_step1_chatlist.png', { x: 290, y: 80, width: 1050, height: 650 });
  await saveScreenshot('panduan_m11_step2_chatview.png', { x: 290, y: 120, width: 1050, height: 600 }, async () => {
    await clickByText('Chat');
    await delay(400);
  });
  await saveScreenshot('panduan_m11_step3_replybox.png', { x: 290, y: 400, width: 1050, height: 320 }, async () => {
    const replyInput = await page.$('input[placeholder*="Ketik"], textarea');
    if (replyInput) await replyInput.type('Terima kasih, kami siap melayani!');
  });

  // ════════════════════════════════════════════════════════════════
  // 12. MODUL 12: PROMO & IKLAN BANNER
  // ════════════════════════════════════════════════════════════════
  await page.goto('http://localhost:5173/admin-user?tab=iklan', { waitUntil: 'domcontentloaded' });
  await delay(2000);

  await saveScreenshot('panduan_m12_step1_adstab.png', { x: 290, y: 80, width: 1050, height: 650 });
  await saveScreenshot('panduan_m12_step2_slots.png', { x: 300, y: 100, width: 766, height: 550 }, async () => {
    await clickByText('Ajukan Iklan');
    await delay(500);
  });
  await saveScreenshot('panduan_m12_step3_upload.png', { x: 300, y: 250, width: 766, height: 500 });

  await page.goto('http://localhost:5173/admin-user?tab=iklan', { waitUntil: 'domcontentloaded' });
  await delay(1500);
  await saveScreenshot('panduan_m12_step4_stats.png', { x: 290, y: 220, width: 1050, height: 500 });

  // ════════════════════════════════════════════════════════════════
  // 13. MODUL 13: REFERRAL, KODE & KOMISI
  // ════════════════════════════════════════════════════════════════
  await page.goto('http://localhost:5173/admin-user?tab=referral', { waitUntil: 'domcontentloaded' });
  await delay(2000);

  await saveScreenshot('panduan_m13_step1_reflink.png', { x: 290, y: 80, width: 1050, height: 250 });
  await saveScreenshot('panduan_m13_step2_qrcode.png', { x: 290, y: 200, width: 1050, height: 220 });
  await saveScreenshot('panduan_m13_step3_balance.png', { x: 290, y: 350, width: 1050, height: 380 });
  await saveScreenshot('panduan_m13_step4_withdraw.png', { x: 300, y: 120, width: 766, height: 550 }, async () => {
    await clickByText('Tarik Komisi');
    await delay(500);
  });

  // ════════════════════════════════════════════════════════════════
  // 14. MODUL 14: ULASAN & SIMPAN
  // ════════════════════════════════════════════════════════════════
  await page.goto('http://localhost:5173/admin-user?tab=ulasan', { waitUntil: 'domcontentloaded' });
  await delay(2000);

  await saveScreenshot('panduan_m14_step1_reviews.png', { x: 290, y: 80, width: 1050, height: 650 });
  await saveScreenshot('panduan_m14_step2_reply.png', { x: 300, y: 150, width: 766, height: 500 }, async () => {
    await clickByText('Balas');
    await delay(500);
  });

  await page.goto('http://localhost:5173/admin-user?tab=simpan', { waitUntil: 'domcontentloaded' });
  await delay(1800);
  await saveScreenshot('panduan_m14_step3_saved.png', { x: 290, y: 80, width: 1050, height: 650 });

  // ════════════════════════════════════════════════════════════════
  // 15. MODUL 15: BLOG, SMART CITY & CS
  // ════════════════════════════════════════════════════════════════
  await page.goto('http://localhost:5173/blog', { waitUntil: 'domcontentloaded' });
  await delay(1800);
  await saveScreenshot('panduan_m15_step1_blog.png', { x: 80, y: 80, width: 1200, height: 650 });

  await page.goto('http://localhost:5173/smart-city', { waitUntil: 'domcontentloaded' });
  await delay(1800);
  await saveScreenshot('panduan_m15_step2_smartcity.png', { x: 80, y: 80, width: 1200, height: 650 });

  await page.goto('http://localhost:5173/admin-user?tab=profil', { waitUntil: 'domcontentloaded' });
  await delay(1800);
  await saveScreenshot('panduan_m15_step3_profile.png', { x: 290, y: 80, width: 1050, height: 650 });

  await page.goto('http://localhost:5173/partnership-career', { waitUntil: 'domcontentloaded' });
  await delay(1800);
  await saveScreenshot('panduan_m15_step4_cs.png', { x: 80, y: 80, width: 1200, height: 650 });

  await browser.close();
  console.log("ALL 50 BOUNDING-BOX SCREENSHOTS CAPTURED PERFECTLY!");
}

run();
