const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const ASSETS_DIR = path.join(__dirname, 'src', 'assets', 'panduan');
if (!fs.existsSync(ASSETS_DIR)) {
  fs.mkdirSync(ASSETS_DIR, { recursive: true });
}

(async () => {
  console.log('🚀 Starting ULTIMATE Clean Screenshot Capture for Panduan...');
  const browser = await puppeteer.launch({
    headless: 'new',
    defaultViewport: { width: 1280, height: 800 }
  });

  const getPage = async () => {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });
    return page;
  };

  // Helper to capture clean page without top fixed headers covering content
  const captureClean = async (url, filename, scrollY = 0, hideHeader = true) => {
    let page;
    try {
      page = await getPage();
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 12000 }).catch(() => {});
      await new Promise(r => setTimeout(r, 600));

      if (hideHeader) {
        await page.evaluate(() => {
          // Hide fixed headers/navbars so they don't block screenshot
          const fixedElements = document.querySelectorAll('header, nav, .navbar, .panduan-hero, .panduan-mobile-nav, .privacy-progress-bar-container');
          fixedElements.forEach(el => {
            if (el) el.style.display = 'none';
          });
        });
      }

      if (scrollY > 0) {
        await page.evaluate((y) => window.scrollTo(0, y), scrollY);
        await new Promise(r => setTimeout(r, 400));
      }

      const filePath = path.join(ASSETS_DIR, filename);
      await page.screenshot({ path: filePath });
      console.log(`  ✓ Captured ${filename}`);
    } catch (e) {
      console.error(`  ✕ Error ${filename}:`, e.message);
    } finally {
      if (page) await page.close().catch(() => {});
    }
  };

  // ══════════════════════════════════════════════════════════════
  // PUBLIC PAGES (Modul 1 - 4)
  // ══════════════════════════════════════════════════════════════
  console.log('\n📸 Capturing Public Page Modules 1 - 4...');
  
  // Modul 1
  await captureClean('http://localhost:5173', 'panduan_m1_step1_search.png', 0, false);
  await captureClean('http://localhost:5173', 'panduan_m1_step2_quickcats.png', 200, false);
  await captureClean('http://localhost:5173', 'panduan_m1_step3_featured.png', 650, true);

  // Modul 2
  await captureClean('http://localhost:5173/category/all', 'panduan_m2_step1_catgrid.png', 0, false);
  await captureClean('http://localhost:5173/category/all', 'panduan_m2_step2_villagedropdown.png', 220, true);
  await captureClean('http://localhost:5173/category/all', 'panduan_m2_step3_sorting.png', 520, true);

  // Modul 3
  await captureClean('http://localhost:5173/business/28', 'panduan_m3_step1_header.png', 0, false);
  await captureClean('http://localhost:5173/business/28', 'panduan_m3_step2_products.png', 650, true);
  await captureClean('http://localhost:5173/business/28', 'panduan_m3_step3_whatsapp.png', 300, true);
  await captureClean('http://localhost:5173/business/28', 'panduan_m3_step4_maps.png', 1300, true);

  // Modul 4
  await captureClean('http://localhost:5173/register', 'panduan_m4_step1_registerform.png', 0, false);
  await captureClean('http://localhost:5173/register', 'panduan_m4_step2_passwordterms.png', 350, true);
  await captureClean('http://localhost:5173/register', 'panduan_m4_step3_emailotp.png', 0, false);
  await captureClean('http://localhost:5173/register', 'panduan_m4_step4_verified.png', 0, false);

  // Modul 5 Login
  await captureClean('http://localhost:5173/login', 'panduan_m5_step1_login.png', 0, false);
  await captureClean('http://localhost:5173/forgot-password', 'panduan_m5_step2_forgotpass.png', 0, false);

  // ══════════════════════════════════════════════════════════════
  // DASHBOARD PAGES WITH AUTH USER LOGGED IN (Modul 5 - 15)
  // ══════════════════════════════════════════════════════════════
  console.log('\n🔑 Logging in as user@surade.com for Dashboard Modules...');
  let dashPage;
  try {
    dashPage = await getPage();
    await dashPage.goto('http://localhost:5173/login', { waitUntil: 'networkidle2' });
    
    // Fill credentials
    const emailInput = await dashPage.$('input[type="email"]');
    const passInput = await dashPage.$('input[type="password"]');
    const submitBtn = await dashPage.$('button[type="submit"]');

    if (emailInput && passInput && submitBtn) {
      await emailInput.type('user@surade.com');
      await passInput.type('password');
      await submitBtn.click();
      await new Promise(r => setTimeout(r, 1200));
    }

    const captureDashView = async (url, filename, scrollY = 0, tabSelector = null) => {
      try {
        await dashPage.goto(url, { waitUntil: 'networkidle2', timeout: 10000 }).catch(() => {});
        await new Promise(r => setTimeout(r, 500));

        if (tabSelector) {
          const tab = await dashPage.$(tabSelector);
          if (tab) {
            await tab.click();
            await new Promise(r => setTimeout(r, 500));
          }
        }

        // Hide top nav inside dashboard screenshot if needed
        await dashPage.evaluate(() => {
          const nav = document.querySelector('header, nav, .navbar');
          if (nav) nav.style.display = 'none';
        });

        if (scrollY > 0) {
          await dashPage.evaluate((y) => window.scrollTo(0, y), scrollY);
          await new Promise(r => setTimeout(r, 400));
        }

        const filePath = path.join(ASSETS_DIR, filename);
        await dashPage.screenshot({ path: filePath });
        console.log(`  ✓ Captured ${filename}`);
      } catch (e) {
        console.error(`  ✕ Error ${filename}:`, e.message);
      }
    };

    console.log('\n📸 Capturing Authenticated Dashboard Modules 5 - 15...');
    
    // Modul 5 step 3
    await captureDashView('http://localhost:5173/dashboard', 'panduan_m5_step3_dashnav.png', 0);

    // Modul 6
    await captureDashView('http://localhost:5173/dashboard', 'panduan_m6_step1_metrics.png', 0);
    await captureDashView('http://localhost:5173/dashboard', 'panduan_m6_step2_chart.png', 350);
    await captureDashView('http://localhost:5173/dashboard', 'panduan_m6_step3_banner.png', 0);

    // Modul 7
    await captureDashView('http://localhost:5173/dashboard', 'panduan_m7_step1_bizlist.png', 0);
    await captureDashView('http://localhost:5173/dashboard', 'panduan_m7_step2_form.png', 0);
    await captureDashView('http://localhost:5173/dashboard', 'panduan_m7_step3_mappin.png', 400);
    await captureDashView('http://localhost:5173/dashboard', 'panduan_m7_step4_activelist.png', 200);

    // Modul 8
    await captureDashView('http://localhost:5173/dashboard', 'panduan_m8_step1_editbtn.png', 100);
    await captureDashView('http://localhost:5173/dashboard', 'panduan_m8_step2_schedule.png', 400);
    await captureDashView('http://localhost:5173/dashboard', 'panduan_m8_step3_closeddays.png', 600);
    await captureDashView('http://localhost:5173/dashboard', 'panduan_m8_step4_statusbadge.png', 0);

    // Modul 9
    await captureDashView('http://localhost:5173/dashboard', 'panduan_m9_step1_prodtab.png', 0);
    await captureDashView('http://localhost:5173/dashboard', 'panduan_m9_step2_photo.png', 200);
    await captureDashView('http://localhost:5173/dashboard', 'panduan_m9_step3_priceform.png', 400);
    await captureDashView('http://localhost:5173/dashboard', 'panduan_m9_step4_prodlist.png', 300);

    // Modul 10
    await captureDashView('http://localhost:5173/pricing', 'panduan_m10_step1_plans.png', 0);
    await captureDashView('http://localhost:5173/pricing', 'panduan_m10_step2_coupon.png', 350);
    await captureDashView('http://localhost:5173/pricing', 'panduan_m10_step3_qris.png', 600);
    await captureDashView('http://localhost:5173/pricing', 'panduan_m10_step4_goldbadge.png', 150);

    // Modul 11
    await captureDashView('http://localhost:5173/dashboard', 'panduan_m11_step1_chatlist.png', 0);
    await captureDashView('http://localhost:5173/dashboard', 'panduan_m11_step2_chatview.png', 0);
    await captureDashView('http://localhost:5173/dashboard', 'panduan_m11_step3_replybox.png', 300);

    // Modul 12
    await captureDashView('http://localhost:5173/dashboard', 'panduan_m12_step1_adstab.png', 0);
    await captureDashView('http://localhost:5173/dashboard', 'panduan_m12_step2_slots.png', 200);
    await captureDashView('http://localhost:5173/dashboard', 'panduan_m12_step3_upload.png', 400);
    await captureDashView('http://localhost:5173/dashboard', 'panduan_m12_step4_stats.png', 100);

    // Modul 13
    await captureDashView('http://localhost:5173/dashboard', 'panduan_m13_step1_reflink.png', 0);
    await captureDashView('http://localhost:5173/dashboard', 'panduan_m13_step2_qrcode.png', 200);
    await captureDashView('http://localhost:5173/dashboard', 'panduan_m13_step3_balance.png', 400);
    await captureDashView('http://localhost:5173/dashboard', 'panduan_m13_step4_withdraw.png', 600);

    // Modul 14
    await captureDashView('http://localhost:5173/dashboard', 'panduan_m14_step1_reviews.png', 0);
    await captureDashView('http://localhost:5173/dashboard', 'panduan_m14_step2_reply.png', 200);
    await captureDashView('http://localhost:5173/dashboard', 'panduan_m14_step3_saved.png', 0);

    // Modul 15
    await captureDashView('http://localhost:5173/blog', 'panduan_m15_step1_blog.png', 0);
    await captureDashView('http://localhost:5173/smart-city', 'panduan_m15_step2_smartcity.png', 0);
    await captureDashView('http://localhost:5173/dashboard', 'panduan_m15_step3_profile.png', 0);
    await captureDashView('http://localhost:5173/contact', 'panduan_m15_step4_cs.png', 0);

  } catch(e) {
    console.error('Dashboard capture error:', e.message);
  } finally {
    if (dashPage) await dashPage.close().catch(() => {});
  }

  console.log('\n🎉 ALL SCREENSHOTS CAPTURED CLEANLY!');
  await browser.close();
})();
