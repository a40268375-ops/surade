const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const outDir = path.resolve(__dirname, '../src/assets/panduan');

async function captureAllModulesPrecision() {
  console.log('=== STARTING PRECISION HIGH-DEFINITION SHOTS FOR ALL MODULES ===');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    defaultViewport: { width: 1280, height: 900, deviceScaleFactor: 2 }
  });

  const page = await browser.newPage();

  async function applyAuthAndClean(p) {
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

  // Helper function to snap with exact crop box
  async function snapBox(url, filename, box, waitTime = 1800, customFn = null) {
    console.log(`[SNAP] ${filename} from ${url}...`);
    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await applyAuthAndClean(page);
      await new Promise(r => setTimeout(r, waitTime));
      await applyAuthAndClean(page);

      if (customFn) {
        await customFn(page);
        await new Promise(r => setTimeout(r, 600));
      }

      await page.evaluate((b) => window.scrollTo(0, b.y), box);
      await new Promise(r => setTimeout(r, 400));

      const dest = path.join(outDir, filename);
      await page.screenshot({
        path: dest,
        clip: { x: box.x, y: 0, width: box.width, height: box.height }
      });
      console.log(`[SUCCESS] -> ${filename}`);
    } catch (e) {
      console.error(`[FAIL] -> ${filename}:`, e.message);
    }
  }

  // ─────────────────────────────────────────────
  // MODUL 2: 10 Kategori Sektor Usaha & Filter 12 Desa
  // ─────────────────────────────────────────────
  await snapBox('http://localhost:5173/category/all', 'panduan_category_filter.png', { x: 40, y: 150, width: 1200, height: 640 }, 2200);

  // ─────────────────────────────────────────────
  // MODUL 3: Profil Detail Tempat Usaha, Peta GPS & WhatsApp
  // ─────────────────────────────────────────────
  await snapBox('http://localhost:5173/business/1', 'panduan_biz_detail.png', { x: 40, y: 220, width: 1200, height: 640 }, 2500);

  // ─────────────────────────────────────────────
  // MODUL 4: Pendaftaran Akun Baru (Register) & OTP Modal
  // ─────────────────────────────────────────────
  await snapBox('http://localhost:5173/register', 'panduan_register_clean.png', { x: 40, y: 90, width: 1200, height: 640 }, 1500);

  // ─────────────────────────────────────────────
  // MODUL 5: Masuk Akun (Login)
  // ─────────────────────────────────────────────
  await snapBox('http://localhost:5173/login', 'panduan_login_clean.png', { x: 40, y: 60, width: 1200, height: 640 }, 1500);

  // ─────────────────────────────────────────────
  // MODUL 6: Dashboard Overview & Analitik
  // ─────────────────────────────────────────────
  await snapBox('http://localhost:5173/dashboard', 'panduan_dash_overview.png', { x: 40, y: 0, width: 1200, height: 640 }, 2500);

  // ─────────────────────────────────────────────
  // MODUL 7: Pendaftaran Usaha Baru (+ Tambah Bisnis) & GPS Map
  // ─────────────────────────────────────────────
  await snapBox('http://localhost:5173/add-business', 'panduan_add_business.png', { x: 40, y: 80, width: 1200, height: 640 }, 2500);
  await snapBox('http://localhost:5173/dashboard?tab=businesses', 'panduan_dash_bisnis.png', { x: 40, y: 0, width: 1200, height: 640 }, 2200);

  // ─────────────────────────────────────────────
  // MODUL 8: Pengaturan Jam Operasional & Jadwal Buka-Tutup
  // ─────────────────────────────────────────────
  await snapBox('http://localhost:5173/dashboard?tab=businesses', 'panduan_bisnis.png', { x: 40, y: 140, width: 1200, height: 640 }, 2200);

  // ─────────────────────────────────────────────
  // MODUL 9: Manajemen Katalog Produk & Harga Jasa
  // ─────────────────────────────────────────────
  await snapBox('http://localhost:5173/dashboard?tab=businesses', 'panduan_dash_produk.png', { x: 40, y: 280, width: 1200, height: 640 }, 2200);

  // ─────────────────────────────────────────────
  // MODUL 10: Upgrade Bisnis ke Centang Emas & Pembayaran QRIS
  // ─────────────────────────────────────────────
  await snapBox('http://localhost:5173/pricing', 'panduan_dash_premium.png', { x: 40, y: 180, width: 1200, height: 640 }, 2000);
  
  await snapBox('http://localhost:5173/pricing', 'panduan_dash_bayar.png', { x: 40, y: 100, width: 1200, height: 640 }, 2000, async (p) => {
    await p.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const btn = btns.find(b => b.textContent.includes('Pilih') || b.textContent.includes('Upgrade') || b.textContent.includes('Langganan'));
      if (btn) btn.click();
    });
  });
  fs.copyFileSync(path.join(outDir, 'panduan_dash_bayar.png'), path.join(outDir, 'panduan_bayar.png'));

  // ─────────────────────────────────────────────
  // MODUL 11: Inbox Pesan Masuk
  // ─────────────────────────────────────────────
  await snapBox('http://localhost:5173/dashboard?tab=inbox', 'panduan_dash_inbox.png', { x: 40, y: 0, width: 1200, height: 640 }, 2000);

  // ─────────────────────────────────────────────
  // MODUL 12: Pemasangan Iklan Banner
  // ─────────────────────────────────────────────
  await snapBox('http://localhost:5173/dashboard?tab=dashboard', 'panduan_dash_iklan.png', { x: 40, y: 220, width: 1200, height: 640 }, 2000);
  fs.copyFileSync(path.join(outDir, 'panduan_dash_iklan.png'), path.join(outDir, 'panduan_iklan.png'));

  // ─────────────────────────────────────────────
  // MODUL 13: Program Kemitraan Referral & Penarikan Saldo
  // ─────────────────────────────────────────────
  await snapBox('http://localhost:5173/dashboard?tab=referrals', 'panduan_dash_referral.png', { x: 40, y: 0, width: 1200, height: 640 }, 2200);
  fs.copyFileSync(path.join(outDir, 'panduan_dash_referral.png'), path.join(outDir, 'panduan_referral.png'));

  // ─────────────────────────────────────────────
  // MODUL 14: Manajemen Ulasan Pelanggan & Simpanan Bookmark
  // ─────────────────────────────────────────────
  await snapBox('http://localhost:5173/dashboard?tab=dashboard', 'panduan_dash_ulasan.png', { x: 40, y: 380, width: 1200, height: 640 }, 2000);
  await snapBox('http://localhost:5173/dashboard?tab=saved', 'panduan_dash_simpan.png', { x: 40, y: 0, width: 1200, height: 640 }, 2000);

  // ─────────────────────────────────────────────
  // MODUL 15: Blog, Smart City 12 Desa & Customer Care CS 24/7
  // ─────────────────────────────────────────────
  await snapBox('http://localhost:5173/berita', 'panduan_dash_blog.png', { x: 40, y: 180, width: 1200, height: 640 }, 2000);
  fs.copyFileSync(path.join(outDir, 'panduan_dash_blog.png'), path.join(outDir, 'panduan_blog.png'));
  await snapBox('http://localhost:5173/smart-city', 'panduan_smart_city.png', { x: 40, y: 220, width: 1200, height: 640 }, 2000);
  await snapBox('http://localhost:5173/dashboard?tab=settings', 'panduan_dash_profil.png', { x: 40, y: 0, width: 1200, height: 640 }, 2000);
  await snapBox('http://localhost:5173/contact', 'panduan_hubungi_cs.png', { x: 40, y: 160, width: 1200, height: 640 }, 2000);

  await browser.close();
  console.log('=== ALL MODULES PRECISION CAPTURE FINISHED! ===');
}

captureAllModulesPrecision().catch(console.error);
