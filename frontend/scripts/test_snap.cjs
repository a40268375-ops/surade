const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

async function test() {
  console.log('Launching browser...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800, deviceScaleFactor: 2 });
  
  console.log('Navigating to http://localhost:5173 ...');
  await page.goto('http://localhost:5173', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await new Promise(r => setTimeout(r, 2000));

  console.log('Removing modals...');
  await page.evaluate(() => {
    localStorage.setItem('surade_welcome_modal_closed', 'true');
    localStorage.setItem('hasSeenWelcome', 'true');
    document.querySelectorAll('[class*="welcome"], [class*="modal"], [class*="backdrop"]').forEach(el => el.remove());
  });
  await new Promise(r => setTimeout(r, 500));

  const outPath = path.resolve(__dirname, '../src/assets/panduan/panduan_home_hero.png');
  await page.screenshot({ path: outPath, clip: { x: 0, y: 0, width: 1280, height: 720 } });
  console.log('Saved to', outPath);

  await browser.close();
  console.log('DONE!');
}

test().catch(err => {
  console.error('ERROR:', err);
  process.exit(1);
});
