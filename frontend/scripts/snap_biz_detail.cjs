const puppeteer = require('puppeteer');
const path = require('path');

async function snapBiz() {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    defaultViewport: { width: 1280, height: 800, deviceScaleFactor: 2 }
  });

  const page = await browser.newPage();
  
  // Go to category page first to get a business id or go to business detail
  await page.goto('http://localhost:5173/category/all', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 2000));
  
  await page.evaluate(() => {
    localStorage.setItem('surade_welcome_modal_closed', 'true');
    localStorage.setItem('hasSeenWelcome', 'true');
    document.querySelectorAll('[class*="modal"], [class*="welcome"], [class*="backdrop"]').forEach(el => el.remove());
  });

  // Find a business link and click it
  const link = await page.$('a[href^="/business/"], a[href*="/business/"]');
  if (link) {
    await link.click();
    await new Promise(r => setTimeout(r, 2500));
    await page.evaluate(() => {
      document.querySelectorAll('[class*="modal"], [class*="welcome"], [class*="backdrop"]').forEach(el => el.remove());
      window.scrollTo(0, 200);
    });
    await new Promise(r => setTimeout(r, 600));
    await page.screenshot({
      path: path.resolve(__dirname, '../src/assets/panduan/panduan_biz_detail.png'),
      clip: { x: 0, y: 0, width: 1280, height: 720 }
    });
    console.log('Successfully captured authentic panduan_biz_detail.png!');
  } else {
    // fallback directly to /business/1
    await page.goto('http://localhost:5173/business/1', { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 2000));
    await page.screenshot({
      path: path.resolve(__dirname, '../src/assets/panduan/panduan_biz_detail.png'),
      clip: { x: 0, y: 0, width: 1280, height: 720 }
    });
    console.log('Captured direct /business/1');
  }

  await browser.close();
}

snapBiz().catch(console.error);
