const puppeteer = require('puppeteer');
const path = require('path');

const outDir = path.resolve(__dirname, '../src/assets/panduan');

async function cleanShots() {
  const browser = await puppeteer.launch({
    headless: 'new',
    defaultViewport: { width: 1280, height: 800, deviceScaleFactor: 2 }
  });

  const page = await browser.newPage();
  await page.goto('http://127.0.0.1:5173/', { waitUntil: 'load', timeout: 15000 });
  await new Promise(r => setTimeout(r, 2000));

  // Dismiss welcome modal or overlays
  await page.evaluate(() => {
    localStorage.setItem('surade_welcome_modal_closed', 'true');
    localStorage.setItem('hasSeenWelcome', 'true');
    document.querySelectorAll('.welcome-modal, [class*="modal"], [class*="backdrop"]').forEach(el => el.remove());
    window.scrollTo(0, 0);
  });
  await new Promise(r => setTimeout(r, 600));

  // 1. Home Hero
  await page.screenshot({
    path: path.join(outDir, 'panduan_home_hero.png'),
    clip: { x: 0, y: 0, width: 1280, height: 720 }
  });
  console.log('Saved panduan_home_hero.png');

  // 2. Home Categories Grid
  await page.evaluate(() => {
    const el = document.querySelector('.category-grid') || document.querySelector('.categories-grid') || document.querySelector('.category-section');
    if (el) el.scrollIntoView({ block: 'center' });
    else window.scrollTo(0, 520);
  });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({
    path: path.join(outDir, 'panduan_home_categories.png'),
    clip: { x: 0, y: 0, width: 1280, height: 720 }
  });
  console.log('Saved panduan_home_categories.png');

  // 3. Home Featured UMKM Cards
  await page.evaluate(() => {
    const el = document.querySelector('.featured-businesses') || document.querySelector('.business-grid') || document.querySelector('section:nth-of-type(3)');
    if (el) el.scrollIntoView({ block: 'center' });
    else window.scrollTo(0, 1150);
  });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({
    path: path.join(outDir, 'panduan_home_featured.png'),
    clip: { x: 0, y: 0, width: 1280, height: 720 }
  });
  console.log('Saved panduan_home_featured.png');

  await browser.close();
  console.log('ALL PRISTINE HOME SHOTS SAVED!');
}

cleanShots().catch(console.error);
