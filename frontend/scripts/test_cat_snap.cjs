const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const outDir = path.resolve(__dirname, '../src/assets/panduan');

async function testElementSnap() {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    defaultViewport: { width: 1280, height: 1200, deviceScaleFactor: 2 }
  });

  const page = await browser.newPage();
  await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 2000));

  await page.evaluate(() => {
    localStorage.setItem('surade_welcome_modal_closed', 'true');
    localStorage.setItem('hasSeenWelcome', 'true');
    document.querySelectorAll('.welcome-modal, [class*="welcome"], [class*="backdrop"]').forEach(el => el.remove());
  });
  await new Promise(r => setTimeout(r, 500));

  // Find the category section or category grid
  const catEl = await page.$('.category-grid, .categories-grid, .category-section, .categories-section, div[class*="category"]');
  if (catEl) {
    await catEl.screenshot({ path: path.join(outDir, 'panduan_home_categories.png') });
    console.log('Successfully captured element screenshot: panduan_home_categories.png');
  } else {
    console.log('Category element not found, capturing document rect');
    await page.screenshot({
      path: path.join(outDir, 'panduan_home_categories.png'),
      clip: { x: 0, y: 520, width: 1280, height: 600 }
    });
  }

  await browser.close();
}

testElementSnap().catch(console.error);
