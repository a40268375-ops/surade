const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const outDir = path.resolve(__dirname, '../src/assets/panduan');

async function testPerfectShots() {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    defaultViewport: { width: 1280, height: 900, deviceScaleFactor: 2 }
  });

  const page = await browser.newPage();

  // Helper to remove any popups
  async function clean(p) {
    await p.evaluate(() => {
      localStorage.setItem('token', '102|CArY3e8rxuNnxzkrlL9WDLWMRoNDKRFA3golo4XMfcc4c877');
      localStorage.setItem('user', JSON.stringify({
        id: 14,
        name: 'Reseller Surade',
        username: 'reseller_surade',
        email: 'user@surade.com',
        role: 'user'
      }));
      localStorage.setItem('surade_welcome_modal_closed', 'true');
      localStorage.setItem('hasSeenWelcome', 'true');
      document.querySelectorAll('.welcome-modal, [class*="welcome"], [class*="backdrop"]').forEach(el => el.remove());
    });
  }

  // 1. Home Categories Section directly
  await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded' });
  await clean(page);
  await new Promise(r => setTimeout(r, 2000));
  await clean(page);

  const catSec = await page.$('.category-section');
  if (catSec) {
    await catSec.scrollIntoView();
    await new Promise(r => setTimeout(r, 500));
    await catSec.screenshot({ path: path.join(outDir, 'panduan_home_categories.png') });
    console.log('Successfully captured .category-section for panduan_home_categories.png');
  }

  // 2. Featured Businesses (Temukan Section) directly
  const temukanSec = await page.$('.temukan-section');
  if (temukanSec) {
    await temukanSec.scrollIntoView();
    await new Promise(r => setTimeout(r, 500));
    await temukanSec.screenshot({ path: path.join(outDir, 'panduan_home_featured.png') });
    console.log('Successfully captured .temukan-section for panduan_home_featured.png');
  }

  await browser.close();
}

testPerfectShots().catch(console.error);
